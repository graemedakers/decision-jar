"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gamepad2, Loader2, Sparkles, ExternalLink, Plus, Zap, Heart, Monitor, User, Lock, Star } from "lucide-react";
import { Button } from "./ui/Button";
import { useConciergeActions } from "@/hooks/useConciergeActions";
import { ConciergeResultCard } from "@/components/ConciergeResultCard";

interface GameConciergeModalProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation?: string; // Not used but kept for interface consistency
    onIdeaAdded?: () => void;
    onGoTonight?: (idea: any) => void;
    onFavoriteUpdated?: () => void;
}

export function GameConciergeModal({ isOpen, onClose, onIdeaAdded, onGoTonight, onFavoriteUpdated }: GameConciergeModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Selections
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [selectedBudget, setSelectedBudget] = useState<string[]>([]);
    const [selectedDuration, setSelectedDuration] = useState<string[]>([]);
    const [isPrivate, setIsPrivate] = useState(true);

    const [recommendations, setRecommendations] = useState<any[]>([]);
    const resultsRef = useRef<HTMLDivElement>(null);

    const GENRE_OPTIONS = [
        "Action", "Adventure", "Strategy", "Puzzle", "RPG",
        "Shooter", "Party / Social", "Card / Board", "Simulation", "Sports", "Trivia"
    ];

    const PLAYER_OPTIONS = [
        "Solo (1)", "Duo (2)", "Small Group (3-4)", "Large Group (5+)", "Massively Multiplayer"
    ];

    const BUDGET_OPTIONS = [
        "Free", "Cheap (<$10)", "Moderate ($10-$30)", "Premium ($30+)"
    ];

    const DURATION_OPTIONS = [
        "Quick (<20 min)", "Short (30-60 min)", "Medium (1-2 hours)", "Long (2+ hours)", "Endless"
    ];

    const [prevOpen, setPrevOpen] = useState(false);

    if (isOpen && !prevOpen) {
        setSelectedGenres([]);
        setSelectedPlayers([]);
        setSelectedBudget([]);
        setSelectedDuration([]);
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
            const res = await fetch('/api/game-concierge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    genre: selectedGenres.join(", "),
                    players: selectedPlayers.join(", "),
                    budget: selectedBudget.join(", "),
                    duration: selectedDuration.join(", ")
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setRecommendations(data.recommendations);
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(errorData.error || "Failed to get recommendations.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred. Please try again.");
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
                                    <Gamepad2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Game Finder</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Discover digital games</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 space-y-6 px-7">
                            <div className="space-y-4">

                                {/* Genre */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Genre (Select multiple)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {GENRE_OPTIONS.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => toggleSelection(c, selectedGenres, setSelectedGenres)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedGenres.includes(c)
                                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Players */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Players</label>
                                    <div className="flex flex-wrap gap-2">
                                        {PLAYER_OPTIONS.map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => toggleSelection(p, selectedPlayers, setSelectedPlayers)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedPlayers.includes(p)
                                                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Budget */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Budget</label>
                                    <div className="flex flex-wrap gap-2">
                                        {BUDGET_OPTIONS.map((b) => (
                                            <button
                                                key={b}
                                                onClick={() => toggleSelection(b, selectedBudget, setSelectedBudget)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedBudget.includes(b)
                                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                {b}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Duration */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Typical Duration</label>
                                    <div className="flex flex-wrap gap-2">
                                        {DURATION_OPTIONS.map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => toggleSelection(d, selectedDuration, setSelectedDuration)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedDuration.includes(d)
                                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                {d}
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
                                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Searching Games...</>
                                    ) : (
                                        <><Sparkles className="w-5 h-5 mr-2" /> Find Games</>
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
                                                categoryType="GAME"
                                                mainIcon={Gamepad2}
                                                subtext={rec.speciality || 'Game'}
                                                secondIcon={Monitor}
                                                secondSubtext={rec.address || 'N/A'}
                                                isPrivate={isPrivate}
                                                onFavorite={handleFavorite}
                                                onAddToJar={handleAddToJar}
                                                onGoAction={handleGoTonight}
                                                goActionLabel="Play Now"
                                                goActionClass="bg-gradient-to-r from-indigo-400/20 to-purple-400/20 text-indigo-700 dark:text-indigo-200 border border-indigo-400/30"
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
