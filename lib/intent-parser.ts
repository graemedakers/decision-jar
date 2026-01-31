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
    enrichment?: {
        category: string;
        cost: string; // $, $$, $$$, $$$$
        duration: number; // minutes
        vibe: string;
    };
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
           - If they ask for a list or a number of things (including "Suggest 5..." or "Recommend 3..."), use 'BULK_GENERATE'.
           - If they ask "What", "Where", "How", "Find" or open-ended "Suggest/Recommend" WITHOUT a specific quantity, use 'LAUNCH_CONCIERGE'.
        2. "conciergeTool": If 'LAUNCH_CONCIERGE', map to the best tool ID.
        3. "targetCategory": REQUIRED FOR ALL ACTIONS. Best fit from:
           - BAR (bars, pubs, nightlife)
           - MEAL (restaurants, food, dinner, breakfast)
           - MOVIE (films, cinema)
           - BOOK (reading)
           - GAME (board games, video games)
           - WELLNESS (spa, meditation, self-care)
           - FITNESS (gym, yoga, sports)
           - ACTIVITY (general fun, sightseeing, hobbies)
           - TRAVEL (holidays, hotels, flights)
           - EVENT (concerts, theatre, festivals)
           - OUTDOORS (hiking, nature)
           - CHORE (tasks, housework)
           - RECIPE (cooking)
        4. "quantity": Extract number of ideas requested for BULK_GENERATE. Default to 5.
        5. "topic": The specific subject the user asked for (e.g., "Cosy rooftop bars").
        6. "location": Extract specific location if mentioned (e.g., "Melbourne CBD").
        7. "requiresVenueLookup": Set to true IF the request needs physical addresses (Restaurants, Bars, Gyms).
        8. "isLocationDependent": True if physical location is required to fulfill.
        9. "enrichment": IF 'ADD_SINGLE', extract:
           - "cost": Estimated price $, $$, $$$, or $$$$.
           - "duration": Estimated duration in minutes.
           - "vibe": A single adjective describing the activity.

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

