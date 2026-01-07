import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isCouplePremium, isUserPro } from '@/lib/premium';
import { reliableGeminiCall } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check premium status
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                memberships: { include: { jar: true } },
                legacyJar: true
            },
        });

        // Determine the Active Jar
        const activeJar = (user?.activeJarId ? user.memberships.find(m => m.jarId === user.activeJarId)?.jar : null) ||
            user?.memberships?.[0]?.jar ||
            user?.legacyJar;

        if (!user || !activeJar) {
            return NextResponse.json({ error: 'No active jar' }, { status: 400 });
        }

        if (!isCouplePremium(activeJar) && !isUserPro(user)) {
            return NextResponse.json({ error: 'Premium required' }, { status: 403 });
        }

        const rateLimit = await checkRateLimit(user);
        if (!rateLimit.allowed) {
            return NextResponse.json({ error: 'Rate limit exceeded', details: rateLimit.error }, { status: 429 });
        }

        const { location, count, type } = await request.json().catch(() => ({}));

        const targetLocation = location || activeJar.location || "your local area";
        const stopCount = count || 3;
        const barType = type || "Any";

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            // Mock response for dev
            await new Promise(resolve => setTimeout(resolve, 1500));
            return NextResponse.json({
                itinerary: [
                    {
                        sequence: 1,
                        name: "The Starting Point",
                        description: "Begin here with a relaxed drink.",
                        address: "123 Start St, " + targetLocation,
                        walking_time_to_next: "5 mins",
                        website: "https://example.com"
                    },
                    {
                        sequence: 2,
                        name: "The Middle Ground",
                        description: "Ramp up the energy here.",
                        address: "456 Mid Ave, " + targetLocation,
                        walking_time_to_next: "10 mins",
                        website: "https://example.com"
                    },
                    {
                        sequence: 3,
                        name: "The Final Stop",
                        description: "End the night with a view.",
                        address: "789 End Blvd, " + targetLocation,
                        walking_time_to_next: null,
                        website: "https://example.com"
                    }
                ]
            });
        }

        const prompt = `
        Act as a expert nightlife planner for ${targetLocation}.
        Plan a "Bar Crawl" route with exactly ${stopCount} stops.
        
        Constraints:
        - Location: ${targetLocation}
        - Minimum Stops: ${stopCount}
        - Bar Type Preference: ${barType} (If "Any", mix it up. If specific, prioritize that type but ensure proximity).
        - LOGIC: The bars MUST be in close proximity (walking distance preferred, or short transit).
        - OPTIMIZATION: Order them in the most logical geographic sequence to minimize travel time.
        - Open for business: Ensure places are currently operating.

        For each stop, provide:
        - Sequence Number
        - Name
        - A brief 1-sentence description fitting for a crawl.
        - Exact Address (for mapping).
        - Estimated walking time to the NEXT stop (null for the last stop).
        - Website URL (if available, otherwise null).

        Return the result as a JSON object with a "itinerary" array.
        Example format:
        {
            "itinerary": [
                {
                    "sequence": 1,
                    "name": "Bar A",
                    "description": "Start here...",
                    "address": "123 Main St",
                    "walking_time_to_next": "5 mins",
                    "website": "https://bara.com"
                },
                ...
            ]
        }
        Do not include markdown. Just raw JSON.
        `;

        const result = await reliableGeminiCall(prompt);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Bar Crawl Planner error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
