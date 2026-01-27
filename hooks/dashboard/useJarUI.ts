import { useState, useEffect } from "react";
import { useModalSystem } from "@/components/ModalProvider";

export function useJarUI(userData: any) {
    const { openModal, closeModal } = useModalSystem();
    const [userLocation, setUserLocation] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [isGeneratingSmartIdeas, setIsGeneratingSmartIdeas] = useState(false);

    // Onboarding UI state (previously managed by useOnboarding hook but exposed state)
    // Actually, useOnboarding manages its own state?
    // In useDashboardLogic: `const { showOnboarding, setShowOnboarding... } = useOnboarding(...)`
    // So we don't need to redeclare it here if we use `useOnboarding`.
    // But `useOnboarding` is a feature usage hook.

    // Initialize location from user data
    useEffect(() => {
        if (userData?.location) {
            setUserLocation(userData.location);
        }
    }, [userData]);

    return {
        openModal,
        closeModal,
        userLocation,
        setUserLocation,
        showConfetti,
        setShowConfetti,
        showQuiz,
        setShowQuiz,
        isGeneratingSmartIdeas,
        setIsGeneratingSmartIdeas
    };
}
