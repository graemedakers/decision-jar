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

            // Check premium status
            user = await prisma.user.findUnique({
                where: { email: session.user.email },
                include: {
                    memberships: { include: { jar: true } },
                    couple: true
                },
            });

            // Determine the Active Jar
            // Priority: 1. activeJarId, 2. First membership, 3. Legacy couple
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

        const { themes, difficulty, groupSize, location } = await request.json().catch(() => ({}));

        const coupleLocation = activeJar?.location;
        const userInterests = user ? (user as any).interests : null;

        let targetLocation = location;
        if (!targetLocation || targetLocation.trim() === "") {
            targetLocation = coupleLocation || "your local area";
        }

        let extraInstructions = "";

        // Add specific instructions for the location
        extraInstructions += `The user is looking for an escape room experience in or near "${targetLocation}". 
        - Find highly-rated escape rooms located in or very near "${targetLocation}".\n`;


        if (userInterests) {
            extraInstructions += `The user is interested in these general topics: ${userInterests}.\n`;
        }

        const excludeNames = activeJar ? await getExcludedNames(activeJar.id) : [];
        if (excludeNames.length > 0) {
            extraInstructions += `\nEXCLUSION LIST: The user is already aware of the following places. Do NOT match or recommend these exact names again: ${excludeNames.join(', ')}. Find NEW alternatives.\n`;
        }
        // -------------------------------------------------------------

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            // Mock response fordev/testing without API key
            await new Promise(resolve => setTimeout(resolve, 1500));
            return NextResponse.json({
                recommendations: [
                    {
                        name: "The Locked Room Mock",
                        description: "A classic mystery escape room.",
                        theme_type: "Mystery",
                        difficulty_level: "Intermediate",
                        price: "$$",
                        address: "123 Puzzle St, " + (targetLocation || "City"),
                        google_rating: 4.8,
                        website: "https://example.com"
                    },
                    {
                        name: "Sci-Fi Escape",
                        description: "Escape a spaceship before oxygen runs out.",
                        theme_type: "Sci-Fi",
                        difficulty_level: "Hard",
                        price: "$$",
                        address: "456 Space Ave, " + (targetLocation || "City"),
                        google_rating: 4.9,
                        website: "https://example.com"
                    }
                ]
            });
        }

        const prompt = `
        Act as an expert game master and entertainment concierge for ${targetLocation}.
        Recommend 5 distinct Escape Rooms based on the following preferences:
        - Desired Themes: ${themes && themes.length > 0 ? themes.join(", ") : "Any (Horror, Mystery, Adventure, etc)"}
        - Difficulty Level: ${difficulty || "Any"}
        - Group Size: ${groupSize || "Standard (2-6)"}
        
        ${extraInstructions}
        
        IMPORTANT: Perform a check to ensure the place is currently OPEN for business.
        
        For each venue, provide:
        - Name
        - A brief, enticing description (1 sentence)
        - Theme/Genre (e.g. Horror, Heist, Magic)
        - Difficulty Level (Beginner, Intermediate, Expert)
        - Price Category ($ = Budget, $$ = Moderate, $$$ = Expensive)
        - Approximate address or neighborhood
        - A likely website URL (or a Google Search URL if specific site unknown)
        - Approximate Google Rating (e.g. 4.8)
        
        Return the result as a JSON object with a "recommendations" array.
        Example format:
        {
            "recommendations": [
                {
                    "name": "Escape Room Name",
                    "description": "Solve the murder mystery in a haunted mansion.",
                    "theme_type": "Horror/Mystery",
                    "difficulty_level": "Intermediate",
                    "price": "$$",
                    "address": "123 Main St, Downtown",
                    "website": "https://example.com",
                    "google_rating": 4.9
                }
            ]
        }
        Do not include markdown formatting. Just raw JSON.
        `;

        const result = await reliableGeminiCall(prompt);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Escape Room Concierge error:', error);

        // Fallback to mock data
        return NextResponse.json({
            recommendations: [
                {
                    name: "Escape City (Fallback)",
                    description: "Popular local escape room center.",
                    theme_type: "Variety",
                    difficulty_level: "Various",
                    price: "$$",
                    address: "Central Sq, " + (location || "City"),
                    google_rating: 4.5
                }
            ]
        });
    }
}
