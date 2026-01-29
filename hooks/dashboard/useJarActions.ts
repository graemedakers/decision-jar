import { useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { showSuccess, showError, showInfo } from "@/lib/toast";
import { triggerHaptic } from "@/lib/feedback";
import { getCurrentLocation } from "@/lib/utils";
import { DASHBOARD_TOOLS } from "@/lib/constants/tools";
import { trackEvent } from "@/lib/analytics";

// Hooks
import { useSpin } from "@/hooks/features/useSpin";
import { useSquadMode } from "@/hooks/features/useSquadMode";
import { useIdeaMutations } from "@/hooks/mutations/useIdeaMutations";
import { useOnboarding } from "@/hooks/features/useOnboarding";

import { ModalType } from "@/components/ModalProvider";
import { getBestCategoryFit } from "@/lib/categories";

// Types override (simplification)
interface JarActionsProps {
    userData: any;
    ideas: any[];
    isLoadingUser: boolean;
    isLoadingIdeas: boolean;
    isPremium: boolean;
    refreshUser: () => Promise<void>;
    fetchIdeas: () => Promise<any>;
    fetchAIUsage: () => Promise<void>;
    handleContentUpdate: () => void;

    // UI
    openModal: (type: ModalType, props?: any) => void;
    setIsGeneratingSmartIdeas: (val: boolean) => void;
    setShowConfetti: (val: boolean) => void;
    setShowQuiz: (val: boolean) => void;
}

export function useJarActions({
    userData, ideas, isLoadingUser, isLoadingIdeas, isPremium,
    refreshUser, fetchIdeas, fetchAIUsage, handleContentUpdate,
    openModal, setIsGeneratingSmartIdeas, setShowConfetti, setShowQuiz
}: JarActionsProps) {

    const router = useRouter();
    const searchParams = useSearchParams();
    const { deleteIdea } = useIdeaMutations();

    // 1. Spin Logic
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

    // 2. Onboarding
    const canStartTour = !!userData?.activeJarId && ideas.length > 0 && !isLoadingIdeas;
    const { showOnboarding, setShowOnboarding, handleCompleteOnboarding, handleSkipOnboarding } = useOnboarding({
        userData,
        isLoadingUser,
        canStartTour
    });

    // 3. Idea Actions
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

    // 4. Quiz
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

    // 5. Smart Prompt
    const handleSmartPrompt = useCallback(async (prompt: string) => {
        setIsGeneratingSmartIdeas(true);
        try {
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

                if (intent.intentAction === 'LAUNCH_CONCIERGE') {
                    setIsGeneratingSmartIdeas(false);
                    openModal('CONCIERGE', {
                        toolId: intent.conciergeTool || 'CONCIERGE',
                        initialPrompt: prompt
                    });
                    return;
                }

                if (intent.intentAction === 'ADD_SINGLE') {
                    setIsGeneratingSmartIdeas(false);
                    const jarTopic = userData?.jarTopic || 'Activities';
                    const promptLow = prompt.toLowerCase();

                    // Simple inference for common fields
                    const isOutdoor = (promptLow.includes('walk') || promptLow.includes('hike') || promptLow.includes('outdoor') || promptLow.includes('nature') || promptLow.includes('park') || promptLow.includes('beach') || promptLow.includes('lake') || promptLow.includes('swim'));
                    const isDrink = promptLow.includes('drink') || promptLow.includes('beer') || promptLow.includes('wine') || promptLow.includes('cocktail') || promptLow.includes('bar');

                    const detectedCategory = isDrink ? 'BAR' : (intent.targetCategory || 'ACTIVITY');
                    const bestCategory = typeof getBestCategoryFit === 'function' ? getBestCategoryFit(detectedCategory, jarTopic) : detectedCategory;

                    const ideaType = (() => {
                        const cat = (intent.targetCategory || 'activity').toLowerCase();
                        if (['restaurant', 'dining', 'meal', 'cafe', 'bar'].includes(cat) || isDrink) return 'dining';
                        if (['movie', 'film', 'cinema'].includes(cat)) return 'movie';
                        if (['book', 'reading'].includes(cat)) return 'book';
                        if (['travel', 'trip', 'stay', 'vacation'].includes(cat)) return 'travel';
                        if (['recipe', 'cooking', 'baking', 'food'].includes(cat)) return 'recipe';
                        if (['game', 'gaming'].includes(cat)) return 'game';
                        if (['event', 'show', 'concert'].includes(cat)) return 'event';
                        return 'activity';
                    })();

                    // Normalize the description to use the FULL user prompt
                    const displayDescription = prompt.charAt(0).toUpperCase() + prompt.slice(1);

                    // Clean up the activity type for specialized forms (concise name like "Swim")
                    const cleanActivityType = (topic: string) => {
                        // 1. Remove common action prefixes
                        let cleaned = topic.replace(/^(go for a|go to a|go to the|let's|take a|take the|a|the)\s+/i, '');

                        // 2. Extract core activity (take everything before common prepositions)
                        const coreMatch = cleaned.match(/^(.+?)\s+(in|at|to|on|with|near|by)\b/i);
                        if (coreMatch) {
                            cleaned = coreMatch[1];
                        }

                        // 3. Capitalize and return
                        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
                    };

                    const activityTypeValue = ideaType === 'activity'
                        ? (intent.topic ? cleanActivityType(intent.topic) : (detectedCategory === 'OUTDOOR' ? 'Walk' : 'Activity'))
                        : undefined;

                    openModal('ADD_IDEA', {
                        initialData: {
                            description: displayDescription,
                            category: bestCategory,
                            ideaType: ideaType,
                            indoor: !isOutdoor,
                            duration: promptLow.includes('long') || promptLow.includes('day') ? "2.0" : "1.0",
                            typeData: {
                                // Pre-fill specialized fields if possible
                                activityType: activityTypeValue,
                                cuisine: ideaType === 'dining' ? (intent.topic ? cleanActivityType(intent.topic) : (isDrink ? "Bars" : undefined)) : undefined,
                                establishmentName: ideaType === 'dining' ? displayDescription : undefined,
                                name: ideaType === 'dining' ? displayDescription : undefined
                            }
                        }
                    });
                    return;
                }
            }

            // Bulk Generate
            const response = await fetch('/api/ideas/bulk-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    intent: detectedIntent,
                    location: userLocation,
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

                // Data refresh happens in 'finally' block to prevent UI lag.

                if (data.success) {
                    if (data.preview) {
                        setIsGeneratingSmartIdeas(false);
                        openModal('BULK_IDEA_PREVIEW', {
                            ideas: data.ideas,
                            jarId: data.jarId,
                            originalPrompt: prompt
                        });
                    } else {
                        setIsGeneratingSmartIdeas(false);
                        // Success! Toast immediately.
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

            // Refresh background data safely
            try {
                Promise.allSettled([
                    fetchAIUsage(),
                    fetchIdeas()
                ]).catch(console.error);
            } catch (e) { console.error(e); }
        }
    }, [userData?.jarTopic, userData?.activeJarId, openModal, fetchIdeas, setIsGeneratingSmartIdeas, fetchAIUsage]);

    // 6. User actions
    const handleLogout = async () => {
        await signOut({ redirect: false });
        window.location.href = '/';
    };

    return {
        isSpinning,
        handleSpinJar,
        showOnboarding,
        setShowOnboarding,
        handleCompleteOnboarding,
        handleSkipOnboarding,
        handleDeleteClick,
        handleDuplicate,
        handleQuizComplete,
        handleSmartPrompt,
        handleLogout
    };
}
