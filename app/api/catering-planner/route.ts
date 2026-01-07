import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { reliableGeminiCall } from '@/lib/gemini';
import { isCouplePremium, isUserPro } from '@/lib/premium';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { memberships: { include: { jar: true } } }
        });

        const activeJar = user?.activeJarId
            ? user.memberships.find(m => m.jarId === user.activeJarId)?.jar
            : user?.memberships?.[0]?.jar;

        if (!user || !activeJar) {
            return NextResponse.json({ error: 'No active jar' }, { status: 400 });
        }

        if (!isCouplePremium(activeJar) && !isUserPro(user)) {
            return NextResponse.json({ error: 'Premium required' }, { status: 403 });
        }

        const { numPeople, ageGroup, complexity, theme, numCourses, includeDessert, portionSize, unitSystem = 'Metric' } = await request.json();

        const unitNote = `Use ONLY ${unitSystem} units (e.g. ${unitSystem === 'Metric' ? 'kg, g, l, ml, celsius' : 'lbs, oz, gallons, cups, fahrenheit'}) for all scaled ingredients.`;

        const prompt = `
            Act as a Michelin-star catering consultant. 
            Create 3 distinct meal/dinner party options based on these criteria:
            - Number of people: ${numPeople}
            - Audience: ${ageGroup} (e.g. if children, suggest kid-friendly versions or separate small bites)
            - Complexity: ${complexity} (Simple = few ingredients/steps; Gourmet = advanced techniques)
            - Theme: ${theme}
            - Number of courses: ${numCourses}. ${includeDessert ? (Number(numCourses) === 1 ? "IMPORTANT: The user requested dessert. As only 1 course is specified, this SINGLE course MUST be a dessert." : "This count INCLUDES dessert. Ensure the final course is a dessert.") : ""}
            - Portion Sizes: ${portionSize}
            - Units: ${unitNote}

            For EACH of the 3 options, provide:
            1. Title and Description.
            2. For EACH course: name, description, scaled ingredients for ${numPeople} people, and clear instructions.
            3. A unified "Prep & Timing Strategy" including a timeline (24h/6h/1h before) and general advice for ${ageGroup}.

            Return ONLY a JSON object with this structure:
            {
               "options": [
                  {
                     "title": "...",
                     "description": "...",
                     "courses": [
                        {
                           "name": "...",
                           "description": "...",
                           "ingredients": ["1kg flour", "..."],
                           "instructions": ["Mix flour...", "..."]
                        }
                     ],
                     "strategy": {
                        "prepSteps": [{"time": "24h Before", "task": "..."}],
                        "advice": "..."
                     }
                  }
               ]
            }
        `;

        const data = await reliableGeminiCall<{ options: any[] }>(prompt);
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Catering Planner Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
