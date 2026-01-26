import { useState, useCallback, useEffect } from 'react';
import { useModalSystem } from "@/components/ModalProvider";
import { getCurrentLocation } from "@/lib/utils";
import { showSuccess, showError, showInfo } from "@/lib/toast";

interface UseSmartPromptProps {
    userData: any;
    fetchIdeas: () => void;
    refreshUser?: () => void; // Optional fetch for user limits
}

export function useSmartPrompt({ userData, fetchIdeas, refreshUser }: UseSmartPromptProps) {
    const { openModal } = useModalSystem();
    const [isGeneratingSmartIdeas, setIsGeneratingSmartIdeas] = useState(false);

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

    const handleSmartPrompt = useCallback(async (prompt: string) => {
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

                // Refresh usage limits
                await fetchAIUsage();
                if (refreshUser) refreshUser();

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
    }, [userData?.jarTopic, userData?.activeJarId, openModal, fetchIdeas, refreshUser]);

    return {
        handleSmartPrompt,
        isGeneratingSmartIdeas,
        aiUsage,
        fetchAIUsage
    };
}
