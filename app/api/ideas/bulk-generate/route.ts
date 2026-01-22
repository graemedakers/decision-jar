import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseIntent } from '@/lib/intent-parser';
import { VALID_AI_CATEGORY_IDS, getBestCategoryFit } from '@/lib/categories';
import { getStandardizedData, suggestIdeaType } from '@/lib/idea-standardizer';
import { IdeaStatus } from '@prisma/client';

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

            // 1. Parse Intent & Determine Best Location (Use pre-parsed if available)
            const intent = body.intent || await parseIntent(nlRequest.prompt, context);
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

            // Strip location for non-location-dependent topics (Books, Movies, Games, etc.)
            // This prevents "Melbourne" from leaking into book recommendations, for example.
            if (intent.isLocationDependent === false) {
                bestLocation = undefined;
            }

            // 1.5 Venue Lookup Trigger Check
            const lookupTool = intent.conciergeTool || intent.venueType;
            // List of tool types that inherently imply a physical venue search
            const physicalVenueTypes = [
                'DINING', 'BAR', 'NIGHTCLUB', 'ACTIVITY', 'FITNESS', 'WELLNESS',
                'THEATRE', 'SPORTS', 'ESCAPE_ROOM', 'WEEKEND_EVENTS', 'HOTEL'
            ];

            // Trigger lookup if explicitly requested OR if we detected a physical venue tool type
            if ((intent.requiresVenueLookup || (lookupTool && physicalVenueTypes.includes(lookupTool.toUpperCase())))
                && lookupTool) {

                console.log(`[BulkGenerate] Triggering Venue Lookup for ${lookupTool} at ${bestLocation || 'Unknown'}`);

                if (!bestLocation) {
                    // Critical failure for venues: we need a location.
                    bestLocation = "your local area";
                }

                // Use the detected tool as the venueType for lookup
                intent.venueType = lookupTool as any;

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
                            details: `**Summary:** ${v.description || 'A great venue.'}\n\n**Address:** ${v.address || 'N/A'}\n\n**Rating:** ${v.rating ? v.rating + '/5' : 'N/A'}\n\n${v.hours ? '**Hours:** ' + v.hours : ''}\n\n[Visit Website](${v.website || '#'})`,
                            address: v.address,
                            website: v.website,
                            googleRating: v.rating,
                            photoUrls: v.photos,
                            // Populate typeData regarding of specific schema to ensure all forms work
                            typeData: {
                                establishmentName: v.name, // For Dining
                                cuisine: v.type, // For Dining
                                priceRange: v.priceLevel, // For Dining
                                rating: v.rating, // For Dining/common
                                website: v.website, // For Dining/common
                                location: { address: v.address, name: v.name }, // For Dining/Activity
                                activityType: v.type, // For Activity
                                title: v.name, // For Music/Book/Movie
                                artist: v.description ? v.description.split(' - ')[0] : 'Unknown', // Fallback for music
                            }
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

                    // Build schema reference for the AI - SYNCHRONIZED WITH CONCIERGE PROMPTS
                    const schemaReference = `
IDEA TYPE SCHEMAS (use "ideaType" and "typeData" fields):

- book: { title, author, genre?: string[], yearPublished?: number, pageCount?: number, format?: "physical"|"ebook"|"audiobook"|"any", goodreadsLink?: url }
- movie: { title, year?: number, genre?: string[], director?: string, cast?: string[], runtime?: number, watchMode?: "cinema"|"streaming"|"either", streamingPlatform?: string[], imdbLink?: url }
- recipe: { ingredients: string[], instructions: string, prepTime?: number, cookTime?: number, servings?: number, difficulty?: "easy"|"medium"|"hard", cuisineType?: string, dietaryTags?: string[] }
- game: { title, gameType: "video_game"|"board_game"|"card_game", genre?: string[], platform?: ["Web", "Mobile", "PC"], minPlayers?: number, maxPlayers?: number, coop?: boolean, rating?: "E"|"T"|"M", playUrl: url, estimatedPlaytime?: number }
- dining: { establishmentName, cuisine?: string, mealType?: "breakfast"|"brunch"|"lunch"|"dinner"|"snack", priceRange?: "$"|"$$"|"$$$"|"$$$$", rating?: number, menuUrl?: url, features?: string[], reservationRequired?: boolean }
- activity: { activityName, activityType: string, location: { name: string }, duration?: number, equipmentNeeded?: string[], bookingRequired?: boolean, participants?: { min: number, max: number }, rating?: number }
- music: { artist, title, type?: "album"|"concert"|"playlist", genre?: string[], releaseYear?: number, listenLink?: url }
- event: { eventName, eventType: "theatre"|"sports"|"concert"|"comedy"|"festival"|"other", venue: { name: string }, date?: datetime, startTime?: string, ticketUrl?: url, officialWebsite?: url, lineup?: string[], showDates?: string }
- travel: { destination: { name, address? }, travelType: "hotel"|"resort"|"camping"|"road_trip"|"flight", amenities?: string[], accommodationName?: string, priceRange?: "$"|"$$"|"$$$" }
- itinerary: { title, steps: [{ order, time?, activity, location: { name: string }, notes? }], totalDuration?: string, vibe?: string, estimatedCost?: "$"|"$$"|"$$$"|"$$$$" }
`;

                    systemPrompt = `
                     Generate exactly ${intent.quantity} creative, high-quality ideas for the user request: "${intent.topic}".
                     
                     Context:
                     - User is viewing jar: "${context.jarTopic}"
                     - User Location: "${bestLocation || "Not specified"}"
                     
                     CRITICAL INSTRUCTIONS:
                     1. If the User Request ("${intent.topic}") matches the Jar Name, use the jar context to refine ideas.
                     2. If the User Request is DIFFERENT (e.g. asking for "Books" while in a "Restaurants" jar), IGNORE the Jar Name and generic jar context. Fulfill the specific user request exactly.
                     3. If the requested topic is not location-dependent (e.g. Books, Movies, Online Games, Recipes), IGNORE the "User Location" field completely.
                     4. ALWAYS include "ideaType" and "typeData" fields using the schemas below.
                     
                     5. 🎯 LINK ACCURACY & RICH DATA:
                        - For "website" / "officialWebsite":
                          - 🛑 STOP! DO NOT GUESS DOMAINS (e.g. do not invent .com or .com.au links).
                          - ALWAYS use a Google Search URL to guarantee a working link.
                          - Format: https://www.google.com/search?q=[Venue+Name]+official+website
                        - ALWAYS include a realistic "google_rating" (e.g. 4.3, 4.7) if it's a real place.
                        - ALWAYS include a specific "address" string if it's a physical location.
                        - CRITICAL: IF THE IDEA IS FOR A PHYSICAL PLACE (Restaurant, Venue, Activity), YOU MUST INCLUDE A VALID 'address' AND 'google_rating'. Do not invent fake addresses.

                     ${schemaReference}
                     
                     DEDUCTION INSTRUCTIONS:
                     - Analyze the generated idea content. If it matches one of the schemas above (e.g. looks like a Restaurant), YOU MUST include the specific "ideaType" (e.g. "dining") and populate "typeData".
                     - Prioritize "ideaType" over generic Category assignments.
                     - For Restaurants/Bars: Always set ideaType="dining" or "dining" and populate address/rating.
                     
                     SPECIFIC TYPE REQUIREMENTS:
                     - "dining": typeData MUST include "cuisine" (e.g. Italian, Modern), "priceRange" ($ to $$$$), and "establishmentName". 
                     - "activity": typeData MUST include "activityType", "location", and "duration".
                     - "event": typeData MUST include "date", "venue", and "ticketUrl" (or "officialWebsite").
                     - "book": typeData MUST include "author", "yearPublished", and "format" (default to "physical" if unspecified).

                     Constraints: ${intent.constraints?.join(", ") || "None"}
                     Target Category: ${intent.targetCategory || "ACTIVITY"}
 
                     REQUIRED OUTPUT FORMAT:
                     Return ONLY a valid JSON array. Each object must have:
                     - title: string (3-8 words, the main name)
                     - description: string (20-40 words, engaging summary hook. DO NOT include "Address:", "Website:", "Rating:" fields in this text. Put them in the specific JSON fields only.)
                     - category: enum (${VALID_AI_CATEGORY_IDS.slice(0, 10).join(', ')}, etc.)
                     - indoor: boolean
                     - duration: number (hours)
                     - cost: "FREE" | "$" | "$$" | "$$$" | "$$$$"
                     - activityLevel: "LOW" | "MEDIUM" | "HIGH"
                     - address: string (Must be present for physical locations)
                     - google_rating: number (1-5)
                     - website: string (The Google Search URL described above)
                     - ideaType: string (from schemas above)
                     - typeData: object (matching the schema for ideaType)

                     EXAMPLE for a Restaurant:
                     {
                       "title": "Luigi's Trattoria",
                       "description": "Authentic family-run Italian spot known for their handmade pasta and cozy atmosphere.",
                       "category": "FOOD",
                       "indoor": true,
                       "duration": 2,
                       "cost": "$$",
                       "activityLevel": "LOW",
                       "address": "123 Lygon St, Carlton",
                       "google_rating": 4.6,
                       "website": "https://www.google.com/search?q=Luigi's+Trattoria+Carlton+official+website",
                       "ideaType": "dining",
                       "typeData": {
                         "establishmentName": "Luigi's Trattoria",
                         "cuisine": "Italian",
                         "mealType": "dinner",
                         "rating": 4.6,
                         "priceRange": "$$",
                         "features": ["Handmade Pasta", "Family Friendly"]
                       }
                     }
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

            const userPrompt = `Generate exactly ${preferences.idealCount} creative and diverse date / activity ideas based on these preferences:

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
                    7. OPTIONAL: include "ideaType" and "typeData" for richer display if the idea fits a specific type (e.g. movie, book, game).
                    8. CRITICAL: If the category implies a physical place (Dining, Activity), YOU MUST INCLUDE A VALID "address" and "google_rating" in the root object.

                    Format:
                    [
                        {
                            "title": "Sunset Picnic at Botanical Gardens",
                            "description": "Pack a gourmet basket with wine, cheese, and fresh fruit. Choose a scenic spot to watch the sunset while enjoying intimate conversation and nature.",
                            "category": "romantic",
                            "indoor": false,
                            "duration": 2,
                            "cost": "$$",
                            "activityLevel": "LOW",
                            "ideaType": "activity",
                            "typeData": { "activityType": "picnic" }
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
            INSERT INTO "GenerationHistory"("id", "userId", "apiCalled", "count", "prompt", "createdAt")
                    VALUES(${crypto.randomUUID()}, ${user.id}, 'bulk-generate', ${generatedIdeas.length}, ${safePrompt}, NOW())
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
            generatedIdeas.map((idea: any) => {
                const finalCategory = getBestCategoryFit(idea.category?.toUpperCase() || 'ACTIVITY', jar.topic).toUpperCase();

                // Construct a normalized version of the idea for inference
                const normalized = {
                    category: finalCategory,
                    description: idea.title,
                    details: idea.description || idea.details,
                    typeData: idea.typeData
                };

                // Use the FINAL resolved category and text content to help infer the type
                const inferredType = idea.ideaType ||
                    inferIdeaType(idea.category, idea.title) ||
                    inferIdeaType(finalCategory, idea.title) ||
                    suggestIdeaType(normalized);

                // Attempt to extract structured data if missing
                const finalTypeData = idea.typeData || getStandardizedData(normalized);

                return prisma.idea.create({
                    data: {
                        description: idea.title,
                        details: idea.description || idea.details,
                        category: finalCategory,
                        indoor: idea.indoor ?? true,
                        duration: parseFloat(idea.duration || '1'),
                        cost: idea.cost || '$',
                        activityLevel: idea.activityLevel || 'MEDIUM',
                        timeOfDay: 'ANY',
                        jarId: jar.id,
                        createdById: user.id,
                        status: 'APPROVED',
                        // Root-level venue fields (matching Concierge structure)
                        address: idea.address || null,
                        website: idea.website || null,
                        // Handle both camelCase (from Venue Lookup) and snake_case (from AI Generation)
                        googleRating: (idea.googleRating || idea.google_rating) ? parseFloat(String(idea.googleRating || idea.google_rating)) : null,
                        photoUrls: Array.isArray(idea.photoUrls) ? idea.photoUrls : [],
                        // @ts-ignore
                        ideaType: inferredType || null,
                        // @ts-ignore
                        typeData: finalTypeData ? JSON.parse(JSON.stringify(finalTypeData)) : null
                    }
                });
            })
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

function inferIdeaType(category: string, title?: string): string | null {
    if (!category) return null;
    const cat = category.toUpperCase().replace(/[\s-]/g, '_'); // Normalize for check

    // Dining Matches
    if (cat.includes('DINING') || cat === 'RESTAURANT' || cat === 'FOOD' || cat === 'BRUNCH' || cat === 'LUNCH' || cat === 'DINNER' || cat === 'BREAKFAST' || cat === 'CAFE' || cat === 'BAKERY' || cat === 'BAR' || cat === 'PUB' || cat === 'NIGHTLIFE' || cat === 'COCKTAIL' || cat === 'WINE' || cat === 'WINE_BAR') return 'dining';
    if (cat === 'FINE_DINING' || cat === 'CASUAL' || cat === 'FAST_FOOD' || cat === 'INTERNATIONAL') return 'dining';

    // Other Matches
    if (cat === 'MOVIE' || cat === 'CINEMA' || cat === 'STREAMING' || cat === 'SERIES') return 'movie';
    if (cat === 'GAME' || cat === 'GAMING') return 'game';
    if (cat === 'BOOK' || cat === 'READING') return 'book';
    if (cat === 'RECIPE' || cat === 'COOKING') return 'recipe';
    if (cat === 'GOLF' || cat === 'SPORT' || cat === 'SPORTS' || cat === 'TENNIS' || cat === 'BOWLING') return 'activity';
    return null;
}
