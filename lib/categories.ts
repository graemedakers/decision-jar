import { Activity, Utensils, Calendar, Coffee, Popcorn, ShoppingBag, Briefcase, Home, Loader, Beer, Clapperboard, PartyPopper, CheckSquare, Sparkles, Book, Plane, Car, Map, Music, Headphones, Dumbbell, Gamepad2, Dices, Brain, Leaf, Ticket, Footprints, Moon, Trophy, Users, Wine, Disc, Speaker, Martini, ChefHat, Pizza, Star, Zap } from "lucide-react";

export interface CategoryDef {
    id: string;
    label: string;
    icon: any;
}

export const TOPIC_CATEGORIES: Record<string, CategoryDef[]> = {
    "Activities": [
        { id: "OUTDOOR", label: "Adventure", icon: Activity },
        { id: "INDOOR", label: "Chill/Home", icon: Home },
        { id: "SOCIAL", label: "Event", icon: PartyPopper },
        { id: "CULTURAL", label: "Museum/Art", icon: Ticket },
    ],
    "Restaurants": [
        { id: "FINE_DINING", label: "Fine Dining", icon: ChefHat },
        { id: "CASUAL", label: "Casual", icon: Utensils },
        { id: "BRUNCH", label: "Brunch", icon: Coffee },
        { id: "FAST_FOOD", label: "Quick Bite", icon: Pizza },
        { id: "INTERNATIONAL", label: "Exotic", icon: Map },
    ],
    "Bars": [
        { id: "COCKTAIL", label: "Cocktail Bar", icon: Martini },
        { id: "PUB", label: "Pub/Dive", icon: Beer },
        { id: "WINE_BAR", label: "Wine Bar", icon: Wine },
        { id: "ROOFTOP", label: "Rooftop", icon: Star },
        { id: "SPEAKEASY", label: "Speakeasy", icon: Moon },
    ],
    "Nightclubs": [
        { id: "DANCE_CLUB", label: "Dance Club", icon: Disc },
        { id: "LOUNGE", label: "Lounge", icon: Utensils },
        { id: "LIVE_MUSIC", label: "Live Venue", icon: Speaker },
        { id: "RAVE", label: "Rave/Techno", icon: Zap },
    ],
    "Movies": [
        { id: "CINEMA", label: "Cinema", icon: Popcorn },
        { id: "STREAMING", label: "Streaming", icon: Clapperboard },
        { id: "SERIES", label: "TV Series", icon: Activity },
    ],
    "Wellness": [
        { id: "MEDITATION", label: "Meditation", icon: Moon },
        { id: "SPA", label: "Spa/Bath", icon: Sparkles },
        { id: "WALK", label: "Walk", icon: Footprints },
        { id: "DETOX", label: "Digital Detox", icon: Leaf },
    ],
    "Fitness": [
        { id: "CARDIO", label: "Cardio", icon: Activity },
        { id: "STRENGTH", label: "Strength", icon: Dumbbell },
        { id: "YOGA", label: "Yoga", icon: Leaf },
        { id: "OUTDOOR_SPORT", label: "Sport", icon: Trophy },
    ],
    "Travel": [
        { id: "WEEKEND", label: "Weekend Trip", icon: Car },
        { id: "ABROAD", label: "International", icon: Plane },
        { id: "STAYCATION", label: "Staycation", icon: Home },
        { id: "ROADTRIP", label: "Road Trip", icon: Map },
    ],
    "Custom": [
        { id: "OPTION_A", label: "Option 1", icon: Activity },
        { id: "OPTION_B", label: "Option 2", icon: Activity },
        { id: "OPTION_C", label: "Option 3", icon: Activity },
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
    "Custom": {
        primary: "violet-500",
        secondary: "fuchsia-500",
        gradientFrom: "from-violet-400",
        gradientTo: "to-fuchsia-500",
        bgBlob1: "bg-violet-500/10",
        bgBlob2: "bg-fuchsia-500/10"
    }
};

// Helper to map icon name to component
const getIconComponent = (iconName: string) => {
    // Basic mapping for common icons, fallback to Sparkles
    const map: any = { Activity, Utensils, Calendar, Coffee, Popcorn, ShoppingBag, Briefcase, Home, Loader, Beer, Clapperboard, PartyPopper, CheckSquare, Sparkles, Book, Plane, Car, Map, Music, Headphones, Dumbbell, Gamepad2, Dices, Brain, Leaf, Ticket, Footprints, Moon, Trophy, Users, Wine, Disc, Speaker, Martini, ChefHat, Pizza };
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

    if (!topic) return TOPIC_CATEGORIES["General"];

    // Case-insensitive match 
    const foundKey = Object.keys(TOPIC_CATEGORIES).find(
        key => key.toLowerCase() === topic.toLowerCase()
    );

    return foundKey ? TOPIC_CATEGORIES[foundKey] : TOPIC_CATEGORIES["General"];
};

export const getThemeForTopic = (topic: string | null | undefined): TopicTheme => {
    if (!topic) return TOPIC_THEMES["General"];

    const foundKey = Object.keys(TOPIC_THEMES).find(
        key => key.toLowerCase() === topic.toLowerCase()
    );

    return foundKey ? TOPIC_THEMES[foundKey] : TOPIC_THEMES["General"];
};
