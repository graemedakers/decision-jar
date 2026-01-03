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

        const { sports, membership, location } = await request.json().catch(() => ({}));

        const coupleLocation = activeJar.location;
        const userInterests = (user as any).interests;

        let targetLocation = location;
        if (!targetLocation || targetLocation.trim() === "") {
            targetLocation = coupleLocation || "your local area";
        }

        let extraInstructions = "";

        // Add specific instructions for the location
        extraInstructions += `The user is looking for sports clubs or facilities in or near "${targetLocation}". 
        - Find places where they can participate in: ${sports && sports.length > 0 ? sports.join(", ") : "Various Sports"}.\n`;

        if (membership && membership !== "any") {
            extraInstructions += `The user prefers facilities with this access type: ${membership}.\n`;
        }

        if (userInterests) {
            extraInstructions += `The user is interested in: ${userInterests}.\n`;
        }

        const excludeNames = await getExcludedNames(activeJar.id);
        if (excludeNames.length > 0) {
            extraInstructions += `\nEXCLUSION LIST: The user is already aware of the following places. Do NOT match or recommend these exact names again: ${excludeNames.join(', ')}. Find NEW alternatives.\n`;
        }
        // -------------------------------------------------------------

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            // Mock response
            await new Promise(resolve => setTimeout(resolve, 1500));
            return NextResponse.json({
                recommendations: [
                    {
                        name: "City Tennis Club (Mock)",
                        description: "Public clay and hard courts available for booking.",
                        sport_type: "Tennis",
                        membership_required: "Optional",
                        price: "$$",
                        address: "123 Court St, " + (targetLocation || "City"),
                        google_rating: 4.6,
                        website: "https://example.com"
                    },
                    {
                        name: "Community Pool",
                        description: "Olympic sized pool with lap lanes.",
                        sport_type: "Swimming",
                        membership_required: "No",
                        price: "$",
                        address: "456 Swim Ln, " + (targetLocation || "City"),
                        google_rating: 4.4,
                        website: "https://example.com"
                    }
                ]
            });
        }

        const prompt = `
        Act as a sports and recreation concierge for ${targetLocation}.
        Recommend 5 distinct sports clubs, centers, or facilities based on the following preferences:
        - Desired Sports/Activities: ${sports && sports.length > 0 ? sports.join(", ") : "Any (Tennis, Golf, Swimming, etc)"}
        - Membership Access: ${membership || "Any"}
        
        ${extraInstructions}
        
        IMPORTANT: Perform a check to ensure the place is currently OPEN for business.
        Focus on places where the user can *participate* in the sport, not just watch.
        
        For each venue, provide:
        - Name
        - A brief description (1 sentence)
        - Sport/Activity Type (e.g. Tennis, Golf, Multi-sport)
        - Membership Policy (e.g. "Public Access", "Membership Required", "Guest Pass Available")
        - Price Category ($ = Cheap/Free, $$ = Moderate, $$$ = Expensive/Private)
        - Approximate address or neighborhood
        - A likely website URL (or a Google Search URL if specific site unknown)
        - Approximate Google Rating (e.g. 4.8)
        
        Return the result as a JSON object with a "recommendations" array.
        Example format:
        {
            "recommendations": [
                {
                    "name": "Club Name",
                    "description": "Premiere golf course with driving range.",
                    "sport_type": "Golf",
                    "membership_required": "Public Welcome",
                    "price": "$$$",
                    "address": "123 Green Way",
                    "website": "https://example.com",
                    "google_rating": 4.7
                }
            ]
        }
        Do not include markdown formatting. Just raw JSON.
        `;

        const result = await reliableGeminiCall(prompt);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Sports Concierge error:', error);

        // Fallback to mock data
        return NextResponse.json({
            recommendations: [
                {
                    name: "Local Sports Center (Fallback)",
                    description: "Community center with various courts and fields.",
                    sport_type: "Multi-sport",
                    membership_required: "Public",
                    price: "$",
                    address: "Central Park, " + (location || "City"),
                    google_rating: 4.2
                }
            ]
        });
    }
}
