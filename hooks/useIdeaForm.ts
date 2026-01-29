import { useState, useEffect } from "react";
import { getCategoriesForTopic } from "@/lib/categories";
import { showSuccess, showError } from "@/lib/toast";
import { useIdeaMutations } from "@/hooks/mutations/useIdeaMutations";

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
    photoUrls: [] as string[],
    ideaType: undefined as string | undefined,
    typeData: undefined as any,
    website: undefined as string | undefined, // NEW
    address: undefined as string | undefined, // NEW
    googleRating: undefined as number | undefined, // NEW
    openingHours: undefined as string | undefined, // NEW
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

    // Initialize form data when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                description: initialData.description || "",
                details: initialData.details || "",
                indoor: initialData.indoor ?? DEFAULT_FORM_DATA.indoor,
                duration: initialData.duration !== undefined
                    ? (Number.isInteger(initialData.duration) ? `${initialData.duration}.0` : String(initialData.duration))
                    : DEFAULT_FORM_DATA.duration,
                activityLevel: initialData.activityLevel || DEFAULT_FORM_DATA.activityLevel,
                cost: initialData.cost || DEFAULT_FORM_DATA.cost,
                timeOfDay: initialData.timeOfDay || DEFAULT_FORM_DATA.timeOfDay,
                category: initialData.category || DEFAULT_FORM_DATA.category,
                suggestedBy: initialData.suggestedBy || "",
                isPrivate: initialData.isPrivate ?? (currentUser?.defaultIdeaPrivate ?? DEFAULT_FORM_DATA.isPrivate),
                weather: initialData.weather || DEFAULT_FORM_DATA.weather,
                requiresTravel: initialData.requiresTravel ?? DEFAULT_FORM_DATA.requiresTravel,
                photoUrls: initialData.photoUrls || [],
                ideaType: initialData.ideaType || undefined,
                typeData: initialData.typeData || undefined,
                website: initialData.website || undefined,
                address: initialData.address || undefined,
                googleRating: initialData.googleRating || undefined,
                openingHours: initialData.openingHours || undefined,
            });
        } else {
            setFormData({
                ...DEFAULT_FORM_DATA,
                isPrivate: currentUser?.defaultIdeaPrivate ?? DEFAULT_FORM_DATA.isPrivate
            });
        }
    }, [initialData, currentUser?.defaultIdeaPrivate]);

    // Map ideaType to appropriate topic for category selection
    // This ensures books show book categories, movies show movie categories, etc.
    const getTopicFromIdeaType = (ideaType: string | undefined): string | null => {
        if (!ideaType) return null;
        const ideaTypeToTopicMap: Record<string, string> = {
            'book': 'Books',
            'movie': 'Movies',
            'recipe': 'Cooking & Recipes',
            'game': 'Activities', // Games use Activities categories
            'dining': 'Restaurants',
            'travel': 'Travel',
            'event': 'Activities',
            'music': 'Activities',
            'activity': 'Activities',
            'itinerary': 'Activities'
        };
        return ideaTypeToTopicMap[ideaType] || null;
    };

    // Use ideaType-derived topic if available, otherwise fall back to jar topic
    const effectiveTopic = getTopicFromIdeaType(formData.ideaType) || jarTopic;
    const categories = getCategoriesForTopic(effectiveTopic, customCategories);

    // Ensure category is valid for topic
    useEffect(() => {
        if (categories.length > 0) {
            const isValid = categories.some(c => c.id === formData.category);
            if (!isValid) {
                setFormData(prev => ({ ...prev, category: categories[0].id }));
            }
        }
    }, [jarTopic, categories]);



    const { addIdea, updateIdea, deleteIdea } = useIdeaMutations();
    const isLoading = addIdea.isPending || updateIdea.isPending || deleteIdea.isPending;

    const handleSubmit = async (e?: React.FormEvent, isDirectSubmit = false) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

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
                requiresTravel: formData.requiresTravel,
                photoUrls: formData.photoUrls,
                ideaType: formData.ideaType, // NEW
                typeData: formData.typeData, // NEW
                website: formData.website,
                address: formData.address,
                googleRating: formData.googleRating,
                openingHours: formData.openingHours,
            };

            if (isEditing) {
                await updateIdea.mutateAsync({ id: initialData.id, data: apiBody });
                showSuccess("Idea updated successfully!");
            } else {
                await addIdea.mutateAsync(apiBody);
                showSuccess("Idea added to jar!");
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("[useIdeaForm] Error:", error);
        }
    };

    const handleDelete = async () => {
        if (!initialData?.id) return;
        if (!confirm("Are you sure you want to delete this idea?")) return;

        try {
            await deleteIdea.mutateAsync(initialData.id);
            showSuccess("Idea deleted successfully");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return {
        formData,
        setFormData,
        isLoading,
        handleSubmit,
        handleDelete,
        categories,

    };
}
