import { Activity, Utensils, Calendar, Coffee, Popcorn, ShoppingBag, Briefcase, Home, Loader, Beer, Clapperboard, PartyPopper, CheckSquare, Sparkles, Book, Plane, Car, Map as MapIcon, Music, Headphones, Dumbbell, Gamepad2, Dices, Brain, Leaf, Ticket, Footprints, Moon, Trophy, Users, User, Heart, Wine, Disc, Speaker, Martini, ChefHat, Pizza, Star, Zap, Bed, Bug, Code, PenTool, Search, FileText } from "lucide-react";

export interface CategoryDef {
    id: string;
    label: string;
    icon: any;
    placeholder?: string;
}





export const TOPIC_CATEGORIES: Record<string, CategoryDef[]> = {
    "Activities": [
        { id: "OUTDOOR", label: "Adventure", icon: Activity, placeholder: "e.g. Hiking at Bear Mountain" },
        { id: "INDOOR", label: "Chill/Home", icon: Home, placeholder: "e.g. Board game night" },
        { id: "SOCIAL", label: "Event", icon: PartyPopper, placeholder: "e.g. Local food festival" },
        { id: "CULTURAL", label: "Museum/Art", icon: Ticket, placeholder: "e.g. Visit the Modern Art gallery" },
        { id: "DINING", label: "Dining", icon: Utensils, placeholder: "e.g. That new Ramen spot" },
        { id: "BAR", label: "Drinks", icon: Martini, placeholder: "e.g. Cocktails at The Speakeasy" },
        { id: "MOVIE", label: "Movie", icon: Popcorn, placeholder: "e.g. Watch 'Interstellar' again" },
        { id: "WELLNESS", label: "Wellness", icon: Sparkles, placeholder: "e.g. Couple's Spa Day" },
        { id: "FITNESS", label: "Fitness", icon: Dumbbell, placeholder: "e.g. Morning Yoga Session" },
        { id: "GAME", label: "Gaming", icon: Gamepad2, placeholder: "e.g. Mario Kart Tournament" },
    ],
    "Romantic": [
        { id: "ACTIVITY", label: "Activity", icon: Activity, placeholder: "e.g. Sunset walk on the beach" },
        { id: "DINING", label: "Dining", icon: Utensils, placeholder: "e.g. Candlelit dinner" },
        { id: "NIGHTLIFE", label: "Nightlife", icon: Martini, placeholder: "e.g. Jazz bar date" },
        { id: "STAYCATION", label: "Staycation", icon: Bed, placeholder: "e.g. Luxury hotel weekend" },
        { id: "CULTURAL", label: "Art & Culture", icon: Ticket, placeholder: "e.g. See a Broadway show" },
    ],
    "Restaurants": [
        { id: "FINE_DINING", label: "Fine Dining", icon: ChefHat, placeholder: "e.g. Le Bernardin" },
        { id: "CASUAL", label: "Casual", icon: Utensils, placeholder: "e.g. Joe's Pizza" },
        { id: "BRUNCH", label: "Brunch", icon: Coffee, placeholder: "e.g. Morning Pancakes at the Diner" },
        { id: "FAST_FOOD", label: "Quick Bite", icon: Pizza, placeholder: "e.g. Grab some tacos" },
        { id: "INTERNATIONAL", label: "Exotic", icon: MapIcon, placeholder: "e.g. Thai street food" },
    ],
    "Bars": [
        { id: "COCKTAIL", label: "Cocktail Bar", icon: Martini, placeholder: "e.g. The Attaboy" },
        { id: "PUB", label: "Pub/Dive", icon: Beer, placeholder: "e.g. The Drunken Duck" },
        { id: "WINE_BAR", label: "Wine Bar", icon: Wine, placeholder: "e.g. Terroir Wine" },
        { id: "ROOFTOP", label: "Rooftop", icon: Star, placeholder: "e.g. 230 Fifth Rooftop Bar" },
        { id: "SPEAKEASY", label: "Speakeasy", icon: Moon, placeholder: "e.g. Please Don't Tell" },
    ],
    "Nightclubs": [
        { id: "DANCE_CLUB", label: "Dance Club", icon: Disc, placeholder: "e.g. Club Space" },
        { id: "LOUNGE", label: "Lounge", icon: Utensils, placeholder: "e.g. Blue Note Lounge" },
        { id: "LIVE_MUSIC", label: "Live Venue", icon: Speaker, placeholder: "e.g. Red Rocks Amphitheatre" },
        { id: "RAVE", label: "Rave/Techno", icon: Zap, placeholder: "e.g. Berghain" },
    ],
    "Movies": [
        { id: "CINEMA", label: "Cinema", icon: Popcorn, placeholder: "e.g. IMAX Experience" },
        { id: "STREAMING", label: "Streaming", icon: Clapperboard, placeholder: "e.g. Netflix & Chill" },
        { id: "SERIES", label: "TV Series", icon: Activity, placeholder: "e.g. Binge 'Succession'" },
    ],
    "Wellness": [
        { id: "MEDITATION", label: "Meditation", icon: Moon, placeholder: "e.g. Guided group session" },
        { id: "SPA", label: "Spa/Bath", icon: Sparkles, placeholder: "e.g. Turkish Baths" },
        { id: "WALK", label: "Walk", icon: Footprints, placeholder: "e.g. Nature trail walk" },
        { id: "DETOX", label: "Digital Detox", icon: Leaf, placeholder: "e.g. No-phone Sunday" },
    ],
    "Fitness": [
        { id: "CARDIO", label: "Cardio", icon: Activity, placeholder: "e.g. Peloton Ride" },
        { id: "STRENGTH", label: "Strength", icon: Dumbbell, placeholder: "e.g. Push Pull Legs day" },
        { id: "YOGA", label: "Yoga", icon: Leaf, placeholder: "e.g. Hot Yoga Class" },
        { id: "OUTDOOR_SPORT", label: "Sport", icon: Trophy, placeholder: "e.g. Afternoon Tennis" },
    ],
    "Travel": [
        { id: "WEEKEND", label: "Weekend Trip", icon: Car, placeholder: "e.g. Visit the Catskills" },
        { id: "ABROAD", label: "International", icon: Plane, placeholder: "e.g. Flight to Tokyo" },
        { id: "STAYCATION", label: "Staycation", icon: Home, placeholder: "e.g. Local Airbnb" },
        { id: "ROADTRIP", label: "Road Trip", icon: MapIcon, placeholder: "e.g. Pacific Coast Highway" },
    ],
    "Hotel Stays": [
        { id: "BOUTIQUE", label: "Boutique", icon: Bed, placeholder: "e.g. The Standard Hotel" },
        { id: "RESORT", label: "Resort", icon: Sparkles, placeholder: "e.g. Amanoi Resort" },
        { id: "BUDGET", label: "Budget", icon: Home, placeholder: "e.g. Cozy Local Inn" },
        { id: "LUXURY", label: "Luxury", icon: Star, placeholder: "e.g. The Four Seasons" },
        { id: "BNB", label: "B&B", icon: Coffee, placeholder: "e.g. Charming country B&B" },
    ],
    "Custom": [
        { id: "OPTION_A", label: "Option 1", icon: Activity, placeholder: "e.g. Task one" },
        { id: "OPTION_B", label: "Option 2", icon: Activity, placeholder: "e.g. Task two" },
        { id: "OPTION_C", label: "Option 3", icon: Activity, placeholder: "e.g. Task three" },
    ],
    "System Development": [
        { id: "FEATURE", label: "Feature Request", icon: Code, placeholder: "e.g. Add Dark Mode" },
        { id: "BUG", label: "Bug Report", icon: Bug, placeholder: "e.g. Login broken on Safari" },
        { id: "REVIEW", label: "Code Review", icon: Search, placeholder: "e.g. Review PR #123" },
        { id: "DOCS", label: "Documentation", icon: FileText, placeholder: "e.g. Update API docs" },
        { id: "DESIGN", label: "Design", icon: PenTool, placeholder: "e.g. Redesign Settings Page" },
    ],
    "Cooking & Recipes": [
        { id: "BREAKFAST", label: "Breakfast", icon: Coffee, placeholder: "e.g. Fluffy Pancakes" },
        { id: "LUNCH", label: "Lunch", icon: Pizza, placeholder: "e.g. Quinoa Salad" },
        { id: "DINNER", label: "Dinner", icon: ChefHat, placeholder: "e.g. Beef Wellington" },
        { id: "DESSERT", label: "Dessert", icon: Sparkles, placeholder: "e.g. Chocolate Soufflé" },
        { id: "BAKING", label: "Baking", icon: ChefHat, placeholder: "e.g. Sourdough Bread" },
        { id: "CATERING", label: "Dinner Party", icon: Users, placeholder: "e.g. 3-Course Mediterranean Plan" },
        { id: "MEAL_PREP", label: "Meal Prep", icon: Calendar, placeholder: "e.g. Weekly Chicken Bowls" },
    ],
    "Books": [
        { id: "FICTION", label: "Fiction", icon: Book, placeholder: "e.g. The Great Gatsby" },
        { id: "NON_FICTION", label: "Non-Fiction", icon: CheckSquare, placeholder: "e.g. Sapiens" },
        { id: "SCI_FI", label: "Sci-Fi/Fantasy", icon: Sparkles, placeholder: "e.g. Dune" },
        { id: "MYSTERY", label: "Mystery/Thriller", icon: Search, placeholder: "e.g. Gone Girl" },
        { id: "ROMANCE", label: "Romance", icon: Heart, placeholder: "e.g. Pride and Prejudice" },
        { id: "BIOGRAPHY", label: "Bio/Memoir", icon: User, placeholder: "e.g. Becoming" },
        { id: "SELF_HELP", label: "Self-Help", icon: Brain, placeholder: "e.g. Atomic Habits" },
    ]
};

export interface TopicTheme {
    primary: string; // Tailwind color class for text/bg e.g. "red-500"
    secondary: string;
    gradientFrom: string;
    gradientTo: string;
    bgBlob1: string; // e.g. "bg-red-500/10"
    bgBlob2: string;
}

export const TOPIC_THEMES: Record<string, TopicTheme> = {
    "Activities": {
        primary: "green-500",
        secondary: "emerald-700",
        gradientFrom: "from-green-400",
        gradientTo: "to-emerald-600",
        bgBlob1: "bg-green-500/10",
        bgBlob2: "bg-emerald-600/10"
    },
    "Romantic": {
        primary: "pink-500",
        secondary: "rose-600",
        gradientFrom: "from-pink-400",
        gradientTo: "to-rose-600",
        bgBlob1: "bg-pink-500/10",
        bgBlob2: "bg-rose-600/10"
    },
    "Restaurants": {
        primary: "orange-500",
        secondary: "red-500",
        gradientFrom: "from-orange-400",
        gradientTo: "to-red-500",
        bgBlob1: "bg-orange-500/10",
        bgBlob2: "bg-red-500/10"
    },
    "Bars": {
        primary: "purple-500",
        secondary: "indigo-600",
        gradientFrom: "from-purple-400",
        gradientTo: "to-indigo-600",
        bgBlob1: "bg-purple-500/10",
        bgBlob2: "bg-indigo-600/10"
    },
    "Nightclubs": {
        primary: "fuchsia-500",
        secondary: "pink-600",
        gradientFrom: "from-fuchsia-400",
        gradientTo: "to-pink-600",
        bgBlob1: "bg-fuchsia-500/10",
        bgBlob2: "bg-pink-600/10"
    },
    "Movies": {
        primary: "red-600",
        secondary: "rose-900",
        gradientFrom: "from-red-600",
        gradientTo: "to-rose-800",
        bgBlob1: "bg-red-600/10",
        bgBlob2: "bg-rose-900/10"
    },
    "Wellness": {
        primary: "teal-500",
        secondary: "green-400",
        gradientFrom: "from-teal-400",
        gradientTo: "to-green-400",
        bgBlob1: "bg-teal-500/10",
        bgBlob2: "bg-green-400/10"
    },
    "Fitness": {
        primary: "orange-600",
        secondary: "red-600",
        gradientFrom: "from-orange-500",
        gradientTo: "to-red-600",
        bgBlob1: "bg-orange-500/10",
        bgBlob2: "bg-red-600/10"
    },
    "Travel": {
        primary: "sky-500",
        secondary: "cyan-600",
        gradientFrom: "from-sky-400",
        gradientTo: "to-cyan-600",
        bgBlob1: "bg-sky-500/10",
        bgBlob2: "bg-cyan-600/10"
    },
    "Hotel Stays": {
        primary: "cyan-500",
        secondary: "blue-600",
        gradientFrom: "from-cyan-400",
        gradientTo: "to-blue-600",
        bgBlob1: "bg-cyan-500/10",
        bgBlob2: "bg-blue-600/10"
    },
    "Custom": {
        primary: "violet-500",
        secondary: "fuchsia-500",
        gradientFrom: "from-violet-400",
        gradientTo: "to-fuchsia-500",
        bgBlob1: "bg-violet-500/10",
        bgBlob2: "bg-fuchsia-500/10"
    },
    "System Development": {
        primary: "slate-600",
        secondary: "slate-800",
        gradientFrom: "from-slate-500",
        gradientTo: "to-slate-800",
        bgBlob1: "bg-slate-500/10",
        bgBlob2: "bg-slate-800/10"
    },
    "Cooking & Recipes": {
        primary: "amber-500",
        secondary: "orange-600",
        gradientFrom: "from-amber-400",
        gradientTo: "to-orange-500",
        bgBlob1: "bg-amber-500/10",
        bgBlob2: "bg-orange-600/10"
    },
    "Books": {
        primary: "indigo-500",
        secondary: "blue-600",
        gradientFrom: "from-indigo-400",
        gradientTo: "to-blue-600",
        bgBlob1: "bg-indigo-500/10",
        bgBlob2: "bg-blue-600/10"
    }
};

// Helper to map icon name to component
const getIconComponent = (iconName: string) => {
    // Basic mapping for common icons, fallback to Sparkles
    const map: any = { Activity, Utensils, Calendar, Coffee, Popcorn, ShoppingBag, Briefcase, Home, Loader, Beer, Clapperboard, PartyPopper, CheckSquare, Sparkles, Book, Plane, Car, Map: MapIcon, Music, Headphones, Dumbbell, Gamepad2, Dices, Brain, Leaf, Ticket, Footprints, Moon, Trophy, Users, Wine, Disc, Speaker, Martini, ChefHat, Pizza, Code, Bug, Search, FileText, PenTool };
    return map[iconName] || Sparkles;
};

export const getCategoriesForTopic = (topic: string | null | undefined, customCategories?: any[]): CategoryDef[] => {
    if (customCategories && Array.isArray(customCategories) && customCategories.length > 0) {
        return customCategories.map(c => ({
            id: c.id,
            label: c.label,
            icon: getIconComponent(c.icon || 'Sparkles')
        }));
    }

    if (!topic || topic.toLowerCase() === 'general') return TOPIC_CATEGORIES["Activities"];

    // Case-insensitive match 
    const foundKey = Object.keys(TOPIC_CATEGORIES).find(
        key => key.toLowerCase() === topic.toLowerCase()
    );

    return foundKey ? TOPIC_CATEGORIES[foundKey] : TOPIC_CATEGORIES["Activities"];
};

export const getAllCategories = (): CategoryDef[] => {
    const all = new Map<string, CategoryDef>();
    Object.values(TOPIC_CATEGORIES).forEach(list => {
        list.forEach(cat => {
            if (!all.has(cat.id)) all.set(cat.id, cat);
        });
    });
    return Array.from(all.values());
};

export const VALID_AI_CATEGORY_IDS = getAllCategories().map(c => c.id);

export const getCategoryDef = (id: string, customCategories?: any[]): CategoryDef => {
    // 1. Check custom categories first
    if (customCategories) {
        const custom = customCategories.find(c => c.id === id);
        if (custom) return {
            id: custom.id,
            label: custom.label,
            icon: getIconComponent(custom.icon)
        };
    }

    // 2. Check built-ins
    for (const topic of Object.keys(TOPIC_CATEGORIES)) {
        const found = TOPIC_CATEGORIES[topic].find(c => c.id === id);
        if (found) return found;
    }

    // 3. Last fallback
    return { id, label: id, icon: Sparkles };
};


export const isValidCategoryForTopic = (category: string, topic: string | null | undefined, customCategories?: any[]): boolean => {
    const validCategories = getCategoriesForTopic(topic, customCategories);
    return validCategories.some(c => c.id === category);
};

export const getThemeForTopic = (topic: string | null | undefined): TopicTheme => {
    if (!topic || topic.toLowerCase() === 'general') return TOPIC_THEMES["Activities"];

    const foundKey = Object.keys(TOPIC_THEMES).find(
        key => key.toLowerCase() === topic.toLowerCase()
    );

    return foundKey ? TOPIC_THEMES[foundKey] : TOPIC_THEMES["Activities"];
};

export const getBestCategoryFit = (requestedId: string, topic: string | null | undefined, customCategories?: any[]): string => {
    const valid = getCategoriesForTopic(topic, customCategories);
    const normalizedReq = requestedId.toUpperCase().replace(/[\s-]/g, '_');

    // 1. Perfect match (id check)
    if (valid.some(v => v.id === normalizedReq)) return normalizedReq;
    // Check if any valid ID is "contained" in the requested string (e.g. "FINE_DINING_PLACE" -> "FINE_DINING")
    // or if requested string matches label
    const labelMatch = valid.find(v => v.label.toUpperCase().replace(/[\s-]/g, '_') === normalizedReq);
    if (labelMatch) return labelMatch.id;

    // 2. Common mappings
    const mappings: Record<string, string[]> = {
        'BAR': ['NIGHTLIFE', 'SOCIAL', 'COCKTAIL', 'PUB', 'DRINKS', 'OUTING'],
        'NIGHTCLUB': ['BAR', 'NIGHTLIFE', 'SOCIAL', 'PARTY'],
        'DINING': ['MEAL', 'RESTAURANT', 'SOCIAL', 'FOOD'],
        'MEAL': ['DINING', 'RESTAURANT', 'SOCIAL', 'FOOD'],
        'MOVIE': ['CINEMA', 'ENTERTAINMENT', 'SOCIAL', 'WATCH'],
        'WELLNESS': ['SPA', 'SELF_CARE', 'RELAX', 'HEALTH'],
        'FITNESS': ['GYM', 'EXERCISE', 'OUTDOOR', 'HEALTH'],
        'GAME': ['GAMING', 'ENTERTAINMENT', 'INDOOR'],
        'ACTIVITY': ['OUTDOOR', 'INDOOR', 'SOCIAL', 'EVENT'],
        'CATERING': ['DINNER', 'MEAL', 'SOCIAL', 'FOOD', 'DINING'],
        'MEAL_PREP': ['MEAL', 'DINNER', 'LUNCH', 'FOOD'],
        // AI Common Deviations
        'FOOD': ['DINING', 'MEAL', 'RESTAURANT', 'SOCIAL'],
        'RESTAURANT': ['DINING', 'MEAL', 'FOOD', 'SOCIAL'],
        'DRINKS': ['BAR', 'NIGHTLIFE', 'SOCIAL', 'COCKTAIL'],
        'WALK': ['ACTIVITY', 'OUTDOOR', 'WELLNESS', 'FITNESS'],
        'HIKE': ['ACTIVITY', 'OUTDOOR', 'FITNESS', 'WELLNESS'],
        'SHOW': ['MOVIE', 'CULTURAL', 'ENTERTAINMENT', 'SOCIAL'],
        'THEATRE': ['CULTURAL', 'ENTERTAINMENT', 'SOCIAL', 'ACTIVITY']
    };

    const potentials = mappings[requestedId] || [];
    for (const p of potentials) {
        if (valid.some(v => v.id === p)) return p;
    }

    // 3. Just return the first valid one if all else fails
    return valid[0]?.id || 'ACTIVITY';
};

