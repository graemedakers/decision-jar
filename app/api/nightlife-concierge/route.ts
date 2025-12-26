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

        const { music, crowd, age, location, price } = await request.json().catch(() => ({}));

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
        - Find suggested night clubs, lounges, or dance venues located in or very near "${targetLocation}".\n`;


        if (userInterests) {
            extraInstructions += `The user is interested in: ${userInterests}. Consider this when selecting the music or crowd if applicable.\n`;
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
                        name: "Neon Nights",
                        description: "High-energy club with top tier DJs and light shows.",
                        speciality: "EDM / House",
                        price: "$$$",
                        address: "777 Electric Ave, " + (targetLocation || "City"),
                        google_rating: 4.6,
                        age_group: "18+"
                    },
                    {
                        name: "The Velvet Rope",
                        description: "Upscale lounge with R&B vibes and bottle service.",
                        speciality: "R&B / Hip Hop",
                        price: "$$$",
                        address: "123 Luxury Ln, " + (targetLocation || "City"),
                        google_rating: 4.3,
                        age_group: "21+"
                    },
                    {
                        name: "Retro Rewind",
                        description: "Fun dance club playing 80s, 90s and 00s hits.",
                        speciality: "Throwbacks",
                        price: "$$",
                        address: "90s Blvd, " + (targetLocation || "City"),
                        google_rating: 4.8,
                        age_group: "Any"
                    }
                ]
            });
        }

        const prompt = `
        Act as a local nightlife promoter and concierge for ${targetLocation}.
        Recommend 5 distinct nightclubs, dance bars, or late-night lounges based on the following preferences:
        - Music Type: ${music || "Good dance music"}
        - Crowd/Atmosphere: ${crowd || "Lively"}
        - Target Age Group: ${age || "Any"}
        - Price/Cover Range: ${price || "Any"}
        
        ${extraInstructions}
        
        IMPORTANT: Perform a check to ensure the venue is currently OPEN for business.
        
        For each venue, provide:
        - Name
        - A brief, enticing description (1 sentence)
        - Music Style (e.g. EDM, Hip Hop, Latin, Top 40)
        - Price/Exclusivity ($ = Free/Cheap, $$ = Moderate Cover, $$$ = Expensive/Bottle Service)
        - Approximate address or neighborhood
        - A likely website URL (or a Google Search URL if specific site unknown)
        - Typical opening hours (e.g. "10pm - 4am")
        - Approximate Google Rating (e.g. 4.2)
        - Dress Code note (e.g. "Casual", "Dress to impress")
        
        Return the result as a JSON object with a "recommendations" array.
        Example format:
        {
            "recommendations": [
                {
                    "name": "Club Name",
                    "description": "Great spot for dancing.",
                    "speciality": "EDM",
                    "price": "$$",
                    "address": "123 Main St, Neighborhood",
                    "website": "https://example.com",
                    "opening_hours": "10pm - 4am",
                    "google_rating": 4.5,
                    "dress_code": "Smart Casual",
                    "age_group": "21+"
                }
            ]
        }
        Do not include markdown formatting. Just raw JSON.
        `;

        const result = await reliableGeminiCall(prompt);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Nightlife Concierge error:', error);

        // Fallback to mock data
        return NextResponse.json({
            recommendations: [
                {
                    name: "Club Cloud (Fallback)",
                    description: "Popular local spot for dancing late into the night. (AI unavailable)",
                    speciality: "Top 40",
                    price: "$$",
                    address: "Downtown, " + (location || "City"),
                    opening_hours: "10pm - 3am",
                    google_rating: 4.2,
                    age_group: "21+"
                },
                {
                    name: "The Underground",
                    description: "Underground house music venue.",
                    speciality: "Techno/House",
                    price: "$",
                    address: "Main St, " + (location || "City"),
                    opening_hours: "11pm - 5am",
                    google_rating: 4.5,
                    age_group: "18+"
                }
            ]
        });
    }
}
