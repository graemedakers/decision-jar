import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isCouplePremium, isUserPro } from '@/lib/premium';
import { reliableGeminiCall } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from "@/lib/logger";


export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check premium status

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { memberships: { include: { jar: true } } },
        });

        const activeJar = user && (user.activeJarId
            ? user.memberships.find(m => m.jarId === user.activeJarId)?.jar
            : user.memberships[0]?.jar);

        if (!user || (!isCouplePremium(activeJar) && !isUserPro(user))) {
            return NextResponse.json({ error: 'Premium required' }, { status: 403 });
        }

        const rateLimit = await checkRateLimit(user);
        if (!rateLimit.allowed) {
            return NextResponse.json({ error: 'Rate limit exceeded', details: rateLimit.error }, { status: 429 });
        }


        const body = await request.json().catch(() => ({}));

        let location = "";

        if (body.location) {
            location = body.location;
        } else {
            const coupleLocation = activeJar?.location;
            location = coupleLocation || user.homeTown || "your area";
        }

        const userInterests = user.interests ? `User Interests: ${user.interests}` : "";
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

        let targetDateStr = "";
        let context = "";

        // Logic:
        // If Mon(1) - Thu(4): Plan for upcoming weekend.
        // If Fri(5): Plan for tomorrow (Sat) and Sun.
        // If Sat(6): Plan for today and tomorrow.
        // If Sun(0): Plan for today.

        if (dayOfWeek >= 1 && dayOfWeek <= 4) {
            // Mon-Thu: Get next Saturday
            const daysUntilSat = 6 - dayOfWeek;
            const nextSat = new Date(today);
            nextSat.setDate(today.getDate() + daysUntilSat);
            const nextSun = new Date(nextSat);
            nextSun.setDate(nextSat.getDate() + 1);
            targetDateStr = `${nextSat.toDateString()} and ${nextSun.toDateString()}`;
            context = "the upcoming weekend";
        } else if (dayOfWeek === 5) { // Friday
            const nextSat = new Date(today);
            nextSat.setDate(today.getDate() + 1);
            const nextSun = new Date(nextSat);
            nextSun.setDate(nextSat.getDate() + 1);
            targetDateStr = `${nextSat.toDateString()} and ${nextSun.toDateString()}`;
            context = "this weekend";
        } else if (dayOfWeek === 6) { // Saturday
            const nextSun = new Date(today);
            nextSun.setDate(today.getDate() + 1);
            targetDateStr = `${today.toDateString()} and ${nextSun.toDateString()}`;
            context = "this weekend";
        } else { // Sunday
            targetDateStr = `${today.toDateString()}`;
            context = "today (Sunday)";
        }

        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
            logger.warn("No API key found, returning mock data");
            return NextResponse.json({
                suggestions: [
                    { title: "Mock: Local Farmers Market", description: "Visit the local market for fresh produce.", day: "Saturday", cost: "Free", url: "https://www.google.com/search?q=local+farmers+market" },
                    { title: "Mock: Movie Night", description: "Catch the latest blockbuster.", day: "Sunday", cost: "$$", url: "https://www.google.com/search?q=movie+tickets" },
                    { title: "Mock: Brunch at a New Spot", description: "Try that new cafe everyone is talking about.", day: "Sunday", cost: "$$", url: "https://www.google.com/search?q=best+brunch+near+me" },
                    { title: "Mock: Art Gallery Visit", description: "Soak in some culture at a local gallery.", day: "Saturday", cost: "Free", url: "https://www.google.com/search?q=art+galleries+near+me" },
                    { title: "Mock: Sunset Walk", description: "Take a romantic stroll during golden hour.", day: "Any", cost: "Free", url: "https://www.google.com/search?q=best+sunset+spots+near+me" }
                ]
            });
        }

        // --- CACHE CHECK ---
        const cacheKey = `weekend-planner-${location.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${targetDateStr.replace(/\s+/g, '-')}`;

        try {
            // Using raw query to bypass potential Prisma Client generation issues in dev
            const cached: any[] = await prisma.$queryRaw`
                SELECT value FROM "AICache" 
                WHERE key = ${cacheKey} 
                AND "expiresAt" > NOW()
                LIMIT 1
            `;

            if (cached.length > 0) {
                logger.info("Serving from cache:", { cacheKey });
                const suggestions = JSON.parse(cached[0].value);
                return NextResponse.json({ suggestions, cached: true });
            }
        } catch (e: any) {
            logger.warn("Cache check failed:", { error: e?.message || e });
        }
        // -------------------

        const prompt = `
        I need 5 distinct date ideas for a couple in ${location} for ${context} (${targetDateStr}).
        ${userInterests}
        
        CRITICAL INSTRUCTION:
        You MUST search for and identify SPECIFIC, REAL-WORLD EVENTS that are actually scheduled to happen in ${location} during ${targetDateStr}.
        - If multiple locations are provided (e.g. "City A and City B"), you MUST look for events in BOTH locations.
        - Look for concerts, festivals, markets, theater shows, sports games, or special exhibitions.
        - If you find real events, prioritize them at the top of the list.
        - If no specific scheduled events are found, only then suggest high-quality seasonal activities or evergreen local favorites.
        
        For each idea, clearly state if it is a "Scheduled Event" or a "General Activity" and which location it is in.
        
        Pay particular attention to events that are good for couples (romantic, fun, interactive).
        
        Provide the response as a JSON array of objects. Each object should have the following structure:
        {
            "title": "string", // A concise title for the date idea
            "description": "string", // A brief description of the date idea
            "day": "string", // e.g., "Saturday", "Sunday", "Any"
            "cost": "string", // e.g., "Free", "Low", "$", "$$", "$$$"
            "url": "string" // REQUIRED: Direct link to TICKETING page or Official Event Info. Do not just use a generic search URL if a real link exists.
        }
        
        Do not include markdown formatting. Just the raw JSON.
        `;

        let errors: string[] = [];

        try {
            const suggestions = await reliableGeminiCall(prompt);

            // --- SAVE TO CACHE ---
            try {
                // Expire in 24 hours
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 24);

                // Using raw query for insert/upsert
                await prisma.$executeRaw`
                    INSERT INTO "AICache" (id, key, value, "createdAt", "expiresAt")
                    VALUES (${crypto.randomUUID()}, ${cacheKey}, ${JSON.stringify(suggestions)}, NOW(), ${expiresAt})
                    ON CONFLICT (key) DO UPDATE SET
                    value = ${JSON.stringify(suggestions)},
                    "expiresAt" = ${expiresAt}
                `;
            } catch (e: any) {
                logger.warn("Failed to write to cache:", { error: e?.message || e });
            }
            // ---------------------

            return NextResponse.json({ suggestions });
        } catch (error: any) {
            logger.error("Gemini failed, falling back to mock", error);
            errors.push(error.message);
            // Fallthrough to mock
        }

        // Fallback to mock data if AI fails
        logger.warn("All AI models failed, returning mock data. Errors:", { errors });

        return NextResponse.json({
            suggestions: [
                { title: "Offline: Local Park Picnic", description: "Pack a basket and enjoy the outdoors. (AI unavailable)", day: "Saturday", cost: "Low", url: "https://www.google.com/search?q=picnic+spots+near+me" },
                { title: "Offline: Stargazing", description: "Find a dark spot and watch the stars. (AI unavailable)", day: "Sunday", cost: "Free", url: "https://www.google.com/search?q=stargazing+near+me" },
                { title: "Offline: Cook a New Recipe", description: "Try making something exotic together. (AI unavailable)", day: "Any", cost: "$$", url: "https://www.google.com/search?q=romantic+dinner+recipes" },
                { title: "Offline: Board Game Night", description: "Dust off those old games and have a friendly competition. (AI unavailable)", day: "Any", cost: "Free", url: "https://www.google.com/search?q=best+board+games+for+couples" },
                { title: "Offline: DIY Spa Night", description: "Pamper yourselves with face masks and relaxation. (AI unavailable)", day: "Sunday", cost: "Low", url: "https://www.google.com/search?q=diy+spa+night+ideas" }
            ],
            debugInfo: errors.join(" | ")
        });

    } catch (error: any) {
        logger.error('Weekend Planner error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
