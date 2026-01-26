
const DEFAULT_MODELS = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite-preview-02-05",
    "gemini-2.5-flash"
];

interface GenerateOptions {
    apiKey?: string;
    models?: string[];
    temperature?: number;
    jsonMode?: boolean;
    useSearch?: boolean; // NEW: Explicitly allow search grounding
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

            // 🛑 CRITICAL FIX: Google Search Tools are INCOMPATIBLE with strict responseMimeType: "application/json"
            // We MUST disable strict JSON mode if search is active, and rely on our regex cleaning.
            const actuallyUseSearch = options.useSearch || !options.jsonMode;

            if (actuallyUseSearch) {
                body.tools = [{
                    googleSearch: {}
                }];
            }

            // Enforce JSON mode ONLY if search is NOT used
            if (options.jsonMode && !actuallyUseSearch) {
                body.generationConfig = {
                    responseMimeType: "application/json",
                    temperature: options.temperature ?? 0.1
                };
            } else if (options.jsonMode) {
                // If search is used, we still want a low temperature to encourage JSON output
                body.generationConfig = {
                    temperature: options.temperature ?? 0.1
                };
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

            // 🔍 TRANSPARENT LOGGING: Help the user see exactly what came back
            console.log(`[Gemini Response: ${model}]`, JSON.stringify({
                finishReason: data.candidates?.[0]?.finishReason,
                groundingCount: data.candidates?.[0]?.groundingMetadata?.groundingChunks?.length || 0,
                textLength: (data.candidates?.[0]?.content?.parts || [])
                    .map((p: any) => p.text?.length || 0)
                    .reduce((a: number, b: number) => a + b, 0)
            }, null, 2));

            if (!data.candidates || !data.candidates[0]?.content?.parts) {
                if (data.candidates?.[0]?.finishReason === "SAFETY") {
                    throw new Error(`Model ${model} blocked by safety filters.`);
                }
                console.error(`Invalid structure from ${model}:`, JSON.stringify(data, null, 2));
                throw new Error(`Model ${model} returned invalid structure.`);
            }

            // JOIN ALL TEXT PARTS (some models return text split across parts)
            const allText = data.candidates[0].content.parts
                .map((p: any) => p.text || "")
                .join("\n");

            // EXTRACT GROUNDING LINKS
            const groundingLinks: string[] = [];
            const groundingData = data.candidates[0].groundingMetadata;
            if (groundingData?.groundingChunks) {
                groundingData.groundingChunks.forEach((chunk: any) => {
                    if (chunk.web?.uri) groundingLinks.push(chunk.web.uri);
                });
            }

            // SCAN ALL TEXT FOR YOUTUBE LINKS
            const youtubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:[^\/\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S+\?v=)|youtu\.be\/)\S+)/gi;
            const foundLinks = allText.match(youtubeRegex) || [];

            // Deduplicated list of all potential links
            const allResolvedLinks = Array.from(new Set([...foundLinks, ...groundingLinks]));

            // 🔍 HYPER-ROBUST JSON EXTRACTION
            const extractJson = (text: string) => {
                const stack: string[] = [];
                let firstIdx = -1;
                let longestBlock = "";

                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    if (char === '{' || char === '[') {
                        if (stack.length === 0) firstIdx = i;
                        stack.push(char === '{' ? '}' : ']');
                    } else if (char === '}' || char === ']') {
                        if (stack.length > 0 && char === stack[stack.length - 1]) {
                            stack.pop();
                            if (stack.length === 0) {
                                const currentBlock = text.substring(firstIdx, i + 1);
                                if (currentBlock.length > longestBlock.length) longestBlock = currentBlock;
                            }
                        }
                    }
                }
                return longestBlock || null;
            };

            let jsonBlock = extractJson(allText);

            if (!jsonBlock) {
                const cbMatch = allText.match(/```(?:json)?\s*([\s\S]*?)```/);
                if (cbMatch) jsonBlock = cbMatch[1].trim();
            }

            if (!jsonBlock) {
                console.error(`[Gemini Error] No JSON block in ${model}. Text: ${allText.substring(0, 200)}...`);
                throw new Error(`Model ${model} did not return a valid JSON block.`);
            }

            // Attempt to parse
            try {
                let parsed: any;
                try {
                    parsed = JSON.parse(jsonBlock);
                } catch (e) {
                    const cleaned = jsonBlock.replace(/,\s*([\]\}])/g, '$1');
                    try {
                        parsed = JSON.parse(cleaned);
                    } catch {
                        const match = jsonBlock.match(/([\[\{][\s\S]*[\]\}])/);
                        if (match) parsed = JSON.parse(match[0]);
                        else throw e;
                    }
                }

                // ENRICHMENT: Associate grounding citations with recommendations semantically
                // Handle both object with 'recommendations' or top-level array
                const recs = Array.isArray(parsed) ? parsed : (parsed.recommendations && Array.isArray(parsed.recommendations) ? parsed.recommendations : null);

                if (recs) {
                    // Extract all grounded sources with their titles for semantic matching
                    const groundedSources: { uri: string; title: string }[] = [];
                    if (data.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                        data.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
                            if (chunk.web?.uri && chunk.web?.title) {
                                groundedSources.push({ uri: chunk.web.uri, title: chunk.web.title });
                            }
                        });
                    }

                    recs.forEach((rec: any) => {
                        const recName = (rec.name || rec.title || "").toLowerCase();
                        if (!recName) return;

                        // Try to find a match among grounded sources by title overlap
                        let matchedUri = "";

                        // 1. Check grounded sources for title match
                        const sourceMatch = groundedSources.find(source => {
                            const sourceTitle = source.title.toLowerCase();
                            return sourceTitle.includes(recName) || recName.includes(sourceTitle);
                        });

                        if (matchedUri) {
                            // Apply matched link to website if missing or if it's a higher quality grounded link
                            if (!rec.website || !rec.website.includes('google.com/search')) {
                                rec.website = matchedUri;
                            }

                            if (matchedUri.includes('youtube')) {
                                if (!rec.typeData) rec.typeData = {};
                                rec.typeData.watchUrl = matchedUri;
                                // Force extraction of videoId
                                const idMatch = matchedUri.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:&|\?|$)/);
                                if (idMatch) rec.typeData.videoId = idMatch[1];
                                rec.ideaType = 'youtube'; // Explicitly set type if it's a video
                            }
                        }

                        // Robustness: If they have a website but it's a YouTube link, ensure typeData is populated
                        if (rec.website && (rec.website.includes('youtube.com') || rec.website.includes('youtu.be')) && (!rec.typeData?.videoId || !rec.typeData?.watchUrl)) {
                            if (!rec.typeData) rec.typeData = {};
                            rec.typeData.watchUrl = rec.website;
                            const idMatch = rec.website.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:&|\?|$)/);
                            if (idMatch) rec.typeData.videoId = idMatch[1];
                            rec.ideaType = 'youtube';
                        }
                    });
                }

                return parsed as T;
            } catch (jsonErr) {
                console.error(`Failed to parse JSON from ${model}. Extracted block:`, jsonBlock);
                throw new Error(`Model ${model} returned invalid JSON: ${jsonBlock.substring(0, 50)}...`);
            }

        } catch (error: any) {
            console.warn(`Gemini attempt failed for ${model}:`, error.message); // Log specifically why it failed
            lastError = error;
            // Continue to next model
        }
    }

    throw new Error(`All AI models failed. Last error: ${lastError?.message || lastError}`);
}
