import { reliableGeminiCall } from './gemini';

interface VerificationResult {
    isValid: boolean;
    reason?: string;
    originalIndex: number;
}

/**
 * batchVerifyRecommendations
 * 
 * Uses a lightweight AI call to verify if a list of recommendations ACTUALLY matches the user's intent.
 * This replaces brittle regex-based validation.
 * 
 * @param query The user's original search query (e.g., "Italian food in NYC", "Sci-fi movies from the 90s")
 * @param recommendations The list of raw items returned by the generator
 * @param toolType The type of tool (DINING, MOVIE, etc.) to give context
 */
export async function batchVerifyRecommendations(
    query: string,
    recommendations: any[],
    toolType: string
): Promise<any[]> {
    // 1. Optimization: If query is empty or too simple, skip verification
    if (!query || query.trim().length < 3 || query.toLowerCase() === 'any') {
        return recommendations;
    }

    // 2. Optimization: If list is very short, maybe regex was better? No, consistency is key.
    // Prepare a simplified list for the AI to check (reduce token usage)
    const itemsToCheck = recommendations.map((rec, index) => ({
        index,
        name: rec.name || rec.title,
        description: rec.description || rec.plot || rec.details,
        type: rec.cuisine || rec.category || rec.genre || rec.type
    }));

    const prompt = `
    You are a Strict Quality Control AI. 
    Your goal is to filter out recommendations that DO NOT match the user's specific request.
    
    CONTEXT:
    Tool: ${toolType}
    User Request: "${query}"

    ITEMS TO CHECK:
    ${JSON.stringify(itemsToCheck, null, 2)}

    INSTRUCTIONS:
    1. Analyze each item against the User Request.
    2. REJECT items that fundamentally disagree with the request (e.g. User asked for "Italian" but item is "Sushi").
    3. REJECT items that are the wrong format (e.g. User asked for "Movie" but item is a "Book").
    4. ACCEPT items that are close enough or semantically related (e.g. "Asian" accepts "Thai").
    5. ACCEPT items if the request is vague (e.g. "Good food" accepts anything).

    OUTPUT FORMAT:
    Return a JSON object with a single key "validIndices" containing an array of the indices (integers) of the items that PASSED validation.
    Example: { "validIndices": [0, 2, 5] }
    `;

    try {
        const response: any = await reliableGeminiCall(prompt, {
            temperature: 0.1, // Very, very strict and deterministic
            jsonMode: true,
            // Use a faster model if possible, but flash is good.
            models: ["gemini-2.0-flash", "gemini-1.5-flash"]
        });

        const validIndices = response.validIndices;

        if (Array.isArray(validIndices)) {
            // Filter the original list
            const validRecs = recommendations.filter((_, idx) => validIndices.includes(idx));

            console.log(`[AI Validator] Filtered ${recommendations.length} -> ${validRecs.length} items for query "${query}"`);

            // If we filtered out EVERYTHING, that's suspicious. 
            // In that case, fallback to the original list and log a warning, 
            // because an empty list is worse than a slightly wrong one for the user experience.
            if (validRecs.length === 0 && recommendations.length > 0) {
                console.warn("[AI Validator] AI rejected ALL items. This might be an error or a bad prompt. Returning originals to be safe.");
                return recommendations;
            }

            return validRecs;
        }

        return recommendations;

    } catch (error) {
        console.error("[AI Validator] Verification Failed:", error);
        // Fail open: If logic fails, return all recommendations rather than crashing
        return recommendations;
    }
}
