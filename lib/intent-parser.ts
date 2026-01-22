import { GoogleGenerativeAI } from '@google/generative-ai';
import { VALID_AI_CATEGORY_IDS } from './categories';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

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
           - DINING (restaurants, food), BAR (pubs), MOVIE, BOOK, GAME, HOTEL, WELLNESS (spa/yoga), FITNESS (gym), THEATRE, SPORTS, HOLIDAY (travel/itinerary), ESCAPE_ROOM.
        3. "quantity": Extract number of ideas requested for BULK_GENERATE. Default to 5.
        4. "topic": The specific subject the user asked for.
        5. "location": Extract specific location if mentioned (e.g., "in Paris").
        6. "requiresVenueLookup": Set to true IF the request needs physical addresses (Restaurants, Bars, Gyms).
        7. "venueType": specify category: 'DINING', 'BAR', 'ACTIVITY', 'NIGHTCLUB'.
        8. "contentFormat": 'MARKDOWN_RECIPE' for recipes, 'MARKDOWN_ITINERARY' for plans.
        9. "isLocationDependent": True if physical location is required to fulfill.

        EXAMPLES:
        - "5 sci-fi movies" → BULK_GENERATE, quantity: 5, topic: "sci-fi movies"
        - "Add Interstellar" → ADD_SINGLE, topic: "Interstellar"
        - "Titanic" → ADD_SINGLE, topic: "Titanic"
        - "What movie should I watch?" → LAUNCH_CONCIERGE, conciergeTool: "MOVIE"
        - "Find Italian restaurants nearby" → LAUNCH_CONCIERGE, conciergeTool: "DINING", requiresVenueLookup: true
        - "10 quick recipes" → BULK_GENERATE, quantity: 10, topic: "recipes", contentFormat: "MARKDOWN_RECIPE"
        - "Plan a 3 day trip to Tokyo" → LAUNCH_CONCIERGE, conciergeTool: "HOLIDAY", contentFormat: "MARKDOWN_ITINERARY"
        - "Suggest some board games" → LAUNCH_CONCIERGE, conciergeTool: "GAME"

        Return ONLY JSON:
        {
            "intentAction": "string",
            "conciergeTool": "string | null",
            "quantity": number,
            "topic": "string",
            "location": "string | null",
            "constraints": ["string"],
            "targetCategory": "string",
            "requiresVenueLookup": boolean,
            "venueType": "string | null",
            "contentFormat": "string",
            "isLocationDependent": boolean
        }
        `;

        const result = await model.generateContent([
            systemPrompt,
            `User Request: "${prompt}"`
        ]);

        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            // Fallback for simple parsing if AI fails
            return {
                intentAction: 'BULK_GENERATE',
                quantity: 5,
                topic: prompt,
                targetCategory: 'ACTIVITY'
            };
        }

        return JSON.parse(jsonMatch[0]);
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

        return {
            intentAction: 'BULK_GENERATE',
            quantity: 5,
            topic: prompt,
            conciergeTool: fallbackTool,
            targetCategory: fallbackTool ? 'ACTIVITY' : 'ACTIVITY'
        };
    }
}
