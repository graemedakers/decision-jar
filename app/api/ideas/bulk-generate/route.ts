import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface QuizPreferences {
    categories: string[];
    budget: 'free' | 'low' | 'medium' | 'high' | 'any';
    duration: 'quick' | 'medium' | 'long' | 'any';
    activityLevel: 'relaxed' | 'moderate' | 'active' | 'any';
    idealCount: number;
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                memberships: {
                    include: {
                        jar: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { preferences, jarId }: { preferences: QuizPreferences; jarId?: string } = await request.json();

        // Get or create active jar
        let jar;
        if (jarId) {
            // Find specific jar that user is a member of
            const membership = user.memberships.find(m => m.jarId === jarId);
            if (membership) {
                jar = membership.jar;
            }
        } else {
            // Use active jar or first membership
            const activeMembership = user.memberships.find(m => m.jarId === user.activeJarId) || user.memberships[0];
            if (activeMembership) {
                jar = activeMembership.jar;
            }
        }

        // If no jar exists, create one
        if (!jar) {
            jar = await prisma.jar.create({
                data: {
                    name: 'My Ideas',
                    type: 'SOCIAL',
                    referenceCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
                    members: {
                        create: {
                            userId: user.id,
                            role: 'ADMIN',
                            status: 'ACTIVE'
                        }
                    }
                }
            });

            // Set as active jar
            await prisma.user.update({
                where: { id: user.id },
                data: { activeJarId: jar.id }
            });
        }

        // Build AI prompt based on preferences
        const budgetMap = {
            free: 'free or low-cost',
            low: 'budget-friendly ($1-20)',
            medium: 'moderately priced ($20-100)',
            high: 'premium experiences ($100+)',
            any: 'any budget range'
        };

        const durationMap = {
            quick: 'quick activities (under 2 hours)',
            medium: 'half-day activities (2-5 hours)',
            long: 'full-day or longer experiences',
            any: 'varying durations'
        };

        const activityMap = {
            relaxed: 'low-energy, relaxing activities',
            moderate: 'moderate activity level',
            active: 'high-energy, physically active experiences',
            any: 'mixed activity levels'
        };

        const categoryList = preferences.categories.length > 0
            ? preferences.categories.join(', ')
            : 'diverse categories';

        const prompt = `Generate exactly ${preferences.idealCount} creative and diverse date/activity ideas based on these preferences:

Categories: ${categoryList}
Budget: ${budgetMap[preferences.budget]}
Duration: ${durationMap[preferences.duration]}
Activity Level: ${activityMap[preferences.activityLevel]}

Requirements:
1. Return ONLY valid JSON array
2. Each idea must have: title (concise, 3-8 words), description (detailed, 20-40 words), category (one of: romantic, adventure, cultural, foodie, wellness, entertainment, creative, spontaneous), indoor (boolean), duration (number: 0.5, 1, 2, or 4), cost (string: "FREE", "$", "$$", "$$$"), activityLevel (string: "LOW", "MEDIUM", "HIGH")
3. Include a variety of ideas within the selected preferences
4. Make each idea unique and specific
5. Ensure ideas match ALL the specified preferences
6. Be creative and avoid generic suggestions

Format:
[
  {
    "title": "Sunset Picnic at Botanical Gardens",
    "description": "Pack a gourmet basket with wine, cheese, and fresh fruit. Choose a scenic spot to watch the sunset while enjoying intimate conversation and nature.",
    "category": "romantic",
    "indoor": false,
    "duration": 2,
    "cost": "$$",
    "activityLevel": "LOW"
  }
]`;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Parse AI response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Invalid AI response format');
        }

        const generatedIdeas = JSON.parse(jsonMatch[0]);

        // Create ideas in database
        const createdIdeas = await Promise.all(
            generatedIdeas.map((idea: any) =>
                prisma.idea.create({
                    data: {
                        description: idea.title,
                        details: idea.description,
                        category: idea.category || 'ACTIVITY',
                        indoor: idea.indoor ?? true,
                        duration: parseFloat(idea.duration || '1'),
                        cost: idea.cost || '$',
                        activityLevel: idea.activityLevel || 'MEDIUM',
                        timeOfDay: 'ANY',
                        jarId: jar.id,
                        createdById: user.id
                    }
                })
            )
        );

        return NextResponse.json({
            success: true,
            count: createdIdeas.length,
            jarId: jar.id,
            ideas: createdIdeas
        });
    } catch (error) {
        console.error('Bulk idea generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate ideas' },
            { status: 500 }
        );
    }
}
