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

        const rateLimit = await checkRateLimit(user);
        if (!rateLimit.allowed) {
            return NextResponse.json({ error: 'Rate limit exceeded', details: rateLimit.error }, { status: 429 });
        }

        const { genre, vibe, platforms, decades, location } = await request.json().catch(() => ({}));

        const userInterests = (user as any).interests;

        let extraInstructions = "";

        if (userInterests) {
            extraInstructions += `The user is interested in: ${userInterests}. Consider this when selecting movies.\n`;
        }

        if (platforms) {
            extraInstructions += `PRIORITY: Limit recommendations to movies available on: ${platforms}.\n`;
            if (platforms.includes("Cinemas (Local)")) {
                extraInstructions += `IMPORTANT: Since 'Cinemas (Local)' is selected, include at least 2 movies currently playing in theaters near ${location || 'the user'}. Provide cinema names or broad session info in the 'address' field.\n`;
            }
        }

        const excludeNames = await getExcludedNames(activeJar.id);
        if (excludeNames.length > 0) {
            extraInstructions += `\nEXCLUSION LIST: Do NOT recommend these movies again: ${excludeNames.join(', ')}. Find NEW alternatives.\n`;
        }
        // -------------------------------------------------------------

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        const prompt = `
        Act as a movie critic and local cinema guide.
        Recommend 5 distinct movies based on the following preferences:
        - Genre: ${genre || "Any"}
        - Vibe/Mood: ${vibe || "Any"}
        - Platforms/Cinemas: ${platforms || "Any (Suggest best available)"}
        - User Location: ${location || "Not provided (assume general if cinema is selected)"}
        - Era / Decade: ${decades || "Any"}
        
        ${extraInstructions}
        
        For each movie, provide:
        - Name (Title)
        - A brief, intriguing synopsis (1 sentence)
        - Genre
        - "Price": The specific streaming platform name OR "In Theaters"
        - "Address": If "In Theaters", say "At Cinemas (e.g. Acme Cinema ${location || ''})". If streaming, say "Streaming".
        - A likely website URL (IMDB, Fandango for theaters, or Streaming Link)
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
                    "price": "In Theaters",
                    "address": "At Cinemas near ${location || 'you'}",
                    "website": "https://fandango.com/...",
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
