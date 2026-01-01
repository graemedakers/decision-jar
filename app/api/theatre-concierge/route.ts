import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isCouplePremium, isUserPro } from '@/lib/premium';
import { reliableGeminiCall } from '@/lib/gemini';
import { getExcludedNames } from '@/lib/concierge';


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

        // Determine the Active Jar
        // Priority: 1. activeJarId, 2. First membership, 3. Legacy couple
        const activeJar = (user?.activeJarId ? user.memberships.find(m => m.jarId === user.activeJarId)?.jar : null) ||
            user?.memberships?.[0]?.jar ||
            user?.couple;


        if (!user || !activeJar) {
            return NextResponse.json({ error: 'No active jar' }, { status: 400 });
        }

        if (!isCouplePremium(activeJar) && !isUserPro(user)) {
            return NextResponse.json({ error: 'Premium required' }, { status: 403 });
        }

        const { genre, vibe, location } = await request.json().catch(() => ({}));

        const userInterests = (user as any).interests;

        let extraInstructions = "";

        if (userInterests) {
            extraInstructions += `The user is interested in: ${userInterests}. Consider this when selecting performances.\n`;
        }

        const excludeNames = await getExcludedNames(activeJar.id);
        if (excludeNames.length > 0) {
            extraInstructions += `\nEXCLUSION LIST: Do NOT recommend these shows again: ${excludeNames.join(', ')}. Find NEW alternatives.\n`;
        }
        // -------------------------------------------------------------

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            // Mock response
            await new Promise(resolve => setTimeout(resolve, 1500));
            return NextResponse.json({
                recommendations: [
                    {
                        name: "The Phantom of the Opera",
                        description: "A chilling and romantic musical masterpiece.",
                        cuisine: "Musical",
                        price: "$$$",
                        address: "Her Majesty's Theatre",
                        opening_hours: "2h 30m",
                        website: "https://www.thephantomoftheopera.com/",
                        google_rating: 4.7
                    }
                ]
            });
        }

        const prompt = `
        Act as a theatre critic and concierge.
        Recommend 5 distinct NEW or CURRENT theatre performances (plays, musicals, opera, ballet, comedy) based on the following preferences:
        - Genre: ${genre || "Any"}
        - Vibe/Mood: ${vibe || "Any"}
        - Location: ${location || "New York, NY"} (Prioritize shows currently playing here)
        
        ${extraInstructions}
        
        For each show, provide:
        - Name (Title of the show)
        - Description: A brief, intriguing synopsis.
        - Genre (e.g. Musical, Play, Comedy)
        - "Price": Estimated price range (e.g. $50-$150)
        - "Address": The Name of the Theater/Venue and City.
        - "Website": Official booking link or venue URL.
        - "Opening Hours": Runtime (e.g. "2h 30m")
        - Rating: A critic score or audience rating out of 5 (e.g. 4.8)
        
        Return the result as a JSON object with a "recommendations" array.
        Example format:
        {
            "recommendations": [
                {
                    "name": "Show Title",
                    "description": "Synopsis...",
                    "cuisine": "Musical",
                    "price": "$50-$120",
                    "address": "Broadway Theatre, NY",
                    "website": "https://...",
                    "opening_hours": "150 min",
                    "google_rating": 4.8
                }
            ]
        }
        `;

        const result = await reliableGeminiCall(prompt);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Theatre Concierge error:', error);
        return NextResponse.json({ error: "Failed to fetch theatre shows" }, { status: 500 });
    }
}
