
import { type Idea } from "@prisma/client";

export const determineCost = (price: string | undefined): string => {
    if (!price) return '$';
    const p = price.toLowerCase().trim();
    if (p.includes('free') || p === '0' || p === '$0') return 'FREE';

    // Maintain existing logic for length-based matching (assuming $, $$, $$$ input)
    if (price.length > 2) return '$$$';
    if (price.length > 1) return '$$';
    return '$';
};

export const getIdeaTitle = (rec: any) => {
    return rec.name || rec.typeData?.title || rec.typeData?.eventName || rec.typeData?.establishmentName || rec.typeData?.activityName || rec.title || 'Untitled Idea';
};

export const formatDetails = (rec: any) => {
    if (rec.details) return rec.details;
    let parts = [];
    const desc = rec.description || (rec.typeData && 'vibe' in rec.typeData ? `${rec.typeData.vibe} Itinerary` : '');
    if (desc) parts.push(desc);
    if (rec.cinema_name) parts.push(`Cinema: ${rec.cinema_name}`);
    if (rec.showtimes) parts.push(`Showtimes: ${rec.showtimes}`);
    if (rec.address) parts.push(`Address: ${rec.address}`);
    if (rec.price) parts.push(`Price: ${rec.price}`);
    if (rec.website) parts.push(`${rec.showtimes ? 'Tickets' : 'Website'}: ${rec.website}`);
    if (rec.opening_hours) parts.push(`Hours: ${rec.opening_hours}`);
    if (rec.google_rating) parts.push(`Rating: ${rec.google_rating}`);
    return parts.filter(Boolean).join('\n\n');
};

// Validate and normalize recipe data before saving
export const normalizeRecipeData = (rec: any): any => {
    // Only apply to recipe types
    if (rec.ideaType !== 'recipe') {
        return rec;
    }

    const normalized = { ...rec };

    // Ensure typeData exists
    if (!normalized.typeData) {
        normalized.typeData = {};
    }

    // Force address to "At Home" for recipes
    if (!normalized.address || normalized.address.toLowerCase() !== 'at home') {
        normalized.address = 'At Home';
    }

    // Try to extract ingredients from details if missing
    if (!normalized.typeData.ingredients || !Array.isArray(normalized.typeData.ingredients) || normalized.typeData.ingredients.length === 0) {
        if (normalized.details && typeof normalized.details === 'string') {
            const ingredientMatch = normalized.details.match(/### Ingredients\n([\s\S]*?)(?=###|$)/i);
            if (ingredientMatch) {
                const ingredientLines = ingredientMatch[1].split('\n').filter((line: string) => line.trim().startsWith('-'));
                normalized.typeData.ingredients = ingredientLines.map((line: string) => line.replace(/^-\s*/, '').trim());
            }
        }
    }

    // Try to extract instructions from details if missing
    if (!normalized.typeData.instructions || typeof normalized.typeData.instructions !== 'string' || normalized.typeData.instructions.length === 0) {
        if (normalized.details && typeof normalized.details === 'string') {
            const instructionsMatch = normalized.details.match(/### Instructions\n([\s\S]*?)(?=###|$)/i);
            if (instructionsMatch) {
                normalized.typeData.instructions = instructionsMatch[1].trim();
            }
        }
    }

    // Ensure title is set
    if (!normalized.typeData.title) {
        normalized.typeData.title = getIdeaTitle(rec);
    }

    return normalized;
};
