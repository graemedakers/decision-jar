
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    let category: string | undefined;

    try {
        const session = await getSession();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { couple: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.activeJarId) {
            return NextResponse.json({ error: 'No active jar selected. Please select or create a jar.' }, { status: 400 });
        }

        const body = await request.json().catch(() => ({}));
        category = body.category;
        const { activityLevel, cost, timeOfDay, location: inputLocation, topic } = body;

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            console.warn("GEMINI_API_KEY is missing. Mocking.");
            return NextResponse.json({ error: 'AI Service Unavailable' }, { status: 503 });
        }

        const coupleLocation = (user.couple as any)?.location;

        // Determine which location to use
        const fallbackLocations = [coupleLocation].filter(Boolean);
        const randomFallback = fallbackLocations.length > 0 ? fallbackLocations[0] : "Unknown";

        const location = inputLocation || randomFallback;

        const userInterests = user.interests ? `User Interests: ${user.interests}` : "";
        let weatherInfo = "Unknown";

        // Fetch weather if location known (Simplified for brevity, copying robust logic if needed)
        // For now, let's skip the heavy weather fetch to keep this route fast or trust generic "current weather" if we wanted.
        // Actually, let's keep it simple.

        const prompt = `
        Generate a random, creative ${topic ? topic.toLowerCase() : 'date'} idea for a couple or group of friends.
        
        CONTEXT:
        - Location: ${location}
        - ${userInterests}
        ${topic ? `- Topic Context: This must be related to "${topic}" (e.g. if specific categories like Restaurant are requested, respect them).` : ''}
        
        CRITICAL:
        - Must be valid JSON.
        - If possible, find a REAL venue or event in ${location}.
        
        CONSTRAINTS:
        - Category: ${category || 'Any'}
        ${amountToCost(cost) ? `- Max Cost: ${amountToCost(cost)}` : ''}
        ${activityLevel ? `- Activity Level: ${activityLevel}` : ''}
        ${timeOfDay ? `- Time of Day: ${timeOfDay}` : ''}
        
        Return JSON with:
        - description (string)
        - details (string)
        - indoor (boolean)
        - duration (string: "0.25", "0.5", "1.0", "2.0", "4.0", "8.0")
        - activityLevel (string: "LOW", "MEDIUM", "HIGH")
        - cost (string: "FREE", "$", "$$", "$$$")
        - timeOfDay (string: "DAY", "EVENING", "ANY")
        - category (string: the specific category selected, e.g. "${category || 'ACTIVITY'}")
        - url (string)
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
            }
        });

        // Manually set isSurprise to true via raw query since Prisma Client might be stale/locked
        try {
            await prisma.$executeRawUnsafe('UPDATE "Idea" SET "isSurprise" = $1 WHERE id = $2', true, newIdea.id);
            (newIdea as any).isSurprise = true;
        } catch (e) {
            console.warn("Could not set isSurprise flag", e);
        }

        return NextResponse.json(newIdea);

    } catch (error: any) {
        console.error('Generate Surprise Error:', error);
        return NextResponse.json({ error: error.message || "Failed to generate idea" }, { status: 500 });
    }
}

function amountToCost(cost: string) {
    // Helper to format cost constraint if needed
    return cost;
}
