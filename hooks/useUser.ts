"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/utils";
import { UserData } from "@/lib/types";
import { useEffect, useRef } from "react";
import { CacheKeys, createCacheInvalidator, STALE_TIME } from "@/lib/cache-utils";

interface UseUserOptions {
    onLevelUp?: (newLevel: number) => void;
    onAchievementUnlocked?: (achievementId: string) => void;
    redirectToLogin?: boolean;
}

// ✅ CRITICAL: Global flag to prevent multiple redirects and further queries
let isRedirecting = false;

// ✅ Export function to check redirect status
export function isUserRedirecting() {
    return isRedirecting;
}

// Fetcher
const fetchUserApi = async (redirectToLogin: boolean = true) => {
    // ✅ If already redirecting, immediately throw to prevent further requests
    if (isRedirecting) {
        const error: any = new Error("Redirect in progress");
        error.status = 401;
        throw error;
    }

    const res = await fetch(getApiUrl('/api/auth/me'), {
        credentials: 'include'
    });

    if (!res.ok) {
        if (redirectToLogin && res.status === 401 && !isRedirecting) {
            console.warn('[useUser] User session invalid (401), nuking session and redirecting to login');
            isRedirecting = true; // ✅ Set flag BEFORE redirect
            // ✅ Use replace() to prevent back button issues
            window.location.replace('/api/auth/nuke-session?target=/');
            // Throw error with status to prevent React Query retry
            const error: any = new Error("Redirecting to login...");
            error.status = 401;
            throw error;
        }
        try {
            const err = await res.json();
            const error: any = new Error(err.error || 'Failed to fetch user');
            error.status = res.status;
            throw error;
        } catch (e: any) {
            if (e.message === "Redirecting to login...") throw e;
            const error: any = new Error('Failed to fetch user');
            error.status = res.status;
            throw error;
        }
    }

    const data = await res.json();

    // ✅ CRITICAL: If user is null (deleted but session exists), treat as 401
    if (!data?.user && redirectToLogin && !isRedirecting) {
        console.warn('[useUser] User data is null despite valid session, nuking session and redirecting');
        isRedirecting = true; // ✅ Set flag BEFORE redirect
        // ✅ Use replace() to prevent back button issues
        window.location.replace('/api/auth/nuke-session?target=/');
        const error: any = new Error("User deleted, redirecting...");
        error.status = 401;
        throw error;
    }

    return data?.user || null;
};

export function useUser(options: UseUserOptions = {}) {
    const { onLevelUp, onAchievementUnlocked, redirectToLogin = true } = options;
    const queryClient = useQueryClient();
    const prevLevelRef = useRef<number | null>(null);
    const prevAchievementsRef = useRef<string[]>([]);

    const query = useQuery({
        queryKey: CacheKeys.user(),
        queryFn: () => fetchUserApi(redirectToLogin),
        staleTime: STALE_TIME.USER,
        retry: false,
    });

    const userData = query.data;

    // Derived State (Convenience wrappers)
    const xp = userData?.xp;
    const level = userData?.level;
    const achievements = userData?.unlockedAchievements || [];
    const isPremium = !!userData?.isPremium;
    const hasPaid = !!userData?.hasPaid;
    const isTrialEligible = userData?.isTrialEligible !== false;
    const coupleCreatedAt = userData?.coupleCreatedAt || "";
    const currentStreak = userData?.currentStreak || 0;
    const longestStreak = userData?.longestStreak || 0;

    // Level Up Side Effect
    useEffect(() => {
        if (typeof level === 'number' && userData?.activeJarId) {
            const jarId = userData.activeJarId;
            const storageKey = `level_shown_${jarId}`;

            // Get last shown level for this jar from localStorage
            const lastShownLevel = parseInt(localStorage.getItem(storageKey) || '0', 10);

            // Only show level up modal if:
            // 1. Previous ref level exists (not first load) AND
            // 2. New level is higher than previous ref level AND
            // 3. Haven't shown this level for this jar yet
            if (prevLevelRef.current !== null &&
                level > prevLevelRef.current &&
                level > lastShownLevel) {
                // Show modal
                onLevelUp?.(level);
                // Remember we showed this level for this jar
                localStorage.setItem(storageKey, level.toString());
            }

            prevLevelRef.current = level;
        }
    }, [level, onLevelUp, userData?.activeJarId]);

    // Achievement Unlock Side Effect
    useEffect(() => {
        if (achievements && achievements.length > 0 && userData?.activeJarId) {
            // Check for newly unlocked achievements
            const newAchievements = achievements.filter(
                (id: string) => !prevAchievementsRef.current.includes(id)
            );

            // Only fire callback for new achievements (not on first load)
            if (prevAchievementsRef.current.length > 0 && newAchievements.length > 0) {
                newAchievements.forEach((achievementId: string) => {
                    onAchievementUnlocked?.(achievementId);
                });
            }


            // ✅ CRITICAL FIX: Only update ref if we have MORE achievements than before.
            // This prevents "downgrading" the ref if stale cache data arrives with fewer achievements,
            // which would then trigger a false "new achievement" celebration when fresh data arrives.
            if (achievements.length >= prevAchievementsRef.current.length) {
                prevAchievementsRef.current = [...achievements];
            }
        }
    }, [achievements, onAchievementUnlocked, userData?.activeJarId]);

    // Use centralized cache invalidator
    const cache = createCacheInvalidator(queryClient);
    const refreshUser = () => cache.invalidateUser();

    return {
        userData,
        isLoading: query.isLoading,
        isPremium,
        refreshUser,
        xp,
        level: level || 1,
        achievements,
        hasPaid,
        coupleCreatedAt,
        isTrialEligible,
        currentStreak,
        longestStreak,
        error: query.error
    };
}
