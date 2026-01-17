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
 * Uses keyword matching for reliability (AI validation was too lenient)
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

    // Extract key requirements from user request
    const keywords = {
        brunch: /\b(brunch|breakfast)\b/i,
        cafe: /\b(cafe|coffee shop|coffeehouse)\b/i,
        coffee: /\b(coffee|espresso|cappuccino)\b/i,
        pizza: /\b(pizza|pizzeria)\b/i,
        italian: /\b(italian)\b/i,
        sushi: /\b(sushi|japanese)\b/i,
        chinese: /\b(chinese|dim sum|dumplings)\b/i,
        thai: /\b(thai)\b/i,
        vietnamese: /\b(vietnamese|pho)\b/i,
        indian: /\b(indian|curry)\b/i,
        mexican: /\b(mexican|tacos|burritos)\b/i,
        burger: /\b(burger|burgers)\b/i,
        vegan: /\b(vegan|plant.based)\b/i,
        vegetarian: /\b(vegetarian)\b/i,
        fine_dining: /\b(fine dining|upscale|elegant|michelin)\b/i,
        casual: /\b(casual|relaxed|laid.back)\b/i,
        pub: /\b(pub|bar|tavern)\b/i,
        hotel: /\b(hotel|accommodation|stay)\b/i,
    };

    // Identify what user is asking for
    const userWants: string[] = [];
    for (const [key, pattern] of Object.entries(keywords)) {
        if (pattern.test(requestLower)) {
            userWants.push(key);
        }
    }

    console.log(`[Validation] ${recommendation.name}: User wants [${userWants.join(', ')}]`);

    // If no specific keywords detected, accept (too vague to filter)
    if (userWants.length === 0) {
        console.log(`[Validation] ${recommendation.name}: ACCEPT (no specific requirements detected)`);
        return true;
    }

    // Check if recommendation matches ANY of the requirements
    let matchCount = 0;
    const mismatches: string[] = [];

    for (const want of userWants) {
        const pattern = keywords[want as keyof typeof keywords];
        if (pattern.test(allText)) {
            matchCount++;
        } else {
            mismatches.push(want);
        }
    }

    // Special rules for common mismatches
    // If user wants "cafe" or "brunch", reject obvious dinner-only restaurants
    if ((userWants.includes('cafe') || userWants.includes('brunch')) && 
        (/\b(dinner|fine.dining|upscale|wine.list|tasting.menu)\b/i.test(allText) && 
         !/\b(brunch|breakfast|cafe|coffee)\b/i.test(allText))) {
        console.log(`[Validation] ${recommendation.name}: REJECT (dinner restaurant when brunch/cafe requested)`);
        return false;
    }

    // If user wants specific cuisine (pizza, sushi, etc.), reject other cuisines
    const cuisineTypes = ['pizza', 'sushi', 'chinese', 'thai', 'vietnamese', 'indian', 'mexican', 'burger'];
    const userWantsCuisine = userWants.filter(w => cuisineTypes.includes(w));
    
    if (userWantsCuisine.length > 0) {
        // Check if recommendation is a different cuisine
        const otherCuisines = cuisineTypes.filter(c => !userWantsCuisine.includes(c));
        for (const otherCuisine of otherCuisines) {
            const pattern = keywords[otherCuisine as keyof typeof keywords];
            if (pattern.test(allText) && !userWants.some(w => keywords[w as keyof typeof keywords].test(allText))) {
                console.log(`[Validation] ${recommendation.name}: REJECT (${otherCuisine} when ${userWantsCuisine.join('/')} requested)`);
                return false;
            }
        }
    }

    // Accept if at least 50% of requirements are met (for multi-requirement queries)
    const matchRatio = matchCount / userWants.length;
    const accepted = matchRatio >= 0.5;
    
    console.log(`[Validation] ${recommendation.name}: ${accepted ? 'ACCEPT' : 'REJECT'} (${matchCount}/${userWants.length} requirements met - ${mismatches.join(', ')} missing)`);
    
    return accepted;
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

        const extraInstructions = inputs.extraInstructions
            ? `Additional User Instructions: "${inputs.extraInstructions}"`
            : "";

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
