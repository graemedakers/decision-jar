
const DEFAULT_MODELS = [
    "gemini-flash-latest", // CONFIRMED WORKING
    "gemini-1.5-flash",
    "gemini-2.0-flash-lite-preview-02-05",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.5-flash"
];

interface GenerateOptions {
    apiKey?: string;
    models?: string[];
    temperature?: number;
    jsonMode?: boolean; // New option
}

/**
 * reliableGeminiCall
 * 
 * Executes a prompt against a list of Gemini models, handling failover and 429/404 errors automatically.
 * Returns the parsed JSON response.
 */
export async function reliableGeminiCall<T>(prompt: string, options: GenerateOptions = {}): Promise<T> {
    const apiKey = options.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined");
    }

    const models = options.models || DEFAULT_MODELS;
    let lastError = null;

    for (const model of models) {
        try {
            // Google Search Tool is only supported on some models, but 1.5-flash and pro support it.
            // gemini-1.0-pro might not support it well with JSON mode, but we will try.

            const body: any = {
                contents: [{ parts: [{ text: prompt }] }]
            };

            // Google Search Tool is incompatible with JSON Mode (responseMimeType: "application/json")
            // So we only enable search if we are NOT in strict JSON mode.
            if (!options.jsonMode) {
                body.tools = [{ google_search: {} }];
            }

            // Enforce JSON mode if requested
            if (options.jsonMode) {
                body.generationConfig = { responseMimeType: "application/json" };
            }

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorText = await response.text();
                const status = response.status;
                throw new Error(`Model ${model} failed with status ${status}: ${errorText}`);
            }

            const data = await response.json();

            if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
                // Log the full data to see what went wrong (e.g. Safety filters)
                console.error(`Invalid structure from ${model}:`, JSON.stringify(data, null, 2));
                throw new Error(`Model ${model} returned invalid structure.`);
            }

            let text = data.candidates[0].content.parts[0].text;

            // Clean markdown blocks if present
            text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();

            // Attempt to parse
            try {
                return JSON.parse(text) as T;
            } catch (jsonErr) {
                console.error(`Failed to parse JSON from ${model}. Raw text:`, text);
                throw new Error(`Model ${model} returned invalid JSON: ${text.substring(0, 50)}...`);
            }

        } catch (error: any) {
            console.warn(`Gemini attempt failed for ${model}:`, error.message); // Log specifically why it failed
            lastError = error;
            // Continue to next model
        }
    }

    throw new Error(`All AI models failed. Last error: ${lastError?.message || lastError}`);
}
