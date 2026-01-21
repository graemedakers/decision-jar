import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ParsedIntent {
    quantity: number;
    topic: string;
    location?: string;
    constraints?: string[];
    targetCategory?: string;
    contentFormat?: 'DEFAULT' | 'MARKDOWN_RECIPE' | 'MARKDOWN_ITINERARY';
    requiresVenueLookup?: boolean;
    venueType?: 'DINING' | 'BAR' | 'ACTIVITY' | 'NIGHTCLUB';
}

export async function parseIntent(
    prompt: string,
    userContext?: { location?: string; jarTopic?: string }
): Promise<ParsedIntent> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const systemPrompt = `
        You are an intent parser for a "Decision Jar" app. 
        Extract structured data from the user's natural language request.
        
        User Context:
        - Current Jar Topic: ${userContext?.jarTopic || 'General'}
        - User Location: ${userContext?.location || 'Unknown'}

        Rules:
        1. "quantity": Extract number of ideas requested. Default to 5 if unspecified. Max 20.
        2. "topic": The core subject of the ideas (e.g., "date ideas", "dinner recipes", "movies").
        3. "location": Extract specific location if mentioned (e.g., "in Paris", "at home"). Use "User Location" if implied (e.g., "near me").
        4. "constraints": Array of specific constraints (budget, timing, vibe, etc.).
        5. "targetCategory": Infere the best category ID from: ROMANTIC, SOCIAL, MEAL, ACTIVITY, CHORE, WELLNESS, PERSONAL.
        6. "requiresVenueLookup": Set to true IF AND ONLY IF the user is asking for specific, existence-based places that need address/rating details (e.g., "top rated restaurants", "bars near me", "museums", "gyms"). 
           - FALSE for generic ideas (e.g., "romantic dinner at home", "go for a walk", "cook pasta").
        7. "venueType": If lookup required, specify type: 'DINING' (restaurants, cafes), 'BAR' (pubs, nightlife), 'ACTIVITY' (museums, bowling), 'NIGHTCLUB'.
        8. "contentFormat": Detect if the user wants detailed content.
           - Return "MARKDOWN_RECIPE" if they ask for "recipes", "meals", "cooking", "ingredients", "menu".
           - Return "MARKDOWN_ITINERARY" if they ask for "itinerary", "plan", "trip", "day out".
           - Default to "DEFAULT".

        Return ONLY a JSON object:
        {
            "quantity": number,
            "topic": "string",
            "location": "string | null",
            "constraints": ["string"],
            "targetCategory": "string",
            "requiresVenueLookup": boolean,
            "venueType": "DINING" | "BAR" | "ACTIVITY" | "NIGHTCLUB" | null,
            "contentFormat": "DEFAULT" | "MARKDOWN_RECIPE" | "MARKDOWN_ITINERARY"
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
                quantity: 5,
                topic: prompt,
                targetCategory: 'ACTIVITY'
            };
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("Intent parsing error:", error);
        // Robust fallback
        return {
            quantity: 5,
            topic: prompt,
            targetCategory: 'ACTIVITY'
        };
    }
}
