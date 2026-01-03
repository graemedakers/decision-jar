"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Key, MapPin, Loader2, Sparkles, ExternalLink, Plus, Zap, Star, Heart, Lock, Skull, Ghost, Briefcase, Calculator } from "lucide-react";
import { Button } from "./ui/Button";
import { useConciergeActions } from "@/hooks/useConciergeActions";
import { getCurrentLocation } from "@/lib/utils";
import { LocationInput } from "./LocationInput";
import { ConciergeResultCard } from "@/components/ConciergeResultCard";
import { useDemoConcierge } from "@/lib/use-demo-concierge";
import { DemoUpgradePrompt } from "./DemoUpgradePrompt";

interface EscapeRoomConciergeModalProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation?: string;
    onIdeaAdded?: () => void;
    onGoTonight?: (idea: any) => void;
    onFavoriteUpdated?: () => void;
}

export function EscapeRoomConciergeModal({ isOpen, onClose, userLocation, onIdeaAdded, onGoTonight, onFavoriteUpdated }: EscapeRoomConciergeModalProps) {
    const demoConcierge = useDemoConcierge();
    const [showTrialUsedPrompt, setShowTrialUsedPrompt] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isStandardizing, setIsStandardizing] = useState(false);

    // Filters
    const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
    const [difficulty, setDifficulty] = useState("any");
    const [groupSize, setGroupSize] = useState("any");
    const [location, setLocation] = useState(userLocation || "");
    const [isPrivate, setIsPrivate] = useState(true);

    const [recommendations, setRecommendations] = useState<any[]>([]);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Constants
    const THEME_OPTIONS = [
        "Horror", "Mystery", "Sci-Fi", "Adventure", "Crime/Heist", "Fantasy", "Historical", "Comedy"
    ];

    // Track initialization
    const [prevOpen, setPrevOpen] = useState(false);

    if (isOpen && !prevOpen) {
        setLocation(userLocation || "");
        setSelectedThemes([]);
        setRecommendations([]);
        setIsPrivate(true);
        setPrevOpen(true);
    } else if (!isOpen && prevOpen) {
        setPrevOpen(false);
    }

    useEffect(() => {
        if (recommendations.length > 0 && resultsRef.current) {
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
            const res = await fetch('/api/escape-room-concierge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    themes: selectedThemes,
                    location: location,
                    difficulty,
                    groupSize
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
                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                                    <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Escape Room Scout</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Unlock the best puzzles nearby</p>
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
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Search Area</label>
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
                                            className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center gap-1"
                                        >
                                            <MapPin className="w-3 h-3" />
                                            Use GPS
                                        </button>
                                    </div>
                                    <LocationInput
                                        value={location}
                                        onChange={setLocation}
                                        placeholder="City, Neighborhood, or Zip"
                                        isStandardizing={isStandardizing}
                                        updateProfileLocation={true}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Preferred Themes</label>
                                        <div className="flex flex-wrap gap-2">
                                            {THEME_OPTIONS.map((theme) => (
                                                <button
                                                    key={theme}
                                                    onClick={() => toggleSelection(theme, selectedThemes, setSelectedThemes)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedThemes.includes(theme)
                                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200'
                                                        }`}
                                                >
                                                    {theme}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Difficulty</label>
                                            <select
                                                value={difficulty}
                                                onChange={(e) => setDifficulty(e.target.value)}
                                                className="w-full h-10 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md text-slate-900 dark:text-white"
                                            >
                                                <option value="any">Any Difficulty</option>
                                                <option value="Beginner">Beginner (First Time)</option>
                                                <option value="Intermediate">Intermediate (Puzzler)</option>
                                                <option value="Expert">Expert (Master)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Group Size</label>
                                            <select
                                                value={groupSize}
                                                onChange={(e) => setGroupSize(e.target.value)}
                                                className="w-full h-10 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md text-slate-900 dark:text-white"
                                            >
                                                <option value="any">Any Size</option>
                                                <option value="2-3">Small (2-3 people)</option>
                                                <option value="4-6">Standard (4-6 people)</option>
                                                <option value="7-10">Large (7-10 people)</option>
                                                <option value="10+">Party (10+ people)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="py-2">
                                <Button
                                    type="button"
                                    onClick={() => handleGetRecommendations()}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Searching Rooms...</>
                                    ) : (
                                        <><Sparkles className="w-5 h-5 mr-2" /> Find Escape Rooms</>
                                    )}
                                </Button>
                            </div>

                            {recommendations.length > 0 && (
                                <div ref={resultsRef} className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Rooms for You</h3>
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
                                                categoryType="ACTIVITY"
                                                mainIcon={Ghost}
                                                subtext={rec.theme_type}
                                                secondIcon={Briefcase}
                                                secondSubtext={rec.difficulty_level}
                                                isPrivate={isPrivate}
                                                onFavorite={handleFavorite}
                                                onAddToJar={handleAddToJar}
                                                onGoAction={handleGoTonight}
                                                goActionLabel="Go Now"
                                                goActionClass="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-700 dark:text-yellow-200 border border-yellow-400/30 hover:bg-yellow-400/30"
                                                ratingClass="text-orange-500 dark:text-yellow-400"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {showTrialUsedPrompt && demoConcierge && demoConcierge.triesRemaining === 0 && (
                                <div className="mt-6">
                                    <DemoUpgradePrompt
                                        reason="premium"
                                        message="Loved the Escape Room Concierge? Sign up for unlimited access to ALL 11 premium concierge tools!"
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
