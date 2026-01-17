import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { reliableGeminiCall } from '@/lib/gemini';
import { CONCIERGE_CONFIGS } from '@/lib/concierge-configs';
import { getConciergePromptAndMock } from '@/lib/concierge-prompts';
import { checkSubscriptionAccess } from '@/lib/premium';
import { apiError, handleApiError } from '@/lib/api-response';

// Initialize rate limiter if Redis is available
let ratelimit: Ratelimit | undefined;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
        analytics: true,
    });
}

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

/**
 * Validates if a recommendation matches the user's specific request
 * Uses keyword matching with strict rejection rules
 */
function validateRecommendation(
    recommendation: any,
    userRequest: string,
    toolType: string
): boolean {
    // If no specific request, accept all recommendations
    if (!userRequest || userRequest.trim().length === 0) {
        return true;
    }

    const requestLower = userRequest.toLowerCase();
    const recName = (recommendation.name || '').toLowerCase();
    const recDesc = (recommendation.description || '').toLowerCase();
    const recCuisine = (recommendation.cuisine || recommendation.category || recommendation.type || recommendation.speciality || '').toLowerCase();
    
    // Combine all text fields for searching
    const allText = `${recName} ${recDesc} ${recCuisine}`.toLowerCase();

    console.log(`[Validation] Checking "${recommendation.name}"`);
    console.log(`  Cuisine field: "${recCuisine}"`);
    console.log(`  User request: "${requestLower}"`);

    // STRICT RULE 1: If user asks for "cafe" or "brunch"
    if (/\b(cafe|coffee shop|brunch|breakfast)\b/i.test(requestLower)) {
        // Accept ONLY if explicitly mentioned as cafe/brunch in name, description OR cuisine
        const hasCafeBrunchKeywords = /\b(cafe|coffee|brunch|breakfast)\b/i.test(allText);
        
        // Reject if it's clearly a dinner-heavy type
        const isDinnerHeavy = /\b(pizzeria|pizza|japanese|sushi|indian|thai|chinese|fine.dining|dinner.only)\b/i.test(recCuisine);
        
        // REJECT if it lacks cafe keywords OR is a known dinner type
        if (!hasCafeBrunchKeywords || isDinnerHeavy) {
            console.log(`  ❌ REJECT: Non-cafe type (hasKeywords=${hasCafeBrunchKeywords}, isDinnerHeavy=${isDinnerHeavy})`);
            return false;
        }
        
        console.log(`  ✅ ACCEPT: Matches cafe/brunch request`);
        return true;
    }

    // STRICT RULE 2: If user asks for specific cuisine
    const cuisineRequests = {
        pizza: /\b(pizza)\b/i,
        italian: /\b(italian)\b/i,
        sushi: /\b(sushi|japanese)\b/i,
        chinese: /\b(chinese)\b/i,
        thai: /\b(thai)\b/i,
        vietnamese: /\b(vietnamese|pho)\b/i,
        indian: /\b(indian|curry)\b/i,
        mexican: /\b(mexican|tacos)\b/i,
    };

    for (const [cuisineName, pattern] of Object.entries(cuisineRequests)) {
        if (pattern.test(requestLower)) {
            // User wants this specific cuisine
            const matches = pattern.test(recCuisine) || pattern.test(allText);
            
            if (!matches) {
                console.log(`  ❌ REJECT: User wants ${cuisineName}, but this is ${recCuisine}`);
                return false;
            }
            
            console.log(`  ✅ ACCEPT: Matches ${cuisineName} request`);
            return true;
        }
    }

    // Default: accept if no strict rules violated
    console.log(`  ✅ ACCEPT: No strict rules violated`);
    return true;
}

export async function POST(req: NextRequest) {
    try {
        // 1. Parse Request Body
        const body = await req.json();
        const { configId, inputs, location: cachedLocation, useMockData, isDemo } = body;
        
        // ✅ CRITICAL FIX: Capture extraInstructions from root body, not from inputs
        const rawExtraInstructions = body.extraInstructions || inputs?.extraInstructions || "";

        // 2. Auth & Subscription Check
        const session = await getSession();
        const isDemoMode = isDemo === true;

        if (!session?.user?.email && !isDemoMode) {
            return apiError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        // 3. Find Tool Config
        const toolKey = Object.keys(CONCIERGE_CONFIGS).find(
            key => CONCIERGE_CONFIGS[key].id === configId || key === configId
        );

        if (!toolKey) {
            return apiError(`Invalid config ID: ${configId}`, 400, 'INVALID_CONFIG');
        }

        const config = CONCIERGE_CONFIGS[toolKey];

        // 4. Rate Limiting (skip for demo mode)
        if (ratelimit && !isDemoMode) {
            const identifier = session!.user.id;
            const { success } = await ratelimit.limit(identifier);
            if (!success) {
                return apiError('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT');
            }
        }

        // 5. Subscription Check
        if (!isDemoMode) {
            const access = await checkSubscriptionAccess(session!.user.id, config.id);
            if (!access.allowed) {
                return apiError(access.reason || 'Premium required', 403, 'PREMIUM_REQUIRED');
            }
        }

        // 6. Location Context
        let targetLocation = "your area";
        if (cachedLocation) {
            if (typeof cachedLocation === 'string') {
                targetLocation = cachedLocation;
            } else if (typeof cachedLocation === 'object') {
                targetLocation = [cachedLocation.city, cachedLocation.region, cachedLocation.country]
                    .filter(Boolean)
                    .join(', ') || "your area";
            }
        }

        // 7. Prompt Generation & Execution (with Auto-Retry for Quality)
        const runConciergeSearch = async (query: string, attempt: number = 1) => {
            const { prompt } = getConciergePromptAndMock(
                toolKey,
                inputs,
                targetLocation,
                query
            );

            console.log(`[Concierge] Attempt ${attempt} for query: "${query}"`);
            const jsonResponse = await reliableGeminiCall(prompt, { jsonMode: true }) as { recommendations?: any[] };
            
            if (query && jsonResponse.recommendations && Array.isArray(jsonResponse.recommendations)) {
                // Validate each recommendation
                const filteredRecommendations = jsonResponse.recommendations.filter(
                    (rec: any) => validateRecommendation(rec, query, toolKey)
                );
                
                // ✅ RADICAL: If filtering removed more than 60% of results, and it's attempt 1, 
                // try again with an even more aggressive prompt.
                if (filteredRecommendations.length < 2 && attempt < 2) {
                    console.log(`[Concierge] Low quality results (${filteredRecommendations.length}/5). Retrying with hyper-focus...`);
                    return runConciergeSearch(`${query} (STRICT MATCH ONLY - IGNORE ALL OTHER CATEGORIES)`, attempt + 1);
                }

                return { ...jsonResponse, recommendations: filteredRecommendations };
            }
            return jsonResponse;
        };

        if (useMockData) {
            const { mockResponse } = getConciergePromptAndMock(toolKey, inputs, targetLocation, rawExtraInstructions);
            return NextResponse.json(mockResponse);
        }

        const finalResult = await runConciergeSearch(rawExtraInstructions);
        return NextResponse.json(finalResult);

    } catch (error: any) {
        return handleApiError(error);
    }
}
