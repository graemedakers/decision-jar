import { useState, useEffect } from "react";
import { getCategoriesForTopic } from "@/lib/categories";
import { createIdea, updateIdea } from "@/app/actions/ideas";

export const DEFAULT_FORM_DATA = {
    description: "",
    details: "",
    indoor: true,
    duration: "0.5",
    activityLevel: "MEDIUM",
    cost: "$",
    timeOfDay: "ANY",
    category: "ACTIVITY",
    suggestedBy: "",
    isPrivate: false,
    weather: "ANY",
    requiresTravel: false,
};

interface UseIdeaFormProps {
    initialData?: any;
    currentUser?: any;
    jarTopic?: string | null;
    customCategories?: any[];
    onSuccess?: () => void;
    onClose: () => void;
}

export function useIdeaForm({ initialData, currentUser, jarTopic, customCategories, onSuccess, onClose }: UseIdeaFormProps) {
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
    const [isLoading, setIsLoading] = useState(false);

    // Initialize form data when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                description: initialData.description,
                details: initialData.details || "",
                indoor: initialData.indoor,
                duration: Number.isInteger(initialData.duration) ? `${initialData.duration}.0` : String(initialData.duration),
                activityLevel: initialData.activityLevel,
                cost: initialData.cost,
                timeOfDay: initialData.timeOfDay || "ANY",
                category: initialData.category || "ACTIVITY",
                suggestedBy: "", // Don't carry over suggestedBy for edits usually, or maybe we should? Original code didn't.
                isPrivate: initialData.isPrivate || false,
                weather: initialData.weather || "ANY",
                requiresTravel: initialData.requiresTravel || false,
            });
        } else {
            setFormData(DEFAULT_FORM_DATA); // Reset for new idea
        }
    }, [initialData]);

    const categories = getCategoriesForTopic(jarTopic, customCategories);

    // Ensure category is valid for topic
    useEffect(() => {
        if (categories.length > 0) {
            const isValid = categories.some(c => c.id === formData.category);
            if (!isValid) {
                setFormData(prev => ({ ...prev, category: categories[0].id }));
            }
        }
    }, [jarTopic, categories]); // Removed isOpen dependency as hook doesn't know about it, managing lifecycle via mount/unmount or props

    const isCommunitySubmission = currentUser?.isCommunityJar && !currentUser?.isCreator && !initialData?.id;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const isEditing = initialData && initialData.id;

            // Apply suggestedBy to description if present
            const finalDescription = formData.suggestedBy
                ? `${formData.description} (via ${formData.suggestedBy})`
                : formData.description;

            const apiBody = {
                description: finalDescription,
                details: formData.details,
                indoor: formData.indoor,
                duration: formData.duration,
                activityLevel: formData.activityLevel,
                cost: formData.cost,
                timeOfDay: formData.timeOfDay,
                category: formData.category,
                isPrivate: formData.isPrivate,
                weather: formData.weather,
                requiresTravel: formData.requiresTravel
            };

            let res;
            if (isEditing) {
                res = await updateIdea(initialData.id, apiBody);
            } else {
                res = await createIdea(apiBody);
            }

            if ('success' in res && res.success) { // Handle both standard success
                if (!isEditing || isEditing) { // Logic simplified: on success always notify/close
                    if (isCommunitySubmission) {
                        alert("🚀 Suggestion sent! The jar admin will review your idea soon.");
                    }
                    if (onSuccess) onSuccess();
                }
                onClose();
            } else {
                alert((res as any).error || "Failed to save idea");
            }
        } catch (error) {
            console.error(error);
            alert("Error saving idea");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        setFormData,
        isLoading,
        handleSubmit,
        categories,
        isCommunitySubmission
    };
}
