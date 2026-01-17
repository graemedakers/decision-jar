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
        // Accept ONLY if explicitly mentioned as cafe/brunch
        const isCafeBrunch = /\b(cafe|coffee|brunch|breakfast)\b/i.test(allText);
        
        // Reject if it's clearly a different type
        const isWrongType = /\b(thai|chinese|indian|italian|pizza|japanese|sushi|vietnamese|mexican|greek|korean)\b/i.test(recCuisine);
        
        if (!isCafeBrunch || isWrongType) {
            console.log(`  ❌ REJECT: Not a cafe/brunch spot (isCafeBrunch=${isCafeBrunch}, isWrongType=${isWrongType})`);
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
        // 1. Parse Request Body (need to check demo mode early)
        const { configId, inputs, location: cachedLocation, useMockData, isDemo } = await req.json();

        // 2. Auth & Subscription Check
        const session = await getSession();

        // ✅ FIX: Allow demo mode without authentication
        const isDemoMode = isDemo === true;

        if (!session?.user?.email && !isDemoMode) {
            return apiError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        // 3. Find Tool Config
        // We search by ID first (e.g., 'dining_concierge') or Key (e.g., 'DINING')
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

        // 5. Subscription Check (skip for demo mode - limit handled client-side)
        if (!isDemoMode) {
            const access = await checkSubscriptionAccess(session!.user.id, config.id);
            if (!access.allowed) {
                return apiError(access.reason || 'Premium required', 403, 'PREMIUM_REQUIRED');
            }
        }

        // 6. Location Context
        let targetLocation = "your area";
        const needsLocation = config.hasLocation || (config.locationCondition &&
            (inputs[config.locationCondition.sectionId] || "").split(", ").some((v: string) => config.locationCondition?.values.includes(v)));

        if (needsLocation && cachedLocation) {
            if (typeof cachedLocation === 'string') {
                targetLocation = cachedLocation;
            } else if (typeof cachedLocation === 'object') {
                targetLocation = [cachedLocation.city, cachedLocation.region, cachedLocation.country]
                    .filter(Boolean)
                    .join(', ') || "your area";
            }
        }

        const extraInstructions = inputs.extraInstructions || "";

        // 7. Prompt Generation
        const { prompt, mockResponse } = getConciergePromptAndMock(
            toolKey,
            inputs,
            targetLocation,
            extraInstructions
        );

        if (useMockData) {
            // Simulate stream for mock data
            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue(JSON.stringify(mockResponse));
                    controller.close();
                }
            });
            return new Response(stream, {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 8. Call AI (Using centralized reliable helper)
        try {
            const jsonResponse = await reliableGeminiCall(prompt, { jsonMode: true });
            
            // 9. Filter recommendations based on user's extraInstructions
            if (inputs.extraInstructions && jsonResponse.recommendations && Array.isArray(jsonResponse.recommendations)) {
                console.log(`[Concierge] Validating ${jsonResponse.recommendations.length} recommendations against: "${inputs.extraInstructions}"`);
                
                // Validate each recommendation (now synchronous)
                const filteredRecommendations = jsonResponse.recommendations.filter(
                    (rec: any) => validateRecommendation(rec, inputs.extraInstructions, toolKey)
                );
                
                console.log(`[Concierge] Filtered from ${jsonResponse.recommendations.length} to ${filteredRecommendations.length} recommendations`);
                
                // Return filtered results
                return NextResponse.json({
                    ...jsonResponse,
                    recommendations: filteredRecommendations,
                    _meta: {
                        originalCount: jsonResponse.recommendations.length,
                        filteredCount: filteredRecommendations.length,
                        userRequest: inputs.extraInstructions
                    }
                });
            }
            
            return NextResponse.json(jsonResponse);
        } catch (genError: any) {
            console.error("Concierge AI Failed:", genError);
            return apiError("AI Service Unavailable: " + genError.message, 500, "AI_ERROR");
        }

    } catch (error: any) {
        return handleApiError(error);
    }
}
