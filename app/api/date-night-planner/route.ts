import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isCouplePremium, isUserPro } from '@/lib/premium';
import { reliableGeminiCall } from '@/lib/gemini';


export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check premium status
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                memberships: { include: { jar: true } },
                legacyJar: true
            },
        });

        // Determine the Active Jar
        // Priority: 1. activeJarId, 2. First membership, 3. Legacy couple
        const activeJar = (user?.activeJarId ? user.memberships.find(m => m.jarId === user.activeJarId)?.jar : null) ||
            user?.memberships?.[0]?.jar ||
            user?.legacyJar;


        if (!user || !activeJar) {
            return NextResponse.json({ error: 'No active jar found' }, { status: 400 });
        }

        if (!isCouplePremium(activeJar) && !isUserPro(user)) {
            return NextResponse.json({ error: 'Premium required' }, { status: 403 });
        }

        const { date, location, cost, regenerateSlot, currentSchedule, rejectedVenue, topic } = await request.json().catch(() => ({}));

        const coupleLocation = activeJar.location;
        const targetLocation = location || coupleLocation || "your city";

        // Determine Context
        const isDateContext = !topic || topic === 'Dates' || topic === 'Romantic';
        const planTitle = isDateContext ? "Date Night" : `${topic} Itinerary`;

        // Fetch partner/squad preferences
        const members = await prisma.jarMember.findMany({
            where: { jarId: activeJar.id, userId: { not: user.id } },
            include: { user: true }
        });

        const partnerInterests = members.map(m => m.user.interests).filter(Boolean).join(". ");
        const userInterests = user.interests || "";

        let prompt = "";
        const isRegen = typeof regenerateSlot === 'number';

        // Custom Flow Instructions based on Topic
        let flowInstructions = `
               - Part 1: Pre-dinner drinks at a nice bar or lounge.
               - Part 2: Dinner at a compatible restaurant.
               - Part 3: The MAIN EVENT or Activity.
                 - **CRITICAL**: This final slot CANNOT be another bar, club, or restaurant unless it is a specific ticketed event there (e.g. Jazz Club performance). It must be a distinct activity.
        `;

        let vibeInstructions = isDateContext
            ? `Date Night Focus: PLEASE PRIORITIZE THE PARTNER'S PREFERENCES below, making it a treat for them, while ensuring the user also enjoys it.
               Partner Preferences (Primary): ${partnerInterests || "Surprise them with something romantic/fun."}
               User Preferences (Secondary): ${userInterests}`
            : `Theme Focus: Create a perfect "${topic}" experience.
               Group Preferences: ${partnerInterests || "Fun and engaging."} ${userInterests}`;

        if (!isDateContext) {
            // Relaxed flow for specific topics
            if (topic === 'Wellness') {
                flowInstructions = `
                - Part 1: A relaxing activity or light healthy starter.
                - Part 2: Main wellness activity (Spa, Massage, Class, etc).
                - Part 3: A healthy meal or post-activity relaxation spot.
                `;
            } else if (topic === 'Food' || topic === 'Restaurants') {
                flowInstructions = `
                - Part 1: Aperitif or Starter at a specialized spot.
                - Part 2: The Main Dining Event (Top tier restaurant).
                - Part 3: Dessert spot or Digestif bar.
                `;
            } else if (topic === 'Bars' || topic === 'Nightlife') {
                flowInstructions = `
                - Part 1: Warm-up drinks at a lounge or pub.
                - Part 2: Main venue (Club, Speakeasy, or Busy Bar).
                - Part 3: Late night food or Late night venue.
                `;
            } else {
                // Generic
                flowInstructions = `
                 - Construct a 3-part flow suitable for a "${topic}" outing.
                 - Ensure a mix of Activity and Food/Drink.
                 `;
            }
        }

        if (isRegen && currentSchedule) {
            // Regeneration Prompt
            const otherItems = currentSchedule.filter((_: any, i: number) => i !== regenerateSlot);
            const slotType = currentSchedule[regenerateSlot].activity_type;
            const slotTime = currentSchedule[regenerateSlot].time;

            prompt = `
            The user wants to REPLACE a specific part of their ${planTitle} in ${targetLocation}.
            
            Current Plan Context (KEEP these, do not change them, just match their vibe/location):
            ${otherItems.map((item: any) => `- ${item.time}: ${item.venue_name} (${item.activity_type}) at ${item.address}`).join('\n')}
            
            The user REJECTED this venue for the ${slotTime} slot: "${rejectedVenue}".
            
            Task: Suggest a BETTER alternative for the "${slotType}" slot at ${slotTime} adhering to the "${topic || 'Date Night'}" theme.
            
            CRITICAL CONSTRAINTS:
            1. LOCATION: Must be within walking distance (or very short public transport hop) of the other venues. MATCH THE NEIGHBORHOOD.
            2. STATUS: Must be currently OPEN for business. Verified.
            3. BUDGET: ${cost || "Medium"}.
            4. VIBE: ${vibeInstructions}.
            
            Output strictly as a single JSON object for this one slot:
            {
                "time": "${slotTime}",
                "activity_type": "${slotType}",
                "venue_name": "New Venue Name",
                "description": "Why this is a great alternative.",
                "address": "Street address",
                "booking_link": "URL",
                "cost_estimate": "Low/Medium/High"
            }
            `;
        } else {
            // Standard Full Plan Prompt
            prompt = `
            Plan a complete "${planTitle}" itinerary for a couple/group in ${targetLocation} on ${date || "an upcoming evening"}.
            Budget: ${cost || "Medium"}.
            
            ${vibeInstructions}
            
            CRITICAL INSTRUCTIONS:
            1. EVENT FIRST APPROACH: Search for a SPECIFIC, REAL PUBLIC EVENT happening on ${date} (e.g., Concert, Theater, Comedy, Night Market, Festival, Exhibition) that fits the theme.
               - If a great event is found, make it a key slot and build the rest around it.
               - If no specific event is on, default to high-quality venues/activities fitting the theme.
            
            2. LOCALITY: Choose a SINGLE Neighborhood or District (ideally where the event is) and STICK TO IT. All three venues MUST be walkable or a very short ride apart.
            
            3. FLOW:
            ${flowInstructions}
            
            4. REALITY CHECK: Verify these places exist, are OPEN, and the event is actually happening on ${date}.
               - SKIP venues marked "Permanently Closed".
            
            5. LINKS: You MUST provide a 'booking_link' for every item.
               - For Events: Direct link to TICKETING or OFFICIAL PAGE.
               - For Venues: Website or Booking page.
            
            Output strictly as a JSON object with this structure:
            {
                "neighborhood": "Name of the locality/area",
                "schedule": [
                    {
                        "time": "String (e.g. 6:00 PM)",
                        "activity_type": "Short Type (e.g. Drinks, Dinner, Spa)",
                        "venue_name": "Name",
                        "description": "Short description of the vibe and why it fits.",
                        "address": "Street address",
                        "booking_link": "REQUIRED URL (Tickets/Booking)",
                        "cost_estimate": "Low/Medium/High"
                    }
                    // ... exactly 3 items for the 3 parts
                ]
            }
            
            Do not include markdown. Just JSON.
            `;
        }

        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
            // Mock data
            return NextResponse.json({
                neighborhood: "Downtown Mocksville",
                schedule: [
                    {
                        time: "6:00 PM",
                        activity_type: "Drinks",
                        venue_name: "The Mocktail Lounge",
                        description: "Intimate setting with craft cocktails.",
                        address: "123 Main St",
                        booking_link: "https://google.com",
                        cost_estimate: "$$"
                    },
                    {
                        time: "7:30 PM",
                        activity_type: "Dinner",
                        venue_name: "Bistro Fictional",
                        description: "Romantic candlelight dinner.",
                        address: "125 Main St",
                        booking_link: "https://google.com",
                        cost_estimate: "$$$"
                    },
                    {
                        time: "9:30 PM",
                        activity_type: "Event",
                        venue_name: "The Laughing Comedy Club",
                        description: "Stand-up comedy show.",
                        address: "130 Main St",
                        booking_link: "https://google.com",
                        cost_estimate: "$$"
                    }
                ]
            });
        }

        let lastError = null;
        try {
            const result = await reliableGeminiCall(prompt);
            return NextResponse.json(result);
        } catch (error: any) {
            console.error("Gemini failed, falling back to mock", error);
            lastError = error.message;
            // Fallthrough to mock
        }

        console.error("All AI models failed. Falling back to dynamic mock data. Last error:", lastError);

        // Fallback Mock Data with Dynamic Location
        return NextResponse.json({
            neighborhood: `${targetLocation} (AI Offline Mode)`,
            schedule: [
                {
                    time: "6:00 PM",
                    activity_type: "Drinks",
                    venue_name: `Local Lounge in ${targetLocation.split(',')[0]}`,
                    description: "A cozy spot to start the evening with signature cocktails. (Note: AI service is currently unavailable, this is a placeholder suggestion)",
                    address: `${targetLocation}`,
                    booking_link: `https://www.google.com/search?q=best+bars+in+${encodeURIComponent(targetLocation)}`,
                    cost_estimate: "$$"
                },
                {
                    time: "7:30 PM",
                    activity_type: "Dinner",
                    venue_name: `Top Rated Restaurant`,
                    description: "Enjoy a romantic dinner at one of the city's finest establishments.",
                    address: `${targetLocation}`,
                    booking_link: `https://www.google.com/search?q=romantic+dinner+in+${encodeURIComponent(targetLocation)}`,
                    cost_estimate: "$$$"
                },
                {
                    time: "9:30 PM",
                    activity_type: "Event",
                    venue_name: "Evening Entertainment",
                    description: "Live music, comedy, or a late-night show to wrap up the night.",
                    address: `${targetLocation}`,
                    booking_link: `https://www.google.com/search?q=events+tonight+in+${encodeURIComponent(targetLocation)}`,
                    cost_estimate: "$$"
                }
            ],
            debug_info: lastError
        });



    } catch (error: any) {
        console.error("Date Planner Error:", error);
        return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
    }
}
