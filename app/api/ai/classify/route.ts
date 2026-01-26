import { NextRequest, NextResponse } from 'next/server';
import { reliableGeminiCall } from '@/lib/gemini';
import { CONCIERGE_CONFIGS } from '@/lib/concierge-configs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query } = body;

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // 1. Build a list of valid topics with descriptions for better context
        const validTopics = Object.entries(CONCIERGE_CONFIGS)
            .map(([key, config]) => `- ${key}: ${config.subtitle || config.title}`)
            .join('\n');

        const prompt = `
        You are the Brain of a "Decision Jar" app. Your job is to classify user input into one of three intents.

        CRITICAL PRIORITY RULES (OVERRIDE EVERYTHING ELSE):
        1. If input contains "recipe", "cook", "ingredients" -> INTENT is 'GENERATE_IDEAS' and TOPIC is 'RECIPE'.
        2. If input starts with a number (e.g. "5 ideas", "10 movies", "3 recipes") -> INTENT is ALWAYS 'GENERATE_IDEAS'.
        3. If input is a URL -> INTENT is 'EXECUTE_ACTION'.
        4. If input allows finding a place to eat out (restaurant, cafe, dinner) -> TOPIC is 'DINING'.
        5. If input is a specific DISH or FOOD name (e.g. "Lentil Soup", "Pizza", "Cake") -> INTENT is 'EXECUTE_ACTION' and TYPE is 'RECIPE' (NOT DINING).

        VALID TOPICS:
        ${validTopics}

        Determine the INTENT (if not caught by rules above):
        1. EXECUTE_ACTION: The user wants to add a specific item (Idea, Food, URL) to the jar directly.
           - Examples: "Add a movie called Inception", "Lentil Soup", "Pizza", "Add a date night idea to go bowling".
           - CRITICAL FOR FOOD: If the item is a food/dish name (e.g. "Lentil Soup"), set type to 'RECIPE', NOT 'DINING'. Only set 'DINING' if it is a specific venue name (e.g. "McDonalds").
        
        2. GENERATE_IDEAS: The user wants YOU (the AI) to suggest ideas, or wants to find/search for something.
           - Examples: "Give me ideas", "Where should I eat?", "Plan a date night", "I need movie ideas", "Suggest a good book", "budget friendly meals".
           - Key: If the user is ASKING for content ("Give me", "Find", "Search", "I need"), it is GENERATE.

        3. NAVIGATION: The user is trying to navigate to a specific part of the app (e.g. "Go to settings", "Open my jar").

        OUTPUT JSON SCHEMA (Strict):
        {
          "intent": "EXECUTE_ACTION" | "GENERATE_IDEAS" | "NAVIGATION",
          "confidence": number, // 0-1
          "classification": {
            "topic": string, // MUST be one of VALID TOPICS keys. Default 'CONCIERGE'.
            "isBulk": boolean, // True if user asks for multiple items
            "quantity": number // If specified
          },
          "extraction": { // Only for EXECUTE_ACTION
             "title": string,
             "description": string,
             "type": string, // Best guess at topic key. USE 'recipe' for dishes.
             "url": string
          }
        }

        Return ONLY valid JSON.
        `;

        const aiResponse = await reliableGeminiCall(prompt, {
            temperature: 0.0, // Zero temperature for maximum determinism
            jsonMode: true
        }) as any;

        // 🛡️ DETERMINISTIC OVERRIDES (Belt and Braces)
        // If the AI fails to respect the prompt rules, we enforce them here programmatically.
        const lowerQuery = query.toLowerCase();

        // Rule 1: "Recipe" -> ALWAYS Generate + Recipe
        if (lowerQuery.includes('recipe') || lowerQuery.includes('cook') || lowerQuery.includes('ingredients')) {
            console.log(`[Classify] Overriding AI decision for 'recipe' keyword.`);
            aiResponse.intent = 'GENERATE_IDEAS';
            aiResponse.classification = {
                topic: 'RECIPE',
                isBulk: true,
                quantity: 5 // Default
            };
            aiResponse.extraction = null;
        }

        // Rule 2: Starts with number -> ALWAYS Generate
        if (/^\d+\s/.test(lowerQuery)) {
            console.log(`[Classify] Overriding AI decision for numbered request.`);
            aiResponse.intent = 'GENERATE_IDEAS';
            if (!aiResponse.classification) aiResponse.classification = { topic: 'CONCIERGE' };
            aiResponse.classification.isBulk = true;
            aiResponse.extraction = null;

            // Infer topic if missing from override
            if (aiResponse.classification.topic === 'CONCIERGE') {
                if (lowerQuery.includes('meal') || lowerQuery.includes('food')) aiResponse.classification.topic = 'RECIPE'; // Default meals to recipe if number is present
                if (lowerQuery.includes('movie')) aiResponse.classification.topic = 'MOVIE';
                if (lowerQuery.includes('book')) aiResponse.classification.topic = 'BOOK';
            }
        }

        // Rule 3: Catch misclassified Food/Dishes as Dining
        if (aiResponse.intent === 'EXECUTE_ACTION') {
            const extType = (aiResponse.extraction?.type || '').toUpperCase();
            const extTitle = (aiResponse.extraction?.title || '').toLowerCase();

            // If classified as DINING but looks like a generic dish and NOT a venue request
            if ((extType === 'DINING' || extType === 'MEAL' || extType === 'FOOD') &&
                !extTitle.includes('restaurant') &&
                !extTitle.includes('cafe') &&
                !extTitle.includes('bistro') &&
                !extTitle.includes('hotel') &&
                !extTitle.includes('bar')) {

                // If it's just a dish name, swap to RECIPE
                // This prevents "Lentil Soup" -> Establishment Details
                console.log(`[Classify] Swapping '${extType}' to 'RECIPE' for likely dish input.`);
                if (aiResponse.extraction) {
                    aiResponse.extraction.type = 'recipe';
                }
            }
        }

        // reliableGeminiCall automatically parses JSON result
        return NextResponse.json(aiResponse);

    } catch (error) {
        console.error("Classification API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
