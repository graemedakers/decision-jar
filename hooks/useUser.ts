"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/utils";
import { UserData } from "@/lib/types";
import { useEffect, useRef } from "react";

interface UseUserOptions {
    onLevelUp?: (newLevel: number) => void;
    redirectToLogin?: boolean;
}

// Fetcher
const fetchUserApi = async (redirectToLogin: boolean = true) => {
    const res = await fetch(`${getApiUrl('/api/auth/me')}?_=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
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
        queryKey: ['user'],
        queryFn: () => fetchUserApi(redirectToLogin),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false,
    });

    const userData = query.data;

    // Derived State (Convenience wrappers)
    const xp = userData?.xp;
    const level = userData?.level || 1;
    const achievements = userData?.unlockedAchievements || [];
    const isPremium = !!userData?.isPremium;
    const hasPaid = !!userData?.hasPaid;
    const isTrialEligible = userData?.isTrialEligible !== false;
    const coupleCreatedAt = userData?.coupleCreatedAt || "";

    // Level Up Side Effect
    useEffect(() => {
        if (level && prevLevelRef.current !== null && level > prevLevelRef.current) {
            onLevelUp?.(level);
        }
        prevLevelRef.current = level;
    }, [level, onLevelUp]);

    // Wrapper to match previous interface
    const refreshUser = () => queryClient.invalidateQueries({ queryKey: ['user'] });

    return {
        userData,
        isLoading: query.isLoading,
        isPremium,
        refreshUser,
        xp,
        level,
        achievements,
        hasPaid,
        coupleCreatedAt,
        isTrialEligible,
        error: query.error
    };
}
