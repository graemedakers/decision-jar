
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useModalSystem } from "@/components/ModalProvider";
import { useUser } from "@/hooks/useUser";
import { useIdeas } from "@/hooks/useIdeas";
import { useFavorites } from "@/hooks/useFavorites";
import { trackEvent } from "@/lib/analytics";
import { triggerHaptic } from "@/lib/feedback";
import { signOut } from "next-auth/react";
import { getApiUrl } from "@/lib/utils";
import { showSuccess, showError } from "@/lib/toast";

// Feature Hooks
import { useSpin } from "@/hooks/features/useSpin";
import { usePWAHandler } from "@/hooks/features/usePWAHandler";
import { useUrlSync } from "@/hooks/features/useUrlSync";
import { useOnboarding } from "@/hooks/features/useOnboarding";
import { useIdeaMutations } from "@/hooks/mutations/useIdeaMutations";
import { useSquadMode } from "@/hooks/features/useSquadMode";

export function useDashboardLogic() {
    const { openModal } = useModalSystem();
    const router = useRouter();
    const searchParams = useSearchParams();

    // 1. Data Hooks
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
        isTrialEligible
    } = useUser({
        onLevelUp: (newLevel) => openModal('LEVEL_UP', { level: newLevel })
    });

    const { ideas, isLoading: isLoadingIdeas, fetchIdeas } = useIdeas();
    const { favoritesCount, fetchFavorites } = useFavorites();
    const { deleteIdea } = useIdeaMutations();

    // 2. Local State
    const [userLocation, setUserLocation] = useState<string | null>(null);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);

    const handleContentUpdate = () => {
        fetchIdeas();
        refreshUser();
    };

    // 3. Feature Composition
    const {
        isSpinning,
        handleSpinJar: _internalSpin,
        handleExternalSpinStart,
        handleExternalSpinComplete
    } = useSpin({
        ideas,
        onSpinComplete: handleContentUpdate
    });

    const { broadcastSpinStart, broadcastSpinResult } = useSquadMode(
        userData?.activeJarId,
        handleExternalSpinStart,
        handleExternalSpinComplete
    );

    const handleSpinJar = async (filters: any = {}) => {
        await _internalSpin(filters, {
            onBroadcastStart: broadcastSpinStart,
            onBroadcastResult: broadcastSpinResult
        });
    };

    const { showOnboarding, setShowOnboarding, handleCompleteOnboarding, handleSkipOnboarding } = useOnboarding({
        userData,
        isLoadingUser
    });

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

    // 4. Remaining Effects
    // Data Sync
    useEffect(() => {
        if (userData) {
            if (userData.location) setUserLocation(userData.location);
            if (userData.coupleReferenceCode) setInviteCode(userData.coupleReferenceCode);
        }
    }, [userData]);

    // Premium Tip Check
    useEffect(() => {
        const success = searchParams?.get('success');
        const hasSeenTip = localStorage.getItem('premium_shortcuts_tip_seen');

        if (success === 'true' && !hasSeenTip && isPremium && !isLoadingUser) {
            openModal('PREMIUM_WELCOME_TIP', { showPremiumTip: true });
            trackEvent('premium_shortcuts_tip_shown', { trigger: 'post_upgrade' });
        }
    }, [searchParams, isPremium, isLoadingUser, openModal]);

    // Stripe Success
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const success = params.get('success');
        const sessionId = params.get('session_id');

        if (success && sessionId && refreshUser) {
            triggerHaptic(50);
            setShowConfetti(true);
            window.history.replaceState({}, '', window.location.pathname);
            refreshUser();
        }
    }, [refreshUser]);

    // Deep Linking: Open Idea
    useEffect(() => {
        const ideaId = searchParams?.get('ideaId');
        if (ideaId && !isLoadingIdeas && ideas.length > 0) {
            const targetIdea = ideas.find((i: any) => i.id === ideaId);
            if (targetIdea) {
                openModal('DATE_REVEAL', { idea: targetIdea, isViewOnly: true });
                // Clean URL
                const newParams = new URLSearchParams(searchParams.toString());
                newParams.delete('ideaId');
                window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`);
            }
        }
    }, [searchParams, isLoadingIdeas, ideas, openModal]);

    // 5. Handlers
    const handleLogout = async () => {
        await signOut({ redirect: false });
        await fetch(getApiUrl('/api/auth/logout'), { method: 'POST' });
        window.location.href = '/';
    };

    const handleDeleteClick = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        openModal('DELETE_CONFIRM', {
            onConfirm: async () => {
                try {
                    await deleteIdea.mutateAsync(id);
                    showSuccess("Idea deleted");
                } catch (error: any) {
                    // Error handled by mutation hook
                }
            }
        });
    };

    const handleDuplicate = (idea: any, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const { id, selectedAt, selectedDate, createdBy, createdAt, updatedAt, ...ideaData } = idea;
        openModal('ADD_IDEA', { initialData: ideaData });
    };

    const handleQuizComplete = async (preferences: any) => {
        try {
            const response = await fetch('/api/ideas/bulk-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    preferences,
                    jarId: userData?.activeJarId
                })
            });

            const data = await response.json();

            if (data.success) {
                setShowQuiz(false);
                await fetchIdeas();
                await refreshUser();
                showSuccess(`🎉 ${data.count} ideas generated successfully!`);
            } else {
                showError('Failed to generate ideas. Please try again.');
            }
        } catch (error) {
            console.error('Quiz completion error:', error);
            showError('An error occurred.');
        }
    };

    return {
        // State
        userData, isLoadingUser, isPremium, xp, level, achievements, hasPaid, coupleCreatedAt, isTrialEligible,
        ideas, isLoadingIdeas,
        favoritesCount,
        isSpinning, userLocation, inviteCode, showConfetti, showOnboarding, showQuiz,

        // State Setters
        setShowConfetti, setShowOnboarding, setShowQuiz, setUserLocation,

        // Handlers
        refreshUser,
        fetchIdeas,
        fetchFavorites,
        handleContentUpdate,
        handleCompleteOnboarding,
        handleSkipOnboarding,
        handleLogout,
        handleSpinJar,
        handleDeleteClick,
        handleDuplicate,
        handleQuizComplete,
        handleAddIdeaClick: () => openModal('ADD_IDEA'),

        // Utils
        openModal
    };
}
