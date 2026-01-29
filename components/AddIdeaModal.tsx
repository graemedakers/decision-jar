"use client";
import { getItinerary, getCateringPlan, getVenueDetails } from "@/lib/utils";
import { ItineraryPreview } from "./ItineraryPreview";
import { CateringPreview } from "./CateringPreview";
import { VenuePreview } from "./VenuePreview";
import { ItineraryMarkdownRenderer } from "./ItineraryMarkdownRenderer";
import { ShoppingListPreview } from "./ShoppingListPreview";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Clock, Activity, DollarSign, Home, Trees, Loader2, ExternalLink, Wand2, Lock, Sun, CloudRain, Snowflake, Car, Sparkles, Trash2, Move, ShoppingCart, Heart } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { COST_LEVELS, ACTIVITY_LEVELS, TIME_OF_DAY, WEATHER_TYPES } from "@/lib/constants";
import { exportToPdf } from "@/lib/pdf-export";
import { useIdeaForm } from "@/hooks/useIdeaForm";
import { useMagicIdea } from "@/hooks/useMagicIdea";
import { TOPIC_CATEGORIES } from "@/lib/categories";
import { Idea, UserData } from "@/lib/types";
import { IdeaWizard } from "@/components/wizard/IdeaWizard"; // Import Wizard
import { trackModalAbandoned } from "@/lib/analytics";
import { useModalSystem } from "@/components/ModalProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { IdeaFormRenderer } from "@/components/idea-forms/IdeaFormRenderer"; // New import
import { IdeaTypeTemplate } from "./idea-types/IdeaTypeTemplate";
import { IdeaTypeRenderer } from "./idea-types/IdeaTypeRenderer";
import { suggestIdeaType, getStandardizedData } from "@/lib/idea-standardizer";
import { UnifiedIdeaCard } from "./UnifiedIdeaCard";
import React from 'react';
import { useFavorites } from "@/hooks/useFavorites";


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
    const [isExporting, setIsExporting] = useState(false);
    const [isExportingShopping, setIsExportingShopping] = useState(false);
    const shoppingRef = useRef<HTMLDivElement>(null);

    // Abandonment tracking
    const [modalOpenTime, setModalOpenTime] = useState<number | null>(null);
    const [hadInteraction, setHadInteraction] = useState(false);
    const ideaWasAdded = useRef(false);

    const { formData, setFormData: originalSetFormData, isLoading, handleSubmit, handleDelete, categories } = useIdeaForm({
        initialData,
        currentUser,
        jarTopic,
        customCategories,
        onSuccess,
        onClose
    });

    // Wrapped setFormData to track interactions
    const setFormData: typeof originalSetFormData = (updater) => {
        setHadInteraction(true);
        originalSetFormData(updater);
    };

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

    const handleExportPdf = async () => {
        if (!contentRef.current) return;
        setIsExporting(true);
        try {
            await exportToPdf(contentRef.current, formData.description || 'plan');
        } catch (error) {
            console.error("PDF Export failed", error);
            alert("Failed to export PDF");
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportShoppingPdf = async () => {
        if (!shoppingRef.current) return;
        setIsExportingShopping(true);
        try {
            await exportToPdf(shoppingRef.current, `shopping-list-${formData.description || 'menu'}`);
        } catch (error) {
            console.error("Shopping PDF Export failed", error);
        } finally {
            setIsExportingShopping(false);
        }
    };

    const fetchYouTubeMetadata = async (url: string) => {
        try {
            const response = await fetch(`/api/youtube/metadata?url=${encodeURIComponent(url)}`);
            if (!response.ok) return null;
            const data = await response.json();
            return data;
        } catch (e) {
            console.error("YouTube metadata fetch skipped:", e);
            return null;
        }
    };

    // Enhanced preview detection
    const effectiveType = (formData.ideaType || suggestIdeaType(formData))?.toLowerCase();
    const typeData = formData.typeData || getStandardizedData(formData);
    const hasStructuredData = !!(effectiveType && typeData);
    const itinerary = getItinerary(formData.details);
    const cateringPlan = getCateringPlan(formData.details);
    const venueDetails = getVenueDetails(formData.details);
    const hasMarkdown = formData.details && (formData.details.includes("###") || formData.details.includes("**"));
    const showPreviewToggle = !!effectiveType || !!itinerary || !!cateringPlan || !!venueDetails || !!hasMarkdown;

    useEffect(() => {
        if (isOpen) {
            setIsWizardMode(!initialData?.id && initialMode !== 'magic');
            setViewMode('EDIT');

            if (initialMode === 'magic' && !initialData?.id) {
                // Small delay to ensure hook is ready
                setTimeout(() => randomize(), 100);
            }
        }
    }, [isOpen, initialData?.id, initialMode, showPreviewToggle]);

    // Track modal open time for abandonment analytics
    useEffect(() => {
        if (isOpen) {
            setModalOpenTime(Date.now());
            setHadInteraction(false);
            ideaWasAdded.current = false;
        }
    }, [isOpen]);

    // Auto-detect YouTube metadata for shared links
    useEffect(() => {
        if (!isOpen) return;

        const urlToCheck = formData.details || formData.description;
        const isYouTubeUrl = urlToCheck && (urlToCheck.includes('youtube.com/watch') || urlToCheck.includes('youtu.be/') || urlToCheck.includes('youtube.com/shorts/'));

        if (isYouTubeUrl) {
            const isGenericTitle = !formData.description || formData.description === 'Shared Link' || formData.description === 'YouTube Video';

            // If it's a generic title, we definitely want to fetch
            if (isGenericTitle) {
                // Set loading state immediately in the description field
                if (formData.description !== "Loading video info...") {
                    setFormData(prev => ({ ...prev, description: "Loading video info...", ideaType: 'youtube' }));
                }

                fetchYouTubeMetadata(urlToCheck).then(metadata => {
                    if (metadata) {
                        setFormData(prev => {
                            // Extract video ID if not already present
                            let vId = prev.typeData?.videoId;
                            if (!vId) {
                                const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{10,12})/i;
                                const match = urlToCheck.match(youtubeRegex);
                                if (match) vId = match[1];
                            }

                            return {
                                ...prev,
                                description: metadata.title || prev.description,
                                ideaType: 'youtube',
                                typeData: {
                                    ...prev.typeData,
                                    title: metadata.title,
                                    channelTitle: metadata.authorName,
                                    watchUrl: urlToCheck,
                                    thumbnailUrl: metadata.thumbnailUrl,
                                    videoId: vId
                                }
                            };
                        });
                    }
                });
            }
        }
    }, [isOpen, formData.details, formData.description === 'Shared Link', formData.description === 'YouTube Video']);

    // Enhanced close handler with abandonment tracking
    const handleClose = () => {
        // Track abandonment if modal is being closed without adding an idea
        if (modalOpenTime && !ideaWasAdded.current) {
            const timeOpenSeconds = (Date.now() - modalOpenTime) / 1000;
            trackModalAbandoned('add_idea', timeOpenSeconds, hadInteraction, {
                mode: isWizardMode ? 'wizard' : 'form',
                is_edit: !!initialData?.id
            });
        }
        onClose();
    };

    // Wrapped submit handler to track successful additions
    const handleSubmitWithTracking = async (e: React.FormEvent) => {
        setHadInteraction(true); // Mark interaction on submit attempt
        ideaWasAdded.current = true; // Mark that idea was added (if submission fails, error is thrown and modal stays open)
        await handleSubmit(e);
    };




    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent raw className="bg-slate-50 dark:bg-slate-900 border-none">
                <DialogHeader onClose={handleClose} className="border-none pb-0">
                    <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {viewMode === 'PREVIEW' && showPreviewToggle ? (
                            hasStructuredData ? (
                                {
                                    'recipe': '🍳 Recipe Details',
                                    'book': '📚 Book Details',
                                    'movie': '🎬 Movie Details',
                                    'game': '🎮 Game Details',
                                    'event': '🎭 Event Details',
                                    'travel': '✈️ Travel Details',
                                    'itinerary': '📋 Itinerary',
                                    'dining': (() => {
                                        const cuisine = (typeData as any)?.cuisine || "";
                                        const isBar = /bar|pub|nightlife|club|cocktail/i.test(cuisine);
                                        return isBar ? '🍸 Bar Details' : '🍽️ Dining Details';
                                    })(),
                                    'music': '🎵 Music Details',
                                    'activity': '🏃 Activity Details',
                                    'youtube': '📺 YouTube Video'
                                }[effectiveType || ''] || 'Idea Preview'
                            ) : itinerary ? "Itinerary Preview" :
                                (cateringPlan || formData.details?.includes('Shopping List')) ? "Menu Preview" :
                                    venueDetails ? "Venue Details" :
                                        (effectiveType === 'recipe' ? "Recipe Details" : "Plan Preview")
                        ) : (initialData && initialData.id ? "Edit Idea" : "Add New Idea")}
                        {(!initialData || !initialData.id) && !showPreviewToggle && (
                            <button
                                type="button"
                                onClick={randomize}
                                disabled={isMagicLoading}
                                className="p-1.5 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
                                title="Auto-fill with random idea"
                                aria-label="Auto-fill with random idea"
                            >
                                {isMagicLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                            </button>
                        )}
                    </DialogTitle>

                    {showPreviewToggle && (
                        <div className="flex justify-between items-center w-full mt-2">
                            <div className="flex bg-slate-200/50 dark:bg-black/40 p-1 rounded-lg w-fit">
                                <button
                                    onClick={() => setViewMode('PREVIEW')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'PREVIEW' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                                    aria-label="Switch to Preview Mode"
                                >
                                    Formatted View
                                </button>
                                <button
                                    onClick={() => setViewMode('EDIT')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'EDIT' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                                    aria-label="Switch to Edit Mode"
                                >
                                    Edit Details
                                </button>
                            </div>

                            {(cateringPlan || formData.details?.includes('Shopping List')) && viewMode === 'PREVIEW' && (
                                <button
                                    onClick={handleExportShoppingPdf}
                                    disabled={isExportingShopping}
                                    className="text-xs font-bold text-slate-500 hover:text-orange-600 flex items-center gap-1 transition-colors disabled:opacity-50"
                                    aria-label="Export Shopping List"
                                >
                                    {isExportingShopping ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShoppingCart className="w-3 h-3" />} Shopping List
                                </button>
                            )}
                        </div>
                    )}

                    {/* Wizard Toggle for New Ideas */}
                    {!initialData?.id && !showPreviewToggle && (
                        <div className="flex bg-slate-200/50 dark:bg-black/40 p-1 rounded-lg w-fit mt-2">
                            <button
                                onClick={() => setIsWizardMode(true)}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${isWizardMode ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                                aria-label="Use Step-by-Step Wizard"
                            >
                                Step-by-Step
                            </button>
                            <button
                                onClick={() => setIsWizardMode(false)}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!isWizardMode ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                                aria-label="Use Quick Form"
                            >
                                Quick Form
                            </button>
                        </div>
                    )}
                </DialogHeader>

                <div className="flex-1 overflow-y-auto overscroll-contain px-4 md:px-6 py-4 custom-scrollbar">
                    {showPreviewToggle && viewMode === 'PREVIEW' ? (
                        <div className="space-y-4">
                            <div ref={contentRef} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-white/5">
                                <form id="add-idea-form" onSubmit={handleSubmitWithTracking}>
                                    <UnifiedIdeaCard
                                        idea={formData}
                                        effectiveType={effectiveType || undefined}
                                        typeData={typeData}
                                    />
                                </form>

                                {/* Additional Markdown content if present and not handled by card */}
                                {formData.details && (formData.details.includes('###') || formData.details.includes('**')) && !hasStructuredData && (
                                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                                        <ItineraryMarkdownRenderer
                                            markdown={formData.details}
                                            variant={formData.details?.includes('### Day') ? 'accordion' : 'sections'}
                                            theme={{ sectionHeaderColor: 'text-secondary' }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Hidden component for shopping list PDF export */}
                            {(cateringPlan || formData.details?.includes('Shopping List')) && (
                                <div className="absolute left-[-9999px] top-0 pointer-events-none overflow-hidden h-0">
                                    <div ref={shoppingRef} className="w-[794px] bg-white text-slate-900 p-8">
                                        <ShoppingListPreview plan={cateringPlan} title={formData.description} markdown={formData.details} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : isWizardMode && !initialData?.id ? (
                        <IdeaWizard
                            formData={formData}
                            setFormData={setFormData as any}
                            categories={categories}
                            onSubmit={handleSubmitWithTracking}
                            onCancel={onClose}
                            isLoading={isLoading}
                        />
                    ) : (
                        <form id="add-idea-form" onSubmit={handleSubmitWithTracking} className="space-y-6">
                            <fieldset disabled={!!initialData?.id && (!currentUser || initialData.createdById !== currentUser.id)} className="space-y-6 disabled:opacity-80 min-w-0">
                                <div className="space-y-2 min-w-0">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Idea Type (Optional)</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={formData.ideaType || ""}
                                            onChange={(e) => setFormData({ ...formData, ideaType: e.target.value || undefined, typeData: undefined })}
                                            className="glass-input flex-1 text-slate-800 dark:text-white"
                                        >
                                            <option value="">Standard (No specific type)</option>
                                            <option value="simple">Simple (Quote, Joke, Note)</option>
                                            <option value="dining">Dining / Bar</option>
                                            <option value="recipe">Recipe</option>
                                            <option value="book">Book</option>
                                            <option value="movie">Movie</option>
                                            <option value="music">Music</option>
                                            <option value="game">Game</option>
                                            <option value="activity">Activity</option>
                                            <option value="event">Event/Show</option>
                                            <option value="travel">Travel/Stay</option>
                                            <option value="itinerary">Itinerary</option>
                                        </select>

                                        {!formData.ideaType && suggestIdeaType(formData) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const suggested = suggestIdeaType(formData);
                                                    const data = getStandardizedData(formData);
                                                    if (suggested) {
                                                        setFormData({
                                                            ...formData,
                                                            ideaType: suggested,
                                                            typeData: data || undefined
                                                        });
                                                    }
                                                }}
                                                className="px-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all animate-pulse"
                                                title={`Standardize as ${suggestIdeaType(formData)}`}
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                Standardize
                                            </button>
                                        )}
                                    </div>


                                </div>

                                {formData.ideaType && (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <IdeaFormRenderer
                                            ideaType={formData.ideaType}
                                            typeData={formData.typeData}
                                            onChange={(data) => {
                                                // Prevent infinite loops with deep equality check
                                                if (JSON.stringify(data) !== JSON.stringify(formData.typeData)) {
                                                    setFormData(prev => ({ ...prev, typeData: data }));
                                                }
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2 min-w-0">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Category</label>
                                    <div className="bg-slate-200/50 dark:bg-black/20 rounded-xl p-1 border border-slate-200 dark:border-white/10 overflow-hidden w-full">
                                        <div className="flex overflow-x-auto no-scrollbar gap-1 p-0.5 w-full">
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                                    className={`flex items-center justify-center gap-2 py-2 px-5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap min-w-fit flex-shrink-0 ${formData.category === cat.id
                                                        ? "bg-primary text-white shadow-md scale-[1.02]"
                                                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-white/5"
                                                        }`}
                                                >
                                                    <cat.icon className="w-4 h-4" /> {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 min-w-0">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                        {formData.category === 'MEAL' || formData.category === 'RESTAURANT' ? "Name of place" : "Short Description"}
                                    </label>
                                    <Input
                                        id="description-input"
                                        value={formData.description}
                                        onChange={async (e) => {
                                            const val = e.target.value;
                                            // If user pastes a YouTube link as the title, try to give it a better default title
                                            if (val.includes('youtube.com/watch') || val.includes('youtu.be/')) {
                                                setFormData({ ...formData, description: "Loading title...", details: val + (formData.details ? "\n" + formData.details : "") });

                                                const metadata = await fetchYouTubeMetadata(val);
                                                if (metadata) {
                                                    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{10,12})/i;
                                                    const match = val.match(youtubeRegex);
                                                    const vId = match ? match[1] : undefined;

                                                    setFormData(prev => ({
                                                        ...prev,
                                                        description: metadata.title || "YouTube Video",
                                                        ideaType: 'youtube',
                                                        typeData: {
                                                            ...prev.typeData,
                                                            title: metadata.title,
                                                            channelTitle: metadata.authorName,
                                                            watchUrl: val,
                                                            thumbnailUrl: metadata.thumbnailUrl,
                                                            videoId: vId
                                                        }
                                                    }));
                                                } else {
                                                    setFormData(prev => ({ ...prev, description: "YouTube Video" }));
                                                }
                                            } else {
                                                setFormData({ ...formData, description: val });
                                            }
                                        }}
                                        placeholder={categories.find(c => c.id === formData.category)?.placeholder || "e.g. Build a blanket fort"}
                                        className="w-full"
                                        required
                                        aria-label="Description"
                                    />
                                </div>

                                <div className="space-y-2 min-w-0">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Photo URL (Optional)</label>
                                    <Input
                                        value={formData.photoUrls?.[0] || ""}
                                        onChange={(e) => setFormData({ ...formData, photoUrls: e.target.value ? [e.target.value] : [] })}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full font-mono text-xs"
                                    />

                                    {formData.photoUrls?.[0] && (
                                        <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 mt-2">
                                            <img
                                                src={formData.photoUrls[0]}
                                                alt="Preview"
                                                className="w-full h-48 object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    const parent = e.currentTarget.parentElement;
                                                    if (parent) {
                                                        const errorDiv = document.createElement('div');
                                                        errorDiv.className = 'w-full h-48 flex items-center justify-center text-slate-400 text-sm';
                                                        errorDiv.textContent = 'Failed to load image';
                                                        parent.appendChild(errorDiv);
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, photoUrls: [] })}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                                title="Remove image"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 min-w-0">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Suggested By (Optional)</label>
                                    <Input
                                        value={formData.suggestedBy}
                                        onChange={(e) => setFormData({ ...formData, suggestedBy: e.target.value })}
                                        placeholder="e.g. Billy, Sarah (Leave blank for You)"
                                        className="w-full"
                                    />
                                </div>
                            </fieldset>

                            <div className="space-y-2 min-w-0">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Details (Optional)</label>
                                    {formData.details.match(/https?:\/\/[^\s]+/) && !getItinerary(formData.details) && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 px-2"
                                            onClick={() => {
                                                const match = formData.details.match(/https?:\/\/[^\s]+/);
                                                if (match) window.open(match[0], '_blank');
                                            }}
                                        >
                                            <ExternalLink className="w-3 h-3 mr-1" />
                                            Visit Website
                                        </Button>
                                    )}
                                </div>
                                <textarea
                                    disabled={!!initialData?.id && (!currentUser || initialData.createdById !== currentUser.id)}
                                    value={formData.details}
                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                    placeholder={
                                        (() => {
                                            const topicKey = jarTopic ? Object.keys(TOPIC_CATEGORIES).find(k => k.toLowerCase() === jarTopic.toLowerCase()) : "Activities";
                                            switch (topicKey) {
                                                case "Movies": return "e.g. Streaming platform, release year, or cinema location...";
                                                case "Restaurants": return "e.g. Reservation time, dress code, or parking info...";
                                                case "Travel": return "e.g. Flight numbers, hotel confirmation, or packing list...";
                                                case "Wellness": return "e.g. What to wear, arrival time...";
                                                default: return "Add more info, e.g. what to bring, specific location...";
                                            }
                                        })()
                                    }
                                    className={`glass-input w-full min-h-[100px] py-2 px-3 resize-none text-slate-800 dark:text-white placeholder:text-slate-400 disabled:opacity-80 ${showPreviewToggle ? 'font-mono text-xs opacity-70' : ''}`}
                                    aria-label="Details"
                                />
                            </div>

                            <fieldset disabled={!!initialData?.id && (!currentUser || initialData.createdById !== currentUser.id)} className="space-y-6 disabled:opacity-80 min-w-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2 min-w-0">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Setting</label>
                                        <div className="flex bg-slate-200/50 dark:bg-black/20 rounded-xl p-1 border border-slate-200 dark:border-white/10">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, indoor: true })}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${formData.indoor
                                                    ? "bg-primary text-white shadow-lg"
                                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                                                    }`}
                                                aria-label="Indoor Setting"
                                            >
                                                <Home className="w-4 h-4" /> Indoor
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, indoor: false })}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${!formData.indoor
                                                    ? "bg-primary text-white shadow-lg"
                                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                                                    }`}
                                                aria-label="Outdoor Setting"
                                            >
                                                <Trees className="w-4 h-4" /> Outdoor
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 min-w-0">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Duration</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                className="glass-input pl-10 cursor-pointer w-full text-slate-800 dark:text-white"
                                                aria-label="Duration"
                                            >
                                                <option value="0.25">15 mins</option>
                                                <option value="0.5">30 mins</option>
                                                <option value="1.0">1 hour</option>
                                                <option value="2.0">2 hours</option>
                                                <option value="4.0">Half Day</option>
                                                <option value="8.0">Full Day</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2 min-w-0">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Cost</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select
                                                value={formData.cost}
                                                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                                className="glass-input pl-10 cursor-pointer w-full text-slate-800 dark:text-white"
                                                aria-label="Cost"
                                            >
                                                {COST_LEVELS.map(level => (
                                                    <option key={level.id} value={level.id}>{level.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2 min-w-0">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Energy</label>
                                        <div className="relative">
                                            <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select
                                                value={formData.activityLevel}
                                                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                                                className="glass-input pl-10 cursor-pointer w-full text-slate-800 dark:text-white"
                                                aria-label="Energy Level"
                                            >
                                                {ACTIVITY_LEVELS.map(level => (
                                                    <option key={level.id} value={level.id}>{level.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 min-w-0">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Time of Day</label>
                                    <div className="flex bg-slate-200/50 dark:bg-black/20 rounded-xl p-1 border border-slate-200 dark:border-white/10">
                                        {TIME_OF_DAY.map((time) => (
                                            <button
                                                key={time.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, timeOfDay: time.id })}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.timeOfDay === time.id
                                                    ? "bg-secondary text-white shadow-lg"
                                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                                                    }`}
                                                aria-label={`Time of Day: ${time.label}`}
                                            >
                                                {time.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </fieldset>

                            <div className="space-y-4 pb-4">
                                <div className="p-4 bg-slate-200/50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4">
                                    <div className="flex items-start justify-between group cursor-pointer"
                                        onClick={() => setFormData({ ...formData, requiresTravel: !formData.requiresTravel })}
                                        role="button"
                                        tabIndex={0}
                                        aria-pressed={formData.requiresTravel}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFormData({ ...formData, requiresTravel: !formData.requiresTravel }) }}
                                    >
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${formData.requiresTravel ? 'bg-blue-500 text-white' : 'bg-slate-300 dark:bg-white/5 text-slate-400'}`}>
                                                <Car className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0 pt-0.5">
                                                <p className="font-bold text-slate-900 dark:text-white leading-tight">Requires Traveling?</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">e.g. driving/trip (This is an "Outing")</p>
                                            </div>
                                        </div>
                                        <div className={`w-12 h-6 shrink-0 ml-3 rounded-full relative transition-colors ${formData.requiresTravel ? 'bg-blue-500' : 'bg-slate-300 dark:bg-white/10'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.requiresTravel ? 'left-7' : 'left-1'}`} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Weather Vibe</label>
                                        <div className="grid grid-cols-4 gap-1">
                                            {WEATHER_TYPES.map((w) => {
                                                const Icon = w.id === 'ANY' ? Sparkles : w.id === 'SUNNY' ? Sun : w.id === 'RAINY' ? CloudRain : Snowflake;
                                                return (
                                                    <button
                                                        key={w.id}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, weather: w.id })}
                                                        className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold transition-all border ${formData.weather === w.id
                                                            ? "bg-amber-500 text-white border-amber-400 shadow-md"
                                                            : "bg-white/30 dark:bg-white/5 border-transparent text-slate-500 dark:text-slate-400 hover:bg-white/10"
                                                            }`}
                                                        aria-label={`Weather: ${w.label}`}
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                        {w.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start justify-between p-4 bg-slate-200/50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/10 group cursor-pointer transition-all hover:bg-slate-200 dark:hover:bg-black/30"
                                    onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                                    role="button"
                                    tabIndex={0}
                                    aria-pressed={formData.isPrivate}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFormData({ ...formData, isPrivate: !formData.isPrivate }) }}
                                >
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${formData.isPrivate ? 'bg-amber-500 text-white' : 'bg-slate-300 dark:bg-white/5 text-slate-400'}`}>
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 pt-0.5">
                                            <p className="font-bold text-slate-900 dark:text-white leading-tight">Keep it a secret?</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Other users won't see this until it's selected.</p>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-6 shrink-0 ml-3 rounded-full relative transition-colors ${formData.isPrivate ? 'bg-amber-500' : 'bg-slate-300 dark:bg-white/10'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isPrivate ? 'left-7' : 'left-1'}`} />
                                    </div>
                                </div>
                            </div>
                        </form>
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
