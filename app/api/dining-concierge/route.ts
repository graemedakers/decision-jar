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

        const { cuisine, vibe, location, price } = await request.json().catch(() => ({}));

        const coupleLocation = activeJar.location;
        const userInterests = (user as any).interests;

        // If user manually provided a location in the request, use that.
        // Otherwise, use couple location.
        let targetLocation = location;
        let extraInstructions = "";

        // Check if the requested location is effectively the default couple location (or empty)
        // We normalize strings to be safe (trim, lowercase)
        const isDefaultLocation = !location || (coupleLocation && location.trim().toLowerCase() === coupleLocation.trim().toLowerCase());

        if (isDefaultLocation) {
            targetLocation = coupleLocation || "your local area";
        } else {
            // If a specific location/activity was provided (e.g. "Hiking" or "The Alamo"), 
            // rely ONLY on that information.
            extraInstructions += `The user is asking about "${targetLocation}". 
            - If "${targetLocation}" is a specific place or city (e.g. "The Alamo", "Paris", "123 Main St"), find restaurants near THAT place.
            - If "${targetLocation}" is a generic activity or contains details (e.g. "Hiking", "Context: ..."), first IDENTIFY the best specific venue for this activity based ONLY on the provided text, then find restaurants near THAT venue.
            - CRITICAL: If the input contains a specific address or venue name, prioritize restaurants within walking distance (5-10 mins) of that location.\n`;
        }

        if (userInterests) {
            extraInstructions += `The user is interested in: ${userInterests}. Consider this when selecting the vibe or cuisine if applicable.\n`;
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
                        name: "Mock Bistro",
                        description: "A cozy spot with great pasta.",
                        cuisine: cuisine || "Italian",
                        price: "$$",
                        address: "123 Main St, " + (targetLocation.split(" and ")[0] || "City")
                    },
                    {
                        name: "The Mockingbird",
                        description: "Lively atmosphere and amazing cocktails.",
                        cuisine: "Modern American",
                        price: "$$$",
                        address: "456 Oak Ave, " + (targetLocation.split(" and ")[0] || "City")
                    },
                    {
                        name: "Home Town Taco",
                        description: "Best street tacos in town.",
                        cuisine: "Mexican",
                        price: "$",
                        address: "789 Pine Ln, " + (targetLocation.split(" and ")[0] || "City")
                    }
                ]
            });
        }

        const prompt = `
        Act as a local dining concierge for ${targetLocation}.
        Recommend 5 distinct restaurants based on the following preferences:
        - Cuisine: ${cuisine || "Any good local food"}
        - Vibe/Atmosphere: ${vibe || "Any"}
        - Price Range: ${price || "Any"}
        
        ${extraInstructions}
        
        IMPORTANT: Perform a check to ensure the restaurant is currently OPEN for business and has NOT permanently closed.
        
        For each restaurant, provide:
        - Name
        - A brief, appetizing description (1 sentence)
        - Cuisine type
        - Price range ($, $$, $$$)
        - Approximate address or neighborhood
        - A likely website URL (or a Google Search URL if specific site unknown)
        - Typical opening hours for dinner (e.g. "5pm - 10pm")
        - Approximate Google Rating (e.g. 4.5)
        
        Return the result as a JSON object with a "recommendations" array.
        Example format:
        {
            "recommendations": [
                {
                    "name": "Restaurant Name",
                    "description": "Delicious food in a great setting.",
                    "cuisine": "Italian",
                    "price": "$$",
                    "address": "123 Main St, Neighborhood",
                    "website": "https://example.com",
                    "opening_hours": "5pm - 10pm",
                    "google_rating": 4.5
                }
            ]
        }
        `;

        const result = await reliableGeminiCall(prompt);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Dining Concierge error:', error);

        return NextResponse.json({
            recommendations: [
                {
                    name: "The Rustic Spoon (Fallback)",
                    description: "Farm-to-table dining with a seasonal menu. (AI temporarily unavailable)",
                    cuisine: "Modern American",
                    price: "$$",
                    address: "Market St, " + (location || "City"),
                    opening_hours: "5pm - 10pm",
                    google_rating: 4.6
                },
                {
                    name: "Bella Italia",
                    description: "Authentic handmade pasta and wood-fired pizza.",
                    cuisine: "Italian",
                    price: "$$",
                    address: "Little Italy, " + (location || "City"),
                    opening_hours: "5pm - 11pm",
                    google_rating: 4.5
                },
                {
                    name: "Spice Route",
                    description: "Aromatic curries and tandoori specials.",
                    cuisine: "Indian",
                    price: "$$",
                    address: "Central Ave, " + (location || "City"),
                    opening_hours: "11am - 10pm",
                    google_rating: 4.4
                }
            ]
        });
    }
}
