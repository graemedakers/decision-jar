
import {
    Calendar, Utensils, Wine, Footprints, Moon, Clapperboard,
    Leaf, Dumbbell, Ticket, ChefHat, Gamepad2, Key, Trophy,
    Book, Disc, Bed, Users, Plane
} from "lucide-react";

export type ToolColor = 'purple' | 'blue' | 'orange' | 'pink' | 'rose' | 'indigo' | 'violet' | 'red' | 'cyan' | 'emerald' | 'amber' | 'teal' | 'green';

export type ToolActionType = 'concierge' | 'modal' | 'link';

export interface DashboardTool {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: ToolColor;
    requiresPremium: boolean;

    // Action Logic
    actionType: ToolActionType;
    conciergeId?: string; // Maps to keys in CONCIERGE_CONFIGS
    modalId?: 'weekend_planner' | 'catering' | 'bar_crawl' | 'date_night' | 'menu_planner';
    linkHref?: string;

    // Visibility / Filtering Logic
    showInDashboard: boolean;
    showInExplore: boolean;
    communityJarCompatible?: boolean; // If true, shows in community jars (usually false for most)

    // Dynamic Display Logic (handled by consumer, but flagged here)
    // For example, "Date Night Planner" vs "Catering Planner" swap based on topic
    topicSpecific?: {
        topic: string; // e.g., 'Cooking & Recipes'
        showInsteadOf?: string; // ID of tool to replace, or just logic handle
    };
}

export const DASHBOARD_TOOLS: DashboardTool[] = [
    {
        id: 'community_finder',
        title: 'Community Finder',
        description: 'Join public jars and find your squad.',
        icon: Users,
        color: 'blue',
        requiresPremium: false,
        actionType: 'link',
        linkHref: '/community',
        showInDashboard: false,
        showInExplore: true,
        communityJarCompatible: true
    },
    {
        id: 'weekend_planner',
        title: 'Weekend Planner',
        description: 'Hand-picked events and activities for your next adventure.',
        icon: Calendar,
        color: 'purple',
        requiresPremium: true,
        actionType: 'modal',
        modalId: 'weekend_planner',
        showInDashboard: true,
        showInExplore: true
    },
    {
        id: 'holiday_planner',
        title: 'Holiday Planner',
        description: 'Create a perfect travel itinerary with day-by-day plans.',
        icon: Plane,
        color: 'blue',
        requiresPremium: true,
        actionType: 'concierge',
        conciergeId: 'HOLIDAY',
        showInDashboard: true,
        showInExplore: true
    },
    {
        id: 'dining_concierge',
        title: 'Dining Concierge',
        description: 'Find the perfect breakfast, lunch or dinner spot nearby.',
        icon: Utensils,
        color: 'orange',
        requiresPremium: true,
        actionType: 'concierge',
        conciergeId: 'DINING',
        showInDashboard: true,
        showInExplore: true
    },
    {
        id: 'bar_scout',
        title: 'Bar Scout',
        description: 'The ultimate guide to bars and social venues nearby.',
        icon: Wine,
        color: 'pink',
        requiresPremium: true,
        actionType: 'concierge',
        conciergeId: 'BAR',
        showInDashboard: true,
        showInExplore: true
    },
    {
        id: 'bar_crawl_planner',
        title: 'Bar Crawl Planner',
        description: 'Design a route for the perfect night out.',
        icon: Footprints,
        color: 'orange',
        requiresPremium: true,
        actionType: 'modal',
        modalId: 'bar_crawl',
        showInDashboard: true,
        showInExplore: true
    },
    {
        id: 'date_night_planner',
        title: 'Night Out Planner', // "Activity Planner" in Dashboard, "Night Out Planner" in Explore. Standardizing to "Night Out Planner" or "Date Night Planner"
        description: 'Step-by-step itineraries for any occasion.',
        icon: Moon,
        color: 'rose',
        requiresPremium: true,
        actionType: 'modal',
        modalId: 'date_night',
        showInDashboard: true, // Special handling: swapped with Catering if topic is Cooking
        showInExplore: true
    },
    {
        id: 'catering_planner',
        title: 'Catering Planner',
        description: 'Professional menus for any occasion.',
        icon: ChefHat,
        color: 'red', // Explore uses red, Grid used Orange. Going with Red for distinction.
        requiresPremium: true,
        actionType: 'modal',
        modalId: 'catering',
        showInDashboard: true, // Special handling: Only shows if topic is Cooking (or always in Explore)
        showInExplore: true
    },
    {
        id: 'nightclub_scout',
        title: 'Nightclub Scout',
        description: 'Discover the hottest clubs and dance venues.',
        icon: Disc,
        color: 'indigo',
        requiresPremium: true,
        actionType: 'concierge',
        conciergeId: 'NIGHTCLUB',
        showInDashboard: true,
        showInExplore: true
    },
    {
        id: 'hotel_finder',
        title: 'Hotel Finder',
        description: 'Find the perfect stay for your getaway.',
        icon: Bed,
        color: 'cyan',
        requiresPremium: true,
        actionType: 'concierge',
        conciergeId: 'HOTEL',
        showInDashboard: true,
        showInExplore: true
    },
    {
        id: 'movie_scout',
        title: 'Movie Scout',
        description: 'Find the best movies and cinemas playing near you.',
        icon: Clapperboard,
        color: 'red',
        requiresPremium: true,
        actionType: 'concierge',
        conciergeId: 'MOVIE',
        showInDashboard: true,
        showInExplore: true
    },
    {
        id: 'wellness_scout',
        title: 'Wellness',
        description: 'Find spas, yoga, and relaxation spots.',
        icon: Leaf,
        color: 'emerald',
        requiresPremium: true,
        actionType: 'concierge',
        conciergeId: 'WELLNESS',
        showInDashboard: true,
        showInExplore: true
    },
    {
        id: 'fitness_scout',
        title: 'Fitness',
        description: 'Gyms, trails, and classes to get you moving.',
        icon: Dumbbell,
        color: 'amber', // Grid had Orange, Explore has Amber. Using Amber.
        requiresPremium: true,
        actionType: 'concierge',
        conciergeId: 'FITNESS',
        showInDashboard: true,
        showInExplore: true
    },
    {
        id: 'theatre_scout',
        title: 'Theatre Scout',
        description: 'Discover plays, musicals, and live performances.',
        icon: Ticket,
        color: 'purple',
        requiresPremium: true,
        actionType: 'concierge',
        conciergeId: 'THEATRE',
        showInDashboard: true,
        showInExplore: true
    },
    {
        id: 'game_finder',
        title: 'Game Finder',
        description: 'Find online digital games to play solo or with friends.',
        icon: Gamepad2,
        color: 'indigo',
        requiresPremium: true,
        actionType: 'concierge',
        conciergeId: 'GAME',
        showInDashboard: true,
        showInExplore: true
    },
    {
        id: 'menu_planner',
        title: 'Menu Planner',
        description: 'Plan your weekly meals with personalized recipes.',
        icon: Calendar,
        color: 'green',
        requiresPremium: true,
        actionType: 'modal',
        modalId: 'menu_planner',
        showInDashboard: true,
        showInExplore: false // Currently not in Explore
    },
    {
        id: 'escape_room_scout',
        title: 'Escape Room Scout',
        description: 'Find and book nearby escape rooms.',
        icon: Key,
        color: 'teal',
        requiresPremium: true,
        actionType: 'concierge',
        conciergeId: 'ESCAPE_ROOM',
        showInDashboard: true,
        showInExplore: false // Not in Explore previously
    },
    {
        id: 'sports_scout',
        title: 'Sports Scout',
        description: 'Find clubs, courts, and facilities for solo or joint activities.',
        icon: Trophy,
        color: 'emerald',
        requiresPremium: true,
        actionType: 'concierge',
        conciergeId: 'SPORTS',
        showInDashboard: true,
        showInExplore: false // Not in Explore previously
    },
    {
        id: 'book_finder',
        title: 'Book Finder',
        description: 'Discover your next favorite read tailored to your mood.',
        icon: Book,
        color: 'blue',
        requiresPremium: true,
        actionType: 'concierge',
        conciergeId: 'BOOK',
        showInDashboard: true,
        showInExplore: false // Not in Explore previously
    }
];
