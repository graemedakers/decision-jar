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

export async function POST(req: NextRequest) {
    try {
        // 1. Auth & Subscription Check
        const session = await getSession();
        if (!session?.user?.email) {
            return apiError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        // 2. Parse Request Body
        const { configId, inputs, location: cachedLocation, useMockData } = await req.json();

        // 3. Find Tool Config
        // We search by ID first (e.g., 'dining_concierge') or Key (e.g., 'DINING')
        const toolKey = Object.keys(CONCIERGE_CONFIGS).find(
            key => CONCIERGE_CONFIGS[key].id === configId || key === configId
        );

        if (!toolKey) {
            return apiError(`Invalid config ID: ${configId}`, 400, 'INVALID_CONFIG');
        }

        const config = CONCIERGE_CONFIGS[toolKey];

        // 4. Rate Limiting
        if (ratelimit) {
            const identifier = session.user.id;
            const { success } = await ratelimit.limit(identifier);
            if (!success) {
                return apiError('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT');
            }
        }

        // 5. Subscription Check
        const access = await checkSubscriptionAccess(session.user.id, config.id);
        if (!access.allowed) {
            return apiError(access.reason || 'Premium required', 403, 'PREMIUM_REQUIRED');
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
            return NextResponse.json(jsonResponse);
        } catch (genError: any) {
            console.error("Concierge AI Failed:", genError);
            return apiError("AI Service Unavailable: " + genError.message, 500, "AI_ERROR");
        }

    } catch (error: any) {
        return handleApiError(error);
    }
}
