/**
 * Jar Topic Matcher
 * 
 * Matches concierge categories to relevant jar topics
 * for intelligent "Add to best matching jar" suggestions.
 */

// Mapping of concierge category types to relevant jar topics
const CATEGORY_TO_TOPIC_MAP: Record<string, string[]> = {
    // Dining concierges
    'MEAL': ['Dining', 'Food', 'Restaurants', 'Cooking', 'Date Night'],
    'RESTAURANT': ['Dining', 'Food', 'Restaurants', 'Date Night'],

    // Nightlife
    'DRINK': ['Nightlife', 'Bars', 'Drinks', 'Date Night', 'Social'],
    'BAR': ['Nightlife', 'Bars', 'Drinks', 'Social'],
    'CLUB': ['Nightlife', 'Bars', 'Drinks', 'Social'],

    // Entertainment
    'MOVIE': ['Movies', 'Entertainment', 'Date Night', 'Activities'],
    'THEATRE': ['Theatre', 'Entertainment', 'Date Night', 'Activities', 'Culture'],
    'GAME': ['Games', 'Entertainment', 'Activities', 'Social'],

    // Wellness & Fitness
    'WELLNESS': ['Wellness', 'Self-Care', 'Health', 'Relaxation'],
    'FITNESS': ['Fitness', 'Health', 'Activities', 'Wellness'],
    'SPA': ['Wellness', 'Self-Care', 'Relaxation', 'Date Night'],

    // Activities & Events
    'ACTIVITY': ['Activities', 'Entertainment', 'Adventure', 'Social'],
    'EVENT': ['Events', 'Activities', 'Social', 'Entertainment'],
    'ADVENTURE': ['Adventure', 'Activities', 'Travel', 'Outdoors'],

    // Travel & Outdoors
    'TRAVEL': ['Travel', 'Holidays', 'Adventure', 'Vacation'],
    'HOTEL': ['Travel', 'Holidays', 'Vacation'],
    'OUTDOORS': ['Outdoors', 'Adventure', 'Activities', 'Nature'],

    // Books & Reading
    'BOOK': ['Books', 'Reading', 'Entertainment', 'Self-Care'],

    // Default fallbacks
    'GENERIC': ['General', 'Activities', 'Ideas'],
};

interface JarInfo {
    id: string;
    name: string;
    topic?: string;
}

interface MatchResult {
    jar: JarInfo;
    score: number;
    reason: string;
}

/**
 * Find the best matching jar for a given category
 * @param category The concierge category (e.g., 'MEAL', 'MOVIE')
 * @param availableJars List of jars the user has access to
 * @param currentJarId The user's currently active jar ID
 * @returns The best matching jar (if different from current) or null
 */
export function findBestMatchingJar(
    category: string,
    availableJars: JarInfo[],
    currentJarId: string | null
): MatchResult | null {
    if (!availableJars || availableJars.length <= 1) {
        return null; // No alternatives available
    }

    const categoryUpper = category.toUpperCase();
    let relevantTopics = CATEGORY_TO_TOPIC_MAP[categoryUpper];

    // Keyword-based fallback if no direct category match
    if (!relevantTopics) {
        const foundCategory = Object.keys(CATEGORY_TO_TOPIC_MAP).find(key =>
            categoryUpper.includes(key) || key.includes(categoryUpper)
        );
        relevantTopics = foundCategory ? CATEGORY_TO_TOPIC_MAP[foundCategory] : CATEGORY_TO_TOPIC_MAP['GENERIC'];
    }

    let bestMatch: MatchResult | null = null;

    for (const jar of availableJars) {
        // Skip current jar
        if (jar.id === currentJarId) continue;

        const jarTopic = jar.topic?.toLowerCase() || '';
        const jarName = jar.name?.toLowerCase() || '';

        // Calculate match score
        let score = 0;
        let reason = '';

        for (let i = 0; i < relevantTopics.length; i++) {
            const topic = relevantTopics[i].toLowerCase();

            // Higher score for earlier (more relevant) topics
            const topicScore = relevantTopics.length - i;

            // Check topic match
            if (jarTopic.includes(topic)) {
                score += topicScore * 2; // Topic match is strong
                reason = `matches topic "${jar.topic}"`;
            }

            // Check name match
            if (jarName.includes(topic)) {
                score += topicScore; // Name match is weaker
                reason = reason || `name contains "${topic}"`;
            }
        }

        // Update best match if this is better
        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
            bestMatch = { jar, score, reason };
        }
    }

    return bestMatch;
}

/**
 * Generate a user-friendly suggestion message
 */
export function getSuggestionMessage(match: MatchResult, category: string): string {
    const categoryName = category.replace('_', ' ').toLowerCase();
    return `This ${categoryName} idea might fit better in your "${match.jar.name}" jar (${match.reason}). Add it there instead?`;
}
