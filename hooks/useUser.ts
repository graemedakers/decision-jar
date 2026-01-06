"use client";

import { useState, useCallback, useEffect } from "react";
import { getApiUrl } from "@/lib/utils";
import { UserData } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";

interface UseUserOptions {
    onLevelUp?: (newLevel: number) => void;
    redirectToLogin?: boolean;
}

export function useUser(options: UseUserOptions = {}) {
    const { onLevelUp, redirectToLogin = true } = options;
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(false);

    // Derived state often needed
    const [xp, setXp] = useState<number | undefined>(undefined);
    const [level, setLevel] = useState<number>(1);
    const [achievements, setAchievements] = useState<string[]>([]);
    const [hasPaid, setHasPaid] = useState(false);
    const [isTrialEligible, setIsTrialEligible] = useState(true);
    const [coupleCreatedAt, setCoupleCreatedAt] = useState<string>("");

    // Optimistic loading from cache
    useEffect(() => {
        try {
            const cachedXp = localStorage.getItem('datejar_xp');
            const cachedLevel = localStorage.getItem('datejar_user_level');
            const cachedAch = localStorage.getItem('datejar_achievements');
            const cachedPremium = localStorage.getItem('datejar_is_premium');

            if (cachedXp) setXp(parseInt(cachedXp, 10));
            if (cachedLevel) setLevel(parseInt(cachedLevel, 10));
            if (cachedAch) setAchievements(JSON.parse(cachedAch));
            if (cachedPremium) setIsPremium(cachedPremium === 'true');
        } catch (e) {
            // Ignore cache errors
        }
    }, []);

    const refreshUser = useCallback(async () => {
        // Don't set loading true here if we want background refresh, 
        // but for initial load it might be handled.
        // We'll rely on initial isLoading=true and set it false after first fetch.

        try {
            const res = await fetch(`${getApiUrl('/api/auth/me')}?_=${Date.now()}`, {
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
                credentials: 'include'
            });

            if (!res.ok) {
                if (res.status === 401 && redirectToLogin) {
                    console.warn("Invalid session. Redirecting to login.");
                    window.location.href = '/';
                }
                throw new Error('Failed to fetch user');
            }

            const data = await res.json();

            if (data?.user) {
                setUserData(data.user);

                // Update Cache
                if (data.user.location) {
                    localStorage.setItem('datejar_user_location', data.user.location);
                }

                const userIsPremium = !!data.user.isPremium;
                setIsPremium(userIsPremium);
                localStorage.setItem('datejar_is_premium', userIsPremium.toString());

                setHasPaid(!!data.user.hasPaid);
                setCoupleCreatedAt(data.user.coupleCreatedAt);
                setIsTrialEligible(data.user.isTrialEligible !== false);

                // Gamification Updates
                if (data.user.xp !== undefined) {
                    setXp(data.user.xp);
                    localStorage.setItem('datejar_xp', data.user.xp.toString());
                }

                if (data.user.unlockedAchievements) {
                    setAchievements(data.user.unlockedAchievements);
                    localStorage.setItem('datejar_achievements', JSON.stringify(data.user.unlockedAchievements));
                }

                if (data.user.level !== undefined) {
                    const newLevel = data.user.level;
                    // Logic to detect level up
                    const storedLevelStr = localStorage.getItem('datejar_user_level');
                    let storedLevel = storedLevelStr ? parseInt(storedLevelStr, 10) : 1;

                    // If no stored level, assume it's the current one (first load) needed to sync
                    if (!storedLevelStr) {
                        storedLevel = newLevel;
                        localStorage.setItem('datejar_user_level', newLevel.toString());
                    }

                    if (newLevel > storedLevel) {
                        // LEVEL UP DETECTED
                        if (onLevelUp) onLevelUp(newLevel);
                        // We do NOT update localStorage here; typically wait for modal close,
                        // BUT since the callback handles the modal, we might want to let the caller handle persistence 
                        // or we assume the modal's close handler will update it?
                        // Actually, the original logic didn't update localStorage until... wait.
                        // Original: "Don't update localStorage here - wait for modal close"
                        // So we should NOT update it yet.
                    } else if (newLevel !== storedLevel) {
                        // Sync if different (e.g. decreased or synced from another device without level up event locally needed?)
                        localStorage.setItem('datejar_user_level', newLevel.toString());
                    }

                    setLevel(newLevel);
                }

            }
        } catch (err) {
            console.error("Error fetching user:", err);
        } finally {
            setIsLoading(false);
        }
    }, [redirectToLogin, onLevelUp]);

    // Initial fetch
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    return {
        userData,
        isLoading,
        isPremium,
        refreshUser,
        xp,
        level,
        achievements,
        hasPaid,
        coupleCreatedAt,
        isTrialEligible
    };
}
