import { Button } from "@/components/ui/Button";
import { ExternalLink, Heart, MapPin, Plus, Star, Zap, Clock, Calendar, ChevronDown, ChevronUp, Check, Loader2, Car } from "lucide-react";
import React from "react";
import { ShareButton } from "@/components/ShareButton";
import { motion, AnimatePresence } from "framer-motion";
import { ACTION_LABELS } from "@/lib/ui-constants";
import { StandardizedIdeaHeader } from "./StandardizedIdeaHeader";

// Categories that are inherently digital/online and shouldn't show map
const DIGITAL_CATEGORIES = ['BOOK', 'GAME', 'STREAMING', 'ONLINE', 'DIGITAL', 'VIRTUAL'];

// Keywords that indicate an item is digital/online (check address and name)
const DIGITAL_KEYWORDS = [
    'streaming', 'online', 'digital', 'virtual', 'app', 'mobile', 'web',
    'netflix', 'disney+', 'amazon prime', 'hbo', 'hulu', 'spotify',
    'audible', 'kindle', 'ebook', 'podcast', 'youtube', 'twitch',
    'playstation', 'xbox', 'nintendo', 'steam', 'epic games', 'pc game'
];

/**
 * Detects if a recommendation is a digital/online item
 * that shouldn't show physical location buttons
 */
function isDigitalItem(rec: ConciergeRecommendation, categoryType: string): boolean {
    // Check category type
    if (DIGITAL_CATEGORIES.includes(categoryType.toUpperCase())) {
        return true;
    }

    // Check for digital keywords in name or address
    const textToCheck = `${rec.name || ''} ${rec.address || ''} ${rec.description || ''}`.toLowerCase();
    return DIGITAL_KEYWORDS.some(keyword => textToCheck.includes(keyword));
}

interface ConciergeRecommendation {
    name: string;
    description: string;
    price?: string;
    address?: string;
    website?: string;
    google_rating?: string | number;
    isFavorite?: boolean;
    [key: string]: any;
}

interface ConciergeResultCardProps {
    rec: ConciergeRecommendation;
    categoryType: string;

    // Customization
    mainIcon?: React.ElementType;
    subtext?: string;
    secondIcon?: React.ElementType;
    secondSubtext?: string;

    // State & Handlers
    isPrivate: boolean;
    onFavorite: (rec: any, type: any) => void;
    onAddToJar: (rec: any, type: any, isPrivate: boolean) => void;
    onGoAction: (rec: any, type: any, isPrivate: boolean) => void;
    isAddingToJar?: boolean;  // Loading state for Add to Jar button

    // Visual Overrides
    goActionLabel?: string;
    goActionClass?: string;
    ratingClass?: string;

    // Accordion Logic
    expandable?: boolean;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    renderExpandedContent?: React.ReactNode;
}

export function ConciergeResultCard({
    rec,
    categoryType,
    mainIcon: MainIcon,
    subtext,
    secondIcon: SecondIcon,
    secondSubtext,
    isPrivate,
    onFavorite,
    onAddToJar,
    onGoAction,
    isAddingToJar = false,
    goActionLabel = ACTION_LABELS.DO_THIS,
    goActionClass = "bg-gradient-to-r from-emerald-400/20 to-teal-400/20 text-emerald-700 dark:text-emerald-200 border border-emerald-400/30 hover:bg-emerald-400/30",
    ratingClass = "text-yellow-400",
    expandable = false,
    isExpanded = false,
    onToggleExpand,
    renderExpandedContent
}: ConciergeResultCardProps) {
    return (
        <div className="glass p-4 rounded-xl flex flex-col hover:bg-slate-50 dark:hover:bg-white/5 transition-colors relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
            <div className="flex flex-col sm:flex-row gap-4 mb-2">
                <button
                    onClick={() => onFavorite(rec, categoryType)}
                    className={`absolute top-3 p-2 rounded-full transition-all z-10 ${rec.isFavorite
                        ? 'text-pink-500 bg-pink-500/10'
                        : 'text-slate-400 hover:text-pink-400 hover:bg-slate-100 dark:hover:bg-white/5'
                        } ${expandable ? 'right-14' : 'right-3'}`}
                >
                    <Heart className={`w-5 h-5 ${rec.isFavorite ? 'fill-current' : ''}`} />
                </button>

                {expandable && (
                    <button
                        onClick={onToggleExpand}
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-full transition-all z-10 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                        aria-label={isExpanded ? "Collapse details" : "View full plan"}
                    >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                )}

                <div className={`flex-1 ${expandable ? 'pr-24' : 'pr-12'}`}>
                    <StandardizedIdeaHeader
                        name={rec.name || rec.typeData?.title || rec.typeData?.eventName || rec.typeData?.establishmentName || rec.typeData?.activityName || rec.title || 'Untitled Idea'}
                        description={rec.description || (rec.typeData && 'vibe' in rec.typeData ? `${rec.typeData.vibe} Itinerary` : '')}
                        address={rec.address}
                        price={rec.price}
                        rating={rec.google_rating}
                        website={rec.website || rec.typeData?.playUrl || rec.typeData?.officialWebsite}
                        menuUrl={rec.menuUrl || rec.typeData?.menuUrl || rec.typeData?.menuLink}
                        category={categoryType}
                        showtimes={rec.showtimes}
                        showDates={rec.show_dates}
                        cinemaName={rec.cinema_name}
                        compact={true}
                    />
                </div>

            </div>

            {/* Action Buttons Container - Two rows for clarity */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                {/* Row 2: Primary Action Buttons - always on same line */}
                <div className="flex items-center gap-1.5">
                    <ShareButton
                        title={`${getRecommendationEmoji(categoryType)} ${rec.name}`}
                        description={getShareDescription(rec, categoryType)}
                        source={categoryType.toLowerCase() + '_concierge'}
                        contentType={categoryType.toLowerCase()}
                        className="text-xs h-7 px-2 whitespace-nowrap"
                    />

                    <Button
                        size="sm"
                        disabled={rec.isAdded || isAddingToJar}
                        onClick={() => onAddToJar(rec, categoryType, isPrivate)}
                        className={`text-xs h-7 px-2 transition-all whitespace-nowrap ${rec.isAdded
                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                            : isAddingToJar
                                ? "bg-slate-200 dark:bg-white/20 text-slate-500 cursor-wait"
                                : "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20"}`}
                    >
                        {isAddingToJar ? (
                            <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> {ACTION_LABELS.ADDING}</>
                        ) : rec.isAdded ? (
                            <><Check className="w-3 h-3 mr-1" /> {ACTION_LABELS.ADDED}</>
                        ) : (
                            <><Plus className="w-3 h-3 mr-1" /> {ACTION_LABELS.JAR}</>
                        )}
                    </Button>

                    <Button
                        size="sm"
                        onClick={() => onGoAction(rec, categoryType, isPrivate)}
                        className={`text-xs h-7 px-2 whitespace-nowrap ${goActionClass}`}
                    >
                        <Zap className="w-3 h-3 mr-1" /> {goActionLabel}
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {expandable && isExpanded && renderExpandedContent && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 border-t border-slate-100 dark:border-white/5 mt-2">
                            {renderExpandedContent}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Helper functions for sharing
function getRecommendationEmoji(categoryType: string): string {
    switch (categoryType) {
        case 'MEAL': return '🍽️';
        case 'DRINK': return '🍸';
        case 'EVENT': return '🎬';
        case 'ACTIVITY': return '✨';
        case 'BOOK': return '📚';
        default: return '✨';
    }
}

function getShareDescription(rec: any, categoryType: string): string {
    const details = [rec.cuisine, rec.price, rec.address].filter(Boolean).join(' • ');
    const typeLabel = categoryType === 'MEAL' ? 'Restaurant' : categoryType === 'DRINK' ? 'Bar' : 'Activity';
    return `${typeLabel} Recommendation: ${rec.name}${details ? `\n${details}` : ''}${rec.description ? `\n\n${rec.description.slice(0, 150)}...` : ''}`;
}
