import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { reliableGeminiCall } from '@/lib/gemini';
import { getCategoriesForTopic } from '@/lib/categories';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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

        const { topic, location: userLocation } = await request.json();
        const location = userLocation || activeJar.location || "your local area";

        // dynamic prompt construction
        const categories = getCategoriesForTopic(topic);
        const categoryIds = categories.map(c => c.id).join(", ");

        let promptContext = "";
        switch (topic?.toLowerCase()) {
            case 'movies':
                promptContext = `Recommend a specific movie or current cinema release. It can be a classic or new.`;
                break;
            case 'books':
                promptContext = `Recommend a specific book that is great for discussion.`;
                break;
            case 'restaurants':
                promptContext = `Recommend a specific, highly-rated restaurant in or near ${location}.`;
                break;
            case 'bars':
                promptContext = `Recommend a specific, cool bar or pub in or near ${location}.`;
                break;
            case 'nightclubs':
                promptContext = `Recommend a specific nightclub or late-night venue in or near ${location}.`;
                break;
            case 'wellness':
                promptContext = `Recommend a specific wellness activity (spa, hike, class) in or near ${location}.`;
                break;
            case 'travel':
                promptContext = `Recommend a specific weekend getaway destination or hotel within driving distance of ${location}.`;
                break;
            case 'fitness':
                promptContext = `Recommend a specific fitness activity, workout, or gym class in or near ${location}.`;
                break;
            case 'activities':
            case 'general':
            case 'dates':
            case 'romantic':
            case undefined:
            case null:
                promptContext = `Recommend a specific fun date activity or interesting place to visit in or near ${location}.`;
                break;
            default:
                // Handle custom topics (e.g. "Cleaning", "Chores", "Work", "Kids")
                promptContext = `Recommend a specific activity, task, or idea strictly related to the topic "${topic}". Do NOT suggest a date idea unless the topic implies it. For example if the topic is "Cleaning", suggest a specific cleaning task. If it is "Gardening", suggest a gardening task. Apply this logic to the topic: ${topic}.`;
                break;
        }

        const prompt = `
        ${promptContext}
        
        Return a single result formatted as a JSON object strictly following this schema:
        {
            "description": "Name of the place, movie, or activity (Max 50 chars)",
            "details": "A persuasive, exciting description of why we should do this. Include location details if applicable.",
            "website": "A real URL to the place, IMDB page, or booking site (or a Google Search link if specific site is unknown)",
            "cost": "One of: FREE, $, $$, $$$",
            "indoor": true or false,
            "duration": "Duration in hours (e.g. 1.5, 2.0, 4.0)",
            "activityLevel": "One of: LOW, MEDIUM, HIGH",
            "timeOfDay": "One of: DAY, EVENING, ANY",
            "category": "Pick the most fitting ID from this list: [${categoryIds}]"
        }
        
        Ensure the recommendation is real, currently open/available, and high quality.
        `;

        const result = await reliableGeminiCall(prompt);
        return NextResponse.json(result);

    } catch (error) {
        console.error('Magic Idea error:', error);
        return NextResponse.json({ error: 'Failed to generate idea' }, { status: 500 });
    }
}
