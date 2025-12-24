
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

export const getCategoriesForTopic = (topic: string | null | undefined): CategoryDef[] => {
    if (!topic) return TOPIC_CATEGORIES["General"];
    // Case-insensitive match or exact? The DB stores proper case usually, but let's be safe.
    // The keys above are Exact matches to what we set in CreateJarModal.

    // If not found, default to General
    return TOPIC_CATEGORIES[topic] || TOPIC_CATEGORIES["General"];
};
