"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Loader2, Sparkles, ExternalLink, Plus, Zap, Heart, Dumbbell, Lock, Star } from "lucide-react";
import { Button } from "./ui/Button";
import { useConciergeActions } from "@/hooks/useConciergeActions";
import { getCurrentLocation } from "@/lib/utils";
import { LocationInput } from "./LocationInput";
import { ConciergeResultCard } from "@/components/ConciergeResultCard";

interface FitnessConciergeModalProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation?: string;
    onIdeaAdded?: () => void;
    onGoTonight?: (idea: any) => void;
    onFavoriteUpdated?: () => void;
}

export function FitnessConciergeModal({ isOpen, onClose, userLocation, onIdeaAdded, onGoTonight, onFavoriteUpdated }: FitnessConciergeModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isStandardizing, setIsStandardizing] = useState(false);
    const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>([]);
    const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
    const [selectedBudget, setSelectedBudget] = useState<string[]>([]);
    const [location, setLocation] = useState(userLocation || "");
    const [isPrivate, setIsPrivate] = useState(true);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const resultsRef = useRef<HTMLDivElement>(null);

    const WORKOUT_OPTIONS = [
        "Gym", "Running", "Yoga", "Pilates", "Boxing",
        "HIIT", "Swimming", "Rock Climbing", "Dance Class"
    ];

    const VIBE_OPTIONS = [
        "High Energy", "Focused", "Group Class", "Solo",
        "Outdoor", "Intense", "Beginner Friendly"
    ];

    const BUDGET_OPTIONS = [
        "Free", "$ (Cheap)", "$$ (Moderate)", "$$$ (Premium)"
    ];

    const [prevOpen, setPrevOpen] = useState(false);

    if (isOpen && !prevOpen) {
        setLocation(userLocation || "");
        setSelectedWorkouts([]);
        setSelectedVibes([]);
        setSelectedBudget([]);
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
        setIsLoading(true);
        try {
            const res = await fetch('/api/fitness-concierge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workoutType: selectedWorkouts.join(", "),
                    vibe: selectedVibes.join(", "),
                    budget: selectedBudget.join(", "),
                    location: location
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setRecommendations(data.recommendations);
            } else {
                alert("Failed to get recommendations.");
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
                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                                    <Dumbbell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Fitness Planner</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Get moving</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 space-y-6 px-7">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location</label>
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
                                            className="text-[10px] uppercase tracking-wider font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-colors flex items-center gap-1"
                                        >
                                            <MapPin className="w-3 h-3" />
                                            Use GPS
                                        </button>
                                    </div>
                                    <LocationInput
                                        value={location}
                                        onChange={setLocation}
                                        placeholder="Current location"
                                        isStandardizing={isStandardizing}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Workout Type (Select multiple)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {WORKOUT_OPTIONS.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => toggleSelection(c, selectedWorkouts, setSelectedWorkouts)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedWorkouts.includes(c)
                                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Vibe (Select multiple)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {VIBE_OPTIONS.map((v) => (
                                            <button
                                                key={v}
                                                onClick={() => toggleSelection(v, selectedVibes, setSelectedVibes)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedVibes.includes(v)
                                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Budget (Select multiple)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {BUDGET_OPTIONS.map((b) => (
                                            <button
                                                key={b}
                                                onClick={() => toggleSelection(b, selectedBudget, setSelectedBudget)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedBudget.includes(b)
                                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                {b}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="py-2">
                                <Button
                                    type="button"
                                    onClick={handleGetRecommendations}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/20"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Finding Workouts...</>
                                    ) : (
                                        <><Sparkles className="w-5 h-5 mr-2" /> Find Gyms & Classes</>
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
                                                categoryType="FITNESS"
                                                mainIcon={Dumbbell}
                                                subtext={rec.speciality || 'Fitness'}
                                                isPrivate={isPrivate}
                                                onFavorite={handleFavorite}
                                                onAddToJar={handleAddToJar}
                                                onGoAction={handleGoTonight}
                                                goActionLabel="Go Now"
                                                goActionClass="bg-gradient-to-r from-orange-400/20 to-red-400/20 text-orange-700 dark:text-orange-200 border border-orange-400/30"
                                                ratingClass="text-yellow-500 dark:text-yellow-400"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
