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
    },
    {
        id: 'first-date-ideas',
        name: '💕 First Date Ideas',
        topic: 'Dates',
        description: 'Low-pressure, conversation-friendly first date ideas that help you get to know each other',
        icon: '💕',
        category: 'dates',
        ideas: [
            {
                description: 'Coffee shop meet-up',
                category: 'MEAL',
                duration: 1,
                cost: '$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'ANY',
                details: 'Classic first date. Easy to extend if it\'s going well, easy to end if not. Pick a cozy spot with good vibes'
            },
            {
                description: 'Walk through a farmers market or street fair',
                category: 'ACTIVITY',
                duration: 1.5,
                cost: '$',
                activityLevel: 'MEDIUM',
                indoor: false,
                timeOfDay: 'DAY',
                details: 'Lots to talk about as you browse. Can grab samples or coffee. Natural conversation and easy atmosphere'
            },
            {
                description: 'Mini golf or bowling',
                category: 'ACTIVITY',
                duration: 1.5,
                cost: '$$',
                activityLevel: 'MEDIUM',
                indoor: true,
                timeOfDay: 'ANY',
                details: 'Fun activity that takes pressure off constant conversation. Playful and light-hearted'
            },
            {
                description: 'Art gallery or museum visit',
                category: 'ACTIVITY',
                duration: 2,
                cost: '$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'DAY',
                details: 'Built-in conversation starters. Learn about their taste and interests. Many museums are free or cheap'
            },
            {
                description: 'Ice cream walk in the park',
                category: 'ACTIVITY',
                duration: 1,
                cost: '$',
                activityLevel: 'LOW',
                indoor: false,
                timeOfDay: 'DAY',
                details: 'Sweet, casual, and low commitment. Perfect for daytime first dates'
            },
            {
                description: 'Drinks at a chill wine bar or cocktail lounge',
                category: 'MEAL',
                duration: 1.5,
                cost: '$$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'EVENING',
                details: 'More grown-up than a regular bar, less formal than dinner. Good for evening first dates'
            },
            {
                description: 'Book store browsing',
                category: 'ACTIVITY',
                duration: 1,
                cost: 'FREE',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'ANY',
                details: 'See what they\'re into. Recommend books to each other. Grab coffee at the café after'
            },
            {
                description: 'Lunch at a trendy food hall',
                category: 'MEAL',
                duration: 1,
                cost: '$$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'DAY',
                details: 'Lots of options if you have different tastes. Casual vibe, less pressure than formal dinner'
            },
            {
                description: 'Afternoon matinee movie',
                category: 'EVENT',
                duration: 2.5,
                cost: '$$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'DAY',
                details: 'Cheaper than evening shows. Can grab coffee or drinks after to discuss. Pick something you both want to see'
            },
            {
                description: 'Dog park visit (if one of you has a dog)',
                category: 'ACTIVITY',
                duration: 1,
                cost: 'FREE',
                activityLevel: 'MEDIUM',
                indoor: false,
                timeOfDay: 'ANY',
                details: 'Instant conversation topic. See how they are with animals. Super casual and fun'
            }
        ]
    },
    {
        id: 'budget-friendly-dates',
        name: '💰 Budget-Friendly Date Night',
        topic: 'Dates',
        description: 'Romantic and fun date ideas that won\'t break the bank. Great dates don\'t have to be expensive!',
        icon: '💰',
        category: 'dates',
        ideas: [
            {
                description: 'Picnic in the park with homemade food',
                category: 'MEAL',
                duration: 2,
                cost: '$',
                activityLevel: 'LOW',
                indoor: false,
                timeOfDay: 'DAY',
                details: 'Make sandwiches, pack fruit and snacks. Bring a blanket and enjoy the outdoors'
            },
            {
                description: 'Free outdoor concert or festival',
                category: 'EVENT',
                duration: 2,
                cost: 'FREE',
                activityLevel: 'MEDIUM',
                indoor: false,
                timeOfDay: 'EVENING',
                details: 'Check local event calendars. Many cities have free summer concerts in the park'
            },
            {
                description: 'Cook a fancy dinner together at home',
                category: 'MEAL',
                duration: 2,
                cost: '$',
                activityLevel: 'MEDIUM',
                indoor: true,
                timeOfDay: 'EVENING',
                details: 'Pick a recipe you\'ve never tried. Light candles, play music. Restaurant quality for $20'
            },
            {
                description: 'Sunrise or sunset hike',
                category: 'ACTIVITY',
                duration: 2,
                cost: 'FREE',
                activityLevel: 'HIGH',
                indoor: false,
                timeOfDay: 'DAY',
                details: 'Free, beautiful, and memorable. Pack snacks and enjoy the view together'
            },
            {
                description: 'Game night tournament',
                category: 'ACTIVITY',
                duration: 3,
                cost: 'FREE',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'EVENING',
                details: 'Card games, board games, video games. Make it competitive with silly prizes'
            },
            {
                description: 'Free museum or gallery day',
                category: 'ACTIVITY',
                duration: 2,
                cost: 'FREE',
                activityLevel: 'MEDIUM',
                indoor: true,
                timeOfDay: 'DAY',
                details: 'Many museums have free admission days. Check their websites for schedules'
            },
            {
                description: 'Bike ride to get ice cream',
                category: 'ACTIVITY',
                duration: 1.5,
                cost: '$',
                activityLevel: 'HIGH',
                indoor: false,
                timeOfDay: 'DAY',
                details: 'Borrow or rent bikes if needed. Find a scenic route to your favorite ice cream spot'
            },
            {
                description: 'Movie night at home with themed snacks',
                category: 'ACTIVITY',
                duration: 3,
                cost: '$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'EVENING',
                details: 'Make popcorn, create a cozy fort with blankets. Way cheaper than theater'
            },
            {
                description: 'Beach or lake day',
                category: 'ACTIVITY',
                duration: 4,
                cost: 'FREE',
                activityLevel: 'HIGH',
                indoor: false,
                timeOfDay: 'DAY',
                details: 'Pack a lunch, bring sunscreen. Swim, play frisbee, relax in the sun'
            },
            {
                description: 'Explore a new neighborhood on foot',
                category: 'ACTIVITY',
                duration: 2,
                cost: 'FREE',
                activityLevel: 'MEDIUM',
                indoor: false,
                timeOfDay: 'ANY',
                details: 'Pick a neighborhood you\'ve never been to. Window shop, grab coffee, discover new spots'
            }
        ]
    },
    {
        id: 'anniversary-celebration',
        name: '🎊 Anniversary Celebration Ideas',
        topic: 'Dates',
        description: 'Special and memorable ways to celebrate your relationship milestones',
        icon: '🎊',
        category: 'dates',
        ideas: [
            {
                description: 'Recreate your first date',
                category: 'MEAL',
                duration: 2,
                cost: '$$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'EVENING',
                details: 'Go back to where it all started. Same restaurant, same order if possible. Reminisce about how far you\'ve come'
            },
            {
                description: 'Couples massage and spa day',
                category: 'ACTIVITY',
                duration: 3,
                cost: '$$$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'ANY',
                details: 'Book a couples suite with massage, hot tub, and relaxation. Pure indulgence'
            },
            {
                description: 'Weekend getaway to a romantic destination',
                category: 'ACTIVITY',
                duration: 48,
                cost: '$$$',
                activityLevel: 'MEDIUM',
                indoor: false,
                timeOfDay: 'ANY',
                details: 'Book a B&B, boutique hotel, or cabin. Disconnect and focus on each other'
            },
            {
                description: 'Fancy tasting menu dinner',
                category: 'MEAL',
                duration: 3,
                cost: '$$$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'EVENING',
                details: 'Save up for the best restaurant in town. Make a reservation months in advance'
            },
            {
                description: 'Sunrise hot air balloon ride',
                category: 'ACTIVITY',
                duration: 3,
                cost: '$$$',
                activityLevel: 'MEDIUM',
                indoor: false,
                timeOfDay: 'DAY',
                details: 'Bucket list experience. Champagne toast at sunrise. Unforgettable'
            },
            {
                description: 'Create a photo book or scrapbook together',
                category: 'ACTIVITY',
                duration: 3,
                cost: '$',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'ANY',
                details: 'Go through all your photos. Print favorites, write captions, laugh at memories'
            },
            {
                description: 'Private cooking class with a chef',
                category: 'ACTIVITY',
                duration: 3,
                cost: '$$$',
                activityLevel: 'MEDIUM',
                indoor: true,
                timeOfDay: 'EVENING',
                details: 'Hire a chef to teach you a special cuisine at home. Enjoy the meal you made together'
            },
            {
                description: 'Stargazing with champagne and strawberries',
                category: 'ACTIVITY',
                duration: 2,
                cost: '$$',
                activityLevel: 'LOW',
                indoor: false,
                timeOfDay: 'EVENING',
                details: 'Pack blankets, fancy treats, and a bottle of bubbly. Find a dark spot away from city lights'
            },
            {
                description: 'Concert or show of your favorite artist',
                category: 'EVENT',
                duration: 4,
                cost: '$$$',
                activityLevel: 'MEDIUM',
                indoor: true,
                timeOfDay: 'EVENING',
                details: 'Splurge on good seats. Make it extra special with dinner before'
            },
            {
                description: 'Write letters to each other about your relationship',
                category: 'ACTIVITY',
                duration: 2,
                cost: 'FREE',
                activityLevel: 'LOW',
                indoor: true,
                timeOfDay: 'ANY',
                details: 'Pour your hearts out on paper. Exchange and read them together. Save them forever'
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
