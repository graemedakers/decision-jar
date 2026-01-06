import { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/utils";
import { getCategoriesForTopic } from "@/lib/categories";

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
            const url = isEditing ? getApiUrl(`/api/ideas/${initialData.id}`) : getApiUrl("/api/ideas");
            const method = isEditing ? "PUT" : "POST";

            const payload = { ...formData };
            if (formData.suggestedBy) {
                payload.description = `${formData.description} (via ${formData.suggestedBy})`;
            }

            // Reconstruct payload to match API expectation
            const apiBody = {
                description: payload.description,
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

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(apiBody),
                credentials: 'include',
            });

            if (res.ok) {
                if (method === "POST" || method === "PUT") {
                    if (isCommunitySubmission) {
                        alert("🚀 Suggestion sent! The jar admin will review your idea soon.");
                    }
                    if (onSuccess) onSuccess();
                }
                onClose();
            } else {
                alert("Failed to save idea");
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
