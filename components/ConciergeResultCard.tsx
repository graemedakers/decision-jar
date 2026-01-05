import { Button } from "@/components/ui/Button";
import { ExternalLink, Heart, Info, MapPin, Plus, Star, Zap, Share2 } from "lucide-react";
import React from "react";
import { ShareButton } from "@/components/ShareButton";

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
    categoryType: string; // "MEAL" | "ACTIVITY" | "EVENT" | "DRINK" etc

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

    // Visual Overrides
    goActionLabel?: string;
    goActionClass?: string;
    ratingClass?: string;
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
    goActionLabel = "Go Now",
    goActionClass = "bg-gradient-to-r from-emerald-400/20 to-teal-400/20 text-emerald-700 dark:text-emerald-200 border border-emerald-400/30 hover:bg-emerald-400/30",
    ratingClass = "text-yellow-400"
}: ConciergeResultCardProps) {
    return (
        <div className="glass p-4 rounded-xl flex flex-col sm:flex-row gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
            <button
                onClick={() => onFavorite(rec, categoryType)}
                className={`absolute top-3 right-3 p-2 rounded-full transition-all z-10 ${rec.isFavorite
                    ? 'text-pink-500 bg-pink-500/10'
                    : 'text-slate-400 hover:text-pink-400 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
            >
                <Heart className={`w-5 h-5 ${rec.isFavorite ? 'fill-current' : ''}`} />
            </button>

            <div className="flex-1 pr-8">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">{rec.name}</h4>
                    {rec.price && (
                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-white/10 rounded text-slate-600 dark:text-slate-300">
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
                            <MapPin className="w-3 h-3" /> {rec.address}
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

            <div className="flex flex-wrap sm:flex-col gap-2 justify-start sm:justify-end">
                {rec.address && !rec.address.toLowerCase().includes('streaming') && categoryType !== 'BOOK' && categoryType !== 'GAME' && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-slate-600 dark:text-slate-300"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rec.name + " " + (rec.address || ""))}`, '_blank')}
                    >
                        <ExternalLink className="w-4 h-4 mr-1" /> Map
                    </Button>
                )}

                {rec.website && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-slate-600 dark:text-slate-300"
                        onClick={() => window.open(rec.website, '_blank')}
                    >
                        <ExternalLink className="w-4 h-4 mr-1" /> Web
                    </Button>
                )}

                <ShareButton
                    title={`${getRecommendationEmoji(categoryType)} ${rec.name}`}
                    description={getShareDescription(rec, categoryType)}
                    source={categoryType.toLowerCase() + '_concierge'}
                    contentType={categoryType.toLowerCase()}
                    className="text-xs h-8"
                />

                <Button
                    size="sm"
                    onClick={() => onAddToJar(rec, categoryType, isPrivate)}
                    className="text-xs bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20"
                >
                    <Plus className="w-4 h-4 mr-1" /> Jar
                </Button>

                <Button
                    size="sm"
                    onClick={() => onGoAction(rec, categoryType, isPrivate)}
                    className={`text-xs ${goActionClass}`}
                >
                    <Zap className="w-4 h-4 mr-1" /> {goActionLabel}
                </Button>
            </div>
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
