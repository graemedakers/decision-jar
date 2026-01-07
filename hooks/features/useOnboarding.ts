import { useState, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { UserData } from "@/lib/types";

export function useOnboarding({ userData, isLoadingUser }: { userData: UserData | null, isLoadingUser: boolean }) {
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
        if (!hasCompletedOnboarding && !isLoadingUser && userData) {
            setTimeout(() => setShowOnboarding(true), 1000);
        }
    }, [isLoadingUser, userData]);

    const handleCompleteOnboarding = () => {
        localStorage.setItem('onboarding_completed', 'true');
        trackEvent('onboarding_completed', {});
    };

    const handleSkipOnboarding = () => {
        localStorage.setItem('onboarding_completed', 'true');
        trackEvent('onboarding_skipped', {});
    };

    return {
        showOnboarding,
        setShowOnboarding,
        handleCompleteOnboarding,
        handleSkipOnboarding
    };
}
