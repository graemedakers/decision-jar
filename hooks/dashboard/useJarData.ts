import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { useIdeas } from "@/hooks/useIdeas";
import { useFavorites } from "@/hooks/useFavorites";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { usePWAHandler } from "@/hooks/features/usePWAHandler";
import { useUrlSync } from "@/hooks/features/useUrlSync";
import { showAchievementToast } from "@/components/Gamification/AchievementToast";
import { ACHIEVEMENTS } from "@/lib/achievements-shared";

export interface DashboardData {
    userData: any;
    isLoadingUser: boolean;
    isPremium: boolean;
    refreshUser: () => Promise<void>;
    xp: number;
    level: number;
    achievements: string[];
    hasPaid: boolean;
    coupleCreatedAt: string;
    isTrialEligible: boolean;
    currentStreak: number;
    longestStreak: number;
    ideas: any[];
    isLoadingIdeas: boolean;
    isFetchingIdeas: boolean;
    fetchIdeas: () => Promise<any>;
    favoritesCount: number;
    fetchFavorites: () => Promise<void>;
    aiUsage: {
        remaining: number | null;
        dailyLimit: number | null;
        isPro: boolean;
    };
    fetchAIUsage: () => Promise<void>;
    shouldShowTrialModal: boolean;
    dismissTrialModal: () => void;
    inviteCode: string | null;
    handleContentUpdate: () => void;
}

import { ModalType } from "@/components/ModalProvider";

export function useJarData(openModal: (type: ModalType, props?: any) => void): DashboardData {
    // 1. User Data & Gamification
    const {
        userData,
        isLoading: isLoadingUser,
        isPremium,
        refreshUser,
        xp,
        level,
        achievements,
        hasPaid,
        coupleCreatedAt,
        isTrialEligible,
        currentStreak,
        longestStreak
    } = useUser({
        onLevelUp: (newLevel) => openModal('LEVEL_UP', { level: newLevel }),
        onAchievementUnlocked: (achievementId) => {
            const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
            if (achievement) {
                showAchievementToast(achievement);
            }
        }
    });

    // 2. Ideas & Favorites
    const { ideas, isLoading: isLoadingIdeas, isFetching: isFetchingIdeas, fetchIdeas } = useIdeas();
    const { favoritesCount, fetchFavorites } = useFavorites();

    const handleContentUpdate = useCallback(() => {
        fetchIdeas();
        refreshUser();
    }, [fetchIdeas, refreshUser]);

    // 3. Side Effects: PWA & URL Sync
    usePWAHandler({
        userData,
        isLoadingUser,
        isPremium,
        refreshUser
    });

    useUrlSync({
        userData,
        onJarSwitched: handleContentUpdate
    });

    // 4. AI Usage Stats
    const [aiUsage, setAiUsage] = useState<{
        remaining: number | null;
        dailyLimit: number | null;
        isPro: boolean;
    }>({
        remaining: null,
        dailyLimit: null,
        isPro: false
    });

    const fetchAIUsage = useCallback(async () => {
        try {
            const res = await fetch('/api/user/ai-usage');
            if (res.ok) {
                const data = await res.json();
                setAiUsage({
                    remaining: data.remaining,
                    dailyLimit: data.dailyLimit,
                    isPro: data.isPro || false
                });
            }
        } catch (error) {
            console.error('Failed to fetch AI usage:', error);
        }
    }, []);

    useEffect(() => {
        fetchAIUsage();
    }, [fetchAIUsage]);

    // 5. Trial Status
    const { shouldShowTrialModal, dismissTrialModal } = useTrialStatus(userData);

    return {
        userData, isLoadingUser, isPremium, refreshUser,
        xp, level, achievements, hasPaid, coupleCreatedAt, isTrialEligible,
        currentStreak, longestStreak,
        ideas, isLoadingIdeas, isFetchingIdeas, fetchIdeas,
        favoritesCount, fetchFavorites,
        aiUsage, fetchAIUsage,
        shouldShowTrialModal, dismissTrialModal,
        inviteCode: userData?.coupleReferenceCode || userData?.referenceCode || userData?.jarReferenceCode || null,
        handleContentUpdate
    };
}
