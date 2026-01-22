
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useModalSystem } from "@/components/ModalProvider";
import { useUser } from "@/hooks/useUser";
import { useIdeas } from "@/hooks/useIdeas";
import { useFavorites } from "@/hooks/useFavorites";
import { trackEvent } from "@/lib/analytics";
import { triggerHaptic } from "@/lib/feedback";
import { signOut } from "next-auth/react";
import { getApiUrl, getCurrentLocation } from "@/lib/utils";
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
    const { openModal, closeModal } = useModalSystem();
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
    const [isGeneratingSmartIdeas, setIsGeneratingSmartIdeas] = useState(false);

    // Prevent double execution of join logic
    const joinProcessedRef = useRef<string | null>(null);
    const oauthCleanupRef = useRef(false);

    const handleContentUpdate = useCallback(() => {
        fetchIdeas();
        refreshUser();
    }, [fetchIdeas, refreshUser]);

    // 3. Feature Composition
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
        handleExternalSpinComplete,
        handleContentUpdate
    );

    const handleSpinJar = async (filters: any = {}) => {
        // PERMISSION CHECK: Fail fast if not admin/owner
        if (userData?.activeJarId) {
            const membership = userData.memberships?.find((m: any) => m.jarId === userData.activeJarId);
            const role = membership?.role;
            if (role !== 'ADMIN' && role !== 'OWNER') {
                showError("Only the jar owner or admins can spin!");
                return;
            }
        }

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

    // AI Usage State
    const [aiUsage, setAiUsage] = useState<{
        remaining: number | null;
        dailyLimit: number | null;
        isPro: boolean;
    }>({
        remaining: null,
        dailyLimit: null,
        isPro: false
    });

    const fetchAIUsage = async () => {
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
    };

    useEffect(() => {
        fetchAIUsage();
    }, []);

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
        if (isLoadingUser || !userData || isLoadingIdeas) return;

        const code = searchParams?.get('code');
        const premiumToken = searchParams?.get('pt');

        if (code && joinProcessedRef.current !== code) {
            joinProcessedRef.current = code;
            const handleJoin = async () => {
                // Check if we should clean up "My First Jar"
                // Only if it's "My First Jar" and it's empty
                const jarIdToDelete = (userData.jarName === "My First Jar" && ideas.length === 0)
                    ? userData.activeJarId
                    : null;

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

                        // Use the cleanup logic if applicable
                        if (jarIdToDelete && data.jarId !== jarIdToDelete) {
                            try {
                                const deleteRes = await fetch(`/api/jars/${jarIdToDelete}`, {
                                    method: 'DELETE',
                                });
                                if (deleteRes.ok) {
                                    console.log('[Dashboard Join] Cleaned up empty "My First Jar"');
                                }
                            } catch (e) {
                                console.error("Failed to delete empty jar", e);
                            }
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
                        // Only show error if it's not a session issue
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
    }, [searchParams, userData, isLoadingUser, isLoadingIdeas, ideas]);

    // ✅ FIX: Handle OAuth Invite Signup Cleanup
    // After OAuth callback, check for pending invite params in sessionStorage
    // If user has auto-created "My First Jar" with 0 ideas, delete it and join invited jar
    useEffect(() => {
        if (isLoadingUser || !userData || isLoadingIdeas) return;

        const isOAuthInviteSignup = sessionStorage.getItem('oauth_invite_signup');
        const pendingCode = sessionStorage.getItem('pending_invite_code');
        const pendingToken = sessionStorage.getItem('pending_premium_token');

        // Only run if we don't have a code in the URL (which is handled by the other Effect)
        if (isOAuthInviteSignup && pendingCode && !searchParams?.get('code')) {
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
                        } else if (joinData.message !== "Already a member, switched to jar.") {
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
                    openModal('SETTINGS');
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


    const handleSmartPrompt = async (prompt: string) => {
        setIsGeneratingSmartIdeas(true);
        try {
            // Attempt to get client location (fails gracefully)
            let userLocation: string | undefined = undefined;
            try {
                userLocation = await getCurrentLocation();
            } catch (ignore) {
                console.log("Could not get client location:", ignore);
            }

            // 1. Classify Intent
            const classifyRes = await fetch('/api/intent/classify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    location: userLocation,
                    jarTopic: userData?.jarTopic
                })
            });

            let detectedIntent = null;

            if (classifyRes.ok) {
                const { intent } = await classifyRes.json();
                detectedIntent = intent;
                console.log("[SmartRouter] Intent Detected:", intent);

                // 2. Action: Launch Concierge
                if (intent.intentAction === 'LAUNCH_CONCIERGE') {
                    setIsGeneratingSmartIdeas(false);
                    openModal('CONCIERGE', {
                        toolId: intent.conciergeTool || 'CONCIERGE',
                        initialPrompt: prompt
                    });
                    return;
                }

                // 3. Action: Add Single Idea
                if (intent.intentAction === 'ADD_SINGLE') {
                    setIsGeneratingSmartIdeas(false);
                    openModal('ADD_IDEA', {
                        initialData: {
                            description: intent.topic || prompt,
                            category: intent.targetCategory || 'ACTIVITY'
                        }
                    });
                    return;
                }
            }

            // 4. Action: Bulk Generate (Default)
            const response = await fetch('/api/ideas/bulk-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    intent: detectedIntent, // Pass pre-parsed intent if available
                    location: userLocation, // Pass client location
                    jarId: userData?.activeJarId
                })
            });

            if (response.status === 403) {
                const error = await response.json();
                if (error.code === 'UPGRADE_REQUIRED') {
                    setIsGeneratingSmartIdeas(false);
                    openModal('PREMIUM');
                    return;
                }
            }

            if (response.ok) {
                const data = await response.json();

                await fetchAIUsage(); // Refresh usage limits

                if (data.success) {
                    if (data.preview) {
                        openModal('BULK_IDEA_PREVIEW', {
                            ideas: data.ideas,
                            jarId: data.jarId,
                            originalPrompt: prompt
                        });
                    } else {
                        await fetchIdeas();
                        showSuccess(`✨ ${data.count} ideas added to your jar!`);
                    }
                }
            } else {
                showError('Failed to generate ideas. Please try again.');
            }
        } catch (error) {
            console.error('Smart prompt error:', error);
            showError('An error occurred.');
        } finally {
            setIsGeneratingSmartIdeas(false);
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
        openModal,
        dismissTrialModal,

        // Smart Prompt
        isGeneratingSmartIdeas,
        handleSmartPrompt,
        aiUsage
    };
}
