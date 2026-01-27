
import { useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { showSuccess, showError, showInfo } from "@/lib/toast";
import { triggerHaptic } from "@/lib/feedback";
import { DASHBOARD_TOOLS } from "@/lib/constants/tools";
import { trackEvent } from "@/lib/analytics";
import { useModalSystem } from "@/components/ModalProvider";

// New Modular Hooks
import { useJarData } from "@/hooks/dashboard/useJarData";
import { useJarUI } from "@/hooks/dashboard/useJarUI";
import { useJarActions } from "@/hooks/dashboard/useJarActions";

export function useDashboardLogic() {
    const { openModal } = useModalSystem();

    // 1. Data Layer
    const data = useJarData(openModal);

    // 2. UI Layer
    const ui = useJarUI(data.userData);

    // 3. Actions Layer
    const actions = useJarActions({
        ...data,
        ...ui,
        openModal
    });

    const router = useRouter();
    const searchParams = useSearchParams();

    // 4. Legacy/Aggregated Effects (Invite Handling, Deep Links)
    const joinProcessedRef = useRef<string | null>(null);
    const oauthCleanupRef = useRef(false);

    // Handle Invite Codes on Dashboard
    useEffect(() => {
        if (data.isLoadingUser || !data.userData || data.isLoadingIdeas) return;

        const code = searchParams?.get('code');
        const premiumToken = searchParams?.get('pt');

        if (code && joinProcessedRef.current !== code) {
            joinProcessedRef.current = code;
            const handleJoin = async () => {
                const jarIdToDelete = (data.userData.jarName === "My First Jar" && data.ideas.length === 0)
                    ? data.userData.activeJarId
                    : null;

                try {
                    const res = await fetch('/api/jars/join', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code, premiumToken }),
                    });
                    const resData = await res.json();

                    if (res.ok) {
                        if (resData.premiumGifted) showSuccess("Welcome! Joined & Upgraded!");
                        else if (resData.message !== "Already a member, switched to jar.") showSuccess("Joined jar!");

                        if (jarIdToDelete && resData.jarId !== jarIdToDelete) {
                            try { fetch(`/api/jars/${jarIdToDelete}`, { method: 'DELETE' }); } catch (e) { }
                        }
                        sessionStorage.setItem('email_invite_signup', 'true');

                        // Clean URL
                        const newParams = new URLSearchParams(searchParams.toString());
                        newParams.delete('code');
                        newParams.delete('pt');
                        window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`);

                        data.handleContentUpdate();
                    } else {
                        showError(resData.error || "Failed to join");
                        const newParams = new URLSearchParams(searchParams.toString());
                        newParams.delete('code');
                        newParams.delete('pt');
                        window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`);
                    }
                } catch (error) {
                    console.error("Join error:", error);
                }
            };
            handleJoin();
        }
    }, [searchParams, data.userData, data.isLoadingUser, data.isLoadingIdeas, data.ideas, data.handleContentUpdate]);


    // OAuth Cleanup Effect
    useEffect(() => {
        if (data.isLoadingUser || !data.userData || data.isLoadingIdeas) return;

        const isOAuthInviteSignup = sessionStorage.getItem('oauth_invite_signup');
        const pendingCode = sessionStorage.getItem('pending_invite_code');
        const pendingToken = sessionStorage.getItem('pending_premium_token');

        if (isOAuthInviteSignup && pendingCode && !searchParams?.get('code')) {
            if (oauthCleanupRef.current) return;
            oauthCleanupRef.current = true;

            const handleOAuthInviteCleanup = async () => {
                try {
                    console.log('[OAuth Invite Cleanup] Starting cleanup based on session flags');
                    const hasMyFirstJar = data.userData.jarName === "My First Jar" && data.ideas.length === 0;
                    const myFirstJarId = hasMyFirstJar ? data.userData.activeJarId : null;

                    const joinRes = await fetch('/api/jars/join', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code: pendingCode, premiumToken: pendingToken }),
                    });
                    const joinData = await joinRes.json();

                    if (joinRes.ok) {
                        if (myFirstJarId) {
                            try { await fetch(`/api/jars/${myFirstJarId}`, { method: 'DELETE' }); } catch (e) { }
                        }

                        if (joinData.premiumGifted) showSuccess("Welcome! Joined & Upgraded!");
                        else if (joinData.message !== "Already a member, switched to jar.") showSuccess("Joined jar!");

                        sessionStorage.removeItem('oauth_invite_signup');
                        sessionStorage.removeItem('pending_invite_code');
                        sessionStorage.removeItem('pending_premium_token');

                        data.handleContentUpdate();
                    } else {
                        showError(joinData.error || "Failed to join jar");
                        sessionStorage.removeItem('oauth_invite_signup');
                        sessionStorage.removeItem('pending_invite_code');
                        sessionStorage.removeItem('pending_premium_token');
                    }
                } catch (error) {
                    console.error('[OAuth Cleanup] Error:', error);
                    sessionStorage.removeItem('oauth_invite_signup');
                    sessionStorage.removeItem('pending_invite_code');
                    sessionStorage.removeItem('pending_premium_token');
                }
            };
            handleOAuthInviteCleanup();
        }
    }, [data.userData, data.isLoadingUser, data.ideas, data.handleContentUpdate]);

    // Unified Deep Link Router
    useEffect(() => {
        if (data.isLoadingUser || data.isLoadingIdeas) return;
        const action = searchParams?.get('action');
        const ideaId = searchParams?.get('ideaId');
        const toolId = searchParams?.get('tool');
        const newGift = searchParams?.get('newGift');

        let urlCleaned = false;
        const newParams = new URLSearchParams(searchParams.toString());

        if (newGift) {
            data.refreshUser();
            data.fetchIdeas();
            ui.setShowConfetti(true);
            newParams.delete('newGift');
            urlCleaned = true;
        }

        if (ideaId && data.ideas.length > 0) {
            const targetIdea = data.ideas.find((i: any) => i.id === ideaId);
            if (targetIdea) {
                openModal('DATE_REVEAL', { idea: targetIdea, isViewOnly: true });
                newParams.delete('ideaId');
                urlCleaned = true;
            }
        }

        if (action) {
            switch (action) {
                case 'add': openModal('ADD_IDEA'); break;
                case 'spin':
                    document.getElementById('jar-container')?.scrollIntoView({ behavior: 'smooth' });
                    break;
                case 'quiz': ui.setShowQuiz(true); break;
                case 'concierge':
                    if (toolId) {
                        const tool = DASHBOARD_TOOLS.find(t => t.conciergeId?.toLowerCase() === toolId.toLowerCase() || t.id.toLowerCase() === toolId.toLowerCase());
                        if (tool?.requiresPremium && !data.isPremium) {
                            openModal('PREMIUM');
                            showInfo('Premium required');
                        } else {
                            openModal('CONCIERGE', { toolId: toolId.toUpperCase() });
                        }
                    } else {
                        router.push('/explore');
                        return;
                    }
                    newParams.delete('tool');
                    break;
                case 'settings': openModal('SETTINGS'); break;
                case 'invite': openModal('SETTINGS'); break;
                case 'capture':
                    if (ideaId) {
                        const i = data.ideas.find((x: any) => x.id === ideaId);
                        if (i) openModal('ADD_MEMORY', { initialData: i });
                        newParams.delete('ideaId');
                    } else openModal('ADD_MEMORY');
                    break;
                case 'onboarding': actions.setShowOnboarding(true); break;
            }
            newParams.delete('action');
            urlCleaned = true;
        }

        if (urlCleaned) {
            window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`);
        }
    }, [searchParams, data.isLoadingUser, data.ideas, openModal, router, ui, data, actions]);

    // Premium Tip Effect
    useEffect(() => {
        const success = searchParams?.get('success');
        const hasSeenTip = localStorage.getItem('premium_shortcuts_tip_seen');
        if (success === 'true' && !hasSeenTip && data.isPremium && !data.isLoadingUser) {
            openModal('PREMIUM_WELCOME_TIP', { showPremiumTip: true });
            trackEvent('premium_shortcuts_tip_shown', { trigger: 'post_upgrade' });
        }
    }, [searchParams, data.isPremium, data.isLoadingUser, openModal]);

    // Stripe Success
    useEffect(() => {
        const success = searchParams?.get('success');
        const sessionId = searchParams?.get('session_id');
        if (success && sessionId && data.refreshUser) {
            triggerHaptic(50);
            ui.setShowConfetti(true);
            localStorage.removeItem('trial_modal_dismissed_at');
            localStorage.removeItem('trial_modal_snoozed_until');
            window.history.replaceState({}, '', window.location.pathname);
            data.refreshUser();
        }
    }, [data.refreshUser, searchParams, data, ui]);

    return {
        ...data,
        ...ui,
        ...actions,
        openModal,
        handleAddIdeaClick: () => openModal('ADD_IDEA')
    };
}
