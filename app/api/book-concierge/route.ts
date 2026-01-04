import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isCouplePremium, isUserPro } from '@/lib/premium';
import { reliableGeminiCall } from '@/lib/gemini';
import { getExcludedNames } from '@/lib/concierge';
import { checkRateLimit } from '@/lib/rate-limit';

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

            user = await prisma.user.findUnique({
                where: { email: session.user.email },
                include: {
                    memberships: { include: { jar: true } },
                    couple: true
                },
            });

            activeJar = (user?.activeJarId ? user.memberships.find((m: any) => m.jarId === user.activeJarId)?.jar : null) ||
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
        }

        const { genre, vibe, length, era, interests } = await request.json().catch(() => ({}));

        let extraInstructions = "";
        if (interests) {
            extraInstructions += `The user is interested in: ${interests}. Prioritize books that align with these interests.\n`;
        }

        const excludeNames = activeJar ? await getExcludedNames(activeJar.id) : [];
        if (excludeNames.length > 0) {
            extraInstructions += `\nEXCLUSION LIST: Do NOT recommend these books: ${excludeNames.join(', ')}.\n`;
        }

        const prompt = `
        Act as a world-class librarian and book curator.
        Recommend 5 distinct books based on:
        - Genre: ${genre || "Any"}
        - Vibe/Mood: ${vibe || "Any"}
        - Preferred Length: ${length || "Any"}
        - Era: ${era || "Any"}
        
        ${extraInstructions}
        
        For each book, provide:
        - Name (Title)
        - Author
        - A brief, captivating synopsis (2 sentences)
        - Genre
        - "Price": Estimated reading time or page count (e.g. "350 pages / ~8 hours")
        - "Address": The year it was published.
        - "Opening Hours": The tone/vibe (e.g. "Dark, Philosophical, Gripping")
        - Goodreads/StoryGraph Score (e.g. 4.2)
        
        Return the result as a JSON object with a "recommendations" array.
        Example format:
        {
            "recommendations": [
                {
                    "name": "Book Title",
                    "author": "Author Name",
                    "description": "Captivating summary.",
                    "cuisine": "Genre Name",
                    "price": "300 pages",
                    "address": "Published 2021",
                    "opening_hours": "Atmospheric",
                    "google_rating": 4.5
                }
            ]
        }
        `;

        const result = (await reliableGeminiCall(prompt)) as any;

        // Add reliable search links
        if (result.recommendations && Array.isArray(result.recommendations)) {
            result.recommendations = result.recommendations.map((rec: any) => {
                const searchName = `${rec.name} ${rec.author || ''}`;
                return {
                    ...rec,
                    // Use author in the display name if available
                    name: rec.author ? `${rec.name} by ${rec.author}` : rec.name,
                    website: `https://www.google.com/search?q=${encodeURIComponent(searchName + " book amazon")}`
                };
            });
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Book Concierge error:', error);
        return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
    }
}
