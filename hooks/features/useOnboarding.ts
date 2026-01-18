import { useState, useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import { UserData } from "@/lib/types";
import { useModalSystem } from "@/components/ModalProvider";

export function useOnboarding({ userData, isLoadingUser, canStartTour = true }: { userData: UserData | null, isLoadingUser: boolean, canStartTour?: boolean }) {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { activeModal } = useModalSystem(); // ✅ NEW: Check if modals are open
    const activeModalRef = useRef(activeModal); // ✅ Track current value

    // ✅ Keep ref in sync with activeModal
    useEffect(() => {
        activeModalRef.current = activeModal;
    }, [activeModal]);

    useEffect(() => {
        // ✅ CRITICAL FIX: Make onboarding check user-specific, not browser-wide
        const userId = userData?.id;
        if (!userId) return; // Wait for user ID to load

        const userOnboardingKey = `onboarding_completed_${userId}`;
        const hasCompletedOnboarding = localStorage.getItem(userOnboardingKey);

        // ✅ NEW: Skip tour for invite users (they joined an existing jar)
        const isInviteUser = sessionStorage.getItem('oauth_invite_signup') ||
            sessionStorage.getItem('email_invite_signup');

        if (isInviteUser) {
            // Mark onboarding as completed for invite users (skip tour)
            localStorage.setItem(userOnboardingKey, 'true');
            console.log('[Onboarding] Skipping tour for invite user');
            return;
        }

        // ✅ CRITICAL FIX: Only trigger tour if user has a personal jar
        // Check if user has at least one jar where they are ADMIN (personal jar)
        const hasPersonalJar = userData?.memberships?.some(
            (m: any) => m.role === 'ADMIN' || m.role === 'OWNER'
        );

        // Only show onboarding if:
        // 1. Never completed before (for THIS user)
        // 2. User data fully loaded
        // 3. User is authenticated
        // 4. User has a personal jar (not just community jar membership)
        // 5. ✅ NO MODALS ARE OPEN (don't interrupt other prompts)
        // 6. ✅ NOT an invite user
        // 7. ✅ canStartTour (UI is ready, e.g. jar is visible)
        if (!hasCompletedOnboarding && !isLoadingUser && userData && hasPersonalJar && !activeModal && canStartTour) {
            setTimeout(() => {
                // ✅ RE-CHECK: Only start tour if STILL no modal open
                // Use ref to get CURRENT value, not stale closure value
                if (!activeModalRef.current) {
                    setShowOnboarding(true);
                }
            }, 1000); // ✅ Reduced delay slightly as we now wait for condition
        }
    }, [isLoadingUser, userData, activeModal, canStartTour]); // ✅ Added activeModal and canStartTour dependency

    const handleCompleteOnboarding = () => {
        const userId = userData?.id;
        if (!userId) return;

        const userOnboardingKey = `onboarding_completed_${userId}`;
        localStorage.setItem(userOnboardingKey, 'true');
        trackEvent('onboarding_completed', {});
    };

    const handleSkipOnboarding = () => {
        const userId = userData?.id;
        if (!userId) return;

        const userOnboardingKey = `onboarding_completed_${userId}`;
        localStorage.setItem(userOnboardingKey, 'true');
        trackEvent('onboarding_skipped', {});
    };

    return {
        showOnboarding,
        setShowOnboarding,
        handleCompleteOnboarding,
        handleSkipOnboarding
    };
}
