import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONCIERGE_CONFIGS } from '@/lib/concierge-configs';
import { getConciergePromptAndMock } from '@/lib/concierge-prompts';
import { reliableGeminiCall } from '@/lib/gemini';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface Venue {
    name: string;
    description: string;
    address?: string;
    website?: string;
    rating?: number;
    photos?: string[];
    placeId?: string;
    priceLevel?: string; // $, $$, etc
    hours?: string;
    type?: string;
    category?: string;
}

export async function lookupVenuesViaConcierge(params: {
    toolType: string;
    location: string;
    userRequest: string;
    count: number;
}): Promise<Venue[]> {
    const { toolType, location, userRequest, count } = params;

    // 1. Get Tool Config
    const config = CONCIERGE_CONFIGS[toolType as keyof typeof CONCIERGE_CONFIGS];
    if (!config) {
        throw new Error(`Invalid venue tool type: ${toolType}`);
    }

    // 2. Get Prompt
    // We pass empty inputs as we are relying on natural language request in extraInstructions
    const { prompt: systemPrompt } = getConciergePromptAndMock(
        toolType,
        {}, // inputs
        location,
        userRequest // extraInstructions
    );

    // 3. Call AI
    const finalPrompt = `${systemPrompt}\n\nUSER REQUEST: ${userRequest} (Please find exactly ${count} options)`;

    try {
        const result = await reliableGeminiCall<{ recommendations: any[] }>(
            finalPrompt,
            {
                models: ['gemini-2.0-flash-exp', 'gemini-1.5-flash'],
                jsonMode: true
            }
        );

        let venues: any[] = [];

        // Normalize result
        if (result && Array.isArray(result.recommendations)) {
            venues = result.recommendations;
        } else if (Array.isArray(result)) {
            venues = result;
        } else {
            // Fallback: try to find any array property
            if (typeof result === 'object' && result !== null) {
                const arrays = Object.values(result).filter(Array.isArray);
                if (arrays.length > 0) venues = arrays[0];
            }
        }

        // Limit to requested count
        return venues.slice(0, count).map(v => ({
            name: v.name || v.title || "Unknown Venue",
            description: v.description || v.reason || "A great spot.",
            address: v.address || v.location,
            website: v.website || v.url,
            rating: v.rating || v.google_rating,
            photos: v.photos || [],
            priceLevel: v.price || v.cost,
            hours: v.hours || v.opening_hours,
            type: v.type || v.cuisine || v.music || v.theme_type,
            category: config.categoryType || 'ACTIVITY'
        }));

    } catch (error) {
        console.error("Venue Lookup Error:", error);
        return [];
    }
}
