import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isCouplePremium, isUserPro } from '@/lib/premium';
import { reliableGeminiCall } from '@/lib/gemini';
import { getExcludedNames } from '@/lib/concierge';
import { checkRateLimit } from '@/lib/rate-limit';


export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check premium status
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                memberships: { include: { jar: true } },
                couple: true
            },
        });

        let activeJar = null;
        if (user) {
            if (user.activeJarId) {
                activeJar = user.memberships.find(m => m.jarId === user.activeJarId)?.jar;
            } else if (user.coupleId) {
                activeJar = user.couple;
            } else if (user.memberships.length > 0) {
                activeJar = user.memberships[0].jar;
            }
        }

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

        const { genre, players, budget, duration } = await request.json().catch(() => ({}));

        let extraInstructions = "";
        const excludeNames = await getExcludedNames(activeJar.id);
        if (excludeNames.length > 0) {
            extraInstructions += `\nEXCLUSION LIST: Do NOT recommend these games again: ${excludeNames.join(', ')}. Find NEW alternatives.\n`;
        }

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            // Mock response
            await new Promise(resolve => setTimeout(resolve, 1500));
            return NextResponse.json({
                recommendations: [
                    {
                        name: "Among Us",
                        description: "A multiplayer game of teamwork and betrayal.",
                        cuisine: "Social Deduction",
                        price: "Free / $5",
                        address: "PC / Mobile / Console",
                        opening_hours: "15-20 mins per round",
                        google_rating: 4.5
                    }
                ]
            });
        }

        const prompt = `
        Act as a gaming concierge.
        Recommend 5 distinct online digital games (playable alone or with friends remotely) based on:
        - Genre: ${genre || "Any"}
        - Minimum Players: ${players || "Any"}
        - Budget: ${budget || "Any"}
        - Typical Duration: ${duration || "Any"}
        
        ${extraInstructions}
        
        For each game, provide:
        - Name (Title)
        - A brief, intriguing description
        - Genre
        - Price (e.g. Free, $15, $60)
        - "Address": Platform (e.g. Steam, Browser, Mobile, Cross-platform)
        - A likely website URL (Official site or Store page)
        - "Opening Hours": Typical session duration (e.g. "30 mins", "∞")
        - Rating (e.g. 9/10 or 4.5/5)
        
        Return the result as a JSON object with a "recommendations" array.
        Example format:
        {
            "recommendations": [
                {
                    "name": "Game Title",
                    "description": "Fun game description.",
                    "cuisine": "Strategy",
                    "price": "Free",
                    "address": "Web Browser",
                    "website": "https://...",
                    "opening_hours": "30 mins",
                    "google_rating": 4.5
                }
            ]
        }
        `;

        const result = await reliableGeminiCall(prompt);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Game Concierge error:', error);
        return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
    }
}
