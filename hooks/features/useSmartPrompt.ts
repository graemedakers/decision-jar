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

                // 3. Action: Add Single Idea ("Magic Add" or Manual)
                if (intent.intentAction === 'ADD_SINGLE') {
                    // MAGIC ADD: If we have enough confidence (enrichment data), skip the modal!
                    if (intent.enrichment && intent.topic) {
                        try {
                            const { category, cost, duration, vibe } = intent.enrichment;

                            // Map Vibe to Activity Level
                            let activityLevel = 'MEDIUM';
                            if (vibe) {
                                const lowerVibe = vibe.toLowerCase();
                                if (['relaxed', 'chill', 'calm', 'quiet', 'lazy'].some(v => lowerVibe.includes(v))) activityLevel = 'LOW';
                                else if (['energetic', 'active', 'intense', 'wild', 'loud'].some(v => lowerVibe.includes(v))) activityLevel = 'HIGH';
                            }

                            // Optimistic Toast
                            showInfo(`✨ Magic adding "${intent.topic}"...`);

                            const createRes = await fetch('/api/ideas', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    description: intent.topic,
                                    category: intent.enrichment.category || intent.targetCategory || 'ACTIVITY',
                                    cost: intent.enrichment.cost || '$',
                                    duration: intent.enrichment.duration || 60,
                                    activityLevel,
                                    indoor: true, // Default safe assumption? Or infer from category? Let's leave undefined or default.
                                    // Could assume indoor for dining/movies, outdoor for parks. 
                                    // For now, let the API defaults handle strictness, or send what we know.
                                })
                            });

                            if (createRes.ok) {
                                await fetchIdeas();
                                showSuccess(`Added "${intent.topic}" to your jar!`);
                                setIsGeneratingSmartIdeas(false);
                                return;
                            }
                            // If failed, fall back to modal
                        } catch (e) {
                            console.error("Magic Add failed, falling back to modal", e);
                        }
                    }

                    // FALLBACK: Open Modal (Manual Entry with Pre-fill)
                    setIsGeneratingSmartIdeas(false);
                    openModal('ADD_IDEA', {
                        initialData: {
                            description: intent.topic || prompt,
                            category: intent.targetCategory || 'ACTIVITY',
                            // Pre-fill enrichment if available but we fell back
                            cost: intent.enrichment?.cost,
                            duration: intent.enrichment?.duration
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
                        // Data refresh happens in 'finally' block to prevent UI lag.
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
            // Ensure UI is unblocked even if network fails
            setIsGeneratingSmartIdeas(false);

            // Refresh background data safely
            try {
                Promise.allSettled([
                    fetchAIUsage(),
                    fetchIdeas(),
                    refreshUser ? refreshUser() : Promise.resolve()
                ]).catch(console.error);
            } catch (e) { console.error(e); }
        }
    }, [userData?.jarTopic, userData?.activeJarId, openModal, fetchIdeas, refreshUser]);

    return {
        handleSmartPrompt,
        isGeneratingSmartIdeas,
        aiUsage,
        fetchAIUsage
    };
}
