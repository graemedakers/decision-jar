
const https = require('https');
const fs = require('fs');
const path = require('path');

// 1. Load API Key
let apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);
        if (match) apiKey = match[1].trim();
    } catch (e) {
        console.error("Could not load .env file");
    }
}

if (!apiKey) {
    console.error("No API KEY found");
    process.exit(1);
}

// 2. Mock Configs (extracted from lib/concierge-configs.ts)
const MOCK_CONFIGS = {
    DINING: { title: 'Dining Concierge', subtitle: 'Find the perfect spot for dinner' },
    CONCIERGE: { title: 'AI Concierge', subtitle: 'Ask for anything, get personalized ideas' },
    BAR: { title: 'Bar Scout', subtitle: 'Find the perfect spot for a drink' },
    BAR_CRAWL: { title: 'Bar Crawl Planner', subtitle: 'Plan a route of best bars' },
    NIGHTCLUB: { title: 'Nightlife Navigator', subtitle: 'Find the best clubs and parties' },
    HOTEL: { title: 'Staycation Finder', subtitle: 'Find the perfect hotel for a getaway' },
    MOVIE: { title: 'Movie Picker', subtitle: 'Find the perfect movie to watch' },
    BOOK: { title: 'Book Finder', subtitle: 'Discover your next favorite read' },
    WELLNESS: { title: 'Wellness & Spa', subtitle: 'Relax and recharge' },
    FITNESS: { title: 'Fitness Finder', subtitle: 'Find a workout or activity' },
    THEATRE: { title: 'Theatre & Arts', subtitle: 'Discover shows and exhibitions' },
    GAME: { title: 'Game Guru', subtitle: 'Find the perfect video game' },
    ESCAPE_ROOM: { title: 'Escape Room Scout', subtitle: 'Unlock the best puzzles nearby' },
    SPORTS: { title: 'Sports Finder', subtitle: 'Find a game or match to watch/play' },
    CHEF: { title: 'Dinner Party Chef', subtitle: 'Plan a perfect menu for any occasion' },
    RECIPE: { title: 'Recipe Finder', subtitle: 'Find delicious recipes to cook at home' },
    DATE_NIGHT: { title: 'Date Night Planner', subtitle: 'Plan a complete evening out' },
    WEEKEND_EVENTS: { title: 'Weekend Planner', subtitle: 'Find events and activities for this weekend' },
    HOLIDAY: { title: 'Holiday Planner', subtitle: 'Create a perfect travel itinerary' },
    YOUTUBE: { title: 'YouTube Scout', subtitle: 'Find the perfect videos to watch' }
};

const validTopics = Object.entries(MOCK_CONFIGS)
    .map(([key, config]) => `- ${key}: ${config.subtitle || config.title}`)
    .join('\n');

const query = "5 budget friendly meal recipes for my family";
console.log(`Testing query: "${query}"`);

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

const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.0
    }
});

const req = https.request(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length
    }
}, (res) => {
    let data = '';
    res.on('data', (d) => data += d);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.candidates && parsed.candidates[0].content && parsed.candidates[0].content.parts) {
                const text = parsed.candidates[0].content.parts[0].text;
                console.log("AI Output:", text);
            } else {
                console.log("Raw Response:", data);
            }
        } catch (e) {
            console.error("Failed to parse response", e);
            console.log(data);
        }
    });
});

req.on('error', (e) => console.error(e));
req.write(body);
req.end();
