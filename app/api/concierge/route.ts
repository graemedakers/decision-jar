
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isCouplePremium, isUserPro } from '@/lib/premium';
import { reliableGeminiCall } from '@/lib/gemini';
import { getExcludedNames } from '@/lib/concierge';
import { checkRateLimit } from '@/lib/rate-limit';
import { CONCIERGE_CONFIGS } from '@/lib/concierge-configs';
import { getConciergePromptAndMock } from '@/lib/concierge-prompts';

export async function POST(request: Request) {
    try {
        const isDemoMode = request.headers.get('x-demo-mode') === 'true';

        let activeJar: any = null;
        let user: any = null;

        if (!isDemoMode) {
            const session = await getSession();
            if (!session?.user?.email) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            // Check premium status
            user = await prisma.user.findUnique({
                where: { email: session.user.email },
                include: {
                    memberships: { include: { jar: true } },
                    couple: true
                },
            });

            // Determine the Active Jar
            activeJar = (user?.activeJarId ? user.memberships.find((m: any) => m.jarId === user.activeJarId)?.jar : null) ||
                user?.memberships?.[0]?.jar ||
                user?.couple;


            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 400 });
            }

            // Check premium status
            if (!activeJar || (!isCouplePremium(activeJar) && !isUserPro(user))) {
                if (!isUserPro(user)) {
                    return NextResponse.json({ error: 'Premium required' }, { status: 403 });
                }
            }

            const rateLimit = await checkRateLimit(user);
            if (!rateLimit.allowed) {
                return NextResponse.json({ error: 'Rate limit exceeded', details: rateLimit.error }, { status: 429 });
            }
        }

        const body = await request.json().catch(() => ({}));
        const { location, toolId } = body;

        // Identify the tool key (e.g. 'DINING') from the toolId (e.g. 'dining_concierge')
        // We assume the frontend sends 'toolId'.
        const toolKey = Object.keys(CONCIERGE_CONFIGS).find(k => CONCIERGE_CONFIGS[k].id === toolId);

        if (!toolKey) {
            return NextResponse.json({ error: 'Invalid tool ID' }, { status: 400 });
        }

        const coupleLocation = activeJar?.location;
        const userInterests = user ? (user as any).interests : null;

        let targetLocation = location;
        if (!targetLocation || targetLocation.trim() === "") {
            targetLocation = coupleLocation || "your local area";
        }

        // --- Build Instructions ---
        let extraInstructions = "";

        // Only add strict location logic if the tool is location-based
        const config = CONCIERGE_CONFIGS[toolKey];
        if (config.hasLocation) {
            extraInstructions += `The user is asking about "${targetLocation}". 
            - Use this location as the primary search area.
            - If "${targetLocation}" is detailed (e.g. "Paris"), search there.
            - If generic (e.g. "Local"), assume the user's current city.
            - CRITICAL: If the input contains a specific address, prioritize venues within walking distance.\n`;
        }

        if (userInterests) {
            extraInstructions += `The user is interested in: ${userInterests}. Consider this for context.\n`;
        }

        const excludeNames = activeJar ? await getExcludedNames(activeJar.id) : [];
        if (excludeNames.length > 0) {
            extraInstructions += `\nEXCLUSION LIST: The user is already aware of these places. Do NOT match: ${excludeNames.join(', ')}. Find NEW alternatives.\n`;
        }

        // --- Generate Prompt ---
        const { prompt, mockResponse } = getConciergePromptAndMock(toolKey, body, targetLocation, extraInstructions);

        // --- Call AI ---
        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            return NextResponse.json(mockResponse);
        }

        try {
            const result = await reliableGeminiCall(prompt);
            return NextResponse.json(result);
        } catch (error) {
            console.error('Unified Concierge AI error:', error);
            // Fallback to mock on AI failure
            return NextResponse.json(mockResponse);
        }

    } catch (error: any) {
        console.error('Unified Concierge error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
