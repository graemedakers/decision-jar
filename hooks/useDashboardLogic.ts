
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useModalSystem } from "@/components/ModalProvider";
import { useUser } from "@/hooks/useUser";
import { useIdeas } from "@/hooks/useIdeas";
import { useFavorites } from "@/hooks/useFavorites";
import { trackEvent } from "@/lib/analytics";
import { triggerHaptic } from "@/lib/feedback";
import { signOut } from "next-auth/react";
import { getApiUrl } from "@/lib/utils";
import { showSuccess, showError, showInfo } from "@/lib/toast";
import { DASHBOARD_TOOLS } from "@/lib/constants/tools";
import { showAchievementToast } from "@/components/Gamification/AchievementToast";
import { ACHIEVEMENTS } from "@/lib/achievements-shared";
import { useTrialStatus } from "@/hooks/useTrialStatus";

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
        isTrialEligible,
        currentStreak,
        longestStreak
    } = useUser({
        onLevelUp: (newLevel) => openModal('LEVEL_UP', { level: newLevel }),
        onAchievementUnlocked: (achievementId) => {
            // Find the achievement definition and show toast
            const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
            if (achievement) {
                showAchievementToast(achievement);
            }
        }
    });

    const { ideas, isLoading: isLoadingIdeas, isFetching: isFetchingIdeas, fetchIdeas } = useIdeas();
    const { favoritesCount, fetchFavorites } = useFavorites();
    const { deleteIdea } = useIdeaMutations();

    // 2. Local State
    const [userLocation, setUserLocation] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);

    // Prevent double execution of OAuth cleanup
    const oauthCleanupRef = useRef(false);

    const handleContentUpdate = () => {
        fetchIdeas();
        refreshUser();
    };

    // 3. Feature Composition
    const { activeModal } = useModalSystem();
    const showNoJars = !userData?.activeJarId && (userData?.memberships?.length || 0) === 0;

    const {
        isSpinning,
        handleSpinJar: _internalSpin,
        handleExternalSpinStart,
        handleExternalSpinComplete
    } = useSpin({
        ideas,
        onSpinComplete: handleContentUpdate,
        disabled: isLoadingUser || showNoJars
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

    const canStartTour = !!userData?.activeJarId && ideas.length > 0 && !isLoadingIdeas && !isFetchingIdeas;
    const { showOnboarding, setShowOnboarding, handleCompleteOnboarding, handleSkipOnboarding } = useOnboarding({
        userData,
        isLoadingUser,
        canStartTour
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

    useEffect(() => {
        if (userData?.location) {
            setUserLocation(userData.location);
        }
    }, [userData]);

    // Trial Expiry Check
    const { shouldShowTrialModal, dismissTrialModal } = useTrialStatus(userData);

    useEffect(() => {
        // Don't show trial modal if we just returned from successful checkout
        const params = new URLSearchParams(window.location.search);
        const justUpgraded = params.get('success') === 'true';

        // Show trial expired modal after a short delay for better UX
        if (shouldShowTrialModal && !isLoadingUser && userData && !justUpgraded) {
            const timer = setTimeout(() => {
                openModal('TRIAL_EXPIRED');
            }, 1500); // 1.5 second delay for smoother experience
            return () => clearTimeout(timer);
        }
    }, [shouldShowTrialModal, isLoadingUser, userData, openModal]);

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

            // Clear trial modal state since user just upgraded
            localStorage.removeItem('trial_modal_dismissed_at');
            localStorage.removeItem('trial_modal_snoozed_until');

            window.history.replaceState({}, '', window.location.pathname);
            refreshUser();
        }
    }, [refreshUser]);

    // Handle Invite Codes on Dashboard (Direct Landing or Social Redirect)
    useEffect(() => {
        if (isLoadingUser || !userData) return;

        const code = searchParams?.get('code');
        const premiumToken = searchParams?.get('pt');

        if (code) {
            const handleJoin = async () => {
                try {
                    const res = await fetch('/api/jars/join', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code, premiumToken }),
                    });

                    const data = await res.json();

                    if (res.ok) {
                        if (data.premiumGifted) {
                            showSuccess("Welcome! You've joined the jar and upgraded to Premium!");
                        } else if (data.message !== "Already a member, switched to jar.") {
                            showSuccess("Successfully joined the jar!");
                        }

                        // ✅ Mark as invite user (for tour skip)
                        sessionStorage.setItem('email_invite_signup', 'true');

                        // Clean URL
                        const newParams = new URLSearchParams(searchParams.toString());
                        newParams.delete('code');
                        newParams.delete('pt');
                        window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`);

                        // Refresh data
                        handleContentUpdate();
                    } else {
                        // Only show error if it's not a session issue (which shouldn't happen here as we check userData)
                        showError(data.error || "Failed to join jar");

                        // Clean URL even on failure to prevent repeated attempts
                        const newParams = new URLSearchParams(searchParams.toString());
                        newParams.delete('code');
                        newParams.delete('pt');
                        window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`);
                    }
                } catch (error) {
                    console.error("Join from dashboard error:", error);
                }
            };
            handleJoin();
        }
    }, [searchParams, userData, isLoadingUser]);

    // ✅ FIX: Handle OAuth Invite Signup Cleanup
    // After OAuth callback, check for pending invite params in sessionStorage
    // If user has auto-created "My First Jar" with 0 ideas, delete it and join invited jar
    useEffect(() => {
        if (isLoadingUser || !userData || isLoadingIdeas) return;

        const isOAuthInviteSignup = sessionStorage.getItem('oauth_invite_signup');
        const pendingCode = sessionStorage.getItem('pending_invite_code');
        const pendingToken = sessionStorage.getItem('pending_premium_token');

        if (isOAuthInviteSignup && pendingCode) {
            if (oauthCleanupRef.current) return;
            oauthCleanupRef.current = true;

            const handleOAuthInviteCleanup = async () => {
                try {
                    console.log('[OAuth Invite Cleanup] Starting cleanup for invite code:', pendingCode);

                    // Check if user has "My First Jar" with 0 ideas
                    const hasMyFirstJar = userData.jarName === "My First Jar" && ideas.length === 0;
                    const myFirstJarId = hasMyFirstJar ? userData.activeJarId : null;

                    // Join the invited jar
                    const joinRes = await fetch('/api/jars/join', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code: pendingCode, premiumToken: pendingToken }),
                    });

                    const joinData = await joinRes.json();

                    if (joinRes.ok) {
                        console.log('[OAuth Invite Cleanup] Successfully joined invited jar');

                        // If we have "My First Jar" to delete, do it now
                        if (myFirstJarId) {
                            try {
                                const deleteRes = await fetch(`/api/jars/${myFirstJarId}`, {
                                    method: 'DELETE',
                                });

                                if (deleteRes.ok) {
                                    console.log('[OAuth Invite Cleanup] Successfully deleted "My First Jar"');
                                } else {
                                    console.warn('[OAuth Invite Cleanup] Failed to delete "My First Jar", but invite join succeeded');
                                }
                            } catch (deleteError) {
                                console.error('[OAuth Invite Cleanup] Error deleting "My First Jar":', deleteError);
                            }
                        }

                        // Show success message
                        if (joinData.premiumGifted) {
                            showSuccess("Welcome! You've joined the jar and upgraded to Premium!");
                        } else {
                            showSuccess("Successfully joined the jar!");
                        }

                        // Clear sessionStorage flags
                        sessionStorage.removeItem('oauth_invite_signup');
                        sessionStorage.removeItem('pending_invite_code');
                        sessionStorage.removeItem('pending_premium_token');

                        // Refresh data
                        handleContentUpdate();
                    } else {
                        console.error('[OAuth Invite Cleanup] Failed to join jar:', joinData.error);
                        showError(joinData.error || "Failed to join jar");

                        // Clear flags even on failure to prevent retry loops
                        sessionStorage.removeItem('oauth_invite_signup');
                        sessionStorage.removeItem('pending_invite_code');
                        sessionStorage.removeItem('pending_premium_token');
                    }
                } catch (error) {
                    console.error('[OAuth Invite Cleanup] Error during cleanup:', error);

                    // Clear flags to prevent retry loops
                    sessionStorage.removeItem('oauth_invite_signup');
                    sessionStorage.removeItem('pending_invite_code');
                    sessionStorage.removeItem('pending_premium_token');
                }
            };

            handleOAuthInviteCleanup();
        }
    }, [userData, isLoadingUser, isLoadingIdeas, ideas]);

    // Unified Deep Link Action Router
    useEffect(() => {
        if (isLoadingUser || isLoadingIdeas) return;

        const action = searchParams?.get('action');
        const ideaId = searchParams?.get('ideaId');
        const toolId = searchParams?.get('tool');

        let urlCleaned = false;
        const newParams = new URLSearchParams(searchParams.toString());

        // 1. Direct Idea Opening (Legacy support + new structure)
        if (ideaId && ideas.length > 0) {
            const targetIdea = ideas.find((i: any) => i.id === ideaId);
            if (targetIdea) {
                openModal('DATE_REVEAL', { idea: targetIdea, isViewOnly: true });
                newParams.delete('ideaId');
                urlCleaned = true;
            }
        }

        // 2. Action Routing
        if (action) {
            switch (action) {
                case 'add':
                    openModal('ADD_IDEA');
                    break;
                case 'spin':
                    // Scroll to jar or open filters
                    const jarElement = document.getElementById('jar-container');
                    if (jarElement) jarElement.scrollIntoView({ behavior: 'smooth' });
                    // Optional: open filters immediately
                    // openModal('SPIN_FILTERS'); 
                    break;
                case 'quiz':
                    setShowQuiz(true);
                    break;
                case 'concierge':
                    if (toolId) {
                        // Check if tool requires premium
                        const tool = DASHBOARD_TOOLS.find(t =>
                            t.conciergeId?.toLowerCase() === toolId.toLowerCase() ||
                            t.id.toLowerCase() === toolId.toLowerCase()
                        );

                        if (tool?.requiresPremium && !isPremium) {
                            // Show premium modal instead of the concierge
                            openModal('PREMIUM');
                            showInfo('This concierge is available for Premium members. Upgrade to unlock!');
                            newParams.delete('tool');
                            newParams.delete('action');
                        } else {
                            openModal('CONCIERGE', { toolId: toolId.toUpperCase() });
                            newParams.delete('tool');
                        }
                    } else {
                        // Default to EXPLORE tab (which isn't a modal, but we can redirect or show generic)
                        router.push('/explore');
                        return; // Don't clean param yet if we redirect
                    }
                    break;
                case 'settings':
                    openModal('SETTINGS');
                    break;
                case 'invite':
                    openModal('COMMUNITY_ADMIN'); // Or scroll to invite code
                    break;
                case 'capture':
                    if (ideaId) {
                        const targetIdea = ideas.find((i: any) => i.id === ideaId);
                        if (targetIdea) {
                            openModal('ADD_MEMORY', { initialData: targetIdea });
                            newParams.delete('ideaId');
                        }
                    } else {
                        // If no ID, just open modal for adding new past memory
                        openModal('ADD_MEMORY');
                    }
                    break;
                case 'onboarding':
                    setShowOnboarding(true);
                    break;
            }
            newParams.delete('action');
            urlCleaned = true;
        }

        // Clean URL if we took action
        if (urlCleaned) {
            window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`);
        }
    }, [searchParams, isLoadingUser, isLoadingIdeas, ideas, openModal, setShowQuiz, setShowOnboarding, router]);

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
        currentStreak, longestStreak,
        ideas, isLoadingIdeas, isFetchingIdeas,
        favoritesCount,
        isSpinning, userLocation, inviteCode: userData?.coupleReferenceCode || userData?.referenceCode || userData?.jarReferenceCode || null, showConfetti, showOnboarding, showQuiz,

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
