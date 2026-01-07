
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useModalSystem } from "@/components/ModalProvider";
import { useUser } from "@/hooks/useUser";
import { useIdeas } from "@/hooks/useIdeas";
import { useFavorites } from "@/hooks/useFavorites";
import { trackEvent } from "@/lib/analytics";
import { SoundEffects, triggerHaptic } from "@/lib/feedback";
import { spinJar } from "@/app/actions/spin";
import { deleteIdea } from "@/app/actions/ideas";
import { signOut } from "next-auth/react";
import { getApiUrl } from "@/lib/utils";

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

    // 2. Local State
    const [isSpinning, setIsSpinning] = useState(false);
    const [userLocation, setUserLocation] = useState<string | null>(null);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);

    // 3. Effects

    // Onboarding Check
    useEffect(() => {
        const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
        if (!hasCompletedOnboarding && !isLoadingUser && userData) {
            setTimeout(() => setShowOnboarding(true), 1000);
        }
    }, [isLoadingUser, userData]);

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

    // PWA Shortcuts
    useEffect(() => {
        const tool = searchParams?.get('tool');
        if (!tool) return;

        trackEvent('pwa_shortcut_used', { tool, from_home_screen: true });

        const checkAndOpenTool = async () => {
            if (isLoadingUser || !userData) {
                setTimeout(checkAndOpenTool, 100);
                return;
            }

            if (!isPremium) {
                trackEvent('pwa_shortcut_blocked', { tool, reason: 'requires_premium' });
                openModal('PREMIUM');
                return;
            }

            // Auto-select jar if strictly necessary (Legacy logic preserved)
            if (!userData.activeJarId && userData.memberships && userData.memberships.length > 0) {
                const firstJar = userData.memberships[0];
                try {
                    await fetch('/api/jar/set-active', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ jarId: firstJar.jarId }),
                    });
                    trackEvent('pwa_shortcut_jar_auto_selected', { tool, jarId: firstJar.jarId });
                    refreshUser();
                } catch (error) {
                    console.error('Failed to auto-select jar:', error);
                }
            }

            trackEvent('pwa_shortcut_opened', { tool, user_type: 'premium' });

            switch (tool) {
                case 'dining': openModal('CONCIERGE', { toolId: 'DINING' }); break;
                case 'bar': openModal('CONCIERGE', { toolId: 'BAR' }); break;
                case 'weekend': openModal('WEEKEND_PLANNER'); break;
                case 'movie': openModal('CONCIERGE', { toolId: 'MOVIE' }); break;
                default: console.warn(`Unknown PWA shortcut tool: ${tool}`);
            }
        };

        checkAndOpenTool();
    }, [searchParams, isPremium, isLoadingUser, userData, openModal, refreshUser]);

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

    // 4. Handlers

    const handleContentUpdate = () => {
        fetchIdeas();
        refreshUser();
    };

    const handleCompleteOnboarding = () => {
        localStorage.setItem('onboarding_completed', 'true');
        trackEvent('onboarding_completed', {});
    };

    const handleSkipOnboarding = () => {
        localStorage.setItem('onboarding_completed', 'true');
        trackEvent('onboarding_skipped', {});
    };

    const handleLogout = async () => {
        await signOut({ redirect: false });
        await fetch(getApiUrl('/api/auth/logout'), { method: 'POST' });
        window.location.href = '/';
    };

    const handleSpinJar = async (filters: any = {}) => {
        if (ideas.length === 0) {
            alert("Add some ideas first!");
            return;
        }
        setIsSpinning(true);

        // Animation Loop
        const spinDuration = 2000;
        const tickInterval = 150;
        let elapsed = 0;

        const tickLoop = setInterval(() => {
            SoundEffects.playTick();
            triggerHaptic(10);
            elapsed += tickInterval;
            if (elapsed >= spinDuration) clearInterval(tickLoop);
        }, tickInterval);

        await new Promise(resolve => setTimeout(resolve, spinDuration));

        clearInterval(tickLoop);
        triggerHaptic([50, 50, 50]);
        SoundEffects.playFanfare();

        try {
            const res = await spinJar(filters);

            if (res.success) {
                openModal('DATE_REVEAL', { idea: res.idea });
                handleContentUpdate();
            } else {
                alert(res.error || "Failed to pick a date. Try adding more ideas!");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSpinning(false);
        }
    };

    const handleDeleteClick = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        openModal('DELETE_CONFIRM', {
            onConfirm: async () => {
                try {
                    const res = await deleteIdea(id);
                    if (res.success) {
                        fetchIdeas();
                    } else {
                        alert(`Failed: ${res.error}`);
                    }
                } catch (error: any) {
                    alert(`Error: ${error.message}`);
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
                alert(`🎉 ${data.count} ideas generated successfully!`);
            } else {
                alert('Failed to generate ideas. Please try again.');
            }
        } catch (error) {
            console.error('Quiz completion error:', error);
            alert('An error occurred.');
        }
    };

    return {
        // State
        userData, isLoadingUser, isPremium, xp, level, achievements, hasPaid, coupleCreatedAt, isTrialEligible,
        ideas, isLoadingIdeas,
        favoritesCount,
        isSpinning, userLocation, inviteCode, showConfetti, showOnboarding, showQuiz,

        // State Setters (if needed expose them, otherwise wrap in handlers)
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
