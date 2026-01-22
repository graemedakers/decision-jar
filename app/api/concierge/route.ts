import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { reliableGeminiCall } from '@/lib/gemini';
import { CONCIERGE_CONFIGS } from '@/lib/concierge-configs';
import { getConciergePromptAndMock } from '@/lib/concierge-prompts';
import { checkSubscriptionAccess } from '@/lib/premium';
import { apiError, handleApiError } from '@/lib/api-response';

// Initialize rate limiter if Redis is available
let ratelimit: Ratelimit | undefined;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
        analytics: true,
    });
}

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

/**
 * Validates if a recommendation matches the user's specific request
 * Uses keyword matching with strict rejection rules for each concierge type
 */
function validateRecommendation(
    recommendation: any,
    userRequest: string,
    toolType: string,
    inputs?: any
): boolean {
    // Non-location tools or tools without strict filtering rules yet should skip validation
    const skipValidationTools = ['CHEF', 'HOLIDAY', 'DATE_NIGHT', 'WEEKEND_PLANNER', 'WEEKEND_EVENTS'];
    if (skipValidationTools.includes(toolType)) {
        return true;
    }

    // If no specific request, accept all recommendations
    if (!userRequest || userRequest.trim().length === 0) {
        return true;
    }

    const requestLower = userRequest.toLowerCase();
    const recName = (recommendation.name || '').toLowerCase();
    const recDesc = (recommendation.description || '').toLowerCase();
    const recType = (recommendation.cuisine || recommendation.category || recommendation.type || recommendation.speciality || recommendation.genre || recommendation.activity_type || recommendation.theme_type || recommendation.sport || recommendation.music || '').toLowerCase();

    // Combine all text fields for searching
    const allText = `${recName} ${recDesc} ${recType}`.toLowerCase();

    console.log(`[Validation] Checking "${recommendation.name}" (Tool: ${toolType})`);
    console.log(`  Type field: "${recType}"`);
    console.log(`  User request: "${requestLower}"`);

    // ============================================
    // DINING / CONCIERGE - Food & Venue Rules
    // ============================================
    if (toolType === 'DINING' || toolType === 'CONCIERGE') {
        // RULE: Cafe/Brunch requests
        if (/\b(cafe|coffee shop|brunch|breakfast)\b/i.test(requestLower)) {
            const hasCafeBrunchKeywords = /\b(cafe|coffee|brunch|breakfast|bakery)\b/i.test(allText);
            const isDinnerHeavy = /\b(pizzeria|pizza|japanese|sushi|indian|thai|chinese|fine.dining|dinner.only)\b/i.test(recType);

            if (!hasCafeBrunchKeywords || isDinnerHeavy) {
                console.log(`  ❌ REJECT: Non-cafe type`);
                return false;
            }
            return true;
        }

        // RULE: Specific cuisine requests
        const cuisinePatterns: Record<string, RegExp> = {
            pizza: /\b(pizza|pizzeria)\b/i,
            italian: /\b(italian|pasta|trattoria)\b/i,
            sushi: /\b(sushi|japanese|ramen)\b/i,
            chinese: /\b(chinese|dim.sum|cantonese)\b/i,
            thai: /\b(thai)\b/i,
            vietnamese: /\b(vietnamese|pho|banh.mi)\b/i,
            indian: /\b(indian|curry|tandoori)\b/i,
            mexican: /\b(mexican|tacos|burrito)\b/i,
            korean: /\b(korean|bbq|kimchi)\b/i,
            greek: /\b(greek|mediterranean|gyro)\b/i,
            french: /\b(french|bistro|patisserie)\b/i,
        };

        for (const [cuisineName, pattern] of Object.entries(cuisinePatterns)) {
            if (pattern.test(requestLower)) {
                if (!pattern.test(allText)) {
                    console.log(`  ❌ REJECT: User wants ${cuisineName}, but this is ${recType}`);
                    return false;
                }
                return true;
            }
        }
    }

    // ============================================
    // BAR / BAR_CRAWL / NIGHTCLUB - Drink & Nightlife Rules
    // ============================================
    if (toolType === 'BAR' || toolType === 'BAR_CRAWL' || toolType === 'NIGHTCLUB') {
        const drinkPatterns: Record<string, RegExp> = {
            cocktails: /\b(cocktail|mixolog|speakeasy)\b/i,
            wine: /\b(wine|vino|sommelier)\b/i,
            beer: /\b(beer|brew|craft|ale|lager|pub)\b/i,
            whiskey: /\b(whiskey|whisky|bourbon|scotch)\b/i,
        };

        for (const [drinkType, pattern] of Object.entries(drinkPatterns)) {
            if (pattern.test(requestLower)) {
                if (!pattern.test(allText)) {
                    console.log(`  ❌ REJECT: User wants ${drinkType}, but this is ${recType}`);
                    return false;
                }
                return true;
            }
        }

        // Music genre for nightclubs
        if (toolType === 'NIGHTCLUB') {
            const musicPatterns: Record<string, RegExp> = {
                edm: /\b(edm|electronic|techno|house|trance)\b/i,
                hiphop: /\b(hip.hop|rap|r&b|rnb)\b/i,
                latin: /\b(latin|salsa|reggaeton|bachata)\b/i,
                rock: /\b(rock|indie|alternative)\b/i,
            };

            for (const [musicType, pattern] of Object.entries(musicPatterns)) {
                if (pattern.test(requestLower)) {
                    if (!pattern.test(allText)) {
                        console.log(`  ❌ REJECT: User wants ${musicType} music, but this is ${recType}`);
                        return false;
                    }
                    return true;
                }
            }
        }
    }

    // ============================================
    // BOOK - Genre Rules
    // ============================================
    if (toolType === 'BOOK') {
        const bookPatterns: Record<string, RegExp> = {
            mystery: /\b(mystery|thriller|detective|suspense|crime)\b/i,
            romance: /\b(romance|love|romantic)\b/i,
            scifi: /\b(sci-fi|science.fiction|space|dystopian|cyberpunk)\b/i,
            fantasy: /\b(fantasy|magic|dragon|wizard|epic)\b/i,
            horror: /\b(horror|scary|supernatural|ghost)\b/i,
            biography: /\b(biography|memoir|autobiography|non-fiction)\b/i,
            selfhelp: /\b(self-help|self.improvement|productivity|motivational)\b/i,
            history: /\b(history|historical|war|ancient)\b/i,
        };

        for (const [genre, pattern] of Object.entries(bookPatterns)) {
            if (pattern.test(requestLower)) {
                if (!pattern.test(allText)) {
                    console.log(`  ❌ REJECT: User wants ${genre} book, but this is ${recType}`);
                    return false;
                }
                return true;
            }
        }
    }

    // ============================================
    // MOVIE - Genre Rules
    // ============================================
    if (toolType === 'MOVIE') {
        const moviePatterns: Record<string, RegExp> = {
            action: /\b(action|superhero|martial.arts)\b/i,
            comedy: /\b(comedy|funny|humour|humor)\b/i,
            drama: /\b(drama|emotional|tearjerker)\b/i,
            horror: /\b(horror|scary|slasher|paranormal)\b/i,
            scifi: /\b(sci-fi|science.fiction|space|alien)\b/i,
            animation: /\b(animation|animated|cartoon|pixar|disney)\b/i,
            documentary: /\b(documentary|docu|true.story)\b/i,
            romance: /\b(romance|romantic|love.story)\b/i,
        };

        for (const [genre, pattern] of Object.entries(moviePatterns)) {
            if (pattern.test(requestLower)) {
                if (!pattern.test(allText)) {
                    console.log(`  ❌ REJECT: User wants ${genre} movie, but this is ${recType}`);
                    return false;
                }
                return true;
            }
        }
    }

    // ============================================
    // GAME - Genre Rules
    // ============================================
    if (toolType === 'GAME') {
        const gamePatterns: Record<string, RegExp> = {
            rpg: /\b(rpg|role.playing|jrpg)\b/i,
            fps: /\b(fps|shooter|first.person)\b/i,
            strategy: /\b(strategy|rts|turn.based|4x)\b/i,
            puzzle: /\b(puzzle|brain|logic)\b/i,
            racing: /\b(racing|driving|car)\b/i,
            sports: /\b(sports|football|soccer|basketball|fifa)\b/i,
            horror: /\b(horror|survival.horror|scary)\b/i,
            coop: /\b(co-op|cooperative|multiplayer)\b/i,
        };

        for (const [genre, pattern] of Object.entries(gamePatterns)) {
            if (pattern.test(requestLower)) {
                if (!pattern.test(allText)) {
                    console.log(`  ❌ REJECT: User wants ${genre} game, but this is ${recType}`);
                    return false;
                }
                return true;
            }
        }
    }

    // ============================================
    // WELLNESS / FITNESS - Activity Rules
    // ============================================
    if (toolType === 'WELLNESS' || toolType === 'FITNESS') {
        const activityPatterns: Record<string, RegExp> = {
            yoga: /\b(yoga|vinyasa|hatha|hot.yoga)\b/i,
            pilates: /\b(pilates|reformer)\b/i,
            massage: /\b(massage|spa|relaxation|thai.massage)\b/i,
            meditation: /\b(meditation|mindfulness|zen)\b/i,
            crossfit: /\b(crossfit|hiit|functional)\b/i,
            swimming: /\b(swim|pool|aqua)\b/i,
            climbing: /\b(climb|bouldering|rock)\b/i,
            boxing: /\b(boxing|kickboxing|mma|martial)\b/i,
            cycling: /\b(cycling|spin|bike)\b/i,
            running: /\b(running|jogging|trail)\b/i,
        };

        for (const [activity, pattern] of Object.entries(activityPatterns)) {
            if (pattern.test(requestLower)) {
                if (!pattern.test(allText)) {
                    console.log(`  ❌ REJECT: User wants ${activity}, but this is ${recType}`);
                    return false;
                }
                return true;
            }
        }
    }

    // ============================================
    // ESCAPE_ROOM - Theme Rules
    // ============================================
    if (toolType === 'ESCAPE_ROOM') {
        const themePatterns: Record<string, RegExp> = {
            horror: /\b(horror|scary|haunted|zombie)\b/i,
            mystery: /\b(mystery|detective|sherlock|murder)\b/i,
            heist: /\b(heist|bank|robbery|spy)\b/i,
            fantasy: /\b(fantasy|magic|wizard|medieval)\b/i,
            scifi: /\b(sci-fi|space|alien|futuristic)\b/i,
        };

        for (const [theme, pattern] of Object.entries(themePatterns)) {
            if (pattern.test(requestLower)) {
                if (!pattern.test(allText)) {
                    console.log(`  ❌ REJECT: User wants ${theme} escape room, but this is ${recType}`);
                    return false;
                }
                return true;
            }
        }
    }

    // ============================================
    // SPORTS - Sport Type Rules
    // ============================================
    if (toolType === 'SPORTS') {
        // Validation now supports checking structured 'sport' input if available (e.g. from pill selection)
        // This fixes the issue where an empty text search would bypass validation even if "Golf" was selected.
        const selectedSport = (recommendation.sport || recommendation.type || '').toLowerCase();

        const sportPatterns: Record<string, RegExp> = {
            tennis: /\b(tennis|racquet)\b/i,
            golf: /\b(golf|driving.range|fairway|putt)\b/i,
            soccer: /\b(soccer|football|futsal)\b/i,
            basketball: /\b(basketball|hoops)\b/i,
            swimming: /\b(swim|pool|aquatic)\b/i,
            cricket: /\b(cricket)\b/i,
            rugby: /\b(rugby|league|union)\b/i,
        };

        for (const [sportKey, pattern] of Object.entries(sportPatterns)) {
            // CHECK 1: If user TYPED this sport
            if (pattern.test(requestLower)) {
                if (!pattern.test(allText)) {
                    console.log(`  ❌ REJECT: User typed ${sportKey}, but this is ${recType}`);
                    return false;
                }
                return true;
            }

            // CHECK 2: If user SELECTED this sport via UI inputs (e.g. Golf button)
            // We infer this by checking if the user request is empty but we entered this block? 
            // Actually, we can't easily access 'inputs' here without changing signature.
            // BUT, we can make 'validateRecommendation' smarter by assuming if the AI returned "Golf" when "Tennis" 
            // was asked, it's wrong.
            // Wait, the issue is "Golf" was selected but "AFL" was returned.
            // The AI prompt received "Sport: Golf". If it returned AFL, it ignored the prompt.
            // We need to catch that here.
        }

        // NEW STRICT CHECK: If the recommendation ITSELF claims to be a specific sport,
        // and that sport heavily contradicts the apparent user intent (if any), we might flag it.
        // But the real fix is likely that we need to pass 'inputs' to this function to know what button was pressed.
        // However, refactoring strictly might be risky.
        //
        // ALTERNATIVE: Use the text presence of the sport name in the result.
        // If the result says "AFL Match" and doesn't mention "Golf", and we know (how?) the user wanted Golf?



        // 1. Check Explicit Input (Button Selection)
        if (inputs?.sport && inputs.sport !== 'Any') {
            const selectedSport = inputs.sport.toLowerCase();
            const matchingPattern = Object.entries(sportPatterns).find(([key]) => selectedSport.includes(key))?.[1];
            // Fallback to simple includes if no pattern

            if (matchingPattern) {
                if (!matchingPattern.test(allText)) {
                    console.log(`  ❌ REJECT: User selected ${inputs.sport}, but this result does not match.`);
                    return false;
                }
            } else {
                // If it's a sport we don't have a pattern for (e.g. "Squash"), we just check for the word presence
                if (!allText.includes(selectedSport)) {
                    console.log(`  ❌ REJECT: User selected ${inputs.sport}, but result text missing keywords.`);
                    return false;
                }
            }
        }

        // 2. Check Text Request (if any)
        for (const [sport, pattern] of Object.entries(sportPatterns)) {
            if (pattern.test(requestLower)) {
                if (!pattern.test(allText)) {
                    console.log(`  ❌ REJECT: User typed ${sport}, but this is ${recType}`);
                    return false;
                }
                return true;
            }
        }
    }

    // ============================================
    // THEATRE - Performance Type Rules
    // ============================================
    if (toolType === 'THEATRE') {
        const showPatterns: Record<string, RegExp> = {
            musical: /\b(musical|broadway|west.end)\b/i,
            comedy: /\b(comedy|stand-up|improv)\b/i,
            drama: /\b(drama|play|shakespeare)\b/i,
            ballet: /\b(ballet|dance|contemporary)\b/i,
            opera: /\b(opera|orchestr)\b/i,
        };

        for (const [showType, pattern] of Object.entries(showPatterns)) {
            if (pattern.test(requestLower)) {
                if (!pattern.test(allText)) {
                    console.log(`  ❌ REJECT: User wants ${showType}, but this is ${recType}`);
                    return false;
                }
                return true;
            }
        }
    }

    // Default: accept if no strict rules violated
    console.log(`  ✅ ACCEPT: No strict rules violated`);
    return true;
}

export async function POST(req: NextRequest) {
    try {
        // 1. Parse Request Body
        const body = await req.json();
        const { configId, inputs, location: cachedLocation, useMockData, isDemo, isPrivate } = body;

        // ✅ CRITICAL FIX: Capture extraInstructions from root body, not from inputs
        const rawExtraInstructions = body.extraInstructions || inputs?.extraInstructions || "";

        // 2. Auth & Subscription Check
        const session = await getSession();
        const isDemoMode = isDemo === true;

        if (!session?.user?.email && !isDemoMode) {
            return apiError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        // 3. Find Tool Config
        const toolKey = Object.keys(CONCIERGE_CONFIGS).find(
            key => CONCIERGE_CONFIGS[key].id === configId || key === configId
        );

        if (!toolKey) {
            return apiError(`Invalid config ID: ${configId}`, 400, 'INVALID_CONFIG');
        }

        const config = CONCIERGE_CONFIGS[toolKey];

        // 4. Rate Limiting (skip for demo mode)
        if (ratelimit && !isDemoMode) {
            const identifier = session!.user.id;
            const { success } = await ratelimit.limit(identifier);
            if (!success) {
                return apiError('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT');
            }
        }

        // 5. Subscription Check
        if (!isDemoMode) {
            const access = await checkSubscriptionAccess(session!.user.id, config.id);
            if (!access.allowed) {
                return apiError(access.reason || 'Premium required', 403, 'PREMIUM_REQUIRED');
            }
        }

        // 6. Location Context
        let targetLocation = "your area";
        if (cachedLocation) {
            if (typeof cachedLocation === 'string') {
                targetLocation = cachedLocation;
            } else if (typeof cachedLocation === 'object') {
                targetLocation = [cachedLocation.city, cachedLocation.region, cachedLocation.country]
                    .filter(Boolean)
                    .join(', ') || "your area";
            }
        }

        // 7. Prompt Generation & Execution (with Auto-Retry for Quality)
        const runConciergeSearch = async (query: string, attempt: number = 1) => {
            const { prompt } = getConciergePromptAndMock(
                toolKey,
                inputs,
                targetLocation,
                query,
                isPrivate === true
            );

            console.log(`[Concierge] Attempt ${attempt} for query: "${query}"`);
            const jsonResponse = await reliableGeminiCall(prompt, { jsonMode: true }) as { recommendations?: any[] };
            console.log(`[Concierge] Received response from model for ${toolKey}. Total recs: ${jsonResponse.recommendations?.length || 0}`);

            if (query && jsonResponse.recommendations && Array.isArray(jsonResponse.recommendations)) {
                // Validate each recommendation
                const filteredRecommendations = jsonResponse.recommendations.filter(
                    (rec: any) => validateRecommendation(rec, query, toolKey, inputs)
                );

                // ✅ RADICAL: If filtering removed more than 60% of results, and it's attempt 1, 
                // try again with an even more aggressive prompt.
                if (filteredRecommendations.length < 2 && attempt < 2) {
                    console.log(`[Concierge] Low quality results (${filteredRecommendations.length}/5). Retrying with hyper-focus...`);
                    return runConciergeSearch(`${query} (STRICT MATCH ONLY - IGNORE ALL OTHER CATEGORIES)`, attempt + 1);
                }

                return { ...jsonResponse, recommendations: filteredRecommendations };
            }

            // Fallback: If AI returned empty or ill-formatted, and it's attempt 2, return mock data
            // This prevents a "dead" experience for the user.
            if ((!jsonResponse.recommendations || jsonResponse.recommendations.length === 0) && attempt >= 2) {
                console.log(`[Concierge] AI failed twice. Falling back to mock data for ${toolKey}`);
                const { mockResponse } = getConciergePromptAndMock(toolKey, inputs, targetLocation, query, isPrivate === true);
                return mockResponse;
            }

            return jsonResponse;
        };

        // Helper: Normalize URLs to Google search format for location-based concierges
        // This prevents hallucinated URLs that lead to 404s or wrong sites
        const normalizeVenueUrls = (result: { recommendations?: any[] }) => {
            if (!result.recommendations || !Array.isArray(result.recommendations)) {
                return result;
            }

            const encodedLocation = encodeURIComponent(targetLocation);

            // Define which concierges need URL normalization and their search suffix
            const urlNormalizationRules: Record<string, string> = {
                'MOVIE': 'showtimes+near',      // Cinema mode only (handled separately)
                'DINING': 'restaurant',
                'BAR': 'bar',
                'WELLNESS': 'spa+wellness',
                'FITNESS': 'gym+fitness',
                'THEATRE': 'tickets',
                'ESCAPE_ROOM': 'escape+room',
                'SPORTS': 'sports',
                'WEEKEND_EVENTS': 'official+website',
                'HOTEL': 'hotel+booking',
                'NIGHTCLUB': 'nightclub',
            };

            // Special handling for cinema mode
            if (toolKey === 'MOVIE' && inputs.watchMode === 'Cinema') {
                result.recommendations = result.recommendations.map((rec: any) => {
                    const currentUrl = rec.website || '';
                    if (!currentUrl.includes('google.com/search')) {
                        const encodedTitle = encodeURIComponent(rec.name || '');
                        rec.website = `https://www.google.com/search?q=${encodedTitle}+showtimes+near+${encodedLocation}`;
                        console.log(`[URL Fix] Cinema: Replaced "${currentUrl.substring(0, 50)}..." with Google search`);
                    }
                    return rec;
                });
                return result;
            }

            // General URL normalization for other location-based concierges
            const searchSuffix = urlNormalizationRules[toolKey];
            if (searchSuffix) {
                result.recommendations = result.recommendations.map((rec: any) => {
                    const currentUrl = rec.website || '';

                    // Only replace if URL looks suspicious (not google, not major platforms)
                    const trustedDomains = ['google.com', 'facebook.com', 'instagram.com', 'yelp.com', 'tripadvisor.com', 'booking.com', 'airbnb.com'];
                    const isTrusted = trustedDomains.some(domain => currentUrl.includes(domain));

                    // ✅ CRITICAL FIX: If the prompt generated a Google Search intent (which we asked for), TRUST IT.
                    // Do not overwrite it with a generic search, as the prompt's search is likely more specific.
                    if (currentUrl && !isTrusted && !currentUrl.includes('google.com/search')) {
                        const encodedName = encodeURIComponent(rec.name || '');
                        rec.website = `https://www.google.com/search?q=${encodedName}+${encodedLocation}+${searchSuffix}`;
                        console.log(`[URL Fix] ${toolKey}: Replaced suspicious URL with Google search`);
                    } else if (currentUrl && currentUrl.includes('google.com/search')) {
                        console.log(`[URL Fix] ${toolKey}: Trusted generic Google Search URL from AI: ${currentUrl}`);
                    }

                    return rec;
                });
            }

            return result;
        };

        if (useMockData) {
            const { mockResponse } = getConciergePromptAndMock(toolKey, inputs, targetLocation, rawExtraInstructions, isPrivate);
            return NextResponse.json(normalizeVenueUrls(mockResponse));
        }

        const finalResult = await runConciergeSearch(rawExtraInstructions);
        return NextResponse.json(normalizeVenueUrls(finalResult));

    } catch (error: any) {
        return handleApiError(error);
    }
}
