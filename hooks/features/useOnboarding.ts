import { useState, useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import { UserData } from "@/lib/types";
import { useModalSystem } from "@/components/ModalProvider";

export function useOnboarding({ userData, isLoadingUser }: { userData: UserData | null, isLoadingUser: boolean }) {
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
        if (!hasCompletedOnboarding && !isLoadingUser && userData && hasPersonalJar && !activeModal) {
            setTimeout(() => {
                // ✅ RE-CHECK: Only start tour if STILL no modal open
                // Use ref to get CURRENT value, not stale closure value
                if (!activeModalRef.current) {
                    setShowOnboarding(true);
                }
            }, 1500); // ✅ Increased delay to 1.5s
        }
    }, [isLoadingUser, userData, activeModal]); // ✅ Added activeModal dependency

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
