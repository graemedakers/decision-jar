// Template system for pre-populated jars

export interface JarTemplate {
    id: string;
    name: string;
    topic: string;
    description: string;
    icon: string;
    category: 'dates' | 'activities' | 'food' | 'entertainment' | 'lifestyle';
    ideas: {
        description: string;
        category?: string;
        duration?: number;
        cost?: string;
        activityLevel?: string;
        indoor?: boolean;
        timeOfDay?: string;
        details?: string;
    }[];
}

export const JAR_TEMPLATES: JarTemplate[] = [
    {
        id: 'romantic-date-nights',
        name: '🌹 Romantic Date Night Ideas',
        topic: 'Dates',
        description: 'Classic and creative date ideas perfect for couples looking to spend quality time together',
        icon: '🌹',
        category: 'dates',
        ideas: [
            {
                description: 'Candlelit dinner at a new Italian restaurant',
                category: 'MEAL',
                duration: 2,
                cost: '$$$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'EVENING',
                details: 'Make a reservation, dress up, and enjoy a romantic evening with wine and pasta'
            },
            {
                description: 'Sunset picnic at the park',
                category: 'ACTIVITY',
                duration: 2,
                cost: '$',
                activityLevel: 'LOW',
                indoor: false,
                timeOfDay: 'EVENING',
                details: 'Pack a basket with cheese, wine, and snacks. Bring a blanket and watch the sunset together'
            },
            {
                description: 'Couples cooking class',
                category: 'ACTIVITY',
                duration: 3,
                cost: '$$',
                activityLevel: 'MEDIUM',
                indoor: true,
                timeOfDay: 'EVENING',
                details: 'Learn to make a new cuisine together. Many local cooking schools offer couples classes'
            },
            {
                description: 'Stargazing at a dark sky location',
                category: 'ACTIVITY',
                duration: 2,
                cost: 'FREE',
                activityLevel: 'LOW',
                indoor: false,
                timeOfDay: 'EVENING',
                details: 'Download a star map app, bring blankets, and find a spot away from city lights'
            },
            {
                description: 'Jazz club night',
                category: 'EVENT',
                duration: 3,
                cost: '$$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'EVENING',
                details: 'Check out local jazz venues. Order craft cocktails and enjoy live music'
            },
            {
                description: 'Breakfast in bed and lazy morning',
                category: 'ACTIVITY',
                duration: 2,
                cost: '$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'DAY',
                details: 'Take turns making breakfast. No phones, just conversation and coffee'
            },
            {
                description: 'Art gallery hop',
                category: 'ACTIVITY',
                duration: 2,
                cost: '$',
                activityLevel: 'MEDIUM',
                indoor: true,
                timeOfDay: 'DAY',
                details: 'Visit 2-3 local galleries. Discuss your favorite pieces over coffee after'
            },
            {
                description: 'Couples spa evening at home',
                category: 'ACTIVITY',
                duration: 2,
                cost: '$$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'EVENING',
                details: 'Face masks, massage oils, candles, and relaxing music. Create your own spa experience'
            },
            {
                description: 'Dance class (salsa, swing, or ballroom)',
                category: 'ACTIVITY',
                duration: 1.5,
                cost: '$$',
                activityLevel: 'HIGH',
                indoor: true,
                timeOfDay: 'EVENING',
                details: 'Learn a new dance style together. Many studios offer drop-in classes'
            },
            {
                description: 'Wine tasting at a local vineyard',
                category: 'ACTIVITY',
                duration: 3,
                cost: '$$$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'DAY',
                details: 'Book a tasting tour. Learn about wine making and enjoy beautiful vineyard views'
            }
        ]
    },
    {
        id: 'foodie-adventures',
        name: '🍕 Foodie Adventures',
        topic: 'Cooking & Recipes',
        description: 'Explore new cuisines and restaurants in your city',
        icon: '🍕',
        category: 'food',
        ideas: [
            {
                description: 'Try authentic Thai street food',
                category: 'MEAL',
                duration: 1.5,
                cost: '$$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'ANY'
            },
            {
                description: 'Sushi-making class',
                category: 'ACTIVITY',
                duration: 2,
                cost: '$$$',
                activityLevel: 'MEDIUM',
                indoor: true,
                timeOfDay: 'EVENING'
            },
            {
                description: 'Food truck festival',
                category: 'EVENT',
                duration: 2,
                cost: '$$',
                activityLevel: 'MEDIUM',
                indoor: false,
                timeOfDay: 'DAY'
            },
            {
                description: 'Farm-to-table restaurant experience',
                category: 'MEAL',
                duration: 2,
                cost: '$$$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'EVENING'
            },
            {
                description: 'Sunday brunch at a hidden gem',
                category: 'MEAL',
                duration: 1.5,
                cost: '$$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'DAY'
            },
            {
                description: 'Master the perfect homemade pasta',
                category: 'ACTIVITY',
                duration: 2,
                cost: '$',
                activityLevel: 'MEDIUM',
                indoor: true,
                timeOfDay: 'ANY',
                details: 'Follow a recipe from scratch - flour, eggs, and love'
            }
        ]
    },
    {
        id: 'weekend-adventures',
        name: '✨ Weekend Adventure Ideas',
        topic: 'Activities',
        description: 'Active and exciting ways to spend your weekends',
        icon: '✨',
        category: 'activities',
        ideas: [
            {
                description: 'Hiking to a waterfall',
                category: 'ACTIVITY',
                duration: 4,
                cost: 'FREE',
                activityLevel: 'HIGH',
                indoor: false,
                timeOfDay: 'DAY'
            },
            {
                description: 'Kayaking on a local lake',
                category: 'ACTIVITY',
                duration: 3,
                cost: '$$',
                activityLevel: 'HIGH',
                indoor: false,
                timeOfDay: 'DAY'
            },
            {
                description: 'Escape room challenge',
                category: 'ACTIVITY',
                duration: 1.5,
                cost: '$$',
                activityLevel: 'MEDIUM',
                indoor: true,
                timeOfDay: 'ANY'
            },
            {
                description: 'Rock climbing gym session',
                category: 'ACTIVITY',
                duration: 2,
                cost: '$$',
                activityLevel: 'HIGH',
                indoor: true,
                timeOfDay: 'ANY'
            },
            {
                description: 'Farmers market  and brunch',
                category: 'ACTIVITY',
                duration: 2,
                cost: '$',
                activityLevel: 'MEDIUM',
                indoor: false,
                timeOfDay: 'DAY'
            },
            {
                description: 'Beach day with volleyball',
                category: 'ACTIVITY',
                duration: 4,
                cost: 'FREE',
                activityLevel: 'HIGH',
                indoor: false,
                timeOfDay: 'DAY'
            }
        ]
    },
    {
        id: 'movie-marathon',
        name: '🎬 Movie Marathon Themes',
        topic: 'Movies',
        description: 'Themed movie nights for the perfect cozy evening',
        icon: '🎬',
        category: 'entertainment',
        ideas: [
            {
                description: '80s Comedy Marathon',
                category: 'ACTIVITY',
                duration: 4,
                cost: '$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'EVENING',
                details: 'The Breakfast Club, Ferris Bueller, Ghostbusters'
            },
            {
                description: 'Studio Ghibli Magic',
                category: 'ACTIVITY',
                duration: 3,
                cost: '$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'ANY',
                details: 'Spirited Away, My Neighbor Totoro, Howl\'s Moving Castle'
            },
            {
                description: 'Marvel MCU Rewatch',
                category: 'ACTIVITY',
                duration: 6,
                cost: '$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'ANY',
                details: 'Pick your favorite phase and binge-watch'
            },
            {
                description: 'Classic Film Noir Night',
                category: 'ACTIVITY',
                duration: 3,
                cost: '$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'EVENING',
                details: 'Casablanca, The Maltese Falcon, Double Indemnity'
            },
            {
                description: 'Outdoor cinema under the stars',
                category: 'EVENT',
                duration: 2.5,
                cost: '$$',
                activityLevel: 'LOW',
                indoor: false,
                timeOfDay: 'EVENING'
            }
        ]
    },
    {
        id: 'self-care-sunday',
        name: '🧘 Self-Care & Wellness',
        topic: 'General',
        description: 'Relaxation and personal wellness activities',
        icon: '🧘',
        category: 'lifestyle',
        ideas: [
            {
                description: 'Morning yoga and meditation',
                category: 'ACTIVITY',
                duration: 1,
                cost: 'FREE',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'DAY'
            },
            {
                description: 'Digital detox day',
                category: 'ACTIVITY',
                duration: 8,
                cost: 'FREE',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'DAY',
                details: 'No screens. Read, journal, walk in nature'
            },
            {
                description: 'Spa day at home',
                category: 'ACTIVITY',
                duration: 3,
                cost: '$$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'ANY'
            },
            {
                description: 'Nature walk and forest bathing',
                category: 'ACTIVITY',
                duration: 2,
                cost: 'FREE',
                activityLevel: 'MEDIUM',
                indoor: false,
                timeOfDay: 'DAY'
            },
            {
                description: 'Journaling and reflection time',
                category: 'ACTIVITY',
                duration: 1,
                cost: 'FREE',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'ANY'
            }
        ]
    },
    {
        id: 'rainy-day-fun',
        name: '☔ Rainy Day Activities',
        topic: 'Activities',
        description: 'Fun indoor activities for when the weather doesn\'t cooperate',
        icon: '☔',
        category: 'activities',
        ideas: [
            {
                description: 'Board game tournament',
                category: 'ACTIVITY',
                duration: 3,
                cost: '$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'ANY'
            },
            {
                description: 'Baking challenge (make something new)',
                category: 'ACTIVITY',
                duration: 2,
                cost: '$',
                activityLevel: 'MEDIUM',
                indoor: true,
                timeOfDay: 'ANY'
            },
            {
                description: 'Museum visit',
                category: 'ACTIVITY',
                duration: 2.5,
                cost: '$$',
                activityLevel: 'MEDIUM',
                indoor: true,
                timeOfDay: 'DAY'
            },
            {
                description: 'Cozy book reading marathon',
                category: 'ACTIVITY',
                duration: 4,
                cost: 'FREE',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'ANY'
            },
            {
                description: 'Indoor rock climbing',
                category: 'ACTIVITY',
                duration: 2,
                cost: '$$',
                activityLevel: 'HIGH',
                indoor: true,
                timeOfDay: 'ANY'
            },
            {
                description: 'Coffee shop hopping',
                category: 'ACTIVITY',
                duration: 2,
                cost: '$$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'ANY',
                details: 'Visit 3 different cafes, order something new at each'
            }
        ]
    }
];

export function getTemplateById(id: string): JarTemplate | undefined {
    return JAR_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: JarTemplate['category']): JarTemplate[] {
    return JAR_TEMPLATES.filter(t => t.category === category);
}
