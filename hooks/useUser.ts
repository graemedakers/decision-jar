"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/utils";
import { UserData } from "@/lib/types";
import { useEffect, useRef } from "react";
import { CacheKeys, createCacheInvalidator, STALE_TIME } from "@/lib/cache-utils";

interface UseUserOptions {
    onLevelUp?: (newLevel: number) => void;
    redirectToLogin?: boolean;
}

// Fetcher
const fetchUserApi = async (redirectToLogin: boolean = true) => {
    const res = await fetch(getApiUrl('/api/auth/me'), {
        credentials: 'include'
    });

    if (!res.ok) {
        if (redirectToLogin && res.status === 401) {
            window.location.href = '/api/auth/nuke-session';
            throw new Error("Redirecting...");
        }
        try {
            const err = await res.json();
            throw new Error(err.error || 'Failed to fetch user');
        } catch (e: any) {
            if (e.message !== "Redirecting...") throw new Error('Failed to fetch user');
        }
    }

    const data = await res.json();
    if (!data?.user && redirectToLogin) {
        window.location.href = '/api/auth/nuke-session';
        throw new Error("Redirecting...");
    }

    return data?.user || null;
};

export function useUser(options: UseUserOptions = {}) {
    const { onLevelUp, redirectToLogin = true } = options;
    const queryClient = useQueryClient();
    const prevLevelRef = useRef<number | null>(null);

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
        error: query.error
    };
}
