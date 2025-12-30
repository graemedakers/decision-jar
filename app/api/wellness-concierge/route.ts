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

        const { activityType, vibe, budget, location } = await request.json().catch(() => ({}));

        const coupleLocation = activeJar.location;
        let targetLocation = location;
        const isDefaultLocation = !location || (coupleLocation && location.trim().toLowerCase() === coupleLocation.trim().toLowerCase());

        if (isDefaultLocation) {
            targetLocation = coupleLocation || "your local area";
        }

        let extraInstructions = "";
        const excludeNames = await getExcludedNames(activeJar.id);
        if (excludeNames.length > 0) {
            extraInstructions += `\nEXCLUSION LIST: Do NOT recommend: ${excludeNames.join(', ')}. Find NEW alternatives.\n`;
        }

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            // Mock response
            await new Promise(resolve => setTimeout(resolve, 1500));
            return NextResponse.json({
                recommendations: [
                    {
                        name: "Zen Spa",
                        description: "Relaxing massage and essential oils.",
                        cuisine: "Spa",
                        price: "$$$",
                        address: "123 Peace Rd, " + targetLocation,
                        opening_hours: "9am - 7pm",
                        google_rating: 4.9
                    }
                ]
            });
        }

        const prompt = `
        Act as a wellness concierge for ${targetLocation}.
        Recommend 5 distinct wellness activities or venues based on:
        - Activity Type: ${activityType || "Any (Spa, Yoga, Nature, etc)"}
        - Vibe: ${vibe || "Any"}
        - Budget: ${budget || "Any"}
        
        ${extraInstructions}
        
        Use Google Maps data knowledge to find realistic places.
        
        For each, provide:
        - Name
        - Description
        - Type (e.g. "Massage", "Meditation Studio")
        - Price range ($, $$, $$$)
        - Address
        - Website URL
        - Opening Hours
        - Google Rating
        
        Return the result as a JSON object with a "recommendations" array.
        Example format:
        {
            "recommendations": [
                {
                    "name": "Place Name",
                    "description": "Short description.",
                    "cuisine": "Yoga",
                    "price": "$$",
                    "address": "Address...",
                    "website": "http...",
                    "opening_hours": "...",
                    "google_rating": 4.8
                }
            ]
        }
        `;

        const result = await reliableGeminiCall(prompt);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Wellness Concierge error:', error);
        return NextResponse.json({ error: "Failed to fetch wellness ideas" }, { status: 500 });
    }
}
