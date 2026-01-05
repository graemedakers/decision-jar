import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isCouplePremium, isUserPro } from '@/lib/premium';
import { reliableGeminiCall } from '@/lib/gemini';
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
            include: { couple: true },
        });

        if (!user || (!isCouplePremium(user.couple) && !isUserPro(user))) {
            return NextResponse.json({ error: 'Premium required' }, { status: 403 });
        }

        const rateLimit = await checkRateLimit(user);
        if (!rateLimit.allowed) {
            return NextResponse.json({ error: 'Rate limit exceeded', details: rateLimit.error }, { status: 429 });
        }

        const body = await request.json().catch(() => ({}));
        const { numDays = 7, dietaryPreference = 'None', cookingSkill = 'Intermediate' } = body;

        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
            console.warn("No API key found, returning mock data");
            return NextResponse.json({
                meals: getMockMealPlan(numDays)
            });
        }

        // Cache key based on parameters
        const cacheKey = `menu-planner-${numDays}-${dietaryPreference.toLowerCase()}-${cookingSkill.toLowerCase()}`;

        try {
            const cached: any[] = await prisma.$queryRaw`
                SELECT value FROM "AICache" 
                WHERE key = ${cacheKey} 
                AND "expiresAt" > NOW()
                LIMIT 1
            `;

            if (cached.length > 0) {
                console.log("Serving from cache:", cacheKey);
                const meals = JSON.parse(cached[0].value);
                return NextResponse.json({ meals, cached: true });
            }
        } catch (e) {
            console.warn("Cache check failed:", e);
        }

        const dietaryNote = dietaryPreference !== 'None' ? `All meals MUST be ${dietaryPreference}.` : '';
        const skillNote = cookingSkill === 'Beginner'
            ? 'Keep recipes simple with common ingredients and basic techniques.'
            : cookingSkill === 'Advanced'
                ? 'Include some gourmet techniques and unique ingredient combinations.'
                : 'Balance of accessible and interesting recipes.';

        const prompt = `
        Generate a ${numDays}-day meal plan. ${dietaryNote} ${skillNote}
        
        IMPORTANT REQUIREMENTS:
        - Provide exactly ${numDays} meals (one per day - dinner only)
        - Each meal should be practical, healthy, and delicious
        - Include variety (different proteins, vegetables, cooking methods)
        - Consider meal prep efficiency (some ingredients can overlap between days)
        - Meals should match the ${cookingSkill} cooking skill level
        
        For each meal, provide:
        {
            "day": "Day 1", // "Day 1", "Day 2", etc.
            "meal": "string", // Name of the dish
            "description": "string", // Brief appetizing description
            "prep_time": "string", // e.g., "30 mins", "1 hour"
            "difficulty": "string" // "Easy", "Medium", or "Hard"
        }
        
        Return ONLY a JSON array of ${numDays} meal objects. No markdown, no extra text.
        `;

        let errors: string[] = [];

        try {
            const meals = await reliableGeminiCall(prompt);

            // Save to cache (expire in 7 days since meal plans are evergreen)
            try {
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 7);

                await prisma.$executeRaw`
                    INSERT INTO "AICache" (id, key, value, "createdAt", "expiresAt")
                    VALUES (${crypto.randomUUID()}, ${cacheKey}, ${JSON.stringify(meals)}, NOW(), ${expiresAt})
                    ON CONFLICT (key) DO UPDATE SET
                    value = ${JSON.stringify(meals)},
                    "expiresAt" = ${expiresAt}
                `;
            } catch (e) {
                console.warn("Failed to write to cache:", e);
            }

            return NextResponse.json({ meals });
        } catch (error: any) {
            console.error("Gemini failed, falling back to mock", error);
            errors.push(error.message);
        }

        // Fallback to mock data
        console.warn("AI models failed, returning mock data. Errors:", errors);

        return NextResponse.json({
            meals: getMockMealPlan(numDays),
            debugInfo: errors.join(" | ")
        });

    } catch (error: any) {
        console.error('Menu Planner error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

function getMockMealPlan(numDays: number) {
    const mockMeals = [
        { day: "Day 1", meal: "Grilled Lemon Herb Chicken", description: "Juicy chicken breast with fresh herbs and lemon zest, served with roasted vegetables", prep_time: "35 mins", difficulty: "Easy" },
        { day: "Day 2", meal: "Spaghetti Carbonara", description: "Classic Italian pasta with crispy bacon, eggs, and parmesan cheese", prep_time: "25 mins", difficulty: "Medium" },
        { day: "Day 3", meal: "Teriyaki Salmon Bowl", description: "Glazed salmon over rice with edamame, cucumber, and avocado", prep_time: "30 mins", difficulty: "Easy" },
        { day: "Day 4", meal: "Vegetarian Stir-Fry", description: "Colorful mix of vegetables with tofu in savory soy-ginger sauce", prep_time: "20 mins", difficulty: "Easy" },
        { day: "Day 5", meal: "Beef Tacos", description: "Seasoned ground beef in soft tortillas with all the fixings", prep_time: "30 mins", difficulty: "Easy" },
        { day: "Day 6", meal: "Margherita Pizza", description: "Homemade pizza with fresh mozzarella, basil, and tomato sauce", prep_time: "45 mins", difficulty: "Medium" },
        { day: "Day 7", meal: "Thai Green Curry", description: "Creamy coconut curry with vegetables and your choice of protein", prep_time: "40 mins", difficulty: "Medium" },
        { day: "Day 8", meal: "BBQ Pulled Pork Sandwiches", description: "Slow-cooked tender pork in tangy BBQ sauce on toasted buns", prep_time: "15 mins active", difficulty: "Easy" },
        { day: "Day 9", meal: "Greek Salad with Grilled Chicken", description: "Fresh Mediterranean salad topped with herb-marinated chicken", prep_time: "25 mins", difficulty: "Easy" },
        { day: "Day 10", meal: "Mushroom Risotto", description: "Creamy arborio rice with sautéed mushrooms and parmesan", prep_time: "45 mins", difficulty: "Medium" },
        { day: "Day 11", meal: "Fish Tacos with Cabbage Slaw", description: "Crispy white fish with tangy slaw and lime crema", prep_time: "30 mins", difficulty: "Medium" },
        { day: "Day 12", meal: "Chicken Fajitas", description: "Sizzling peppers and onions with seasoned chicken strips", prep_time: "30 mins", difficulty: "Easy" },
        { day: "Day 13", meal: "Vegetable Lasagna", description: "Layers of pasta, vegetables, ricotta, and marinara sauce", prep_time: "1 hour", difficulty: "Medium" },
        { day: "Day 14", meal: "Honey Mustard Pork Chops", description: "Pan-seared pork chops with sweet and tangy glaze", prep_time: "25 mins", difficulty: "Easy" }
    ];

    return mockMeals.slice(0, numDays);
}
