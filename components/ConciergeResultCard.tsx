import { Button } from "@/components/ui/Button";
import { ExternalLink, Heart, MapPin, Plus, Star, Zap, Clock, Calendar, ChevronDown, ChevronUp, Check, Loader2 } from "lucide-react";
import React from "react";
import { ShareButton } from "@/components/ShareButton";
import { motion, AnimatePresence } from "framer-motion";
import { ACTION_LABELS } from "@/lib/ui-constants";

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
                        className="absolute top-3 right-3 p-2 rounded-full transition-all z-10 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                        aria-label={isExpanded ? "Collapse details" : "View full plan"}
                    >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                )}

                <div className="flex-1 pr-14">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{rec.name}</h4>
                        {rec.price && (
                            <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-white/10 rounded text-slate-600 dark:text-slate-300 ml-2 whitespace-nowrap">
                                {rec.price}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{rec.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-400">
                        {MainIcon && subtext && (
                            <span className="flex items-center gap-1">
                                <MainIcon className="w-3 h-3" /> {subtext}
                            </span>
                        )}
                        {SecondIcon && secondSubtext && (
                            <span className="flex items-center gap-1">
                                <SecondIcon className="w-3 h-3" /> {secondSubtext}
                            </span>
                        )}
                        {rec.address && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {rec.cinema_name ? `${rec.cinema_name} - ${rec.address}` : rec.address}
                            </span>
                        )}
                        {rec.showtimes && (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                <Clock className="w-3 h-3" /> {rec.showtimes}
                            </span>
                        )}
                        {rec.show_dates && (
                            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                                <Calendar className="w-3 h-3" /> {rec.show_dates}
                            </span>
                        )}
                        {rec.google_rating && (
                            <span className={`flex items-center gap-1 ${ratingClass}`}>
                                <Star className="w-3 h-3 fill-current" /> {rec.google_rating}
                            </span>
                        )}
                    </div>
                    {rec.google_rating && (
                        <button
                            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(rec.name + " " + (rec.address || "") + " reviews")}`, '_blank')}
                            className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 underline mt-1 text-left"
                        >
                            Read Google Reviews
                        </button>
                    )}
                </div>

            </div>

            {/* Action Buttons Container - Two rows for clarity */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                {/* Row 1: Info Links (Map, Web) - only show if there are visible links */}
                {((rec.address && !rec.address.toLowerCase().includes('streaming') && categoryType !== 'BOOK' && categoryType !== 'GAME') || rec.website) && (
                    <div className="flex items-center gap-2">
                        {rec.address && !rec.address.toLowerCase().includes('streaming') && categoryType !== 'BOOK' && categoryType !== 'GAME' && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs text-slate-600 dark:text-slate-300 h-7 px-2 whitespace-nowrap"
                                onClick={() => {
                                    const query = rec.cinema_name ? `${rec.cinema_name} ${rec.address}` : `${rec.name} ${rec.address}`;
                                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
                                }}
                            >
                                <ExternalLink className="w-3 h-3 mr-1" /> Map
                            </Button>
                        )}

                        {rec.website && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs text-slate-600 dark:text-slate-300 h-7 px-2 whitespace-nowrap"
                                onClick={() => window.open(rec.website, '_blank')}
                            >
                                <ExternalLink className="w-3 h-3 mr-1" /> {rec.showtimes ? 'Tickets' : 'Web'}
                            </Button>
                        )}
                    </div>
                )}

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
