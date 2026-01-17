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
 * Uses AI to determine if the recommendation is relevant
 */
async function validateRecommendation(
    recommendation: any,
    userRequest: string,
    toolType: string
): Promise<boolean> {
    // If no specific request, accept all recommendations
    if (!userRequest || userRequest.trim().length === 0) {
        return true;
    }

    // Quick validation prompt for AI
    const validationPrompt = `
You are a recommendation validator. Your job is to determine if a venue/item matches the user's specific request.

USER'S REQUEST: "${userRequest}"
TOOL TYPE: ${toolType}

RECOMMENDATION TO VALIDATE:
- Name: ${recommendation.name}
- Description: ${recommendation.description}
- Type/Cuisine: ${recommendation.cuisine || recommendation.category || recommendation.type || recommendation.speciality || 'N/A'}

QUESTION: Does this recommendation match the user's specific request?

Consider:
- If user asked for "brunch cafes", this should be a brunch cafe (NOT a dinner restaurant, NOT a sushi place)
- If user asked for "good coffee", this should be known for good coffee
- If user asked for "pizza places", this should be a pizza restaurant
- If user asked for specific cuisine/venue type, this should match that type

Answer with ONLY "YES" or "NO" (one word only).
`;

    try {
        const response = await reliableGeminiCall(validationPrompt, { jsonMode: false });
        const answer = response.trim().toUpperCase();
        
        console.log(`[Validation] ${recommendation.name}: ${answer} (User request: "${userRequest}")`);
        
        return answer === 'YES' || answer.startsWith('YES');
    } catch (error) {
        console.error('[Validation] Error validating recommendation:', error);
        // On error, accept the recommendation (fail open)
        return true;
    }
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
                
                // Validate each recommendation in parallel
                const validationResults = await Promise.all(
                    jsonResponse.recommendations.map(rec => 
                        validateRecommendation(rec, inputs.extraInstructions, toolKey)
                    )
                );
                
                // Filter to only matching recommendations
                const filteredRecommendations = jsonResponse.recommendations.filter(
                    (_: any, index: number) => validationResults[index]
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
