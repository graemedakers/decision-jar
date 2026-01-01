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

        const { drinks, vibe, location, price } = await request.json().catch(() => ({}));

        const coupleLocation = activeJar.location;
        const userInterests = (user as any).interests;

        // If user manually provided a location in the request, use that.
        // Otherwise, use couple location.
        // Use the location provided in the request, or fallback to couple's location if empty
        let targetLocation = location;
        if (!targetLocation || targetLocation.trim() === "") {
            targetLocation = coupleLocation || "your local area";
        }

        let extraInstructions = "";

        // Add specific instructions for the location
        extraInstructions += `The user is asking about "${targetLocation}". 
        - Find bars and drink spots located in or very near "${targetLocation}".
        - CRITICAL: If the input contains a specific address or venue name, prioritize bars within walking distance (5-10 mins) of that location.\n`;


        if (userInterests) {
            extraInstructions += `The user is interested in: ${userInterests}. Consider this when selecting the vibe or drinks if applicable.\n`;
        }

        const excludeNames = await getExcludedNames(activeJar.id);
        if (excludeNames.length > 0) {
            extraInstructions += `\nEXCLUSION LIST: The user is already aware of the following places. Do NOT match or recommend these exact names again: ${excludeNames.join(', ')}. Find NEW alternatives.\n`;
        }
        // -------------------------------------------------------------

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            // Mock response for dev/testing without API key
            await new Promise(resolve => setTimeout(resolve, 1500));
            return NextResponse.json({
                recommendations: [
                    {
                        name: "The Mockingbird Lounge",
                        description: "Lively atmosphere and amazing cocktails.",
                        speciality: "Cocktails",
                        price: "$$$",
                        address: "456 Oak Ave, " + (targetLocation || "City")
                    },
                    {
                        name: "Mock Pub",
                        description: "Classic pub with a great beer selection.",
                        speciality: "Beer",
                        price: "$",
                        address: "123 Main St, " + (targetLocation || "City")
                    },
                    {
                        name: "Vineyard Vibes",
                        description: "Cozy wine bar with a fireplace.",
                        speciality: "Wine",
                        price: "$$",
                        address: "789 Pine Ln, " + (targetLocation || "City")
                    }
                ]
            });
        }

        const prompt = `
        Act as a local nightlife concierge for ${targetLocation}.
        Recommend 5 distinct bars or places to have a drink based on the following preferences:
        - Drinks Speciality: ${drinks || "Any good local drinks"}
        - Vibe/Atmosphere: ${vibe || "Any"}
        - Price Range: ${price || "Any"}
        
        ${extraInstructions}
        
        IMPORTANT: Perform a check to ensure the bar/venue is currently OPEN for business and has NOT permanently closed. Do NOT exclude any currently operating bar within the location bounds.
        
        For each venue, provide:
        - Name
        - A brief, enticing description (1 sentence)
        - Drinks Speciality (e.g. Wine, Cocktails, Craft Beer, Dive Bar)
        - Price range ($, $$, $$$)
        - Approximate address or neighborhood
        - A likely website URL (or a Google Search URL if specific site unknown)
        - Typical opening hours for evening (e.g. "5pm - 2am")
        - Approximate Google Rating (e.g. 4.5)
        
        Return the result as a JSON object with a "recommendations" array.
        Example format:
        {
            "recommendations": [
                {
                    "name": "Bar Name",
                    "description": "Great spot for drinks.",
                    "speciality": "Cocktails",
                    "price": "$$",
                    "address": "123 Main St, Neighborhood",
                    "website": "https://example.com",
                    "opening_hours": "5pm - 2am",
                    "google_rating": 4.5
                }
            ]
        }
        Do not include markdown formatting. Just raw JSON.
        `;

        const result = await reliableGeminiCall(prompt);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Bar Concierge error:', error);

        // Fallback to mock data if AI fails, so the user experience isn't broken
        return NextResponse.json({
            recommendations: [
                {
                    name: "The Local Speakeasy (Fallback)",
                    description: "A hidden gem with amazing craft cocktails and a cozy vibe. (AI temporarily unavailable)",
                    speciality: "Cocktails",
                    price: "$$",
                    address: "Downtown, " + (location || "City"),
                    opening_hours: "6pm - 2am",
                    google_rating: 4.7
                },
                {
                    name: "Hops & Dreams",
                    description: "Relaxed atmosphere with a massive selection of local brews.",
                    speciality: "Craft Beer",
                    price: "$",
                    address: "Main St, " + (location || "City"),
                    opening_hours: "12pm - 12am",
                    google_rating: 4.5
                },
                {
                    name: "Vino Valley",
                    description: "Elegant wine bar offering tastings and small plates.",
                    speciality: "Wine",
                    price: "$$$",
                    address: "River Walk, " + (location || "City"),
                    opening_hours: "4pm - 11pm",
                    google_rating: 4.8
                }
            ]
        });
    }
}
