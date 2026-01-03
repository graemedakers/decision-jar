"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wine, Beer, MapPin, Loader2, Sparkles, ExternalLink, Plus, Zap, Star, Martini, Heart, Lock } from "lucide-react";
import { Button } from "./ui/Button";
import { LocationInput } from "./LocationInput";
import { ConciergeResultCard } from "@/components/ConciergeResultCard";
import { useDemoConcierge } from "@/lib/use-demo-concierge";
import { DemoUpgradePrompt } from "./DemoUpgradePrompt";

interface BarConciergeModalProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation?: string;
    onIdeaAdded?: () => void;
    onGoTonight?: (idea: any) => void;
    onFavoriteUpdated?: () => void;
}

import { useConciergeActions } from "@/hooks/useConciergeActions";
import { getCurrentLocation } from "@/lib/utils";

export function BarConciergeModal({ isOpen, onClose, userLocation, onIdeaAdded, onGoTonight, onFavoriteUpdated }: BarConciergeModalProps) {
    const demoConcierge = useDemoConcierge();
    const [showTrialUsedPrompt, setShowTrialUsedPrompt] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isStandardizing, setIsStandardizing] = useState(false);
    const [selectedDrinks, setSelectedDrinks] = useState<string[]>([]);
    const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
    const [location, setLocation] = useState(userLocation || "");
    const [price, setPrice] = useState("any");
    const [isPrivate, setIsPrivate] = useState(true);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Constants for selection options
    const DRINK_OPTIONS = [
        "Cocktails", "Wine", "Craft Beer", "Whiskey", "Gin", "Tequila/Mezcal",
        "Pub", "Dive Bar", "Rooftop", "Speakeasy", "Sake", "Non-Alcoholic"
    ];

    const VIBE_OPTIONS = [
        "Romantic", "Casual", "Lively", "Cozy", "Upscale", "Hidden Gem",
        "Outdoor", "Quiet", "Trendy", "Dance", "Live Music", "Sports"
    ];

    // Using a ref to track if we have initialized for this open session
    const [prevOpen, setPrevOpen] = useState(false);

    if (isOpen && !prevOpen) {
        setLocation(userLocation || "");
        setSelectedDrinks([]);
        setSelectedVibes([]);
        setRecommendations([]);
        setPrevOpen(true);
    } else if (!isOpen && prevOpen) {
        setPrevOpen(false);
    }

    useEffect(() => {
        if (recommendations.length > 0 && resultsRef.current) {
            // Small timeout to ensure DOM is ready
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [recommendations]);

    const { handleAddToJar, handleGoTonight, handleFavorite, toggleSelection } = useConciergeActions({
        onIdeaAdded,
        onGoTonight,
        onFavoriteUpdated,
        onClose,
        setRecommendations
    });

    const handleGetRecommendations = async () => {
        if (demoConcierge && !demoConcierge.hasUsedTrial) {
            demoConcierge.onUse();
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/bar-concierge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    drinks: selectedDrinks.join(", "),
                    vibe: selectedVibes.join(", "),
                    location: location,
                    price
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setRecommendations(data.recommendations);

                if (demoConcierge && demoConcierge.triesRemaining === 0) {
                    setTimeout(() => {
                        setShowTrialUsedPrompt(true);
                    }, 3000);
                }
            } else {
                const data = await res.json().catch(() => ({}));
                alert(`Error ${res.status}: ${data.error || "Failed to get recommendations. Please try again."}`);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card w-full max-w-2xl relative max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10"
                    >
                        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                                    <Wine className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bar Scout</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Find the perfect spot for a drink</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 space-y-6 px-7">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location to Search</label>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    const currentLoc = await getCurrentLocation();
                                                    setLocation(currentLoc);
                                                } catch (err) {
                                                    alert("Could not get location. Please check permissions.");
                                                }
                                            }}
                                            className="text-[10px] uppercase tracking-wider font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors flex items-center gap-1"
                                        >
                                            <MapPin className="w-3 h-3" />
                                            Use GPS
                                        </button>
                                    </div>
                                    <LocationInput
                                        value={location}
                                        onChange={setLocation}
                                        placeholder="Current location, Neighborhood, or City"
                                        isStandardizing={isStandardizing}
                                        updateProfileLocation={true}
                                    />
                                    <p className="text-xs text-slate-500">Edit this to search in a specific area.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Drinks Preference (Select multiple)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {DRINK_OPTIONS.map((c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => toggleSelection(c, selectedDrinks, setSelectedDrinks)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedDrinks.includes(c)
                                                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200'
                                                        }`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Vibe / Atmosphere (Select multiple)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {VIBE_OPTIONS.map((v) => (
                                                <button
                                                    key={v}
                                                    onClick={() => toggleSelection(v, selectedVibes, setSelectedVibes)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedVibes.includes(v)
                                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200'
                                                        }`}
                                                >
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Price Range</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['any', 'cheap', 'moderate', 'expensive'].map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setPrice(p)}
                                                className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${price === p
                                                    ? 'bg-purple-500/20 border-purple-500 text-purple-600 dark:text-purple-200'
                                                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                {p === 'any' ? 'Any' : p.charAt(0).toUpperCase() + p.slice(1)} {p !== 'any' && `(${p === 'cheap' ? '$' : p === 'moderate' ? '$$' : '$$$'})`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="py-2">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        console.log("Find Bars clicked");
                                        handleGetRecommendations();
                                    }}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg shadow-purple-500/20"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Finding Spots...</>
                                    ) : (
                                        <><Sparkles className="w-5 h-5 mr-2" /> Find Bars</>
                                    )}
                                </Button>
                            </div>

                            {recommendations.length > 0 && (
                                <div ref={resultsRef} className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Picks</h3>
                                        <button
                                            onClick={() => setIsPrivate(!isPrivate)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isPrivate ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500'}`}
                                        >
                                            <Lock className="w-3.5 h-3.5" />
                                            {isPrivate ? "Secret Mode On" : "Public Mode"}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {recommendations.map((rec, index) => (
                                            <ConciergeResultCard
                                                key={index}
                                                rec={rec}
                                                categoryType="BAR"
                                                mainIcon={Martini}
                                                subtext={rec.speciality}
                                                isPrivate={isPrivate}
                                                onFavorite={handleFavorite}
                                                onAddToJar={handleAddToJar}
                                                onGoAction={handleGoTonight}
                                                goActionLabel="Go Tonight"
                                                goActionClass="bg-gradient-to-r from-pink-400/20 to-rose-400/20 text-pink-700 dark:text-pink-200 border border-pink-400/30 hover:bg-pink-400/30"
                                                ratingClass="text-yellow-400"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {showTrialUsedPrompt && demoConcierge && demoConcierge.triesRemaining === 0 && (
                                <div className="mt-6">
                                    <DemoUpgradePrompt
                                        reason="premium"
                                        message="Loved the Bar Concierge? Sign up for unlimited access to ALL 11 premium concierge tools!"
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
