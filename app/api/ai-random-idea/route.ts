import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    let category: string | undefined;

    try {
        const session = await getSession();
        // ... (rest of logic)

        // We'll parse the request body later, or do it here.
        // But to minimize diff, let's just make 'category' available to the whole function scope.
        // Wait, 'category' comes from request.json().

        // Let's refactor slightly to parse body early.

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user for context (location, interests)
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { legacyJar: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json().catch(() => ({}));
        category = body.category;
        const { duration } = body;

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            console.warn("GEMINI_API_KEY is missing. Returning mock data.");
            await new Promise(resolve => setTimeout(resolve, 1000));
            return NextResponse.json({
                description: category === 'MEAL' ? "Mock: Dinner at Luigi's" : "Mock: Picnic in the Park",
                details: category === 'MEAL' ? "Enjoy some authentic Italian pasta." : "Bring a checkered blanket and some sandwiches. It's a nice day!",
                indoor: category === 'MEAL',
                duration: "2.0",
                activityLevel: "LOW",
                cost: category === 'MEAL' ? "$$" : "FREE",
                timeOfDay: category === 'MEAL' ? "EVENING" : "DAY",
                category: category || "ACTIVITY"
            });
        }

        const coupleLocation = (user.legacyJar as any)?.location;

        // Determine which location to use
        const location = coupleLocation || "Unknown";

        const userInterests = user.interests ? `User Interests: ${user.interests}` : "";

        let weatherInfo = "Unknown";

        if (location && location !== 'Unknown') {
            try {
                // 1. Geocode the location
                const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData.results && geoData.results.length > 0) {
                        const { latitude, longitude } = geoData.results[0];

                        // 2. Get Weather
                        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day`);
                        if (weatherRes.ok) {
                            const weatherData = await weatherRes.json();
                            const temp = weatherData.current.temperature_2m;
                            const code = weatherData.current.weather_code;
                            const isDay = weatherData.current.is_day === 1 ? "Day" : "Night";

                            // Simple WMO code map (optional, but helps context)
                            const wmoMap: Record<number, string> = {
                                0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
                                45: "Fog", 48: "Depositing rime fog",
                                51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
                                61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
                                71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
                                95: "Thunderstorm"
                            };
                            const condition = wmoMap[code] || `WMO Code ${code}`;
                            weatherInfo = `${condition}, ${temp}°C, ${isDay}`;
                        }
                    }
                }
            } catch (e) {
                console.warn("Failed to fetch weather:", e);
            }
        }

        const prompt = `
        Generate a random, creative, and fun date idea for a couple.
        
        CONTEXT:
        - Location: ${location || "Unknown"}
        - Current Weather: ${weatherInfo}
        - ${userInterests}
        
        CRITICAL INSTRUCTION:
        - FIRST, search for any REAL, SPECIFIC public events, festivals, concerts, markets, or special exhibitions happening NOW or VERY SOON in ${location || "the area"}.
        - If a compelling real-world event is found, prioritize making this the date idea.
        - If no specific event is found, fall back to a creative generic activity or specific venue visit.
        
        ${category ? `- The user specifically wants a date idea in the category: "${category}".` : ''}
        ${category === 'MEAL' ? `- CRITICAL FOR MEAL: Suggest a SPECIFIC, REAL restaurant in or very close to ${location}. Do NOT suggest a generic cuisine type. You MUST provide the specific restaurant name as the 'description'.` : ''}
        ${category === 'EVENT' ? `- CRITICAL FOR EVENT: You MUST provide a specific, real-world event name as the 'description'.` : ''}
        
        CONSTRAINTS:
        - The idea MUST be suitable for the current weather conditions and location.
        - Verify to the best of your knowledge that the venue/restaurant/event is currently OPEN/ACTIVE.
        - It can be an indoor activity (staying at home) or an outdoor activity (going out).
        - Do NOT involve cardboard in any way.
        - Do NOT involve cocktails or alcohol-focused activities.
        - Avoid activities that require significant prior preparation or planning (spontaneous ideas preferred).
        - If the user has listed interests, try to incorporate them if possible, but don't be limited by them.
        ${category ? `- The idea MUST fit the category: ${category}` : ''}
        
        URL REQUIREMENTS:
        - You MUST provide a valid URL in the 'url' field.
        - If the idea is an EVENT: Provide the direct link to the official event page or TICKETING page.
        - If the idea is a VENUE/RESTAURANT: Provide the official website or Google Maps link.
        - If the idea is generic (e.g. "Walk in park"): Provide a link to a "Best Parks in [City]" guide or similar.
        
        Return the response as a valid JSON object with the following fields:
        - description: string (The specific Event Name, Restaurant Name, or Activity Title)
        - details: string (specific tips, what to wear, where to go, or instructions. Mention the event date/time if applicable.)
        - indoor: boolean (true for indoor, false for outdoor)
        - duration: string (one of: "0.25", "0.5", "1.0", "2.0", "4.0", "8.0")
        - activityLevel: string (one of: "LOW", "MEDIUM", "HIGH")
        - cost: string (one of: "FREE", "$", "$$", "$$$")
        - timeOfDay: string (one of: "ANY", "DAY", "EVENING")
        - category: string (must be one of: "ACTIVITY", "MEAL", "EVENT")
        - url: string (REQUIRED. Link to tickets, info, or website)

        Example:
        {
            "description": "Stargazing at the Observatory",
            "details": "Drive out to the local observatory. Bring a warm blanket and a thermos of hot cocoa as it's a chilly night.",
            "indoor": false,
            "duration": "2.0",
            "activityLevel": "LOW",
            "cost": "$",
            "timeOfDay": "EVENING",
            "category": "ACTIVITY"
        }
        
        Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
        `;

        // Use the centralized reliable helper
        const { reliableGeminiCall } = await import('@/lib/gemini');
        const idea = await reliableGeminiCall(prompt);
        return NextResponse.json(idea);

    } catch (error: any) {
        console.error('AI Random Idea error:', error);

        // Fallback to a mock idea if AI fails (e.g. Quota Exceeded)
        // Select a random template based on category if possible, or general otherwise
        const fallbacks = [
            {
                description: "Stargazing Picnic (AI Offline)",
                details: "Pack a cozy blanket, some hot chocolate or wine, and drive to a spot away from city lights. Spend the evening pointing out constellations.",
                indoor: false,
                duration: "2.0",
                activityLevel: "LOW",
                cost: "FREE",
                timeOfDay: "EVENING",
                category: "ACTIVITY"
            },
            {
                description: "Homemade Pizza Night (AI Offline)",
                details: "Buy pre-made dough (or make your own!) and a bunch of fun toppings. Compete to see who can make the best-looking or best-tasting pizza.",
                indoor: true,
                duration: "2.0",
                activityLevel: "MEDIUM",
                cost: "$$",
                timeOfDay: "EVENING",
                category: "MEAL"
            },
            {
                description: "Local Museum Tour (AI Offline)",
                details: "Visit a local museum you haven't been to in a while. Dedicate a couple of hours to really reading the plaques and discussing the exhibits.",
                indoor: true,
                duration: "3.0",
                activityLevel: "LOW",
                cost: "$",
                timeOfDay: "DAY",
                category: "ACTIVITY"
            }
        ];

        // Pick one randomly
        const fallbackIdea = fallbacks[Math.floor(Math.random() * fallbacks.length)];

        // Force the category to match request if needed, though random is often fine for fallback
        if (category) {
            fallbackIdea.category = category;
            if (category === 'MEAL') {
                fallbackIdea.description = "Surprise Dinner Spot (AI Offline)";
                fallbackIdea.details = `Head to your favorite local restaurant for a spontaneous dinner date. (AI error: ${error.message})`;
            }
        }

        // Append error to description for visibility during debug
        fallbackIdea.description += ` [Error: ${error.message.substring(0, 30)}...]`;

        return NextResponse.json(fallbackIdea);
    }
}
