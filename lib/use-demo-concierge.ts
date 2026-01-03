/**
 * Demo Mode Concierge Hook
 * Allows demo users to try ONE premium concierge tool
 */

import { isDemoMode, getDemoConciergeCount, incrementDemoConciergeCount, isConciergeLimitReached } from './demo-storage';

export interface DemoConciergeResult {
    canTry: boolean;
    hasUsedTrial: boolean;
    triesRemaining: number;
    onUse: () => void;
}

/**
 * Hook to manage demo concierge trial
 * Call this in concierge modals to check if demo user can access
 */
export function useDemoConcierge(): DemoConciergeResult | null {
    // Only relevant in demo mode
    if (!isDemoMode()) {
        return null;
    }

    const used = getDemoConciergeCount();
    const limitReached = isConciergeLimitReached();

    return {
        canTry: !limitReached,
        hasUsedTrial: used > 0,
        triesRemaining: Math.max(0, 1 - used),
        onUse: () => {
            if (!limitReached) {
                incrementDemoConciergeCount();
            }
        },
    };
}

/**
 * Simple function to check if concierge should be accessible
 * Use this in dashboard to show/hide concierge buttons
 */
export function canAccessConcierge(isPremium: boolean): boolean {
    // Premium users always have access
    if (isPremium) return true;

    // Demo users get one free trial
    if (isDemoMode()) {
        return !isConciergeLimitReached();
    }

    // Free users no access
    return false;
}
