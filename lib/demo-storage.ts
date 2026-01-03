/**
 * Demo Mode - localStorage utilities for client-side data persistence
 */

import { DEMO_IDEAS, DEMO_MEMORIES, DEMO_JAR, DEMO_USER, DEMO_LIMITS } from './demo-data';

const STORAGE_KEYS = {
    IDEAS: 'demo_ideas',
    MEMORIES: 'demo_memories',
    JAR: 'demo_jar',
    USER: 'demo_user',
    AI_COUNT: 'demo_ai_count',
    WEEKEND_COUNT: 'demo_weekend_count',
    CONCIERGE_COUNT: 'demo_concierge_count',
    LAST_SPIN: 'demo_last_spin',
};

/**
 * Initialize demo data if not exists
 */
export function initializeDemoData() {
    if (typeof window === 'undefined') return;

    // Only initialize if no data exists
    if (!localStorage.getItem(STORAGE_KEYS.IDEAS)) {
        localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(DEMO_IDEAS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEMORIES)) {
        localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(DEMO_MEMORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.JAR)) {
        localStorage.setItem(STORAGE_KEYS.JAR, JSON.stringify(DEMO_JAR));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEMO_USER));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AI_COUNT)) {
        localStorage.setItem(STORAGE_KEYS.AI_COUNT, '0');
    }
    if (!localStorage.getItem(STORAGE_KEYS.WEEKEND_COUNT)) {
        localStorage.setItem(STORAGE_KEYS.WEEKEND_COUNT, '0');
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONCIERGE_COUNT)) {
        localStorage.setItem(STORAGE_KEYS.CONCIERGE_COUNT, '0');
    }
}

/**
 * Get demo ideas
 */
export function getDemoIdeas() {
    if (typeof window === 'undefined') return DEMO_IDEAS;

    const stored = localStorage.getItem(STORAGE_KEYS.IDEAS);
    return stored ? JSON.parse(stored) : DEMO_IDEAS;
}

/**
 * Add demo idea
 */
export function addDemoIdea(idea: any) {
    if (typeof window === 'undefined') return;

    const ideas = getDemoIdeas();
    const newIdea = {
        ...idea,
        id: `demo-${Date.now()}`,
        createdAt: new Date().toISOString(),
    };

    ideas.push(newIdea);
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    return newIdea;
}

/**
 * Update demo idea
 */
export function updateDemoIdea(id: string, updates: any) {
    if (typeof window === 'undefined') return;

    const ideas = getDemoIdeas();
    const index = ideas.findIndex((i: any) => i.id === id);

    if (index !== -1) {
        ideas[index] = { ...ideas[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
        return ideas[index];
    }
}

/**
 * Delete demo idea
 */
export function deleteDemoIdea(id: string) {
    if (typeof window === 'undefined') return;

    const ideas = getDemoIdeas();
    const filtered = ideas.filter((i: any) => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(filtered));
}

/**
 * Mark idea as selected (spin result)
 */
export function selectDemoIdea(id: string) {
    if (typeof window === 'undefined') return;

    const ideas = getDemoIdeas();
    const idea = ideas.find((i: any) => i.id === id);

    if (idea) {
        const now = new Date().toISOString();
        idea.selectedAt = now;
        idea.selectedDate = now;
        localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
        localStorage.setItem(STORAGE_KEYS.LAST_SPIN, JSON.stringify(idea));
        return idea;
    }
}

/**
 * Get demo memories
 */
export function getDemoMemories() {
    if (typeof window === 'undefined') return DEMO_MEMORIES;

    const ideas = getDemoIdeas();
    const memories = ideas.filter((i: any) => i.selectedAt);
    return memories;
}

/**
 * Get AI request count
 */
export function getDemoAICount(): number {
    if (typeof window === 'undefined') return 0;

    const count = localStorage.getItem(STORAGE_KEYS.AI_COUNT);
    return count ? parseInt(count, 10) : 0;
}

/**
 * Increment AI request count
 */
export function incrementDemoAICount(): number {
    if (typeof window === 'undefined') return 0;

    const current = getDemoAICount();
    const newCount = current + 1;
    localStorage.setItem(STORAGE_KEYS.AI_COUNT, newCount.toString());
    return newCount;
}

/**
 * Check if AI limit reached
 */
export function isDemoAILimitReached(): boolean {
    return getDemoAICount() >= DEMO_LIMITS.AI_REQUESTS;
}

/**
 * Get weekend plan count
 */
export function getDemoWeekendCount(): number {
    if (typeof window === 'undefined') return 0;

    const count = localStorage.getItem(STORAGE_KEYS.WEEKEND_COUNT);
    return count ? parseInt(count, 10) : 0;
}

/**
 * Increment weekend plan count
 */
export function incrementDemoWeekendCount(): number {
    if (typeof window === 'undefined') return 0;

    const current = getDemoWeekendCount();
    const newCount = current + 1;
    localStorage.setItem(STORAGE_KEYS.WEEKEND_COUNT, newCount.toString());
    return newCount;
}

/**
 * Check if weekend plan limit reached
 */
export function isDemoWeekendLimitReached(): boolean {
    return getDemoWeekendCount() >= DEMO_LIMITS.WEEKEND_PLANS;
}

/**
 * Get concierge use count
 */
export function getDemoConciergeCount(): number {
    if (typeof window === 'undefined') return 0;

    const count = localStorage.getItem(STORAGE_KEYS.CONCIERGE_COUNT);
    return count ? parseInt(count, 10) : 0;
}

/**
 * Increment concierge use count
 */
export function incrementDemoConciergeCount(): number {
    if (typeof window === 'undefined') return 0;

    const current = getDemoConciergeCount();
    const newCount = current + 1;
    localStorage.setItem(STORAGE_KEYS.CONCIERGE_COUNT, newCount.toString());
    return newCount;
}

/**
 * Check if concierge limit reached
 */
export function isConciergeLimitReached(): boolean {
    return getDemoConciergeCount() >= DEMO_LIMITS.CONCIERGE_USES;
}

/**
 * Get demo jar
 */
export function getDemoJar() {
    if (typeof window === 'undefined') return DEMO_JAR;

    const stored = localStorage.getItem(STORAGE_KEYS.JAR);
    return stored ? JSON.parse(stored) : DEMO_JAR;
}

/**
 * Get demo user
 */
export function getDemoUser() {
    if (typeof window === 'undefined') return DEMO_USER;

    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : DEMO_USER;
}

/**
 * Get last spin result
 */
export function getLastDemoSpin() {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem(STORAGE_KEYS.LAST_SPIN);
    return stored ? JSON.parse(stored) : null;
}

/**
 * Clear all demo data
 */
export function clearDemoData() {
    if (typeof window === 'undefined') return;

    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
}

/**
 * Reset only concierge count (For testing)
 */
export function resetConciergeTrial() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.CONCIERGE_COUNT);
    window.location.reload();
}

/**
 * Export demo data for migration to real account
 */
export function exportDemoData() {
    if (typeof window === 'undefined') return null;

    return {
        ideas: getDemoIdeas(),
        jar: getDemoJar(),
        aiCount: getDemoAICount(),
        weekendCount: getDemoWeekendCount(),
    };
}

/**
 * Get demo limits
 */
export { DEMO_LIMITS } from './demo-data';

/**
 * Check if user is in demo mode
 */
export function isDemoMode(): boolean {
    if (typeof window === 'undefined') return false;

    return window.location.pathname.startsWith('/demo');
}
