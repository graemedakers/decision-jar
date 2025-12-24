
import { Activity, Utensils, Calendar, Coffee, Popcorn, ShoppingBag, Briefcase, Home, Loader, Beer, Clapperboard, PartyPopper, CheckSquare, Sparkles } from "lucide-react";

export interface CategoryDef {
    id: string;
    label: string;
    icon: any;
}

export const TOPIC_CATEGORIES: Record<string, CategoryDef[]> = {
    "General": [
        { id: "ACTIVITY", label: "Activity", icon: Activity },
        { id: "MEAL", label: "Meal", icon: Utensils },
        { id: "EVENT", label: "Event", icon: Calendar },
    ],
    "Food": [
        { id: "RESTAURANT", label: "Restaurant", icon: Utensils },
        { id: "CAFE", label: "Cafe", icon: Coffee },
        { id: "COOKING", label: "Home Cook", icon: Home },
        { id: "DRINKS", label: "Drinks", icon: Beer },
    ],
    "Movies": [
        { id: "CINEMA", label: "Cinema", icon: Popcorn },
        { id: "STREAMING", label: "Streaming", icon: Clapperboard },
        { id: "SERIES", label: "TV Series", icon: Activity },
    ],
    "Activities": [
        { id: "OUTDOOR", label: "Adventure", icon: Activity },
        { id: "INDOOR", label: "Chill/Home", icon: Home },
        { id: "SOCIAL", label: "Event", icon: PartyPopper },
    ],
    "Chores": [
        { id: "CLEANING", label: "Cleaning", icon: Sparkles },
        { id: "ORGANIZE", label: "Organize", icon: Briefcase },
        { id: "ERRAND", label: "Errand", icon: ShoppingBag },
        { id: "TASK", label: "Task", icon: CheckSquare },
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
    "General": {
        primary: "pink-500",
        secondary: "purple-600",
        gradientFrom: "from-pink-500",
        gradientTo: "to-purple-600",
        bgBlob1: "bg-pink-500/10",
        bgBlob2: "bg-purple-500/10"
    },
    "Food": {
        primary: "orange-500",
        secondary: "red-500",
        gradientFrom: "from-orange-400",
        gradientTo: "to-red-500",
        bgBlob1: "bg-orange-500/10",
        bgBlob2: "bg-red-500/10"
    },
    "Movies": {
        primary: "red-600",
        secondary: "rose-900",
        gradientFrom: "from-red-600",
        gradientTo: "to-rose-800",
        bgBlob1: "bg-red-600/10",
        bgBlob2: "bg-rose-900/10"
    },
    "Activities": {
        primary: "green-500",
        secondary: "emerald-700",
        gradientFrom: "from-green-400",
        gradientTo: "to-emerald-600",
        bgBlob1: "bg-green-500/10",
        bgBlob2: "bg-emerald-600/10"
    },
    "Chores": {
        primary: "cyan-500",
        secondary: "blue-600",
        gradientFrom: "from-cyan-400",
        gradientTo: "to-blue-600",
        bgBlob1: "bg-cyan-500/10",
        bgBlob2: "bg-blue-600/10"
    },
    "Wellness": {
        primary: "teal-500",
        secondary: "green-400",
        gradientFrom: "from-teal-400",
        gradientTo: "to-green-400",
        bgBlob1: "bg-teal-500/10",
        bgBlob2: "bg-green-400/10"
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

export const getCategoriesForTopic = (topic: string | null | undefined): CategoryDef[] => {
    if (!topic) return TOPIC_CATEGORIES["General"];
    // Case-insensitive match or exact? The DB stores proper case usually, but let's be safe.
    // The keys above are Exact matches to what we set in CreateJarModal.

    // If not found, default to General
    return TOPIC_CATEGORIES[topic] || TOPIC_CATEGORIES["General"];
};

export const getThemeForTopic = (topic: string | null | undefined): TopicTheme => {
    if (!topic) return TOPIC_THEMES["General"];
    return TOPIC_THEMES[topic] || TOPIC_THEMES["General"];
};
