import { BookTypeData, MovieTypeData } from '@/lib/types/idea-types';

/**
 * Detects if an idea should be a certain type based on its category
 */
export function suggestIdeaType(idea: any): string | null {
    if (!idea) return null;
    const category = idea.categoryId || idea.category;

    // Check keywords if category is ambiguous or mismatched
    const textToCheck = ((idea.description || "") + " " + (idea.details || "")).toLowerCase();

    // 0. High Priority: YouTube (Check title, details, AND website/link)
    const urlToCheck = (idea.website || idea.link || idea.url || "").toLowerCase();
    if (textToCheck.includes('youtube.com') || textToCheck.includes('youtu.be') ||
        urlToCheck.includes('youtube.com') || urlToCheck.includes('youtu.be')) {
        return 'youtube';
    }

    // 0.5 HIGH PRIORITY: Recipe Detection (before category check)
    // Check if typeData has recipe structure (ingredients/instructions)
    if (idea.typeData) {
        const hasIngredients = Array.isArray(idea.typeData.ingredients) && idea.typeData.ingredients.length > 0;
        const hasInstructions = typeof idea.typeData.instructions === 'string' && idea.typeData.instructions.length > 10;
        const hasPrepTime = typeof idea.typeData.prepTime === 'number';
        const hasCookTime = typeof idea.typeData.cookTime === 'number';
        const hasServings = typeof idea.typeData.servings === 'number';

        // If typeData has recipe-specific fields, it's definitely a recipe
        if (hasIngredients || (hasInstructions && (hasPrepTime || hasCookTime || hasServings))) {
            return 'recipe';
        }
    }

    // ---------------------------------------------------------
    // 1. EXPLICIT CATEGORY CHECKS (Strong Signals)
    // ---------------------------------------------------------

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

    // Wellness / Fitness / Sport -> Activity
    if (['MEDITATION', 'SPA', 'WALK', 'DETOX', 'CARDIO', 'STRENGTH', 'YOGA', 'OUTDOOR_SPORT', 'WELLNESS', 'FITNESS', 'RELAXATION', 'SPORT', 'GOLF', 'TENNIS', 'SQUASH', 'BADMINTON', 'RACQUETBALL', 'PILATES', 'SWIMMING', 'HIKE', 'HIKING', 'RUNNING'].includes(category) || category.includes('SPORT')) {
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

    // Simple / Text-Only
    if (['SIMPLE', 'QUOTE', 'JOKE', 'AFFIRMATION', 'NOTE'].includes(category) || textToCheck.match(/\b(quote|affirmation|joke|dad joke)\b/)) {
        return 'simple';
    }

    // YouTube (Category Check)
    if (['YOUTUBE', 'VIDEO', 'TUTORIAL'].includes(category)) {
        return 'youtube';
    }

    // ---------------------------------------------------------
    // 2. HEURISTICS & FALLBACKS (Weak Signals)
    // ---------------------------------------------------------

    // Fallback: Check if address is "At Home" (Indicator for recipe, but only if not caught above)
    const address = (idea.address || "").toLowerCase();
    if (address === 'at home' || address.includes('home')) {
        // Also check for recipe keywords in text
        if (textToCheck.includes('recipe') || textToCheck.includes('ingredient') ||
            textToCheck.includes('cook') || textToCheck.includes('prep') ||
            textToCheck.includes('serve') || textToCheck.includes('minute') ||
            /\d+\s*(g|kg|oz|cup|tbsp|tsp|ml|l)\b/.test(textToCheck)) { // Quantity patterns
            return 'recipe';
        }
    }

    // Check for explicit recipe patterns in text (even without category)
    // Only if we haven't matched a stronger category already
    const hasRecipePattern = /### ingredients|### instructions|step \d+:|prep time:|cook time:|serves \d+/i.test(idea.details || '');
    if (hasRecipePattern) {
        return 'recipe';
    }

    // Recipes vs Dining
    // IF category is explicitly MEAL, default to recipe unless it looks like a restaurant
    if (['MEAL', 'BAKING', 'MEAL_PREP'].includes(category)) {
        return 'recipe';
    }

    // Unified Food/Dining Logic: Handles everything from "Meal" to "Fine Dining"
    const foodCategories = [
        'BREAKFAST', 'LUNCH', 'DINNER', 'DESSERT', 'FOOD', 'DINING', 'RESTAURANT', 'MEAL',
        'FINE_DINING', 'CASUAL', 'BRUNCH', 'FAST_FOOD', 'INTERNATIONAL'
    ];

    if (foodCategories.includes(category)) {
        const textLow = textToCheck.toLowerCase();

        // Explicit Recipe Keywords
        if (textLow.includes('recipe') || textLow.includes('ingredients') || textLow.includes('cook') || textLow.includes('make this') || textLow.includes('serves') || textLow.includes('dish') || textLow.includes('flavor')) {
            return 'recipe';
        }

        // Explicit Dining Keywords
        const diningKeywords = ['restaurant', 'reservation', 'book a table', 'seating', 'takeout', 'venue', 'located', 'atmosphere', 'service', 'menu link'];
        if (diningKeywords.some(k => textLow.includes(k))) {
            return 'dining';
        }

        // Ambiguous Fallback: If it's physically located (has address != home), assume dining.
        // Otherwise, if it sounds like food, assume recipe.
        // Note: "At Home" check above might have already caught home recipes.
        const address = (idea.address || "").toLowerCase();
        if (address && address !== 'at home' && address.length > 5) {
            return 'dining';
        }

        // Default to RECIPE for all food categories if we aren't sure it's a place
        return 'recipe';
    }

    // Bars / Nightlife
    // FIX: Be strict about "CLUB". Golf Clubs are not Nightclubs.
    // We check for exact matches or safe suffix matches like " NIGHTCLUB"
    if (['COCKTAIL', 'PUB', 'WINE_BAR', 'ROOFTOP', 'SPEAKEASY', 'BAR', 'NIGHTLIFE', 'DANCE_CLUB', 'LOUNGE', 'RAVE', 'DISCO'].includes(category)) {
        return 'dining';
    }
    // Only map partial "CLUB" if it's explicitly "NIGHTCLUB" or "DANCE CLUB"
    if (category === 'CLUB' || category.includes('NIGHTCLUB') || category.includes('DANCE_CLUB')) {
        return 'dining';
    }

    return null;
}

/**
 * Returns a standardized data object if one can be inferred.
 * Favor AI-provided typeData above all else.
 */
export function getStandardizedData(idea: any): any {
    if (!idea) return null;
    // 1. Direct hit - AI already provided structured data
    if (idea.typeData && Object.keys(idea.typeData).length > 0) {
        // SPECIAL CASE: If it's a youtube type but missing videoId, allow recovery logic below
        if (!(idea.ideaType === 'youtube' && !idea.typeData.videoId)) {
            return {
                ...idea.typeData,
                _standardized: true
            };
        }
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
    // CRITICAL FIX: Respect the explicit ideaType if present!
    const suggestedType = (idea.ideaType && idea.ideaType !== 'standard') ? idea.ideaType.toLowerCase() : suggestIdeaType(idea);
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

    // Recovery for Movies
    if (suggestedType === 'movie') {
        return {
            title: idea.title || idea.name || idea.description,
            plot: idea.details || idea.description,
            _standardized: true
        };
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

    // Recovery for YouTube Links
    if ((suggestedType === 'youtube' || textToScan.includes('youtube.com') || textToScan.includes('youtu.be') || textToScan.includes('watch?v='))) {
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
        const match = textToScan.match(youtubeRegex) || (idea.website && idea.website.match(youtubeRegex));
        if (match && match[1]) {
            const videoId = match[1];
            return {
                videoId: videoId,
                title: idea.typeData?.title || (idea.description && idea.description !== 'Shared Link' && idea.description !== 'YouTube Video' ? idea.description : undefined),
                watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
                _standardized: true
            };
        }
    }

    return null;
}

