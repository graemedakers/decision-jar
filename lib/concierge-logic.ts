export interface ConciergeSuggestion {
    id: string;
    name: string;
    description: string;
}

export const getSuggestedConcierge = (jarTopic?: string | null, jarName?: string | null): ConciergeSuggestion => {
    const topicLower = (jarTopic || "").toLowerCase();
    const nameLower = (jarName || "").toLowerCase();
    const combined = `${topicLower} ${nameLower}`.trim();

    // 1. HIGHEST PRIORITY: Explicit Topic Matches
    if (topicLower.includes('movie') || topicLower.includes('film') || topicLower.includes('cinema')) {
        return { id: 'MOVIE', name: 'Movie Scout', description: 'Browse current films and streaming picks' };
    }
    if (topicLower.includes('restaurant') || topicLower === 'dining' || topicLower === 'meals' || topicLower === 'food') {
        return { id: 'DINING', name: 'Dining Concierge', description: 'Find the best places to eat nearby' };
    }
    if (topicLower.includes('bar') || topicLower.includes('drink') || topicLower === 'nightlife') {
        return { id: 'BAR', name: 'Bar Scout', description: 'Find bars, pubs, and lounges nearby' };
    }
    if (topicLower.includes('club') || topicLower.includes('party')) {
        return { id: 'NIGHTCLUB', name: 'Nightlife Navigator', description: 'Find the best clubs and parties' };
    }
    if (topicLower.includes('wellness') || topicLower.includes('spa') || topicLower.includes('massage')) {
        return { id: 'WELLNESS', name: 'Wellness & Spa', description: 'Relax and recharge with local treatments' };
    }
    if (topicLower.includes('fitness') || topicLower.includes('gym') || topicLower.includes('workout')) {
        return { id: 'FITNESS', name: 'Fitness Finder', description: 'Find a workout or sporting activity' };
    }
    if (topicLower.includes('travel') || topicLower.includes('trip') || topicLower.includes('hotel')) {
        return { id: 'HOTEL', name: 'Staycation Finder', description: 'Find the perfect hotel for a getaway' };
    }
    if (topicLower.includes('theatre') || topicLower.includes('art') || topicLower.includes('museum')) {
        return { id: 'THEATRE', name: 'Theatre & Arts', description: 'Discover shows and exhibitions' };
    }

    // 2. Keyword matching on COMBINED text (Lower Priority)
    if (combined.includes('movie') || combined.includes('film') || combined.includes('cinema') || combined.includes('watch') || combined.includes('tv')) {
        return { id: 'MOVIE', name: 'Movie Scout', description: 'Browse current films and streaming picks' };
    }
    if (combined.includes('nightclub') || combined.includes('nightlife') || combined.includes('party') || combined.includes('clubbing')) {
        return { id: 'NIGHTCLUB', name: 'Nightlife Navigator', description: 'Find the best clubs and parties' };
    }
    if (combined.includes('wellness') || combined.includes('spa') || combined.includes('relax') || combined.includes('massage')) {
        return { id: 'WELLNESS', name: 'Wellness & Spa', description: 'Relax and recharge with local treatments' };
    }
    if (combined.includes('fitness') || combined.includes('gym') || combined.includes('workout') || combined.includes('sport') || combined.includes('exercise')) {
        return { id: 'FITNESS', name: 'Fitness Finder', description: 'Find a workout or sporting activity' };
    }
    if (combined.includes('travel') || combined.includes('trip') || combined.includes('hotel') || combined.includes('getaway') || combined.includes('staycation')) {
        return { id: 'HOTEL', name: 'Staycation Finder', description: 'Find the perfect hotel for a getaway' };
    }
    if (combined.includes('book') || combined.includes('read') || combined.includes('novel') || combined.includes('library')) {
        return { id: 'BOOK', name: 'Book Scout', description: 'Get curated reading recommendations' };
    }
    if (combined.includes('game') || combined.includes('play') || combined.includes('boardgame') || combined.includes('gaming')) {
        return { id: 'GAME', name: 'Game Scout', description: 'Find games for your group or solo play' };
    }
    if (combined.includes('activity') || combined.includes('adventure') || combined.includes('escape') || combined.includes('mystery') || combined.includes('fun')) {
        return { id: 'ESCAPE_ROOM', name: 'Activity Scout', description: 'Discover fun local activities and adventures' };
    }
    if (combined.includes('theatre') || combined.includes('show') || combined.includes('concert') || combined.includes('art')) {
        return { id: 'THEATRE', name: 'Theatre & Arts', description: 'Discover shows and exhibitions' };
    }

    // 3. Date / Romantic (Lowest priority keyword match)
    if (combined.includes('date') || combined.includes('romantic') || combined.includes('couple') || combined.includes('anniversary')) {
        return { id: 'DINING', name: 'Dining Concierge', description: 'Find romantic restaurants and spots near you' };
    }
    if (combined.includes('food') || combined.includes('restaurant') || combined.includes('eat') || combined.includes('dinner') || combined.includes('lunch') || combined.includes('cuisine')) {
        return { id: 'DINING', name: 'Dining Concierge', description: 'Find the best places to eat nearby' };
    }
    if (combined.includes('drink') || combined.includes('bar') || combined.includes('pub') || combined.includes('wine') || combined.includes('cocktail') || combined.includes('brewery')) {
        return { id: 'BAR', name: 'Bar Scout', description: 'Find bars, pubs, and lounges nearby' };
    }

    return { id: 'CONCIERGE', name: 'AI Concierge', description: 'Get smart ideas tailored to your location' };
};
