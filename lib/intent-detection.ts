/**
 * Smart Intent Detection for AI Concierge
 * Analyzes user input to automatically select the appropriate concierge skill
 */

export type ConciergeIntent =
    | 'DINING'
    | 'BAR'
    | 'BAR_CRAWL'
    | 'NIGHTCLUB'
    | 'HOTEL'
    | 'MOVIE'
    | 'BOOK'
    | 'WELLNESS'
    | 'FITNESS'
    | 'THEATRE'
    | 'GAME'
    | 'ESCAPE_ROOM'
    | 'SPORTS'
    | 'RECIPE'
    | 'CHEF'
    | 'DATE_NIGHT'
    | 'WEEKEND_EVENTS'
    | 'HOLIDAY'
    | 'YOUTUBE'
    | 'CONCIERGE'; // Generic fallback

interface IntentPattern {
    intent: ConciergeIntent;
    keywords: string[];
    phrases: string[];
}

const INTENT_PATTERNS: IntentPattern[] = [
    {
        intent: 'DINING',
        keywords: ['restaurant', 'eat out', 'takeout', 'takeaway', 'reservation', 'brunch', 'cafe', 'coffee shop', 'dining', 'eatery', 'bistro'],
        phrases: ['somewhere to eat', 'place to eat', 'grab food', 'get dinner', 'find a restaurant', 'where to eat', 'good restaurant', 'best restaurant', 'eat near', 'food near', 'dinner out', 'lunch out', 'breakfast place']
    },
    {
        intent: 'RECIPE',
        keywords: ['recipe', 'recipes', 'cook', 'cooking', 'ingredients', 'dish', 'meal prep', 'home cooking', 'bake', 'baking', 'homemade', 'make at home'],
        phrases: ['cook dinner', 'what to cook', 'recipe ideas', 'meal ideas', 'make for dinner', 'cook at home', 'meal recipes', 'recipes for', 'budget friendly meal', 'easy meal', 'quick meal', 'family meal', 'weeknight meal', 'healthy meal', 'dinner recipes', 'lunch recipes', 'breakfast recipes']
    },
    {
        intent: 'BAR',
        keywords: ['bar', 'drink', 'cocktail', 'beer', 'wine', 'pub', 'tavern', 'brewpub'],
        phrases: ['grab a drink', 'get drinks', 'go for drinks', 'have a drink']
    },
    {
        intent: 'BAR_CRAWL',
        keywords: ['crawl', 'pub crawl', 'bar hop', 'multiple bars'],
        phrases: ['bar crawl', 'pub crawl', 'hit a few bars', 'bar hopping']
    },
    {
        intent: 'NIGHTCLUB',
        keywords: ['club', 'nightclub', 'dance', 'dancing', 'dj', 'party', 'nightlife'],
        phrases: ['go dancing', 'hit the club', 'go clubbing', 'night out dancing']
    },
    {
        intent: 'HOTEL',
        keywords: ['hotel', 'stay', 'accommodation', 'resort', 'staycation', 'getaway', 'lodge'],
        phrases: ['find a hotel', 'book a stay', 'weekend getaway', 'place to stay']
    },
    {
        intent: 'MOVIE',
        keywords: ['movie', 'film', 'cinema', 'theater', 'watch', 'streaming', 'netflix'],
        phrases: ['watch a movie', 'see a film', 'movie night', 'what to watch']
    },
    {
        intent: 'BOOK',
        keywords: ['book', 'read', 'reading', 'novel', 'fiction', 'author'],
        phrases: ['book recommendation', 'what to read', 'find a book', 'reading suggestion']
    },
    {
        intent: 'WELLNESS',
        keywords: ['spa', 'massage', 'wellness', 'relaxation', 'facial', 'sauna', 'meditation'],
        phrases: ['get a massage', 'spa day', 'need to relax', 'self care']
    },
    {
        intent: 'FITNESS',
        keywords: ['gym', 'workout', 'fitness', 'exercise', 'yoga', 'pilates', 'run', 'hike', 'trail'],
        phrases: ['work out', 'go for a run', 'find a gym', 'exercise class']
    },
    {
        intent: 'THEATRE',
        keywords: ['theatre', 'theater', 'show', 'play', 'musical', 'broadway', 'performance', 'concert'],
        phrases: ['see a show', 'watch a play', 'live performance', 'theatre tickets']
    },
    {
        intent: 'GAME',
        keywords: ['game', 'video game', 'gaming', 'play', 'multiplayer', 'online'],
        phrases: ['what game', 'game to play', 'gaming session', 'play online']
    },
    {
        intent: 'ESCAPE_ROOM',
        keywords: ['escape room', 'puzzle', 'escape', 'mystery room'],
        phrases: ['escape room', 'do an escape room', 'puzzle room']
    },
    {
        intent: 'SPORTS',
        keywords: ['sports', 'match', 'game', 'basketball', 'football', 'soccer', 'tennis', 'golf'],
        phrases: ['watch the game', 'play sports', 'sports bar', 'watch sports']
    },
    {
        intent: 'CHEF',
        keywords: ['personal chef', 'private chef', 'hire chef', 'chef service', 'catering'],
        phrases: ['hire a chef', 'personal chef service', 'find a chef', 'catering for party']
    },
    {
        intent: 'DATE_NIGHT',
        keywords: ['date', 'date night', 'romantic', 'evening out', 'anniversary'],
        phrases: ['date night', 'romantic evening', 'plan a date', 'night out with']
    },
    {
        intent: 'WEEKEND_EVENTS',
        keywords: ['weekend', 'events', 'festival', 'happening', 'this weekend', 'saturday', 'sunday'],
        phrases: ['this weekend', 'weekend plans', 'what to do this weekend', 'weekend events']
    },
    {
        intent: 'HOLIDAY',
        keywords: ['trip', 'travel', 'vacation', 'holiday', 'visit', 'itinerary', 'tour'],
        phrases: ['plan a trip', 'travel to', 'vacation plans', 'holiday itinerary', 'visit']
    },
    {
        intent: 'YOUTUBE',
        keywords: ['youtube', 'video', 'watch', 'video clip', 'tutorial', 'stream'],
        phrases: ['youtube video', 'watch a video', 'find videos about', 'see it on youtube']
    }
];

/**
 * Detects the user's intent from their message
 * @param message User's input message
 * @returns The detected intent or 'CONCIERGE' as fallback
 */
export function detectIntent(message: string): ConciergeIntent {
    if (!message || message.trim().length === 0) {
        return 'CONCIERGE';
    }

    const lowerMessage = message.toLowerCase().trim();

    // First, check for phrase matches (more specific)
    for (const pattern of INTENT_PATTERNS) {
        for (const phrase of pattern.phrases) {
            if (lowerMessage.includes(phrase)) {
                return pattern.intent;
            }
        }
    }

    // Then check for keyword matches
    const scores: Record<ConciergeIntent, number> = {} as any;

    for (const pattern of INTENT_PATTERNS) {
        let score = 0;
        for (const keyword of pattern.keywords) {
            if (lowerMessage.includes(keyword)) {
                score++;
            }
        }
        if (score > 0) {
            scores[pattern.intent] = score;
        }
    }

    // Return the intent with the highest score
    const sortedIntents = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    if (sortedIntents.length > 0 && sortedIntents[0][1] > 0) {
        return sortedIntents[0][0] as ConciergeIntent;
    }

    // Default to generic concierge
    return 'CONCIERGE';
}

/**
 * Gets a confidence score for the detected intent (0-1)
 */
export function getIntentConfidence(message: string, intent: ConciergeIntent): number {
    const lowerMessage = message.toLowerCase().trim();
    const pattern = INTENT_PATTERNS.find(p => p.intent === intent);

    if (!pattern) return 0;

    let matchCount = 0;
    let totalPossible = pattern.keywords.length + pattern.phrases.length;

    // Check phrases (worth more)
    for (const phrase of pattern.phrases) {
        if (lowerMessage.includes(phrase)) {
            matchCount += 2;
        }
    }

    // Check keywords
    for (const keyword of pattern.keywords) {
        if (lowerMessage.includes(keyword)) {
            matchCount += 1;
        }
    }

    return Math.min(matchCount / totalPossible, 1);
}

/**
 * Suggests follow-up questions based on detected intent
 */
export function getSuggestedQuestions(intent: ConciergeIntent): string[] {
    const suggestions: Record<ConciergeIntent, string[]> = {
        DINING: [
            "What cuisine are you in the mood for?",
            "What's your budget?",
            "Casual or upscale?",
            "Indoor or outdoor seating?"
        ],
        BAR: [
            "Cocktails, beer, or wine?",
            "Casual pub or upscale lounge?",
            "Looking for live music?",
            "Rooftop or cozy indoor?"
        ],
        BAR_CRAWL: [
            "How many stops?",
            "What's the theme?",
            "Chill or party vibe?",
            "Which neighborhood?"
        ],
        MOVIE: [
            "Cinema or streaming?",
            "What genre?",
            "Current mood?",
            "Solo or with someone?"
        ],
        HOLIDAY: [
            "Where are you thinking of going?",
            "How many days?",
            "What's your travel style?",
            "Budget range?"
        ],
        WEEKEND_EVENTS: [
            "Friday night, Saturday, or Sunday?",
            "Active or relaxing?",
            "Solo, partner, or group?",
            "Indoor or outdoor?"
        ],
        // ... can add more
        CONCIERGE: [
            "What kind of activity?",
            "What's the occasion?",
            "Who are you with?",
            "What's your budget?"
        ]
    } as any;

    return suggestions[intent] || suggestions.CONCIERGE;
}
