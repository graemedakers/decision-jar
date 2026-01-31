import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { CONCIERGE_CONFIGS } from '@/lib/concierge-configs';
import { checkSubscriptionAccess } from '@/lib/premium';
import { apiError, handleApiError } from '@/lib/api-response';
import { ConciergeService } from '@/lib/services/concierge-service';

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
        // 1. Parse Request Body
        const body = await req.json();
        const { configId, inputs: rawInputs, location: cachedLocation, useMockData, isDemo, isPrivate, price } = body;

        // Ensure price is included in inputs for the prompt generator
        const inputs = { ...(rawInputs || {}), price: price || rawInputs?.price };

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

        console.log(`[Concierge] Received configId: "${configId}", resolved toolKey: "${toolKey}"`);
        console.log(`[Concierge] extraInstructions: "${rawExtraInstructions}"`);

        if (!toolKey) {
            return apiError(`Invalid config ID: ${configId}`, 400, 'INVALID_CONFIG');
        }

        const config = CONCIERGE_CONFIGS[toolKey];

        // 4. Rate Limiting (skip for demo mode)
        if (ratelimit && !isDemoMode) {
            const identifier = session!.user.id!;
            const { success } = await ratelimit.limit(identifier);
            if (!success) {
                return apiError('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT');
            }
        }

        // 5. Subscription Check
        if (!isDemoMode) {
            const access = await checkSubscriptionAccess(session!.user.id!, config.id);
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

        // 7. Execute via Shared Kernel Service
        const result = await ConciergeService.generateIdeas({
            toolKey,
            configId,
            inputs,
            targetLocation,
            isPrivate: isPrivate === true,
            extraInstructions: rawExtraInstructions,
            useMockData
        });

        return NextResponse.json(result);

    } catch (error: any) {
        return handleApiError(error);
    }
}
