
import { reliableGeminiCall } from '../lib/gemini';
import { CONCIERGE_CONFIGS } from '../lib/concierge-configs';
import * as dotenv from 'dotenv';
dotenv.config();

// MOCK: Reconstruct the prompt generation from app/api/ai/classify/route.ts
async function testClassification(query: string) {
    console.log(`Testing query: "${query}"`);

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

        VALID TOPICS:
        ${validTopics}

        Determine the INTENT (if not caught by rules above):
        1. EXECUTE_ACTION: The user wants to add a SPECIFIC single item (Idea, URL, Image) to the jar *explicitly*.
           - Examples: "Add a movie called Inception", "Save this url https://...", "Add a date night idea to go bowling", "Remind me to buy milk".
        
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
             "type": string, // Best guess at topic key
             "url": string
          }
        }

        Return ONLY valid JSON.
    `;

    try {
        const aiResponse = await reliableGeminiCall(prompt, {
            temperature: 0.0,
            jsonMode: true
        });
        console.log("AI Response:", JSON.stringify(aiResponse, null, 2));
    } catch (e) {
        console.error("AI Call Failed:", e);
    }
}

// Run the test
testClassification("5 budget friendly meal recipes for my family");
