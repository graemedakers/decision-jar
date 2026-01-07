import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { CONCIERGE_CONFIGS } from '@/lib/concierge-configs';
import { getConciergePromptAndMock } from '@/lib/concierge-prompts';
import { checkSubscriptionAccess } from '@/lib/premium';

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
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Request Body
        const { configId, inputs, location: cachedLocation, useMockData } = await req.json();

        // 3. Find Tool Config
        // We search by ID first (e.g., 'dining_concierge') or Key (e.g., 'DINING')
        const toolKey = Object.keys(CONCIERGE_CONFIGS).find(
            key => CONCIERGE_CONFIGS[key].id === configId || key === configId
        );

        if (!toolKey) {
            return NextResponse.json({ error: `Invalid config ID: ${configId}` }, { status: 400 });
        }

        const config = CONCIERGE_CONFIGS[toolKey];

        // 4. Rate Limiting
        if (ratelimit) {
            const identifier = session.user.id;
            const { success } = await ratelimit.limit(identifier);
            if (!success) {
                return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
            }
        }

        // 5. Subscription Check
        const access = await checkSubscriptionAccess(session.user.id, config.id);
        if (!access.allowed) {
            return NextResponse.json({ error: access.reason || 'Premium required' }, { status: 403 });
        }

        // 6. Location Context
        let targetLocation = "your area";
        if (config.hasLocation && cachedLocation) {
            targetLocation = `${cachedLocation.city}, ${cachedLocation.region}, ${cachedLocation.country}`;
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

        // 8. Call AI
        // Using streamText from 'ai' library which is standard across the app
        const result = await streamText({
            model: google('gemini-1.5-flash'),
            system: "You are a helpful, expert lifestyle concierge. You MUST return valid JSON only. No markdown formatting.",
            prompt: prompt,
            // We can add tools here later for real Google Maps search if needed
        });

        return result.toTextStreamResponse();

    } catch (error: any) {
        console.error('Unified Concierge Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate recommendations' },
            { status: 500 }
        );
    }
}
