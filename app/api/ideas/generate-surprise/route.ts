
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCategoriesForTopic } from '@/lib/categories';

export async function POST(request: Request) {
    let category: string | undefined;

    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { memberships: { include: { jar: true } } },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.activeJarId) {
            return NextResponse.json({ error: 'No active jar selected. Please select or create a jar.' }, { status: 400 });
        }

        const activeJar = user.memberships.find(m => m.jarId === user.activeJarId)?.jar;
        if (!activeJar) {
            return NextResponse.json({ error: 'Selected jar not found' }, { status: 404 });
        }

        const body = await request.json().catch(() => ({}));
        category = body.category;
        const { activityLevel, cost, timeOfDay, location: inputLocation, isPrivate } = body;
        const jarTopic = activeJar.topic;

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            console.warn("GEMINI_API_KEY is missing. Mocking.");
            return NextResponse.json({ error: 'AI Service Unavailable' }, { status: 503 });
        }

        const coupleLocation = activeJar.location;

        // Determine which location to use
        const fallbackLocations = [coupleLocation].filter(Boolean);
        const randomFallback = fallbackLocations.length > 0 ? fallbackLocations[0] : "Unknown";

        const location = inputLocation || randomFallback;

        const userInterests = user.interests ? `User Interests: ${user.interests}` : "";

        const validCategories = getCategoriesForTopic(jarTopic, (activeJar as any).customCategories);
        const validCategoryIds = validCategories.map(c => c.id).join(', ');

        // Lookup the semantic label for better context (e.g. INDOOR -> "Chill/Home")
        const selectedCategoryDef = validCategories.find(c => c.id === category);
        const categoryLabel = selectedCategoryDef ? selectedCategoryDef.label : category;

        // Determine if this is strictly an At-Home category
        const isHomeCategory = category === 'INDOOR' || category === 'STAYCATION' || category === 'STREAMING' || (categoryLabel && (categoryLabel.includes('Home') || categoryLabel.includes('Chill')));

        const prompt = `
        Generate a random, creative idea for a jar with topic "${jarTopic || 'General'}".
        
        CONTEXT:
        - Location: ${location}
        - ${userInterests}
        - Topic Context: This MUST be related to "${jarTopic || 'General'}". 
        
        CRITICAL:
        - Must be valid JSON.
        ${isHomeCategory
                ? '- Location: MUST be done AT HOME. Do NOT suggest going out to a venue. Focus on activities to do in the house.'
                : `- If possible, find a REAL venue or event in ${location}.`}
        
        CONSTRAINTS (MUST FOLLOW STRICTLY):
        - Category: MUST match specific type "${categoryLabel}" (ID: ${category || 'Any'}).
        ${amountToCost(cost) ? `- Cost: MUST be ${amountToCost(cost)} or cheaper.` : ''}
        ${activityLevel ? `- Energy: MUST matches ${activityLevel} energy.` : ''}
        ${timeOfDay ? `- Time: MUST be suitable for ${timeOfDay}.` : ''}
        
        Return JSON with:
        - description (string)
        - details (string)
        - indoor (boolean)
        - duration (string: "0.25", "0.5", "1.0", "2.0", "4.0", "8.0")
        - activityLevel (string: "LOW", "MEDIUM", "HIGH")
        - cost (string: "FREE", "$", "$$", "$$$")
        - timeOfDay (string: "DAY", "EVENING", "ANY")
        - category (string: strictly one of [${validCategoryIds}])
        - url (string)
        - weather (string: "ANY", "SUNNY", "RAINY", "COLD")
        - requiresTravel (boolean)
        `;

        const { reliableGeminiCall } = await import('@/lib/gemini');
        const ideaData: any = await reliableGeminiCall(prompt);

        // Save directly to DB
        const newIdea = await prisma.idea.create({
            data: {
                description: ideaData.description,
                details: ideaData.details,
                indoor: ideaData.indoor,
                duration: parseFloat(ideaData.duration) || 2.0,
                activityLevel: ideaData.activityLevel,
                cost: ideaData.cost,
                timeOfDay: ideaData.timeOfDay,
                category: ideaData.category,
                website: ideaData.url || null,

                jarId: user.activeJarId!,
                createdById: user.id,
                isPrivate: isPrivate !== undefined ? isPrivate : true,
                isSurprise: true, // Always mark surprise ideas

                // New Tags
                weather: ideaData.weather || "ANY",
                requiresTravel: ideaData.requiresTravel || false,
            }
        });

        return NextResponse.json({ success: true, idea: newIdea });

    } catch (error: any) {
        console.error('Generate Surprise Error:', error);
        return NextResponse.json({ error: error.message || "Failed to generate idea" }, { status: 500 });
    }
}

function amountToCost(cost: string) {
    return cost;
}
