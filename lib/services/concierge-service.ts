import { reliableGeminiCall } from '@/lib/gemini';
import { getConciergePromptAndMock } from '@/lib/concierge-prompts';
import { batchVerifyRecommendations } from '@/lib/ai-validator';

export interface ConciergeGenerationParams {
    toolKey: string;
    configId: string;
    inputs: any;
    targetLocation: string;
    isPrivate: boolean;
    extraInstructions?: string;
    useMockData?: boolean;
}

export class ConciergeService {

    /**
     * Core logic to generate ideas via Gemini or Mock data.
     * Handles prompting, retries, validation, and URL normalization.
     */
    static async generateIdeas(
        params: ConciergeGenerationParams
    ): Promise<{ recommendations: any[]; metadata?: any }> {
        const { toolKey, configId, inputs, targetLocation, isPrivate, extraInstructions, useMockData } = params;

        // 1. Mock Data Handling
        if (useMockData) {
            const { mockResponse } = getConciergePromptAndMock(toolKey, inputs, targetLocation, extraInstructions || "", isPrivate);
            const normalized = this.normalizeVenueUrls(mockResponse, toolKey, targetLocation, inputs);
            return { ...normalized, recommendations: normalized.recommendations || [] };
        }

        // 2. Prepare for Gemini Call
        const runConciergeSearch = async (query: string, attempt: number = 1): Promise<{ recommendations?: any[] }> => {
            const { prompt } = getConciergePromptAndMock(
                toolKey,
                inputs,
                targetLocation,
                query,
                isPrivate
            );

            console.log(`[ConciergeService] Attempt ${attempt} for toolKey: "${toolKey}", query: "${query}"`);

            // Tools that should use Google Search
            const shouldUseSearch = toolKey !== 'RECIPE' && configId !== 'recipe_discovery';

            // Temperature settings
            const contentGenerationTools = ['CHEF', 'RECIPE', 'MOVIE', 'BOOK', 'GAME'];
            const temperature = contentGenerationTools.includes(toolKey) ? 0.3 : 0.7;

            console.log(`[ConciergeService] Calling Gemini with useSearch=${shouldUseSearch}, temperature=${temperature}`);

            let jsonResponse: { recommendations?: any[] };
            try {
                jsonResponse = await reliableGeminiCall(prompt, {
                    temperature: temperature,
                    jsonMode: !shouldUseSearch, // Disable JSON mode if using search
                    useSearch: shouldUseSearch
                }) as { recommendations?: any[] };
            } catch (err: any) {
                console.error(`[ConciergeService] Gemini call failed: ${err.message}`);
                // Retry without search if search failed
                if (shouldUseSearch) {
                    console.log(`[ConciergeService] Retrying without search...`);
                    jsonResponse = await reliableGeminiCall(prompt, {
                        temperature: temperature,
                        jsonMode: true,
                        useSearch: false
                    }) as { recommendations?: any[] };
                } else {
                    throw err;
                }
            }

            console.log(`[ConciergeService] Received response. Total recs: ${jsonResponse.recommendations?.length || 0}`);

            if (query && jsonResponse.recommendations && Array.isArray(jsonResponse.recommendations) && jsonResponse.recommendations.length > 0) {
                // Validation Logic
                const filterSummary = Object.entries(inputs || {})
                    .filter(([k, v]) => k !== 'extraInstructions' && v && v !== 'any')
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ");
                const fullValidationQuery = `${query}${filterSummary ? ` (Filters: ${filterSummary})` : ''}`.trim();

                console.log(`[ConciergeService] Validating against: "${fullValidationQuery}"`);

                const filteredRecommendations = await batchVerifyRecommendations(fullValidationQuery, jsonResponse.recommendations, toolKey);

                // Retry logic for low quality results
                if (filteredRecommendations.length < 2 && attempt < 2 && jsonResponse.recommendations.length > 3) {
                    console.log(`[ConciergeService] Low quality results (${filteredRecommendations.length}/${jsonResponse.recommendations.length}). Retrying...`);
                    return runConciergeSearch(`${query} (STRICT MATCH ONLY - IGNORE ALL OTHER CATEGORIES)`, attempt + 1);
                }

                return { ...jsonResponse, recommendations: filteredRecommendations };
            }

            // Fallback to mock if AI failed twice
            if ((!jsonResponse.recommendations || jsonResponse.recommendations.length === 0) && attempt >= 2) {
                console.log(`[ConciergeService] AI failed twice. Falling back to mock data.`);
                const { mockResponse } = getConciergePromptAndMock(toolKey, inputs, targetLocation, query, isPrivate);
                return mockResponse;
            }

            return jsonResponse;
        };

        // 3. Execute
        const rawResult = await runConciergeSearch(extraInstructions || "");

        // 4. Post-Processing
        const validatedResult = this.validateRecipeResponses(rawResult, toolKey);
        const finalResult = this.normalizeVenueUrls(validatedResult, toolKey, targetLocation, inputs);

        return {
            ...finalResult,
            recommendations: finalResult.recommendations || []
        };
    }

    /**
     * URL Normalization Logic
     */
    private static normalizeVenueUrls(
        result: { recommendations?: any[] },
        toolKey: string,
        targetLocation: string,
        inputs: any
    ) {
        if (!result.recommendations || !Array.isArray(result.recommendations)) {
            return result;
        }

        const encodedLocation = encodeURIComponent(targetLocation);

        const urlNormalizationRules: Record<string, string> = {
            'MOVIE': 'showtimes+near',
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

        // Cinema Mode Exception
        if (toolKey === 'MOVIE' && inputs.watchMode === 'Cinema') {
            result.recommendations = result.recommendations.map((rec: any) => {
                const currentUrl = rec.website || '';
                if (!currentUrl.includes('google.com/search')) {
                    const encodedTitle = encodeURIComponent(rec.name || '');
                    rec.website = `https://www.google.com/search?q=${encodedTitle}+showtimes+near+${encodedLocation}`;
                }
                return rec;
            });
            return result;
        }

        if (toolKey === 'YOUTUBE') return result;

        const searchSuffix = urlNormalizationRules[toolKey];
        if (searchSuffix) {
            result.recommendations = result.recommendations.map((rec: any) => {
                const currentUrl = rec.website || '';

                if (!currentUrl) {
                    const encodedName = encodeURIComponent(rec.name || '');
                    rec.website = `https://www.google.com/search?q=${encodedName}+${encodedLocation}+${searchSuffix}`;
                } else {
                    const trustedDomains = ['google.com', 'facebook.com', 'instagram.com', 'yelp.com', 'tripadvisor.com', 'booking.com', 'airbnb.com', 'youtube.com', 'youtu.be', 'ticketmaster', 'eventbrite'];
                    const isTrusted = trustedDomains.some(domain => currentUrl.includes(domain));

                    if (!isTrusted && !currentUrl.includes('google.com/search')) {
                        const encodedName = encodeURIComponent(rec.name || '');
                        rec.website = `https://www.google.com/search?q=${encodedName}+${encodedLocation}+${searchSuffix}`;
                    }
                }
                return rec;
            });
        }
        return result;
    }

    /**
     * Recipe Data Validation
     */
    private static validateRecipeResponses(result: { recommendations?: any[] }, toolKey: string) {
        if (toolKey !== 'RECIPE' && toolKey !== 'CHEF') {
            return result;
        }

        if (!result.recommendations || !Array.isArray(result.recommendations)) {
            return result;
        }

        result.recommendations = result.recommendations.map((rec: any) => {
            if (rec.ideaType !== 'recipe') rec.ideaType = 'recipe';
            if (rec.address && rec.address !== 'At Home' && !rec.address.toLowerCase().includes('home')) {
                rec.address = 'At Home';
            }
            if (!rec.typeData) rec.typeData = {};

            // Extract ingredients
            if (!rec.typeData.ingredients || !Array.isArray(rec.typeData.ingredients) || rec.typeData.ingredients.length === 0) {
                if (rec.details && typeof rec.details === 'string') {
                    const ingredientMatch = rec.details.match(/### Ingredients\n([\s\S]*?)(?=###|$)/i);
                    if (ingredientMatch) {
                        const ingredientLines = ingredientMatch[1].split('\n').filter((line: string) => line.trim().startsWith('-'));
                        rec.typeData.ingredients = ingredientLines.map((line: string) => line.replace(/^-\s*/, '').trim());
                    }
                }
            }

            // Extract instructions
            if (!rec.typeData.instructions || typeof rec.typeData.instructions !== 'string' || rec.typeData.instructions.length === 0) {
                if (rec.details && typeof rec.details === 'string') {
                    const instructionsMatch = rec.details.match(/### Instructions\n([\s\S]*?)(?=###|$)/i);
                    if (instructionsMatch) {
                        rec.typeData.instructions = instructionsMatch[1].trim();
                    }
                }
            }

            if (!rec.typeData.title) rec.typeData.title = rec.name;

            return rec;
        });

        return result;
    }
}
