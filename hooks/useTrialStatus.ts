"use client";

import { useMemo, useEffect, useState } from "react";
import { UserData } from "@/lib/types";

interface TrialStatus {
    /** Whether the user is currently in their trial period */
    isInTrial: boolean;
    /** Whether the trial has expired (past 14 days, not paid) */
    isTrialExpired: boolean;
    /** Days remaining in trial (0 if expired) */
    daysRemaining: number;
    /** Days since trial started */
    daysSinceStart: number;
    /** Whether to show the trial expired modal */
    shouldShowTrialModal: boolean;
    /** Dismiss the trial modal (stores in localStorage) */
    dismissTrialModal: () => void;
    /** Whether user has permanently dismissed (clicked "Continue Free") */
    hasPermanentlyDismissed: boolean;
}

const TRIAL_DURATION_DAYS = 14;
const TRIAL_MODAL_DISMISSED_KEY = 'trial_modal_dismissed_at';
const TRIAL_MODAL_SNOOZE_KEY = 'trial_modal_snoozed_until';

/**
 * Hook to manage trial status and expiry modal visibility
 */
export function useTrialStatus(userData: UserData | null | undefined): TrialStatus {
    const [hasDismissed, setHasDismissed] = useState(false);
    const [isSnoozed, setIsSnoozed] = useState(false);

    // Check localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        // Check permanent dismissal
        const dismissedAt = localStorage.getItem(TRIAL_MODAL_DISMISSED_KEY);
        if (dismissedAt) {
            setHasDismissed(true);
        }

        // Check temporary snooze (24 hours)
        const snoozedUntil = localStorage.getItem(TRIAL_MODAL_SNOOZE_KEY);
        if (snoozedUntil) {
            const snoozeExpiry = new Date(snoozedUntil);
            if (new Date() < snoozeExpiry) {
                setIsSnoozed(true);
            } else {
                // Snooze expired, remove it
                localStorage.removeItem(TRIAL_MODAL_SNOOZE_KEY);
            }
        }
    }, []);

    const trialStatus = useMemo(() => {
        // Default state for loading/no user
        if (!userData) {
            return {
                isInTrial: false,
                isTrialExpired: false,
                daysRemaining: 0,
                daysSinceStart: 0,
            };
        }

        // If user is premium (any method: paid, lifetime, trial, gifted), no modal needed
        if (userData.isPremium || userData.hasPaid || userData.isLifetimePro) {
            return {
                isInTrial: false,
                isTrialExpired: false,
                daysRemaining: 0,
                daysSinceStart: 0,
            };
        }

        // Calculate trial dates
        const createdAt = new Date(userData.createdAt);
        const now = new Date();
        const daysSinceStart = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, TRIAL_DURATION_DAYS - daysSinceStart);
        
        const isInTrial = daysSinceStart < TRIAL_DURATION_DAYS;
        const isTrialExpired = daysSinceStart >= TRIAL_DURATION_DAYS;

        return {
            isInTrial,
            isTrialExpired,
            daysRemaining,
            daysSinceStart,
        };
    }, [userData]);

    const dismissTrialModal = () => {
        // Permanent dismissal - user clicked "Continue with Free"
        localStorage.setItem(TRIAL_MODAL_DISMISSED_KEY, new Date().toISOString());
        setHasDismissed(true);
    };

    const snoozeTrialModal = () => {
        // Temporary snooze - remind again in 24 hours
        const snoozeUntil = new Date();
        snoozeUntil.setHours(snoozeUntil.getHours() + 24);
        localStorage.setItem(TRIAL_MODAL_SNOOZE_KEY, snoozeUntil.toISOString());
        setIsSnoozed(true);
    };

    // Should show modal if:
    // 1. Trial has expired
    // 2. User hasn't permanently dismissed
    // 3. User isn't currently snoozed
    const shouldShowTrialModal = trialStatus.isTrialExpired && !hasDismissed && !isSnoozed;

    return {
        ...trialStatus,
        shouldShowTrialModal,
        dismissTrialModal,
        hasPermanentlyDismissed: hasDismissed,
    };
}

/**
 * Get usage stats for personalization in the trial modal
 */
export async function fetchTrialUsageStats(): Promise<{
    conciergeUses: number;
    ideasCreated: number;
    daysActive: number;
}> {
    try {
        const res = await fetch('/api/user/trial-stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        return await res.json();
    } catch (error) {
        // Return defaults if API fails
        return {
            conciergeUses: 0,
            ideasCreated: 0,
            daysActive: 0,
        };
    }
}
