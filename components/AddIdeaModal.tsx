"use client";
import { getItinerary, getCateringPlan, getVenueDetails } from "@/lib/utils";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/Dialog";
import { useState, useEffect, useRef } from "react";
import { useIdeaForm } from "@/hooks/useIdeaForm";
import { useMagicIdea } from "@/hooks/useMagicIdea";
import { Idea, UserData } from "@/lib/types";
import { IdeaWizard } from "@/components/wizard/IdeaWizard"; // Import Wizard
import { useModalSystem } from "@/components/ModalProvider";
import { suggestIdeaType, getStandardizedData } from "@/lib/idea-standardizer";
import { useFavorites } from "@/hooks/useFavorites";
import { Loader2, Plus, Trash2, Move, Heart } from "lucide-react";
import React from 'react';

// New Hooks
import { usePdfExport } from "@/hooks/usePdfExport";
import { useYouTubeMetadata } from "@/hooks/useYouTubeMetadata";
import { useAddIdeaAnalytics } from "@/hooks/useAddIdeaAnalytics";

// New Components
import { AddIdeaHeader } from "./add-idea/AddIdeaHeader";
import { AddIdeaForm } from "./add-idea/AddIdeaForm";
import { PreviewSection } from "./add-idea/PreviewSection";

interface AddIdeaModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Idea | Partial<Idea> | null; // If provided, we are in "Edit" mode
    isPremium?: boolean;
    onUpgrade?: () => void;
    jarTopic?: string | null;
    customCategories?: any[];
    currentUser?: UserData | null;
    onSuccess?: () => void;
    initialMode?: 'default' | 'magic';
    availableJars?: { id: string; name: string }[]; // For "Move to Jar" feature
}

export function AddIdeaModal({ isOpen, onClose, initialData, isPremium, onUpgrade, jarTopic, customCategories, currentUser, onSuccess, initialMode = 'default', availableJars = [] }: AddIdeaModalProps) {
    const { openModal: openGlobalModal } = useModalSystem();
    const { favorites, toggleFavorite, isToggling } = useFavorites();

    // Default to wizard for new ideas, form for edits
    const [isWizardMode, setIsWizardMode] = useState(!initialData?.id && initialMode !== 'magic');
    const [viewMode, setViewMode] = useState<'PREVIEW' | 'EDIT'>('EDIT');
    const contentRef = useRef<HTMLDivElement>(null);
    const shoppingRef = useRef<HTMLDivElement>(null);

    const { formData, setFormData: originalSetFormData, isLoading, handleSubmit, handleDelete, categories, setTopicOverride, currentTopic } = useIdeaForm({
        initialData,
        currentUser,
        jarTopic,
        customCategories,
        onSuccess,
        onClose,
        isOpen
    });

    // Wrapped submit handler to track successful additions
    const handleSubmitWithTracking = async (e: React.FormEvent) => {
        markAdded();
        await handleSubmit(e);
    };

    // Tracking Wrapper
    const setFormData: typeof originalSetFormData = (updater) => {
        markInteraction();
        originalSetFormData(updater);
    };

    const { markInteraction, markAdded, trackAbandonment } = useAddIdeaAnalytics({
        isOpen,
        isWizardMode,
        isEditMode: !!initialData?.id
    });

    const { isExportingShopping, handleExportShoppingPdf } = usePdfExport();

    useYouTubeMetadata({ isOpen, formData, setFormData });

    const { randomize, isLoading: isMagicLoading } = useMagicIdea({
        jarTopic,
        currentUser,
        onIdeaGenerated: (randomIdea) => {
            setFormData(prev => ({
                ...prev,
                description: randomIdea.description,
                category: randomIdea.category,
                indoor: randomIdea.indoor,
                duration: String(randomIdea.duration),
                activityLevel: randomIdea.activityLevel,
                cost: randomIdea.cost,
                timeOfDay: randomIdea.timeOfDay,
                details: (randomIdea.details || "") + (randomIdea.website ? `\n\n${randomIdea.website}` : "")
            }));
        }
    });

    // Enhanced preview detection
    const effectiveType = (formData.ideaType || suggestIdeaType(formData))?.toLowerCase();
    const typeData = formData.typeData || getStandardizedData(formData);
    const hasStructuredData = !!(effectiveType && typeData);
    const itinerary = getItinerary(formData.details);
    const cateringPlan = getCateringPlan(formData.details);
    const venueDetails = getVenueDetails(formData.details);
    const hasMarkdown = formData.details && (formData.details.includes("###") || formData.details.includes("**"));
    const showPreviewToggle = !!effectiveType || !!itinerary || !!cateringPlan || !!venueDetails || !!hasMarkdown || !!formData.description || !!formData.details || !!initialData?.id;

    useEffect(() => {
        if (isOpen) {
            setIsWizardMode(!initialData?.id && initialMode !== 'magic');

            // Default to Formatted View (PREVIEW) if it's an existing idea that has content to show
            if (initialData?.id && showPreviewToggle) {
                setViewMode('PREVIEW');
            } else {
                setViewMode('EDIT');
            }

            if (initialMode === 'magic' && !initialData?.id) {
                // Small delay to ensure hook is ready
                setTimeout(() => randomize(), 100);
            }
        }
    }, [isOpen, initialData?.id, initialMode, showPreviewToggle]);


    // Enhanced close handler with abandonment tracking
    const handleClose = () => {
        trackAbandonment();
        onClose();
    };


    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent raw className="bg-slate-50 dark:bg-slate-900 border-none">
                <AddIdeaHeader
                    onClose={handleClose}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    isWizardMode={isWizardMode}
                    setIsWizardMode={setIsWizardMode}
                    showPreviewToggle={showPreviewToggle}
                    initialData={initialData}
                    hasStructuredData={hasStructuredData}
                    itinerary={itinerary}
                    cateringPlan={cateringPlan}
                    venueDetails={venueDetails}
                    effectiveType={effectiveType}
                    typeData={typeData}
                    formData={formData}
                    handleExportShoppingPdf={() => handleExportShoppingPdf(shoppingRef.current, `shopping-list-${formData.description}`)}
                    isExportingShopping={isExportingShopping}
                    randomize={randomize}
                    isMagicLoading={isMagicLoading}
                />

                <div className="flex-1 overflow-y-auto overscroll-contain px-4 md:px-6 py-4 custom-scrollbar">
                    {showPreviewToggle && viewMode === 'PREVIEW' ? (
                        <PreviewSection
                            contentRef={contentRef}
                            shoppingRef={shoppingRef}
                            formData={formData}
                            handleSubmitWithTracking={handleSubmitWithTracking}
                            effectiveType={effectiveType}
                            typeData={typeData}
                            hasStructuredData={hasStructuredData}
                            cateringPlan={cateringPlan}
                        />
                    ) : isWizardMode && !initialData?.id ? (
                        <IdeaWizard
                            formData={formData}
                            setFormData={setFormData as any}
                            categories={categories}
                            onSubmit={handleSubmitWithTracking}
                            onCancel={onClose}
                            isLoading={isLoading}
                            onTopicChange={setTopicOverride}
                            currentTopic={currentTopic}
                        />
                    ) : (
                        <AddIdeaForm
                            formData={formData}
                            setFormData={setFormData}
                            handleSubmitWithTracking={handleSubmitWithTracking}
                            categories={categories}
                            jarTopic={jarTopic}
                            currentUser={currentUser}
                            initialData={initialData}
                        />
                    )}
                </div>

                {(viewMode === 'PREVIEW' || !isWizardMode || !!initialData?.id) && (
                    <DialogFooter className="bg-slate-100 dark:bg-slate-900/50">
                        <div className="flex gap-2 w-full">
                            {initialData && initialData.id && availableJars.length > 1 && (initialData.canEdit ?? (currentUser && initialData.createdById === currentUser.id)) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        openGlobalModal('MOVE_IDEA', { idea: initialData });
                                    }}
                                    disabled={isLoading}
                                    className="px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-900/30 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center justify-center shrink-0"
                                    title="Move to another jar"
                                >
                                    <Move className="w-5 h-5" />
                                </button>
                            )}
                            {initialData && initialData.id && (initialData.canEdit ?? (currentUser && initialData.createdById === currentUser.id)) && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                    className="px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center shrink-0"
                                    title="Delete Idea"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                            {initialData && initialData.id && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            await toggleFavorite(initialData);
                                        } catch (err) {
                                            console.error("Failed to update favorite", err);
                                        }
                                    }}
                                    disabled={isToggling}
                                    className={`px-4 py-3 rounded-xl border transition-colors flex items-center justify-center shrink-0 ${favorites.some(f => f.name === (initialData.description || initialData.name))
                                        ? 'border-pink-200 dark:border-pink-900/30 text-pink-500 bg-pink-50 dark:bg-pink-900/10'
                                        : 'border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                                        }`}
                                    title={favorites.some(f => f.name === (initialData.description || initialData.name)) ? "Remove from Favorites" : "Add to Favorites"}
                                >
                                    {isToggling ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Heart className={`w-5 h-5 ${favorites.some(f => f.name === (initialData.description || initialData.name)) ? 'fill-current' : ''}`} />
                                    )}
                                </button>
                            )}
                            <button
                                type="submit"
                                form="add-idea-form"
                                className="flex-1 inline-flex items-center justify-center transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none bg-primary hover:bg-primary/90 text-white rounded-xl px-4 py-3 text-sm font-bold shadow-lg"
                                disabled={isLoading || (!!initialData?.id && !(initialData.canEdit ?? (currentUser && initialData.createdById === currentUser.id)))}
                            >
                                {isLoading ? (
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : null}
                                {initialData && initialData.id
                                    ? (!(initialData.canEdit ?? (currentUser && initialData.createdById === currentUser.id))
                                        ? "View Only"
                                        : "Save Changes")
                                    : (
                                        <span className="flex items-center gap-2"><Plus className="w-5 h-5" /> Add to Jar</span>
                                    )
                                }
                            </button>
                        </div>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog >
    );
}
