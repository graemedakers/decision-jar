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
                couple: true // Legacy fallback
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

        const { genre, vibe, platforms, decades } = await request.json().catch(() => ({}));

        const userInterests = (user as any).interests;

        let extraInstructions = "";

        if (userInterests) {
            extraInstructions += `The user is interested in: ${userInterests}. Consider this when selecting movies.\n`;
        }

        if (platforms) {
            extraInstructions += `PRIORITY: Limit recommendations to movies available on: ${platforms}. If a movie is not on these, do not suggest it unless it is currently In Theaters.\n`;
        }

        const excludeNames = await getExcludedNames(activeJar.id);
        if (excludeNames.length > 0) {
            extraInstructions += `\nEXCLUSION LIST: Do NOT recommend these movies again: ${excludeNames.join(', ')}. Find NEW alternatives.\n`;
        }
        // -------------------------------------------------------------

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            // Mock response
            await new Promise(resolve => setTimeout(resolve, 1500));
            return NextResponse.json({
                recommendations: [
                    {
                        name: "Inception",
                        description: "A thief who steals corporate secrets through the use of dream-sharing technology.",
                        cuisine: "Sci-Fi",
                        price: "Netflix", // Mock platform
                        address: "Streaming",
                        google_rating: 4.8
                    }
                ]
            });
        }

        const prompt = `
        Act as a movie critic and concierge.
        Recommend 5 distinct movies based on the following preferences:
        - Genre: ${genre || "Any"}
        - Vibe/Mood: ${vibe || "Any"}
        - Streaming Platforms: ${platforms || "Any (Suggest best available)"}
        - Era / Decade: ${decades || "Any"}
        
        ${extraInstructions}
        
        For each movie, provide:
        - Name (Title)
        - A brief, intriguing synopsis (1 sentence)
        - Genre
        - "Price": The specific streaming platform name (e.g. Netflix, Prime) OR "In Theaters"
        - "Address": If "In Theaters", say "Cinema". If streaming, say "Streaming".
        - A likely website URL (IMDB or Rotten Tomatoes or Streaming Link)
        - "Opening Hours": Runtime (e.g. "2h 15m")
        - Rotten Tomatoes or IMDB Score (e.g. 8.5)
        
        Return the result as a JSON object with a "recommendations" array.
        Example format:
        {
            "recommendations": [
                {
                    "name": "Movie Title",
                    "description": "Intriguing summary.",
                    "cuisine": "Sci-Fi / Thriller",
                    "price": "Netflix",
                    "address": "Streaming",
                    "website": "https://imdb.com/...",
                    "opening_hours": "120 min",
                    "google_rating": 8.5
                }
            ]
        }
        `;

        const result = await reliableGeminiCall(prompt);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Movie Concierge error:', error);
        return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
    }
}
