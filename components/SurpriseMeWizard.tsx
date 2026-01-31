/**
 * SurpriseMeWizard - Migrated to WizardFrame Engine
 * 
 * This is a thin wrapper around WizardFrame that adds jar-specific logic
 * (dynamic categories based on jar topic) and uses the SURPRISE_ME_CONFIG.
 * 
 * Migration Notes:
 * - Original: components/SurpriseMeModal.tsx (255 lines)
 * - New: This wrapper + WizardFrame (~30 lines vs 255)
 * - Code reduction: ~225 lines saved
 */

"use client";

import { AiWizardFrame } from "@/components/WizardFrame";
import { SURPRISE_ME_CONFIG } from "@/lib/constants/planners";
import { WizardConfig } from "@/lib/types/wizard";
import { getCategoriesForTopic } from "@/lib/categories";
import { useMemo } from "react";

interface SurpriseMeWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onIdeaAdded?: () => void;
    initialLocation?: string;
    jarTopic?: string | null;
    customCategories?: any[];
}

export function SurpriseMeWizard({
    isOpen,
    onClose,
    onIdeaAdded,
    initialLocation,
    jarTopic,
    customCategories,
}: SurpriseMeWizardProps) {
    // Build dynamic category options based on jar topic
    const dynamicConfig = useMemo<WizardConfig>(() => {
        const categories = getCategoriesForTopic(jarTopic, customCategories);

        // Clone the base config and update the category field with dynamic options
        const config = { ...SURPRISE_ME_CONFIG };
        config.fields = config.fields.map(field => {
            if (field.id === 'category') {
                return {
                    ...field,
                    options: categories.map(cat => ({
                        value: cat.id,
                        label: cat.label,
                    })),
                    defaultValue: categories.length > 0 ? categories[0].id : 'ACTIVITY',
                };
            }
            return field;
        });

        // Update the API route to include the topic
        config.apiRoute = '/api/ideas/generate-surprise';

        // Custom parseResults for Surprise Me (auto-closes on success)
        config.parseResults = (apiResponse: any) => {
            // Surprise Me creates the idea directly, no review step needed
            // Return empty to trigger success behavior
            if (apiResponse.success || apiResponse.idea) {
                // Force reload to show the new idea
                window.location.reload();
                return [];
            }
            return [];
        };

        return config;
    }, [jarTopic, customCategories]);

    return (
        <AiWizardFrame
            isOpen={isOpen}
            config={dynamicConfig}
            userLocation={initialLocation}
            callbacks={{
                onClose,
                onIdeaAdded,
            }}
        />
    );
}
