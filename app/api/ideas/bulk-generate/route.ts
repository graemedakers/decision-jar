import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseIntent } from '@/lib/intent-parser';
import { reliableGeminiCall } from '@/lib/gemini';
import { getBestCategoryFit, getCategoriesForTopic } from '@/lib/categories';
import { getStandardizedData, suggestIdeaType } from '@/lib/idea-standardizer';
import { notifyJarMembers } from '@/lib/notifications';
import { isUserPro } from '@/lib/premium';

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
            return NextResponse.json({ error: 'No active jar found' }, { status: 400 });
        }

        // --- RATE LIMITING (Safe Check) ---
        const FREE_USAGE_LIMIT_PER_DAY = 10; // High limit for debugging
        const isPro = isUserPro(user);

        if (!isPro) {
            try {
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);
                const result: any[] = await prisma.$queryRaw`
                    SELECT COUNT(*)::int as count 
                    FROM "GenerationHistory" 
                    WHERE "userId" = ${user.id} 
                    AND "apiCalled" = 'bulk-generate' 
                    AND "createdAt" >= ${startOfDay}
                `;
                const usageCount = result[0]?.count || 0;
                if (usageCount >= FREE_USAGE_LIMIT_PER_DAY) {
                    return NextResponse.json({ error: 'Daily AI limit reached', code: 'UPGRADE_REQUIRED' }, { status: 403 });
                }
            } catch (rateErr) {
                console.warn("[BulkGenerate] Rate limit check failed (table missing?), skipping check.");
            }
        }

        let rawResponse: any = null;
        let promptValue = '';
        let isRecipeRequest = false;
        let bestLocation: string | null = null; // Lifted scope

        // --- BRANCH 1: Natural Language Prompt ---
        if (body.prompt) {
            promptValue = body.prompt;
            const nlRequest = body as NaturalLanguageRequest;
            const context = {
                jarTopic: jar.topic || 'General',
                location: nlRequest.location || undefined
            };

            // Intent Parsing
            let intent;
            try {
                intent = body.intent || await parseIntent(nlRequest.prompt, context);
            } catch (intentErr) {
                console.warn("[BulkGenerate] Intent parsing failed, using defaults.");
                intent = { quantity: 5, topic: promptValue, isLocationDependent: false };
            }

            // Location Prioritization Logic
            // Location Prioritization Logic

            // 1. Explicit Intent (e.g. "in Paris")
            // Ignore if intent.location is just "local" or "near me" - we handle that via logic
            if (intent.location && !/local|near\s*me/i.test(intent.location)) {
                bestLocation = intent.location;
            }

            const hasNearMe = /near\s*me/i.test(promptValue);
            const hasLocal = /local/i.test(promptValue);

            // 2. "Near Me" -> Prioritize GPS
            if (!bestLocation && hasNearMe) {
                bestLocation = nlRequest.location || null;
            }

            // 3. "Local" or Default -> Prioritize Home Town, then GPS
            if (!bestLocation) {
                if (user.homeTown) {
                    bestLocation = user.homeTown;
                } else if (nlRequest.location) {
                    bestLocation = nlRequest.location;
                }
            }

            // 4. Fallback to Jar Location or generic
            if (!bestLocation) {
                bestLocation = jar.location || "their local area";
            }

            // Detect if this is a recipe/cooking request (should NOT use search)
            isRecipeRequest = /recipe|cook|meal|dish|ingredient|what.*(to|should).*(cook|make|prepare)|dinner idea|lunch idea|breakfast idea/i.test(promptValue);

            // Build appropriate prompt based on request type
            let systemPrompt: string;

            if (isRecipeRequest) {
                // Recipe-specific prompt - generate recipes, NOT restaurants
                systemPrompt = `
                You are a professional Chef helping users find recipe ideas for their "Decision Jar".
                Generate exactly ${intent.quantity} HOME-COOKED RECIPE ideas for: "${intent.topic}".
                
                ⚠️ CRITICAL RULES:
                1. Return RECIPES with ingredients and cooking instructions - NOT restaurants!
                2. Each recipe should be practical for home cooking
                3. If days are mentioned (Mon, Tue, Wed), include the day in the title
                4. Match complexity to request (default: easy/quick weeknight meals)
                
                Return ONLY a valid JSON array of objects.
                
                FORMAT:
                [
                  {
                    "title": "Recipe Name",
                    "description": "Brief 1-2 sentence description",
                    "typeData": {
                      "ingredients": ["1 cup rice", "2 eggs", "Soy sauce"],
                      "instructions": "1. Cook rice.\\n2. Scramble eggs.\\n3. Mix together.",
                      "prepTime": 10,
                      "cookTime": 15,
                      "servings": 2,
                      "difficulty": "Easy"
                    }
                  }
                ]
                `;
            } else {
                // Standard prompt for venues/activities
                systemPrompt = `
                You are a helpful assistant providing creative ideas for a "Decision Jar".
                Generate exactly ${intent.quantity} high-quality recommendations for "${intent.topic}".
                Context: Viewing jar "${context.jarTopic}" in "${bestLocation || "their local area"}".
                Current Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

                CRITICAL INSTRUCTIONS:
                1. STRICTLY ADHERE to all user constraints in the request (e.g. "Public", "Under $50", "Kid-friendly", "Indoor"). If no suitable options stick to constraints (e.g. valid public vs private), say so or find the best match.
                2. If user asks for "cinema", "playing now", or "theatre", use Google Search context to find specific venues/movies.
                3. website: Provide a DIRECT DEEP LINK if known. DO NOT provide generic homepages like "ticketek.com.au" or "eventbrite.com".
                4. If you don't have a specific deep link, leave "website" empty (null or "") so the system can fetch it accurately.
                5. If Ticketek is the only choice, prefer the booking subdomain: "https://premier.ticketek.com.au/".
                6. Return ONLY a valid JSON array of objects.
                7. "ideaType" MUST be one of: 'movie', 'book', 'game', 'music', 'dining', 'activity', 'event', 'travel'. Use 'activity' for sports/golf.
                8. "indoor": Boolean. True if the activity is primarily indoors, False if outdoors.
                9. "category": A short, 1-2 word tag (e.g. "Golf", "Musical", "Theatre").

                FORMAT:
                [
                  {
                    "title": "Place Name or Title",
                    "description": "Engaging 20-40 word description.",
                    "ideaType": "activity",
                    "category": "Golf",
                    "indoor": false,
                    "cost": "$$",
                    "website": "https://example.com",
                    "address": "123 Main St, City",
                5. For SPECIFIC TYPES, provide detailed "typeData" matching our schemas:
                   - Activity: { "activityType": "hiking", "duration": 2, "participants": { "min": 1, "max": 4 }, "equipmentNeeded": ["boots"], "bookingRequired": false }
                   - Game: { "gameType": "board_game", "minPlayers": 2, "coop": false, "playtime": 60 }
                   - Movie: { "year": 2024, "director": "Name", "runtime": 120, "watchMode": "cinema" }
                   - Dining: { "cuisine": "Italian", "priceRange": "$$", "menuHighlights": ["Pizza"] }

                FORMAT:
                [
                  {
                    "title": "Place Name or Title",
                    "description": "Engaging 20-40 word description.",
                    "ideaType": "activity",
                    "category": "Golf",
                    "indoor": false,
                    "cost": "$$",
                    "website": "https://example.com/booking",
                    "address": "123 Main St, City",
                    "typeData": {
                       "activityType": "Golf", 
                       "duration": 4, 
                       "participants": { "min": 1, "max": 4 },
                       "bookingRequired": true
                    }
                  }
                ]
                `;
            }

            console.log(`[BulkGenerate] Calling Gemini for: ${promptValue}, isRecipeRequest: ${isRecipeRequest}`);
            rawResponse = await reliableGeminiCall<any>(systemPrompt, {
                jsonMode: true,
                useSearch: !isRecipeRequest // Disable search for recipes!
            });
        }
        // --- BRANCH 2: Legacy Quiz Preferences ---
        else if (body.preferences) {
            const preferences = body.preferences as QuizPreferences;
            const categoryList = preferences.categories.join(', ') || 'diverse categories';

            const userPrompt = `Generate exactly ${preferences.idealCount} activity ideas based on:
                Categories: ${categoryList}
                Budget: ${preferences.budget}
                Activity Level: ${preferences.activityLevel}

                Return ONLY a JSON array of objects with: "title", "description", "website", "ideaType", "category".
            `;

            rawResponse = await reliableGeminiCall<any>(userPrompt, {
                jsonMode: true,
                useSearch: true
            });
        } else {
            return NextResponse.json({ error: 'Missing prompt or preferences' }, { status: 400 });
        }

        // --- NORMALIZE RESULTS (CRITICAL FIX) ---
        let generatedIdeas: any[] = [];
        if (Array.isArray(rawResponse)) {
            generatedIdeas = rawResponse;
        } else if (rawResponse && typeof rawResponse === 'object') {
            // Check for common wrapper keys
            const possibleArray = rawResponse.recommendations || rawResponse.ideas || rawResponse.results || rawResponse.data || Object.values(rawResponse).find(v => Array.isArray(v));
            if (Array.isArray(possibleArray)) {
                generatedIdeas = possibleArray;
            } else {
                generatedIdeas = [rawResponse];
            }
        }

        if (generatedIdeas.length === 0) {
            throw new Error("AI returned no results. Please try a more specific request.");
        }

        // --- LOG USAGE (Safe Call) ---
        try {
            await prisma.$executeRaw`
                INSERT INTO "GenerationHistory"("id", "userId", "apiCalled", "count", "prompt", "createdAt")
                VALUES(${crypto.randomUUID()}, ${user.id}, 'bulk-generate', ${generatedIdeas.length}, ${promptValue.substring(0, 255)}, NOW())
            `;
        } catch (logErr) {
            console.warn("[BulkGenerate] Usage logging failed, continuing anyway.");
        }

        if (body.preview) {
            return NextResponse.json({ success: true, preview: true, ideas: generatedIdeas });
        }

        // --- SAVE MODE ---
        const createdIdeas = await Promise.all(
            generatedIdeas.map(async (idea: any) => {
                const title = idea.title || idea.name || idea.eventName || idea.activityName || "New Idea";
                const description = idea.description || idea.summary || idea.details || "No description provided.";

                // --- ENHANCED URL LOOKUP ---
                // If the AI didn't provide a website, or provided a generic or ticket homepage, try to find the real one.
                const isGenericTicketSite = idea.website && (/ticketek\.com\.au(\/)?$/i.test(idea.website) || /ticketmaster\.com\.au(\/)?$/i.test(idea.website));
                const needsBetterUrl = !idea.website || idea.website.includes('google.com/search') || isGenericTicketSite;
                const isOnline = idea.ideaType === 'recipe' || idea.ideaType === 'movie' || idea.ideaType === 'book' || idea.ideaType === 'game'; // Don't search for recipes/movies as places

                let website = idea.website || idea.link || idea.url || idea.watchUrl || null;
                let address = idea.address || (typeof idea.location === 'string' ? idea.location : (idea.location?.address || null));
                let rating = (idea.googleRating || idea.google_rating || idea.rating) ? parseFloat(String(idea.googleRating || idea.google_rating || idea.rating)) : null;
                let placeId: string | undefined = undefined;

                if (needsBetterUrl && !isOnline) {
                    try {
                        // Import dynamically to avoid circular deps if any (though route.ts is fine)
                        const { findPlaceUrl } = await import('@/lib/google-places');

                        // Construct a strong query: "Title City" or "Title Address"
                        const searchContext = address ? `${title} ${address}` : `${title} ${bestLocation}`;
                        console.log(`[BulkGenerate] Searching Places for: ${searchContext}`);

                        const placeData = await findPlaceUrl(searchContext);
                        if (placeData) {
                            if (placeData.website) website = placeData.website;
                            else if (placeData.googleMapsUrl && !website) website = placeData.googleMapsUrl; // Fallback to Maps if official site missing

                            if (placeData.placeId) placeId = placeData.placeId; // Store? (Prisma schema check needed, usually stored contextually)
                            if (placeData.rating) rating = placeData.rating;
                            if (placeData.address) address = placeData.address; // Use official address
                        }
                    } catch (searchErr) {
                        console.warn("[BulkGenerate] Places search failed:", searchErr);
                    }
                }

                // 1. Prefer AI's explicit category, fall back to heuristics
                let finalCategory = getBestCategoryFit(idea.category?.toUpperCase() || 'ACTIVITY', jar.topic).toUpperCase();

                // Construct normalized object for classification with website field included
                const normalizedForHelper = {
                    category: finalCategory,
                    description: title,
                    details: description,
                    website: website,
                    typeData: idea.typeData
                };

                // 2. Prefer AI's explicit ideaType, fall back to inference
                // STRICT OVERRIDE: If user asked for recipes, enforce it regardless of AI output
                let inferredType = inferIdeaType(finalCategory, title, description, website, idea.ideaType) || suggestIdeaType(normalizedForHelper);
                const finalTypeData = idea.typeData || getStandardizedData(normalizedForHelper);

                if (isRecipeRequest) {
                    // Force Type
                    inferredType = 'recipe';

                    // Force Category Sanity (Prevent "Fine Dining" on a home cooked meal)
                    const restaurantCategories = ['FINE_DINING', 'CASUAL', 'FAST_FOOD', 'RESTAURANT', 'BAR', 'PUB'];
                    if (restaurantCategories.includes(finalCategory)) {
                        // Try to find a better fit available in this jar
                        const validCategories = getCategoriesForTopic(jar.topic).map((c: any) => c.id);
                        if (validCategories.includes('DINNER')) finalCategory = 'DINNER';
                        else if (validCategories.includes('MEAL')) finalCategory = 'MEAL';
                        else if (validCategories.includes('DINING')) finalCategory = 'DINING'; // Neutral fallback
                        // If none exist (unlikely), keep original but at least type is fixed
                    }
                }

                return prisma.idea.create({
                    data: {
                        description: title,
                        details: description,
                        category: finalCategory,
                        indoor: typeof idea.indoor === 'boolean' ? idea.indoor : (idea.ideaType === 'movie' || idea.ideaType === 'dining'), // Smart default
                        duration: parseFloat(String(idea.duration || '1')),
                        cost: idea.cost || '$',
                        activityLevel: idea.activityLevel || 'MEDIUM',
                        timeOfDay: 'ANY',
                        jarId: jar.id,
                        createdById: user.id,
                        status: 'APPROVED',
                        address: address,
                        website: website,
                        googleRating: rating,
                        photoUrls: Array.isArray(idea.photoUrls) ? idea.photoUrls : [],
                        // @ts-ignore
                        ideaType: inferredType || null,
                        // @ts-ignore
                        typeData: finalTypeData ? JSON.parse(JSON.stringify(finalTypeData)) : null,
                        isPrivate: (jar as any).defaultIdeaPrivate ? Boolean((jar as any).defaultIdeaPrivate) : false
                    }
                });
            })
        );

        if (createdIdeas.length > 0) {
            notifyJarMembers(jar.id, session.user.id, {
                title: `✨ ${session.user.name || 'Someone'} added new ideas`,
                body: `Added ${createdIdeas.length} ideas!`,
                url: '/jar',
                icon: '/icon-192.png'
            }, 'notifyIdeaAdded').catch(() => { });
        }

        return NextResponse.json({ success: true, count: createdIdeas.length, jarId: jar.id, ideas: createdIdeas });
    } catch (error: any) {
        console.error('Bulk generation error [CRITICAL FAIL]:', error);
        return NextResponse.json({
            error: 'Failed to generate ideas',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

function isProUser(user: any): boolean {
    if (user.isLifetimePro) return true;
    const now = new Date();
    if (user.subscriptionEndsAt && new Date(user.subscriptionEndsAt) > now) return true;
    if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing') return true;
    return false;
}

function inferIdeaType(category: string, title?: string, description?: string, website?: string, explicitType?: string): string | null {
    // 0. Explicit Override (AI knows best)
    if (explicitType && explicitType !== 'null' && explicitType !== 'undefined') {
        // Full list from IdeaTypeEnum in idea-schemas.ts
        const validTypes = [
            'recipe', 'movie', 'book', 'activity', 'dining', 'music',
            'game', 'event', 'travel', 'itinerary', 'simple', 'youtube'
        ];
        if (validTypes.includes(explicitType.toLowerCase())) {
            return explicitType.toLowerCase();
        }
    }

    const cat = category.toUpperCase();
    const t = title?.toLowerCase() || '';
    const d = description?.toLowerCase() || '';
    const w = website?.toLowerCase() || '';
    const textToCheck = `${t} ${d} ${w}`;

    // 1. Recipe Detection (Highest Priority)
    if (cat.includes('RECIPE') || t.includes('recipe') || t.includes('cook') || d.includes('recipe') || d.includes('ingredients') || d.includes('cook time')) {
        return 'recipe';
    }

    // 2. Meal/Dining Detection
    if (cat.includes('FOOD') || cat.includes('DINING') || cat.includes('RESTAURANT') || cat.includes('CAFE') || cat.includes('BAR')) {
        return 'dining';
    }

    // 3. Media Types (Movie, Book, Game) - Check context BEFORE YouTube
    if (cat.includes('MOVIE') || t.includes('movie') || t.includes('film') || t.includes('cinema') || d.includes('directed by') || d.includes('starring')) return 'movie';
    if (cat.includes('BOOK') || t.includes('book') || t.includes('novel') || d.includes('author') || d.includes('published')) return 'book';
    if (cat.includes('GAME') || t.includes('game') || d.includes('gameplay') || d.includes('console')) return 'game';

    // 4. Activity / Sport (NEW)
    if (cat.includes('SPORT') || cat.includes('GOLF') || cat.includes('TENNIS') || cat.includes('HIKE') || cat.includes('WALK') || cat.includes('SQUASH') || cat.includes('BADMINTON') || cat.includes('RACQUETBALL') || cat.includes('PILATES') || cat.includes('YOGA')) return 'activity';

    // 5. YouTube (Low Priority - only if no other strong signal)
    // Many movies/games have youtube trailers, that doesn't make them "YouTube" ideas.
    if (cat.includes('YOUTUBE') || t.includes('youtube') || t.includes('video')) return 'youtube';
    if (w.includes('youtube.com') || w.includes('youtu.be')) {
        // Only default to YouTube if we really don't know what else it is
        return 'youtube';
    }

    return null;
}
