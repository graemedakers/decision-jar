import {
    Utensils, Wine, Music, Bed, Clapperboard, BookOpen,
    Leaf, Dumbbell, Ticket, Gamepad2, Key, Trophy, ChefHat,
    Clock, Users, DollarSign, Wallet, Star, Ghost, Briefcase
} from "lucide-react";
import { ConciergeToolConfig } from "@/components/GenericConciergeModal";

export const CONCIERGE_CONFIGS: Record<string, ConciergeToolConfig> = {
    DINING: {
        id: 'dining_concierge',
        title: 'Dining Concierge',
        subtitle: 'Find the perfect spot for dinner',
        icon: Utensils,
        colorTheme: 'orange',
        endpoint: '/api/concierge',
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
            goActionLabel: 'Go Tonight'
        }
    },
    BAR: {
        id: 'bar_concierge',
        title: 'Bar Scout',
        subtitle: 'Find the perfect spot for a drink',
        icon: Wine,
        colorTheme: 'purple',
        endpoint: '/api/concierge',
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
            goActionLabel: 'Go Tonight'
        }
    },
    NIGHTCLUB: {
        id: 'nightlife_concierge',
        title: 'Nightlife Navigator',
        subtitle: 'Find the best clubs and parties',
        icon: Music,
        colorTheme: 'pink',
        endpoint: '/api/concierge',
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
            goActionLabel: 'Go Tonight'
        }
    },
    HOTEL: {
        id: 'hotel_concierge',
        title: 'Staycation Finder',
        subtitle: 'Find the perfect hotel for a getaway',
        icon: Bed,
        colorTheme: 'blue',
        endpoint: '/api/concierge',
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
            goActionLabel: 'Book Now'
        }
    },
    MOVIE: {
        id: 'movie_concierge',
        title: 'Movie Picker',
        subtitle: 'Find the perfect movie to watch',
        icon: Clapperboard,
        colorTheme: 'red',
        endpoint: '/api/concierge',
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
            goActionLabel: 'Watch'
        }
    },
    BOOK: {
        id: 'book_concierge',
        title: 'Book Finder',
        subtitle: 'Discover your next favorite read',
        icon: BookOpen,
        colorTheme: 'blue',
        endpoint: '/api/concierge',
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
            mainIcon: BookOpen,
            subtextKey: 'author',
            goActionLabel: 'Read'
        }
    },
    WELLNESS: {
        id: 'wellness_concierge',
        title: 'Wellness & Spa',
        subtitle: 'Relax and recharge',
        icon: Leaf,
        colorTheme: 'emerald',
        endpoint: '/api/concierge',
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
            goActionLabel: 'Book'
        }
    },
    FITNESS: {
        id: 'fitness_concierge',
        title: 'Fitness Finder',
        subtitle: 'Find a workout or activity',
        icon: Dumbbell,
        colorTheme: 'orange',
        endpoint: '/api/concierge',
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
            goActionLabel: 'Go'
        }
    },
    THEATRE: {
        id: 'theatre_concierge',
        title: 'Theatre & Arts',
        subtitle: 'Discover shows and exhibitions',
        icon: Ticket,
        colorTheme: 'rose',
        endpoint: '/api/concierge',
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
            goActionLabel: 'Tickets'
        }
    },
    GAME: {
        id: 'game_concierge',
        title: 'Game Guru',
        subtitle: 'Find the perfect video game',
        icon: Gamepad2,
        colorTheme: 'indigo',
        endpoint: '/api/concierge',
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
            goActionLabel: 'Play'
        }
    },
    ESCAPE_ROOM: {
        id: 'escape_room_concierge',
        title: 'Escape Room Scout',
        subtitle: 'Unlock the best puzzles nearby',
        icon: Key,
        colorTheme: 'indigo',
        endpoint: '/api/concierge',
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
            goActionLabel: 'View'
        }
    },
    SPORTS: {
        id: 'sports_concierge',
        title: 'Sports Finder',
        subtitle: 'Find a game or match to watch/play',
        icon: Trophy,
        colorTheme: 'green',
        endpoint: '/api/concierge',
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
            goActionLabel: 'Go'
        }
    },
    CHEF: {
        id: 'chef_concierge',
        title: 'Dinner Party Chef',
        subtitle: 'Plan a perfect menu for any occasion',
        icon: ChefHat,
        colorTheme: 'emerald',
        endpoint: '/api/concierge',
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
                options: ["Main Dish Only", "2 Courses (Entree + Main)", "3 Courses (Entree + Main + Dessert)", "Shared Plates / Tapas Style", "Degustation (5+ Small Plates)"]
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
            goActionLabel: 'View Menu'
        }
    }
};
