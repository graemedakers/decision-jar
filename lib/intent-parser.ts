import { VALID_AI_CATEGORY_IDS } from './categories';
import { reliableGeminiCall } from './gemini';

export interface ParsedIntent {
    intentAction: 'BULK_GENERATE' | 'ADD_SINGLE' | 'LAUNCH_CONCIERGE' | 'UNKNOWN';
    conciergeTool?: string; // Mapping to tool IDs (DINING, MOVIE, BOOK, etc.)
    quantity: number;
    topic: string;
    location?: string;
    constraints?: string[];
    targetCategory?: string;
    contentFormat?: 'DEFAULT' | 'MARKDOWN_RECIPE' | 'MARKDOWN_ITINERARY';
    requiresVenueLookup?: boolean;
    venueType?: 'DINING' | 'BAR' | 'ACTIVITY' | 'NIGHTCLUB';
    isLocationDependent?: boolean;
}

export async function parseIntent(
    prompt: string,
    userContext?: { location?: string; jarTopic?: string }
): Promise<ParsedIntent> {
    try {
        const systemPrompt = `
        You are an advanced intent parser for a "Decision Jar" app. 
        Your goal is to categorize user requests into one of three distinct actions:
        1. **BULK_GENERATE**: User wants to populate their jar with multiple ideas (e.g. "5 movies", "fill my jar with recipes").
        2. **ADD_SINGLE**: User wants to add one specific, named item (e.g. "Add Interstellar", "Titanic").
        3. **LAUNCH_CONCIERGE**: User is asking a question or requesting a search/service that requires specialized research (e.g. "Where can I eat Italian?", "Find me a movie to watch tonight", "Help me plan a holiday").
        
        User Context:
        - Current Jar Topic: ${userContext?.jarTopic || 'General'}
        - User Location: ${userContext?.location || 'Unknown'}

        Rules:
        1. "intentAction": Categorize as 'BULK_GENERATE', 'ADD_SINGLE', 'LAUNCH_CONCIERGE', or 'UNKNOWN'.
           - If they mention a specific title (movie, book, restaurant name) but DON'T ask for a quantity or a search, use 'ADD_SINGLE'.
           - If they ask for a list or a number of things, use 'BULK_GENERATE'.
           - If they ask "What", "Where", "How", "Suggest", "Recommend", or "Find", use 'LAUNCH_CONCIERGE'.
        2. "conciergeTool": If 'LAUNCH_CONCIERGE', map to the best tool ID:
           - DINING (restaurants, food), BAR (pubs), MOVIE, BOOK, GAME, HOTEL, WELLNESS (spa/yoga), FITNESS (gym), THEATRE, SPORTS, HOLIDAY (travel/itinerary), ESCAPE_ROOM, SIMPLE (quotes, jokes, affirmations, ideas), YOUTUBE (videos, tutorials).
        3. "quantity": Extract number of ideas requested for BULK_GENERATE. Default to 5.
        4. "topic": The specific subject the user asked for.
        5. "location": Extract specific location if mentioned (e.g., "in Paris").
        6. "requiresVenueLookup": Set to true IF the request needs physical addresses (Restaurants, Bars, Gyms).
        7. "isLocationDependent": True if physical location is required to fulfill.

        Return ONLY a valid JSON object.
        `;

        const intent = await reliableGeminiCall<ParsedIntent>(systemPrompt + `\n\nUser Request: "${prompt}"`, {
            jsonMode: true,
            temperature: 0.1
        });

        // Ensure defaults if AI missed fields
        if (!intent.quantity) intent.quantity = 5;
        if (!intent.intentAction) intent.intentAction = 'BULK_GENERATE';

        return intent;
    } catch (error) {
        console.error("Intent parsing error:", error);
        // Robust fallback with basic keyword matching
        const lowerPrompt = prompt.toLowerCase();
        let fallbackTool: string | undefined;

        if (lowerPrompt.match(/food|eat|restaurant|dinner|lunch|breakfast|brunch/)) fallbackTool = 'DINING';
        else if (lowerPrompt.match(/movie|film|cinema|watch/)) fallbackTool = 'MOVIE';
        else if (lowerPrompt.match(/book|read|novel/)) fallbackTool = 'BOOK';
        else if (lowerPrompt.match(/game|play|board game/)) fallbackTool = 'GAME';
        else if (lowerPrompt.match(/activity|fun|do|weekend/)) fallbackTool = 'ACTIVITY';
        else if (lowerPrompt.match(/youtube|video|tutorial/)) fallbackTool = 'YOUTUBE';

        return {
            intentAction: 'BULK_GENERATE',
            quantity: 5,
            topic: prompt,
            conciergeTool: fallbackTool,
            targetCategory: 'ACTIVITY'
        };
    }
}

