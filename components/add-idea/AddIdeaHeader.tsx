import { DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Loader2, Wand2, ShoppingCart } from "lucide-react";
import { Idea } from "@/lib/types";

interface AddIdeaHeaderProps {
    onClose: () => void;
    viewMode: 'PREVIEW' | 'EDIT';
    setViewMode: (mode: 'PREVIEW' | 'EDIT') => void;
    isWizardMode: boolean;
    setIsWizardMode: (mode: boolean) => void;
    showPreviewToggle: boolean;
    initialData?: Idea | Partial<Idea> | null;
    hasStructuredData: boolean;
    itinerary: any;
    cateringPlan: any;
    venueDetails: any;
    effectiveType: string | undefined;
    typeData: any;
    formData: any;
    handleExportShoppingPdf: () => void;
    isExportingShopping: boolean;
    randomize: () => void;
    isMagicLoading: boolean;
}

export function AddIdeaHeader({
    onClose,
    viewMode,
    setViewMode,
    isWizardMode,
    setIsWizardMode,
    showPreviewToggle,
    initialData,
    hasStructuredData,
    itinerary,
    cateringPlan,
    venueDetails,
    effectiveType,
    typeData,
    formData,
    handleExportShoppingPdf,
    isExportingShopping,
    randomize,
    isMagicLoading
}: AddIdeaHeaderProps) {
    return (
        <DialogHeader onClose={onClose} className="border-none pb-0">
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
    );
}
