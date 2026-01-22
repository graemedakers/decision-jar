import {
    Utensils, Wine, Music, Bed, Clapperboard, BookOpen,
    Leaf, Dumbbell, Ticket, Gamepad2, Key, Trophy, ChefHat,
    Clock, Users, DollarSign, Wallet, Star, Ghost, Briefcase, Sparkles, Plane, Calendar, Library
} from "lucide-react";
import { ConciergeToolConfig } from "@/components/GenericConciergeModal";
import { ACTION_LABELS } from "@/lib/ui-constants";

export const CONCIERGE_CONFIGS: Record<string, ConciergeToolConfig> = {

    DINING: {
        id: 'dining_concierge',
        title: 'Dining Concierge',
        subtitle: 'Find the perfect spot for dinner',
        icon: Utensils,
        colorTheme: 'orange',
        categoryType: 'MEAL',
        hasLocation: true,
        hasPrice: true,
        sections: [
            {
                id: 'cuisine',
                label: 'Cuisine Preference',
                type: 'multi-select',
                options: ["Italian", "Japanese", "Mexican", "Thai", "Indian", "Chinese", "Australian", "Burgers", "Pizza", "Seafood", "Steak", "Vegan", "Dessert", "Breakfast / Cafe", "Coffee"]
            },
            {
                id: 'vibe',
                label: 'Vibe / Atmosphere',
                type: 'multi-select',
                options: ["Romantic", "Casual", "Lively", "Cozy", "Upscale", "Hidden Gem", "Outdoor", "Quiet", "Trendy", "Kid Friendly", "Late Night", "Live Music"]
            }
        ],
        resultCard: {
            mainIcon: Utensils,
            subtextKey: 'cuisine',
            goActionLabel: ACTION_LABELS.DO_THIS
        }
    },
    CONCIERGE: {
        id: 'generic_concierge',
        title: 'AI Concierge',
        subtitle: 'Ask for anything, get personalized ideas',
        icon: Sparkles,
        colorTheme: 'indigo',
        categoryType: 'ACTIVITY',
        hasLocation: true,
        hasPrice: true,
        sections: [
            {
                id: 'mood',
                label: 'Current Mood',
                type: 'multi-select',
                options: ["Relaxed", "Adventurous", "Romantic", "Fun", "Educational", "Active", "Chill"]
            },
            {
                id: 'company',
                label: 'Who are you with?',
                type: 'single-select',
                options: ["Solo", "Partner", "Friends", "Family", "Kids", "Co-workers"]
            },
            {
                id: 'duration',
                label: 'Approx Duration',
                type: 'single-select',
                options: ["1-2 Hours", "Half Day", "Full Day", "Night Out", "Quick Stop"]
            }
        ],
        resultCard: {
            mainIcon: Sparkles,
            subtextKey: 'category', // Custom field to show Activity Type?
            secondIcon: Clock,
            secondSubtextKey: 'duration_label',
            goActionLabel: ACTION_LABELS.DO_THIS
        }
    },
    BAR: {
        id: 'bar_concierge',
        title: 'Bar Scout',
        subtitle: 'Find the perfect spot for a drink',
        icon: Wine,
        colorTheme: 'purple',
        categoryType: 'BAR',
        hasLocation: true,
        hasPrice: true,
        sections: [
            {
                id: 'drinks',
                label: 'Drinks Preference',
                type: 'multi-select',
                options: ["Cocktails", "Wine", "Craft Beer", "Whiskey", "Gin", "Tequila/Mezcal", "Pub", "Dive Bar", "Rooftop", "Speakeasy", "Sake", "Non-Alcoholic"]
            },
            {
                id: 'vibe',
                label: 'Vibe / Atmosphere',
                type: 'multi-select',
                options: ["Romantic", "Casual", "Lively", "Cozy", "Upscale", "Hidden Gem", "Outdoor", "Quiet", "Trendy", "Dance", "Live Music", "Sports"]
            }
        ],
        resultCard: {
            mainIcon: Wine,
            subtextKey: 'speciality',
            goActionLabel: ACTION_LABELS.DO_THIS
        }
    },
    BAR_CRAWL: {
        id: 'bar_crawl_planner',
        title: 'Bar Crawl Planner',
        subtitle: 'Plan a route of best bars',
        icon: Wine,
        colorTheme: 'purple',
        categoryType: 'ITINERARY',
        hasLocation: true,
        hasPrice: true,
        sections: [
            {
                id: 'theme',
                label: 'Crawl Theme',
                type: 'multi-select',
                options: ["Dive Bars", "Cocktail Lounges", "Rooftops", "Craft Beer", "Pub Crawl", "Classy / Dress Up", "Hidden Gems"]
            },
            {
                id: 'stops',
                label: 'Number of Stops',
                type: 'single-select',
                options: ["Quick (3 Stops)", "Standard (4-5 Stops)", "Epic (6+ Stops)"]
            },
            {
                id: 'vibe',
                label: 'Vibe',
                type: 'single-select',
                options: ["Chill", "Party", "Romantic", "Exploratory"]
            }
        ],
        resultCard: {
            mainIcon: Wine,
            subtextKey: 'duration_label',
            goActionLabel: ACTION_LABELS.DO_THIS
        }
    },
    NIGHTCLUB: {
        id: 'nightlife_concierge',
        title: 'Nightlife Navigator',
        subtitle: 'Find the best clubs and parties',
        icon: Music,
        colorTheme: 'pink',
        categoryType: 'ACTIVITY',
        hasLocation: true,
        hasPrice: true,
        sections: [
            {
                id: 'music',
                label: 'Music Style',
                type: 'multi-select',
                options: ["Top 40", "Hip Hop", "EDM / House", "Techno", "Latin", "R&B", "Throwbacks", "Live Band", "Indie / Alt", "Jazz / Blues"]
            },
            {
                id: 'vibe',
                label: 'Crowd & Vibe',
                type: 'multi-select',
                options: ["High Energy", "Chill / Lounge", "Upscale / VIP", "College / Young", "Dive / Underground", "LGBTQ+ Friendly", "Salsa / Dancing"]
            }
        ],
        resultCard: {
            mainIcon: Music,
            subtextKey: 'music',
            goActionLabel: ACTION_LABELS.DO_THIS
        }
    },
    HOTEL: {
        id: 'hotel_concierge',
        title: 'Staycation Finder',
        subtitle: 'Find the perfect hotel for a getaway',
        icon: Bed,
        colorTheme: 'blue',
        categoryType: 'ACTIVITY',
        hasLocation: true,
        hasPrice: true,
        sections: [
            {
                id: 'style',
                label: 'Hotel Style',
                type: 'multi-select',
                options: ["Luxury", "Boutique", "Modern", "Historic", "Resort", "Romantic", "Budget-Friendly", "Unique / Quirky"]
            },
            {
                id: 'amenities',
                label: 'Must-Have Amenities',
                type: 'multi-select',
                options: ["Pool", "Spa", "Rooftop Bar", "Bathtub in Room", "Room Service", "Ocean View", "Gym", "Pet Friendly", "Free Breakfast"]
            }
        ],
        resultCard: {
            mainIcon: Bed,
            subtextKey: 'style',
            goActionLabel: ACTION_LABELS.DO_THIS
        }
    },
    MOVIE: {
        id: 'movie_concierge',
        title: 'Movie Picker',
        subtitle: 'Find the perfect movie to watch',
        icon: Clapperboard,
        colorTheme: 'red',
        categoryType: 'MOVIE',
        hasLocation: false,
        locationCondition: {
            sectionId: 'watchMode',
            values: ['Cinema']
        },
        hasPrice: false,
        sections: [
            {
                id: 'watchMode',
                label: 'How do you want to watch?',
                type: 'single-select',
                options: ["Cinema", "Streaming"]
            },
            {
                id: 'streamingServices',
                label: 'Streaming Services',
                type: 'multi-select',
                options: ["Netflix", "Disney+", "Hulu", "Prime Video", "Max", "Apple TV+", "Peacock", "Paramount+"],
                condition: {
                    sectionId: 'watchMode',
                    values: ['Streaming']
                }
            },
            {
                id: 'genre',
                label: 'Genre',
                type: 'multi-select',
                options: ["Action", "Comedy", "Drama", "Sci-Fi", "Horror", "Romance", "Thriller", "Documentary", "Animation", "Fantasy", "Mystery"]
            },
            {
                id: 'mood',
                label: 'Current Mood',
                type: 'multi-select',
                options: ["Feel Good", "Sad / Emotional", "Tense", "Mind-bending", "Relaxing", "Exciting", "Scary", "Funny", "Inspirational"]
            },
            {
                id: 'era',
                label: 'Era preference',
                type: 'single-select',
                options: ["New Release (2020s)", "Modern (2010s)", "2000s", "90s", "80s", "Classic (Pre-80s)"]
            }
        ],
        resultCard: {
            mainIcon: Clapperboard,
            subtextKey: 'year',
            secondIcon: Star,
            secondSubtextKey: 'rating',
            goActionLabel: ACTION_LABELS.DO_THIS
        }
    },
    BOOK: {
        id: 'book_concierge',
        title: 'Book Finder',
        subtitle: 'Discover your next favorite read',
        icon: Library,
        colorTheme: 'blue',
        categoryType: 'BOOK',
        hasLocation: false,
        hasPrice: false,
        sections: [
            {
                id: 'genre',
                label: 'What do you feel like reading?',
                type: 'multi-select',
                options: ["Fiction", "Non-Fiction", "Mystery/Thriller", "Sci-Fi/Fantasy", "Romance", "Biography", "Self-Help", "History", "Horror"]
            },
            {
                id: 'vibe',
                label: "What's the vibe?",
                type: 'multi-select',
                options: ["Light & Easy", "Deep & Thought-provoking", "Fast-paced/Exciting", "Emotional/Touching", "Inspiring", "Educational", "Dark & Moody"]
            },
            {
                id: 'length',
                label: 'Preferred Length',
                type: 'single-select',
                options: ["Short (< 200 pages)", "Medium (200-400 pages)", "Long (400+ pages)"]
            },
            {
                id: 'era',
                label: 'Era / Period',
                type: 'single-select',
                options: ["Contemporary (Last 5 years)", "Modern (Last 20 years)", "20th Century", "Classics", "Historical"]
            }
        ],
        resultCard: {
            mainIcon: Library,
            subtextKey: 'author',
            goActionLabel: ACTION_LABELS.DO_THIS
        }
    },
    WELLNESS: {
        id: 'wellness_concierge',
        title: 'Wellness & Spa',
        subtitle: 'Relax and recharge',
        icon: Leaf,
        colorTheme: 'emerald',
        categoryType: 'ACTIVITY',
        hasLocation: true,
        hasPrice: true,
        sections: [
            {
                id: 'activity',
                label: 'Type of Wellness',
                type: 'multi-select',
                options: ["Massage", "Facial", "Sauna / Steam", "Hot Springs", "Meditation", "Yoga Class", "Float Tank", "Acupuncture", "Cryotherapy", "Nail Salon"]
            },
            {
                id: 'vibe',
                label: 'Atmosphere',
                type: 'multi-select',
                options: ["Luxury Resort", "Medical / Clinical", "Zen / Spiritual", "Modern / Minimalist", "Rustic / Nature", "Quiet / Private"]
            }
        ],
        resultCard: {
            mainIcon: Leaf,
            subtextKey: 'type',
            goActionLabel: ACTION_LABELS.DO_THIS
        }
    },
    FITNESS: {
        id: 'fitness_concierge',
        title: 'Fitness Finder',
        subtitle: 'Find a workout or activity',
        icon: Dumbbell,
        colorTheme: 'orange',
        categoryType: 'ACTIVITY',
        hasLocation: true,
        hasPrice: true,
        sections: [
            {
                id: 'activity',
                label: 'Activity Type',
                type: 'multi-select',
                options: ["Gym Workout", "Yoga", "Pilates", "CrossFit", "Boxing", "Spinning", "Running Route", "Hiking Trail", "Swimming", "Rock Climbing", "Dance Class"]
            },
            {
                id: 'level',
                label: 'Difficulty / Intensity',
                type: 'multi-select',
                options: ["Beginner Friendly", "Intermediate", "Advanced / Hardcore", "Low Impact", "High Intensity (HIIT)"]
            }
        ],
        resultCard: {
            mainIcon: Dumbbell,
            subtextKey: 'activity_type',
            goActionLabel: ACTION_LABELS.DO_THIS
        }
    },
    THEATRE: {
        id: 'theatre_concierge',
        title: 'Theatre & Arts',
        subtitle: 'Discover shows and exhibitions',
        icon: Ticket,
        colorTheme: 'rose',
        categoryType: 'ACTIVITY',
        hasLocation: true,
        hasPrice: true,
        sections: [
            {
                id: 'type',
                label: 'Type of Event',
                type: 'multi-select',
                options: ["Broadway / Musical", "Play", "Comedy Show", "Concert", "Opera", "Ballet / Dance", "Art Exhibition", "Museum", "Immersive Experience"]
            },
            {
                id: 'vibe',
                label: 'Tone / Vibe',
                type: 'multi-select',
                options: ["Classic", "Modern / Edgy", "Funny", "Serious / Dramatic", "Family Friendly", "Interactive", "Grand & Spectacular"]
            }
        ],
        resultCard: {
            mainIcon: Ticket,
            subtextKey: 'type',
            goActionLabel: ACTION_LABELS.DO_THIS
        }
    },
    GAME: {
        id: 'game_concierge',
        title: 'Game Guru',
        subtitle: 'Find the perfect video game',
        icon: Gamepad2,
        colorTheme: 'indigo',
        categoryType: 'ACTIVITY', // Or GAME specifically?
        hasLocation: false,
        hasPrice: false, // Using custom budget section
        sections: [
            {
                id: 'genre',
                label: 'Genre',
                type: 'multi-select',
                options: ["Action", "Adventure", "Strategy", "Puzzle", "RPG", "Shooter", "Party / Social", "Card / Board", "Simulation", "Sports", "Trivia"]
            },
            {
                id: 'players',
                label: 'Number of Players',
                type: 'multi-select', // Was single logic but button group? Let's allow multi for flexibility
                options: ["Solo (1)", "Duo (2)", "Small Group (3-4)", "Large Group (5+)", "Massively Multiplayer"]
            },
            {
                id: 'budget',
                label: 'Budget',
                type: 'multi-select',
                options: ["Free", "Cheap (<$10)", "Moderate ($10-$30)", "Premium ($30+)"]
            },
            {
                id: 'duration',
                label: 'Session Duration',
                type: 'multi-select',
                options: ["Quick (<20 min)", "Short (30-60 min)", "Medium (1-2 hours)", "Long (2+ hours)", "Endless"]
            }
        ],
        resultCard: {
            mainIcon: Gamepad2,
            subtextKey: 'genre',
            goActionLabel: ACTION_LABELS.DO_THIS
        }
    },
    ESCAPE_ROOM: {
        id: 'escape_room_concierge',
        title: 'Escape Room Scout',
        subtitle: 'Unlock the best puzzles nearby',
        icon: Key,
        colorTheme: 'indigo',
        categoryType: 'ACTIVITY',
        hasLocation: true,
        hasPrice: false,
        sections: [
            {
                id: 'themes',
                label: 'Preferred Themes',
                type: 'multi-select',
                options: ["Horror", "Mystery", "Sci-Fi", "Adventure", "Crime/Heist", "Fantasy", "Historical", "Comedy"]
            },
            {
                id: 'difficulty',
                label: 'Difficulty',
                type: 'single-select',
                options: ["Any Difficulty", "Beginner", "Intermediate", "Expert"]
            },
            {
                id: 'groupSize',
                label: 'Group Size',
                type: 'single-select',
                options: ["Any Size", "Small (2-3)", "Standard (4-6)", "Large (7-10)", "Party (10+)"]
            }
        ],
        resultCard: {
            mainIcon: Ghost,
            subtextKey: 'theme_type',
            secondIcon: Briefcase,
            secondSubtextKey: 'difficulty_level',
            goActionLabel: ACTION_LABELS.DO_THIS
        }
    },
    SPORTS: {
        id: 'sports_concierge',
        title: 'Sports Finder',
        subtitle: 'Find a game or match to watch/play',
        icon: Trophy,
        colorTheme: 'green',
        categoryType: 'ACTIVITY',
        hasLocation: true,
        hasPrice: true,
        sections: [
            {
                id: 'sport',
                label: 'Sport',
                type: 'multi-select',
                allowCustom: true,
                options: ["Football", "Basketball", "Soccer", "Baseball", "Hockey", "Tennis", "Golf", "F1 / Racing", "Boxing / MMA"]
            },
            {
                id: 'type',
                label: 'Watch or Play?',
                type: 'single-select',
                options: ["Watch Live Game", "Find a Sports Bar", "Play / Active"]
            },
            {
                id: 'membership',
                label: 'Membership Access',
                type: 'multi-select',
                options: ["Public Access / Casual Play", "Membership Required", "Guest Pass Available"],
                condition: {
                    sectionId: 'type',
                    values: ["Play / Active"]
                }
            }
        ],
        resultCard: {
            mainIcon: Trophy,
            subtextKey: 'sport',
            goActionLabel: ACTION_LABELS.DO_THIS
        }
    },
    CHEF: {
        id: 'chef_concierge',
        title: 'Dinner Party Chef',
        subtitle: 'Plan a perfect menu for any occasion',
        icon: ChefHat,
        colorTheme: 'emerald',
        categoryType: 'MEAL',
        hasLocation: false, // Recipes don't need location
        hasPrice: true, // Budget for ingredients?
        sections: [
            {
                id: 'occasion',
                label: 'Occasion',
                type: 'single-select',
                options: ["Romantic Date Night In", "Dinner Party", "Family Feast", "Holiday Special", "Casual Gathering"]
            },
            {
                id: 'guests',
                label: 'Number of Guests',
                type: 'single-select',
                options: ["2 People (Date)", "4 People (Double Date)", "6-8 People (Dinner Party)", "10+ People (Feast)"]
            },
            {
                id: 'cuisine',
                label: 'Cuisine Style',
                type: 'multi-select',
                allowCustom: true,
                options: ["Modern Australian", "Italian", "French", "Japanese", "Mexican", "Asian Fusion", "Mediterranean", "BBQ"]
            },
            {
                id: 'courses',
                label: 'Menu Structure',
                type: 'single-select',
                options: ["Main Dish Only", "2 Courses (Entree + Main)", "2 Courses (Main + Dessert)", "3 Courses (Entree + Main + Dessert)", "Shared Plates / Tapas Style", "Degustation (5+ Small Plates)"]
            },
            {
                id: 'complexity',
                label: 'Effort Level',
                type: 'single-select',
                options: ["Quick & Easy (<45 mins)", "Impressive but Manageable", "Pro / Technical (Challenge me!)"]
            },
            {
                id: 'dietary',
                label: 'Dietary Restrictions',
                type: 'multi-select',
                options: ["None", "Vegetarian", "Vegan", "Gluten Free", "Dairy Free", "Nut Free"]
            }
        ],
        resultCard: {
            mainIcon: ChefHat,
            subtextKey: 'occasion',
            goActionLabel: ACTION_LABELS.VIEW_MENU
        }
    },

    DATE_NIGHT: {
        id: 'date_night_planner',
        title: 'Date Night Planner',
        subtitle: 'Plan a complete evening out',
        icon: Sparkles,
        colorTheme: 'rose',
        categoryType: 'ITINERARY',
        hasLocation: true,
        hasPrice: true,
        sections: [
            {
                id: 'vibe',
                label: 'Evening Vibe',
                type: 'multi-select',
                options: ["Romantic", "Casual / Fun", "First Date", "Anniversary / Special", "Active / Adventurous", "Cozy / Intimate"]
            },
            {
                id: 'structure',
                label: 'Plan Structure',
                type: 'single-select',
                options: ["Dinner & Drinks", "Dinner & A Movie", "Activity & Dinner", "Just Drinks & Apps", "Surprise Me"]
            },
            {
                id: 'cuisine',
                label: 'Food Preference',
                type: 'multi-select',
                allowCustom: true,
                options: ["Italian", "Japanese", "Modern American", "Mexican", "French", "Thai", "Tapas", "No Preference"]
            }
        ],
        resultCard: {
            mainIcon: Sparkles,
            subtextKey: 'duration_label',
            goActionLabel: ACTION_LABELS.DO_THIS
        }
    },
    WEEKEND_EVENTS: {
        id: 'weekend_planner',
        title: 'Weekend Planner',
        subtitle: 'Find events and activities for this weekend',
        icon: Calendar,
        colorTheme: 'orange',
        categoryType: 'ACTIVITY',
        hasLocation: true,
        hasPrice: true,
        sections: [
            {
                id: 'mood',
                label: 'What\'s the vibe?',
                type: 'multi-select',
                allowCustom: true,
                options: ["Relaxing", "Active / Outdoors", "Social / Party", "Cultural / Arts", "Foodie", "Family Friendly", "Romantic"]
            },
            {
                id: 'company',
                label: 'Who are you with?',
                type: 'single-select',
                options: ["Just Me", "My Partner", "Friends", "Family"]
            },
            {
                id: 'day',
                label: 'Preferred Day',
                type: 'multi-select',
                options: ["Friday Night", "Saturday", "Sunday", "Any / All Weekend"]
            }
        ],
        resultCard: {
            mainIcon: Calendar,
            subtextKey: 'day',
            goActionLabel: ACTION_LABELS.DO_THIS
        }
    },
    HOLIDAY: {
        id: 'holiday_concierge',
        title: 'Holiday Planner',
        subtitle: 'Create a perfect travel itinerary',
        icon: Plane,
        colorTheme: 'blue',
        categoryType: 'ITINERARY',
        hasLocation: true, // Destination
        hasPrice: true, // Budget
        sections: [
            {
                id: 'dates',
                label: 'Travel Dates',
                type: 'date-range', // New Type
                options: [] // Managed by date picker
            },
            {
                id: 'transport',
                label: 'Transport Available',
                type: 'multi-select',
                options: ["Walking / Foot", "Car / Rental", "Public Transport (Train/Bus/Tram)", "Bicycle / Scooter", "Taxi / Uber"]
            },
            {
                id: 'maxDistance',
                label: 'Max Travel Distance',
                type: 'single-select',
                options: ["Walkable Only (< 1km)", "Short Drive/Ride (< 15 mins)", "Medium Trip (30-60 mins)", "Day Trip (1-2 hours)"]
            },
            {
                id: 'dining',
                label: 'Dining Preferences',
                type: 'multi-select',
                options: ["Eat Out (Lunch)", "Eat Out (Dinner)", "Cook at Accommodation", "Street Food / Casual", "Fine Dining"]
            },
            {
                id: 'interests',
                label: 'Trip Vibe & Interests',
                type: 'multi-select',
                allowCustom: true,
                options: ["Relaxing / Chill", "Adventure / Active", "Sightseeing / History", "Foodie Tour", "Family Fun", "Nightlife", "Shopping", "Nature / Outdoors"]
            },
            {
                id: 'party',
                label: 'Who is travelling?',
                type: 'single-select',
                options: ["Solo", "Couple", "Family with Kids", "Group of Friends"]
            }
        ],
        resultCard: {
            mainIcon: Calendar,
            subtextKey: 'duration_label',
            goActionLabel: ACTION_LABELS.VIEW_ITINERARY
        }
    }
};
