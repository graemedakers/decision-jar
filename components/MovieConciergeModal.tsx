"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Film, Clapperboard, MapPin, Loader2, Sparkles, ExternalLink, Plus, Zap, Star, Heart, Popcorn } from "lucide-react";
import { Button } from "./ui/Button";
import { useConciergeActions } from "@/hooks/useConciergeActions";

interface MovieConciergeModalProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation?: string;
    onIdeaAdded?: () => void;
    onGoTonight?: (idea: any) => void;
    onFavoriteUpdated?: () => void;
}

export function MovieConciergeModal({ isOpen, onClose, userLocation, onIdeaAdded, onGoTonight, onFavoriteUpdated }: MovieConciergeModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
    const [location, setLocation] = useState(userLocation || "");
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Constants for selection options
    const GENRE_OPTIONS = [
        "Action", "Comedy", "Drama", "Sci-Fi", "Horror", "Romance",
        "Thriller", "Documentary", "Classic", "Family", "Animation"
    ];

    const VIBE_OPTIONS = [
        "Feel Good", "Intense", "Relaxing", "Mind-Bending",
        "Scary", "Educational", "Inspirational", "Funny"
    ];

    const [prevOpen, setPrevOpen] = useState(false);

    if (isOpen && !prevOpen) {
        setLocation(userLocation || "");
        setSelectedGenres([]);
        setSelectedVibes([]);
        setRecommendations([]);
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
            const res = await fetch('/api/movie-concierge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    genre: selectedGenres.join(", "),
                    vibe: selectedVibes.join(", "),
                    location
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
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                                    <Clapperboard className="w-5 h-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Movie Scout</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Find the perfect film for tonight</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 space-y-6 px-7">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Genres (Select multiple)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {GENRE_OPTIONS.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => toggleSelection(c, selectedGenres, setSelectedGenres)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedGenres.includes(c)
                                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Vibe / Mood (Select multiple)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {VIBE_OPTIONS.map((v) => (
                                            <button
                                                key={v}
                                                onClick={() => toggleSelection(v, selectedVibes, setSelectedVibes)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedVibes.includes(v)
                                                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                {v}
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
                                    className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/20"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Scouting Movies...</>
                                    ) : (
                                        <><Sparkles className="w-5 h-5 mr-2" /> Find Movies</>
                                    )}
                                </Button>
                            </div>

                            {recommendations.length > 0 && (
                                <div ref={resultsRef} className="space-y-4 pt-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Picks</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {recommendations.map((rec, index) => (
                                            <div key={index} className="glass p-4 rounded-xl flex flex-col sm:flex-row gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                                <button
                                                    onClick={() => handleFavorite(rec, "MOVIE")}
                                                    className={`absolute top-3 right-3 p-2 rounded-full transition-all z-10 ${rec.isFavorite
                                                        ? 'text-pink-500 bg-pink-500/10'
                                                        : 'text-slate-400 hover:text-pink-400'
                                                        }`}
                                                >
                                                    <Heart className={`w-5 h-5 ${rec.isFavorite ? 'fill-current' : ''}`} />
                                                </button>

                                                <div className="flex-1 pr-8">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{rec.name}</h4>
                                                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-white/10 rounded text-slate-600 dark:text-slate-300">{rec.price}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{rec.description}</p>
                                                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                                                        <span className="flex items-center gap-1"><Film className="w-3 h-3" /> {rec.cuisine}</span>
                                                        <span className="flex items-center gap-1">⏱️ {rec.opening_hours}</span>
                                                        {rec.google_rating && (
                                                            <span className="flex items-center gap-1 text-yellow-400">
                                                                <Star className="w-3 h-3 fill-yellow-400" /> {rec.google_rating}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap sm:flex-col gap-2 justify-start sm:justify-end">
                                                    {rec.website && (
                                                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => window.open(rec.website, '_blank')}>
                                                            <ExternalLink className="w-4 h-4 mr-1" /> Info
                                                        </Button>
                                                    )}
                                                    <Button size="sm" onClick={() => handleAddToJar(rec)} className="text-xs bg-slate-100 dark:bg-white/10">
                                                        <Plus className="w-4 h-4 mr-1" /> Jar
                                                    </Button>
                                                    <Button size="sm" onClick={() => handleGoTonight(rec)} className="text-xs bg-gradient-to-r from-red-400/20 to-rose-400/20 text-red-700 dark:text-red-200 border border-red-400/30">
                                                        <Popcorn className="w-4 h-4 mr-1" /> Watch Now
                                                    </Button>
                                                </div>
                                            </div>
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
