import { BookTypeData, MovieTypeData } from '@/lib/types/idea-types';

/**
 * Detects if an idea should be a certain type based on its category
 */
export function suggestIdeaType(idea: any): string | null {
    const category = idea.categoryId || idea.category;

    // Check keywords if category is ambiguous or mismatched
    const textToCheck = ((idea.description || "") + " " + (idea.details || "")).toLowerCase();

    // Books
    if (['FICTION', 'NON_FICTION', 'SCI_FI', 'MYSTERY', 'ROMANCE', 'BIOGRAPHY', 'SELF_HELP'].includes(category)) {
        return 'book';
    }

    // Movies
    if (['CINEMA', 'STREAMING', 'SERIES', 'MOVIE'].includes(category)) {
        return 'movie';
    }

    // Music
    if (['CONCERT', 'ALBUM', 'PLAYLIST', 'LIVE_MUSIC', 'RAVE', 'MUSIC'].includes(category)) {
        return 'music';
    }

    // Games
    if (['GAME', 'GAMING', 'BOARD_GAME', 'VIDEO_GAME'].includes(category) || textToCheck.includes('play a game') || textToCheck.includes('video game')) {
        return 'game';
    }

    // Travel / Hotels
    if (['WEEKEND', 'ABROAD', 'STAYCATION', 'ROADTRIP', 'BOUTIQUE', 'RESORT', 'BUDGET', 'LUXURY', 'BNB', 'TRAVEL', 'HOTEL'].includes(category)) {
        return 'travel';
    }

    // Recipes vs Dining
    if (['BREAKFAST', 'LUNCH', 'DINNER', 'DESSERT', 'BAKING', 'CATERING', 'MEAL_PREP'].includes(category)) {
        if (textToCheck.includes('recipe') || textToCheck.includes('ingredients') || textToCheck.includes('cook')) {
            return 'recipe';
        }
    }

    if (['FINE_DINING', 'CASUAL', 'BRUNCH', 'FAST_FOOD', 'INTERNATIONAL', 'DINING', 'RESTAURANT', 'FOOD'].includes(category)) {
        return 'dining';
    }

    // Bars / Nightlife
    if (['COCKTAIL', 'PUB', 'WINE_BAR', 'ROOFTOP', 'SPEAKEASY', 'BAR', 'NIGHTLIFE', 'DANCE_CLUB', 'LOUNGE', 'CLUB'].includes(category)) {
        return 'dining';
    }

    // Wellness / Fitness -> Activity
    if (['MEDITATION', 'SPA', 'WALK', 'DETOX', 'CARDIO', 'STRENGTH', 'YOGA', 'OUTDOOR_SPORT', 'WELLNESS', 'FITNESS', 'RELAXATION'].includes(category)) {
        return 'activity';
    }

    // Escape Rooms
    if (['ESCAPE_ROOM', 'PUZZLE'].includes(category) || textToCheck.includes('escape room')) {
        return 'activity';
    }

    // Events
    if (['SOCIAL', 'EVENT', 'FESTIVAL', 'THEATRE', 'COMEDY', 'SHOW', 'PERFORMANCE', 'EXHIBITION', 'SPORTS', 'MATCH', 'GAME_WATCH'].includes(category) || textToCheck.includes('theatre') || textToCheck.includes('tickets')) {
        return 'event';
    }

    // Itineraries
    if (category === 'ITINERARY' || textToCheck.includes('itinerary') || textToCheck.includes('schedule') || textToCheck.includes('plan')) {
        return 'itinerary';
    }

    return null;
}

/**
 * Returns a standardized data object if one can be inferred.
 * Favor AI-provided typeData above all else.
 */
export function getStandardizedData(idea: any): any {
    // 1. Direct hit - AI already provided structured data
    if (idea.typeData && Object.keys(idea.typeData).length > 0) {
        return {
            ...idea.typeData,
            _standardized: true
        };
    }

    // 2. Recovery - Check for JSON blocks in text (AI sometimes leaks them)
    const textToScan = (idea.details || "") + "\n" + (idea.description || "");
    if (textToScan.includes('```json') || textToScan.includes('typeData')) {
        try {
            const jsonMatch = textToScan.match(/```json\s*([\s\S]*?)```/) || textToScan.match(/\{[\s\S]*"typeData"[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
                const foundData = parsed.typeData || (parsed.ingredients || parsed.instructions ? parsed : null);
                if (foundData) return { ...foundData, _standardized: true };
            }
        } catch (e) {
            console.error("Failed to parse leaked JSON", e);
        }
    }

    // 3. Inference - For legacy ideas without typeData
    const suggestedType = suggestIdeaType(idea);
    if (!suggestedType) return null;

    // Special handling for legacy recipes
    if (suggestedType === 'recipe') {
        const ingredients = Array.isArray(idea.ingredients) ? idea.ingredients : [];
        const instructions = idea.instructions || idea.details;

        if (ingredients.length > 0 || instructions) {
            return {
                title: idea.title || idea.name || "Recipe",
                ingredients,
                instructions,
                prepTime: parseInt(idea.prep_time || idea.prepTime) || undefined,
                servings: parseInt(idea.servings) || undefined,
                _standardized: true
            };
        }
    }

    // Recovery for Itineraries from Markdown
    if (suggestedType === 'itinerary' && idea.details) {
        const sections = idea.details.split(/^### /gm);
        if (sections.length > 1) {
            const steps: any[] = [];
            let currentDay = 1;

            sections.forEach((section: string, idx: number) => {
                if (!section.trim() || (idx === 0 && !idea.details.startsWith('### '))) return;

                const [titleLine, ...contentLines] = section.split('\n');
                const activity = titleLine.replace(/^[#*\s]+/, '').trim();
                const notes = contentLines.join('\n').trim();

                // Simple day detection if headline is "Day 1: ..."
                const dayMatch = activity.match(/Day\s*(\d+)/i);
                if (dayMatch) {
                    currentDay = parseInt(dayMatch[1]);
                }

                steps.push({
                    order: steps.length + 1,
                    day: currentDay,
                    activity,
                    notes: notes || undefined
                });
            });

            if (steps.length > 0) {
                return {
                    title: idea.description || "Itinerary",
                    steps,
                    _standardized: true
                };
            }
        }
    }

    // Recovery for Venue Details (Dining, Activity, Nightlife)
    if (['dining', 'activity', 'travel', 'event'].includes(suggestedType) && idea.details) {
        const addressMatch = idea.details.match(/(?:\*\*Address:\*\*|Address:)\s*([^\n]+)/i);
        const ratingMatch = idea.details.match(/(?:\*\*Rating:\*\*|Rating:)\s*([^\n]+)/i);
        const hoursMatch = idea.details.match(/(?:\*\*Hours:\*\*|Hours:)\s*([^\n]+)/i);
        const websiteMatch = idea.details.match(/(?:\*\*Website:\*\*|Website:)\s*([^\n]+)/i);
        const menuMatch = idea.details.match(/(?:\*\*Menu:\*\*|Menu Link:|Menu:)\s*([^\n]+)/i);

        const address = addressMatch?.[1]?.trim();
        const rating = ratingMatch?.[1]?.trim();
        const hours = hoursMatch?.[1]?.trim();
        const website = websiteMatch?.[1]?.trim();
        const menu_url = menuMatch?.[1]?.trim();

        if (address || rating || hours || website || menu_url) {
            const data: any = {
                _standardized: true,
                rating: rating ? parseFloat(rating) : undefined,
                hours,
                website,
                menu_url
            };

            // Nest address for Activity/Dining compatibility
            if (address) {
                data.address = address; // Keep at root too for fallback
                data.location = {
                    address: address,
                    name: idea.description || idea.title
                };
            }

            if (suggestedType === 'dining') {
                data.establishmentName = idea.description || idea.title;
            }

            return data;
        }
    }

    return null;
}

