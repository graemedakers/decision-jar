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

        const { facilities, budget, location, type } = await request.json().catch(() => ({}));

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
        extraInstructions += `The user is looking for a hotel stay in or near "${targetLocation}". 
        - Find suggested hotels, resorts, or b&bs located in or very near "${targetLocation}".\n`;


        if (userInterests) {
            extraInstructions += `The user is interested in: ${userInterests}. Consider this when selecting the vibe.\n`;
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
                        name: "Grand Hotel Mock",
                        description: "A luxury stay with all amenities.",
                        speciality: "Luxury",
                        price: "$$$",
                        address: "123 Grand Ave, " + (targetLocation || "City"),
                        google_rating: 4.7,
                        website: "https://example.com"
                    },
                    {
                        name: "Boutique Inn",
                        description: "Charming and cozy with unique decor.",
                        speciality: "Boutique",
                        price: "$$",
                        address: "456 Main St, " + (targetLocation || "City"),
                        google_rating: 4.5,
                        website: "https://example.com"
                    }
                ]
            });
        }

        const prompt = `
        Act as a luxury travel agent and hotel concierge for ${targetLocation}.
        Recommend 5 distinct hotels, resorts, or B&Bs based on the following preferences:
        - Accommodation Type: ${type || "Any"}
        - Budget/Price Range: ${budget || "Any"}
        - Desired Facilities: ${facilities && facilities.length > 0 ? facilities.join(", ") : "Any"}
        
        ${extraInstructions}
        
        IMPORTANT: Perform a check to ensure the place is currently OPEN for business.
        
        For each venue, provide:
        - Name
        - A brief, enticing description (1 sentence)
        - Main Style/Vibe (e.g. Modern, Historic, Resort)
        - Price Category ($ = Budget, $$ = Moderate, $$$ = Expensive, $$$$ = Luxury)
        - Approximate address or neighborhood
        - A likely website URL (or a Google Search URL if specific site unknown)
        - Key Amenities List (e.g. "Pool, Spa, Free WiFi")
        - Approximate Google Rating (e.g. 4.5)
        
        Return the result as a JSON object with a "recommendations" array.
        Example format:
        {
            "recommendations": [
                {
                    "name": "Hotel Name",
                    "description": "A stunning view of the city.",
                    "speciality": "Modern Luxury",
                    "price": "$$$",
                    "address": "123 Main St, Downtown",
                    "website": "https://example.com",
                    "amenities": "Pool, Gym, Spa",
                    "google_rating": 4.6
                }
            ]
        }
        Do not include markdown formatting. Just raw JSON.
        `;

        const result = await reliableGeminiCall(prompt);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Hotel Concierge error:', error);

        // Fallback to mock data
        return NextResponse.json({
            recommendations: [
                {
                    name: "City Central Hotel (Fallback)",
                    description: "Conveniently located in the heart of the city.",
                    speciality: "Business/Travel",
                    price: "$$",
                    address: "Central Sq, " + (location || "City"),
                    amenities: "WiFi, Breakfast",
                    google_rating: 4.0
                }
            ]
        });
    }
}
