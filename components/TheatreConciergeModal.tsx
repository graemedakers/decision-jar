"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ticket, MapPin, Loader2, Sparkles, ExternalLink, Plus, Zap, Star, Heart, Theater, Lock } from "lucide-react";
import { Button } from "./ui/Button";
import { useConciergeActions } from "@/hooks/useConciergeActions";
import { getCurrentLocation } from "@/lib/utils";
import { LocationInput } from "./LocationInput";
import { ConciergeResultCard } from "@/components/ConciergeResultCard";

interface TheatreConciergeModalProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation?: string;
    onIdeaAdded?: () => void;
    onGoTonight?: (idea: any) => void;
    onFavoriteUpdated?: () => void;
}

export function TheatreConciergeModal({ isOpen, onClose, userLocation, onIdeaAdded, onGoTonight, onFavoriteUpdated }: TheatreConciergeModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isStandardizing, setIsStandardizing] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
    const [location, setLocation] = useState(userLocation || "");
    const [isPrivate, setIsPrivate] = useState(true);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Constants for selection options
    const GENRE_OPTIONS = [
        "Musical", "Play", "Comedy", "Opera", "Ballet",
        "Immersive", "Cabaret", "Family", "Classic", "Avant-Garde"
    ];

    const VIBE_OPTIONS = [
        "Spectacular", "Intimate", "Funny", "Dramatic",
        "Romantic", "Thought-Provoking", "Dark", "Uplifting"
    ];

    const [prevOpen, setPrevOpen] = useState(false);

    if (isOpen && !prevOpen) {
        setLocation(userLocation || "");
        setSelectedGenres([]);
        setSelectedVibes([]);
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
            const res = await fetch('/api/theatre-concierge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    genre: selectedGenres.join(", "),
                    vibe: selectedVibes.join(", "),
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
                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                                    <Theater className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Theatre Scout</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Discover plays, musicals, and performances</p>
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
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Genres (Select multiple)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {GENRE_OPTIONS.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => toggleSelection(c, selectedGenres, setSelectedGenres)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedGenres.includes(c)
                                                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
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
                                                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
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
                                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Finding Shows...</>
                                    ) : (
                                        <><Sparkles className="w-5 h-5 mr-2" /> Find Performances</>
                                    )}
                                </Button>
                            </div>

                            {recommendations.length > 0 && (
                                <div ref={resultsRef} className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming Shows</h3>
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
                                                categoryType="THEATRE"
                                                mainIcon={Ticket}
                                                subtext={rec.genre || 'Theatre'}
                                                secondIcon={Theater}
                                                secondSubtext="N/A"
                                                isPrivate={isPrivate}
                                                onFavorite={handleFavorite}
                                                onAddToJar={handleAddToJar}
                                                onGoAction={handleGoTonight}
                                                goActionLabel="Get Tickets"
                                                goActionClass="bg-gradient-to-r from-purple-400/20 to-indigo-400/20 text-purple-700 dark:text-purple-200 border border-purple-400/30"
                                                ratingClass="text-yellow-400"
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
