import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseIntent } from '@/lib/intent-parser';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface QuizPreferences {
    categories: string[];
    budget: 'free' | 'low' | 'medium' | 'high' | 'any';
    duration: 'quick' | 'medium' | 'long' | 'any';
    activityLevel: 'relaxed' | 'moderate' | 'active' | 'any';
    idealCount: number;
}

interface NaturalLanguageRequest {
    prompt: string;
    jarId?: string;
    location?: string;
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
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

        const body = await request.json();
        const jarId = body.jarId;

        // Determine active jar
        let jar;
        if (jarId) {
            const membership = user.memberships.find(m => m.jarId === jarId);
            if (membership) jar = membership.jar;
        } else {
            const activeMembership = user.memberships.find(m => m.jarId === user.activeJarId) || user.memberships[0];
            if (activeMembership) jar = activeMembership.jar;
        }

        if (!jar) {
            // Fallback: create jar logic if absolutely needed, or error
            return NextResponse.json({ error: 'No active jar found' }, { status: 400 });
        }

        // --- RATE LIMITING ---
        const FREE_USAGE_LIMIT_PER_DAY = 3;

        // Use centralized premium logic to capture trials, lifetime, and all active statuses
        const { isUserPro } = await import('@/lib/premium');
        const isPro = isUserPro(user);

        if (!isPro) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            // Use raw query to avoid stale client issues
            const result: any[] = await prisma.$queryRaw`
                SELECT COUNT(*)::int as count 
                FROM "GenerationHistory" 
                WHERE "userId" = ${user.id} 
                AND "apiCalled" = 'bulk-generate' 
                AND "createdAt" >= ${startOfDay}
            `;

            const usageCount = result[0]?.count || 0;

            if (usageCount >= FREE_USAGE_LIMIT_PER_DAY) {
                return NextResponse.json({
                    error: 'Daily AI limit reached',
                    code: 'UPGRADE_REQUIRED',
                    limit: FREE_USAGE_LIMIT_PER_DAY,
                    usage: usageCount
                }, { status: 403 });
            }
        }

        let generatedIdeas: any[] = [];
        let prompt = '';
        let count = 5;

        // ... (existing code for BRANCH 1 & 2) ... 

        // --- BRANCH 1: Natural Language Prompt ---
        if (body.prompt) {
            // ...
            prompt = body.prompt; // Capture prompt for logging
            // ... (rest of Branch 1)
            const nlRequest = body as NaturalLanguageRequest;
            const context = {
                jarTopic: jar.topic || 'General',
                location: nlRequest.location || undefined
            };

            // 1. Parse Intent & Determine Best Location
            const intent = await parseIntent(nlRequest.prompt, context);
            count = intent.quantity;

            // Location Hierarchy: 
            // 1. Explicitly mentioned in prompt (intent.location)
            // 2. Client-provided GPS/Input (nlRequest.location)
            // 3. User's Profile Home Town (user.homeTown)
            // 4. Jar's Default Location (jar.location)
            let bestLocation = intent.location
                || nlRequest.location
                || user.homeTown
                || jar.location;

            // 1.5 Venue Lookup Check
            if (intent.requiresVenueLookup && intent.venueType) {
                console.log(`[BulkGenerate] Triggering Venue Lookup for ${intent.venueType} at ${bestLocation || 'Unknown'}`);

                if (!bestLocation) {
                    // Critical failure for venues: we need a location.
                    // Fallback to a generic valid string that implies local search context
                    // "your local area" allows the AI to potentially infer or ask, but more likely
                    // the AI (Gemini) might use IP-based location if available or just give generic advice.
                    // However, we need a string to pass to the concierge logic.
                    bestLocation = "your local area";
                }

                try {
                    const { lookupVenuesViaConcierge } = await import('@/lib/venue-lookup');

                    const venues = await lookupVenuesViaConcierge({
                        toolType: intent.venueType,
                        location: bestLocation,
                        userRequest: prompt, // Pass original prompt for context
                        count: count
                    });

                    if (venues.length > 0) {
                        generatedIdeas = venues.map(v => ({
                            title: v.name,
                            description: v.description,
                            category: v.category || intent.targetCategory || 'ACTIVITY',
                            indoor: true, // Default assumption for venues unless specified
                            duration: 2, // Default duration
                            cost: v.priceLevel || '$$',
                            activityLevel: 'MEDIUM',
                            details: `**Address:** ${v.address || 'N/A'}\n\n**Rating:** ${v.rating ? v.rating + '/5' : 'N/A'}\n\n${v.hours ? '**Hours:** ' + v.hours : ''}\n\n[Visit Website](${v.website || '#'})`,
                            address: v.address,
                            website: v.website,
                            googleRating: v.rating,
                            photoUrls: v.photos
                        }));
                    } else {
                        console.log("[BulkGenerate] Venue lookup returned 0 results, falling back to generative.");
                    }
                } catch (e) {
                    console.error("[BulkGenerate] Venue lookup failed:", e);
                    // Fallback to standard generation
                }
            }

            // 2. Generate Ideas (Fallback or Standard)
            if (generatedIdeas.length === 0) {
                const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

                let systemPrompt = '';

                if (intent.contentFormat === 'MARKDOWN_RECIPE') {
                    // ... existing recipe logic ...
                    console.log("[BulkGenerate] Using MARKDOWN_RECIPE prompt");
                    systemPrompt = `
                     Act as a professional Chef. Generate exactly ${intent.quantity} distinct recipes for "${intent.topic}".
                     Context: Jar Topic is "${context.jarTopic}".
                     Constraints: ${intent.constraints?.join(", ") || "None"}

                     REQUIREMENTS:
                     1. Return ONLY valid JSON array.
                     2. Each idea must be a complete recipe concept.
                     3. GENERATE RICH MARKDOWN for the 'details' field including Ingredients, Instructions, and Tips.
                     4. 'title' should be the Recipe Name.
                     5. 'description' should be a brief appetizing description (20-40 words).

                     FORMAT:
                     [
                       {
                         "title": "Recipe Name",
                         "description": "Brief appetizing description (20-40 words)",
                         "category": "MEAL",
                         "indoor": true,
                         "duration": 1.5,
                         "cost": "$$",
                         "activityLevel": "MEDIUM",
                         "details": "### 🥘 Ingredients\\n- Item 1\\n- Item 2\\n\\n### 👨‍🍳 Instructions\\n1. Step one...\\n2. Step two..." 
                       }
                     ]
                     `;
                } else {
                    console.log("[BulkGenerate] Using DEFAULT prompt");
                    systemPrompt = `
                     Generate exactly ${intent.quantity} creative ideas for a "${intent.topic}" list.
                     Context: Jar Topic is "${context.jarTopic}". User Location: "${bestLocation || context.location || "Any"}"
                     Constraints: ${intent.constraints?.join(", ") || "None"}
                     Target Category: ${intent.targetCategory || "ACTIVITY"}

                     Requirements:
                     1. Return ONLY valid JSON array
                     2. Each idea must have: title (3-8 words), description (20-40 words), category (enum ID like ROMANTIC, CHORE, etc), indoor (bool), duration (number hours), cost (FREE, $, $$, $$$), activityLevel (LOW, MEDIUM, HIGH)
                     3. Be specific to the location if provided.
                     
                     Format: [{"title": "...", ...}]
                     `;
                }

                const result = await model.generateContent([systemPrompt]);
                const text = result.response.text();
                const jsonMatch = text.match(/\[[\s\S]*\]/);

                if (!jsonMatch) throw new Error('Invalid AI response format');
                generatedIdeas = JSON.parse(jsonMatch[0]);
            }

        }
        // --- BRANCH 2: Legacy Quiz Preferences ---
        else if (body.preferences) {
            const preferences = body.preferences as QuizPreferences;
            // ... existing logic ...

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

            const userPrompt = `Generate exactly ${preferences.idealCount} creative and diverse date/activity ideas based on these preferences:
    
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
            const result = await model.generateContent(userPrompt);
            const text = result.response.text();

            // Parse AI response
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('Invalid AI response format');
            }

            generatedIdeas = JSON.parse(jsonMatch[0]);
        } else {
            return NextResponse.json({ error: 'Missing prompt or preferences' }, { status: 400 });
        }


        // --- LOG USAGE --- 
        // Only log if success
        const safePrompt = prompt ? prompt.substring(0, 255) : 'Quiz Preferences';

        await prisma.$executeRaw`
            INSERT INTO "GenerationHistory" ("id", "userId", "apiCalled", "count", "prompt", "createdAt")
            VALUES (${crypto.randomUUID()}, ${user.id}, 'bulk-generate', ${generatedIdeas.length}, ${safePrompt}, NOW())
        `;

        // IF PREVIEW MODE: Return ideas without saving
        if (body.preview) {
            return NextResponse.json({
                success: true,
                preview: true,
                ideas: generatedIdeas
            });
        }

        // SAVE MODE: Create ideas in database
        const createdIdeas = await Promise.all(
            generatedIdeas.map((idea: any) =>
                prisma.idea.create({
                    data: {
                        description: idea.title,
                        details: idea.details || idea.description,
                        category: idea.category?.toUpperCase() || 'ACTIVITY',
                        indoor: idea.indoor ?? true,
                        duration: parseFloat(idea.duration || '1'),
                        cost: idea.cost || '$',
                        activityLevel: idea.activityLevel || 'MEDIUM',
                        timeOfDay: 'ANY',
                        jarId: jar.id,
                        createdById: user.id,
                        status: 'APPROVED'
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
    } catch (error: any) {
        console.error('Bulk idea generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate ideas', details: error.message },
            { status: 500 }
        );
    }
}
