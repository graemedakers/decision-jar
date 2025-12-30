"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Loader2, Sparkles, ExternalLink, Plus, Zap, Heart, Leaf } from "lucide-react";
import { Button } from "./ui/Button";
import { useConciergeActions } from "@/hooks/useConciergeActions";
import { getCurrentLocation } from "@/lib/utils";

interface WellnessConciergeModalProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation?: string;
    onIdeaAdded?: () => void;
    onGoTonight?: (idea: any) => void;
    onFavoriteUpdated?: () => void;
}

export function WellnessConciergeModal({ isOpen, onClose, userLocation, onIdeaAdded, onGoTonight, onFavoriteUpdated }: WellnessConciergeModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
    const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
    const [selectedBudget, setSelectedBudget] = useState<string[]>([]);
    const [location, setLocation] = useState(userLocation || "");
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const resultsRef = useRef<HTMLDivElement>(null);

    const ACTIVITY_OPTIONS = [
        "Massage", "Spa Day", "Yoga Class", "Meditation",
        "Nature Walk", "Sauna/Bathhouse", "Sound Bath", "Digital Detox"
    ];

    const VIBE_OPTIONS = [
        "Relaxing", "Rejuvenating", "Spiritual", "Luxury",
        "Budget-Friendly", "Social", "Private", "Quiet"
    ];

    const BUDGET_OPTIONS = [
        "Free", "$ (Cheap)", "$$ (Moderate)", "$$$ (Premium)", "$$$$ (Luxury)"
    ];

    const [prevOpen, setPrevOpen] = useState(false);

    if (isOpen && !prevOpen) {
        setLocation(userLocation || "");
        setSelectedActivities([]);
        setSelectedVibes([]);
        setSelectedBudget([]);
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
            const res = await fetch('/api/wellness-concierge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activityType: selectedActivities.join(", "),
                    vibe: selectedVibes.join(", "),
                    budget: selectedBudget.join(", "),
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
                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                                    <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Wellness Concierge</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Find your zen</p>
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
                                            className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors flex items-center gap-1"
                                        >
                                            <MapPin className="w-3 h-3" />
                                            Use GPS
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="Current location"
                                            className="glass-input w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Activity Type (Select multiple)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {ACTIVITY_OPTIONS.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => toggleSelection(c, selectedActivities, setSelectedActivities)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedActivities.includes(c)
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
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
                                                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
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
                                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Finding Peace...</>
                                    ) : (
                                        <><Sparkles className="w-5 h-5 mr-2" /> Explore Wellness</>
                                    )}
                                </Button>
                            </div>

                            {recommendations.length > 0 && (
                                <div ref={resultsRef} className="space-y-4 pt-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Picks</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {recommendations.map((rec, index) => (
                                            <div key={index} className="glass p-4 rounded-xl flex flex-col sm:flex-row gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                                <button onClick={() => handleFavorite(rec, "WELLNESS")} className={`absolute top-3 right-3 p-2 rounded-full transition-all z-10 ${rec.isFavorite ? 'text-pink-500 bg-pink-500/10' : 'text-slate-400 hover:text-pink-400'}`}><Heart className={`w-5 h-5 ${rec.isFavorite ? 'fill-current' : ''}`} /></button>
                                                <div className="flex-1 pr-8">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{rec.name}</h4>
                                                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-white/10 rounded text-slate-600 dark:text-slate-300">{rec.price}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{rec.description}</p>
                                                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                                                        <span className="flex items-center gap-1"><Leaf className="w-3 h-3" /> {rec.cuisine}</span>
                                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {rec.address}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap sm:flex-col gap-2 justify-start sm:justify-end">
                                                    {rec.website && (<Button size="sm" variant="ghost" className="text-xs" onClick={() => window.open(rec.website, '_blank')}><ExternalLink className="w-4 h-4 mr-1" /> Web</Button>)}
                                                    <Button size="sm" onClick={() => handleAddToJar(rec)} className="text-xs bg-slate-100 dark:bg-white/10"><Plus className="w-4 h-4 mr-1" /> Jar</Button>
                                                    <Button size="sm" onClick={() => handleGoTonight(rec)} className="text-xs bg-gradient-to-r from-emerald-400/20 to-teal-400/20 text-emerald-700 dark:text-emerald-200 border border-emerald-400/30"><Zap className="w-4 h-4 mr-1" /> Book</Button>
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
