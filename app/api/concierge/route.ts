import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { reliableGeminiCall } from '@/lib/gemini';
import { CONCIERGE_CONFIGS } from '@/lib/concierge-configs';
import { getConciergePromptAndMock } from '@/lib/concierge-prompts';
import { checkSubscriptionAccess } from '@/lib/premium';
import { apiError, handleApiError } from '@/lib/api-response';
import { batchVerifyRecommendations } from '@/lib/ai-validator';

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

export async function POST(req: NextRequest) {
    try {
        // 1. Parse Request Body
        const body = await req.json();
        const { configId, inputs: rawInputs, location: cachedLocation, useMockData, isDemo, isPrivate, price } = body;

        // Ensure price is included in inputs for the prompt generator
        const inputs = { ...(rawInputs || {}), price: price || rawInputs?.price };

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

        console.log(`[Concierge] Received configId: "${configId}", resolved toolKey: "${toolKey}"`);
        console.log(`[Concierge] extraInstructions: "${rawExtraInstructions}"`);

        if (!toolKey) {
            return apiError(`Invalid config ID: ${configId}`, 400, 'INVALID_CONFIG');
        }

        const config = CONCIERGE_CONFIGS[toolKey];

        // 4. Rate Limiting (skip for demo mode)
        if (ratelimit && !isDemoMode) {
            const identifier = session!.user.id!;
            const { success } = await ratelimit.limit(identifier);
            if (!success) {
                return apiError('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT');
            }
        }

        // 5. Subscription Check
        if (!isDemoMode) {
            const access = await checkSubscriptionAccess(session!.user.id!, config.id);
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

            console.log(`[Concierge] Attempt ${attempt} for toolKey: "${toolKey}", query: "${query}"`);

            // Check if the user's request is for recipes/cooking
            const isRecipeRequest = query && /recipe|cook|meal|dish|ingredient|make.*dinner|make.*lunch|prepare/i.test(query);

            // Tools that should use Google Search (finding real venues/locations)
            // Tools that should NEVER use search (AI generates content, not finds venues)
            const shouldUseSearch = toolKey !== 'RECIPE' && configId !== 'recipe_discovery';

            // Use lower temperature for content-generation tools to get more deterministic outputs
            const contentGenerationTools = ['CHEF', 'RECIPE', 'MOVIE', 'BOOK', 'GAME'];
            const temperature = contentGenerationTools.includes(toolKey) ? 0.3 : 0.7;

            console.log(`[Concierge] Calling Gemini with useSearch=${shouldUseSearch}, temperature=${temperature}`);

            let jsonResponse: { recommendations?: any[] };
            try {
                jsonResponse = await reliableGeminiCall(prompt, {
                    temperature: temperature,
                    jsonMode: !shouldUseSearch, // Disable JSON mode if using search
                    useSearch: shouldUseSearch
                }) as { recommendations?: any[] };

            } catch (err: any) {
                console.error(`[Concierge] Gemini call failed: ${err.message}`);
                // If search failed, try one more time WITHOUT search before giving up
                if (shouldUseSearch) {
                    console.log(`[Concierge] Retrying without search...`);
                    jsonResponse = await reliableGeminiCall(prompt, {
                        temperature: temperature,
                        jsonMode: true,
                        useSearch: false
                    }) as { recommendations?: any[] };
                } else {
                    throw err;
                }
            }
            console.log(`[Concierge] Received response from model for ${toolKey}. Total recs: ${jsonResponse.recommendations?.length || 0}`);

            if (query && jsonResponse.recommendations && Array.isArray(jsonResponse.recommendations)) {
                // Construct a full query description for the validator that includes filters
                const filterSummary = Object.entries(inputs || {})
                    .filter(([k, v]) => k !== 'extraInstructions' && v && v !== 'any')
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ");
                const fullValidationQuery = `${query}${filterSummary ? ` (Filters: ${filterSummary})` : ''}`.trim();

                console.log(`[Concierge] Validating against: "${fullValidationQuery}"`);

                // ✅ REFACTOR: Use Semantic Batch Verification instead of Regex
                const filteredRecommendations = await batchVerifyRecommendations(fullValidationQuery, jsonResponse.recommendations, toolKey);

                // If filtering removed too many results, retry aggressively
                if (filteredRecommendations.length < 2 && attempt < 2 && jsonResponse.recommendations.length > 3) {
                    console.log(`[Concierge] Low quality results (${filteredRecommendations.length}/${jsonResponse.recommendations.length}). Retrying with hyper-focus...`);
                    return runConciergeSearch(`${query} (STRICT MATCH ONLY - IGNORE ALL OTHER CATEGORIES)`, attempt + 1);
                }

                return { ...jsonResponse, recommendations: filteredRecommendations };
            }

            // Fallback: If AI returned empty or ill-formatted, and it's attempt 2, return mock data
            if ((!jsonResponse.recommendations || jsonResponse.recommendations.length === 0) && attempt >= 2) {
                console.log(`[Concierge] AI failed twice. Falling back to mock data for ${toolKey}`);
                const { mockResponse } = getConciergePromptAndMock(toolKey, inputs, targetLocation, query, isPrivate === true);
                return mockResponse;
            }

            return jsonResponse;
        };

        // Helper: Normalize URLs to Google search format for location-based concierges
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
                'HOTEL': 'booking.com',
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
            // 🛑 EXCEPTION: Do not normalize YouTube URLs. Grounding links are precise.
            if (toolKey === 'YOUTUBE') return result;

            const searchSuffix = urlNormalizationRules[toolKey];
            if (searchSuffix) {
                result.recommendations = result.recommendations.map((rec: any) => {
                    const currentUrl = rec.website || '';

                    // ✅ CRITICAL FIX: If no URL is provided, generate a fallback Google Search URL
                    if (!currentUrl) {
                        const encodedName = encodeURIComponent(rec.name || '');
                        rec.website = `https://www.google.com/search?q=${encodedName}+${encodedLocation}+${searchSuffix}`;
                        console.log(`[URL Fix] ${toolKey}: Generated missing URL -> ${rec.website}`);
                    }
                    else {
                        const trustedDomains = ['google.com', 'facebook.com', 'instagram.com', 'yelp.com', 'tripadvisor.com', 'booking.com', 'airbnb.com', 'youtube.com', 'youtu.be', 'ticketmaster', 'eventbrite', 'booking.com', 'tripadvisor.com'];
                        const isTrusted = trustedDomains.some(domain => currentUrl.includes(domain));

                        if (!isTrusted && !currentUrl.includes('google.com/search')) {
                            const encodedName = encodeURIComponent(rec.name || '');
                            rec.website = `https://www.google.com/search?q=${encodedName}+${encodedLocation}+${searchSuffix}`;
                            console.log(`[URL Fix] ${toolKey}: Replaced suspicious URL with Google search`);
                        }
                    }

                    return rec;
                });
            }

            return result;
        };

        // Helper: Validate and fix recipe responses
        const validateRecipeResponses = (result: { recommendations?: any[] }) => {
            // Only apply to recipe-generating tools
            if (toolKey !== 'RECIPE' && toolKey !== 'CHEF') {
                return result;
            }

            if (!result.recommendations || !Array.isArray(result.recommendations)) {
                return result;
            }

            console.log(`[RecipeValidator] Validating ${result.recommendations.length} recommendations for ${toolKey}`);

            result.recommendations = result.recommendations.map((rec: any) => {
                // Force ideaType to be "recipe"
                if (rec.ideaType !== 'recipe') {
                    rec.ideaType = 'recipe';
                }

                // Force address to "At Home"
                if (rec.address && rec.address !== 'At Home' && !rec.address.toLowerCase().includes('home')) {
                    rec.address = 'At Home';
                }

                // Ensure typeData exists
                if (!rec.typeData) {
                    rec.typeData = {};
                }

                // Try to extract ingredients from details if missing
                if (!rec.typeData.ingredients || !Array.isArray(rec.typeData.ingredients) || rec.typeData.ingredients.length === 0) {
                    // Try to parse from details markdown
                    if (rec.details && typeof rec.details === 'string') {
                        const ingredientMatch = rec.details.match(/### Ingredients\n([\s\S]*?)(?=###|$)/i);
                        if (ingredientMatch) {
                            const ingredientLines = ingredientMatch[1].split('\n').filter((line: string) => line.trim().startsWith('-'));
                            rec.typeData.ingredients = ingredientLines.map((line: string) => line.replace(/^-\s*/, '').trim());
                        }
                    }
                }

                // Try to extract instructions from details if missing
                if (!rec.typeData.instructions || typeof rec.typeData.instructions !== 'string' || rec.typeData.instructions.length === 0) {
                    if (rec.details && typeof rec.details === 'string') {
                        const instructionsMatch = rec.details.match(/### Instructions\n([\s\S]*?)(?=###|$)/i);
                        if (instructionsMatch) {
                            rec.typeData.instructions = instructionsMatch[1].trim();
                        }
                    }
                }

                // Ensure title is set
                if (!rec.typeData.title) {
                    rec.typeData.title = rec.name;
                }

                return rec;
            });

            return result;
        };

        if (useMockData) {
            const { mockResponse } = getConciergePromptAndMock(toolKey, inputs, targetLocation, rawExtraInstructions, isPrivate);
            return NextResponse.json(normalizeVenueUrls(mockResponse));
        }

        const rawResult = await runConciergeSearch(rawExtraInstructions);
        const validatedResult = validateRecipeResponses(rawResult);
        const finalResult = normalizeVenueUrls(validatedResult);
        return NextResponse.json(finalResult);

    } catch (error: any) {
        return handleApiError(error);
    }
}
