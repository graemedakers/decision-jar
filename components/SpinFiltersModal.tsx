"use client";
import { getCategoriesForTopic, getCategoryDef } from "@/lib/categories";

import { motion, AnimatePresence } from "framer-motion";
import { X, Filter, ArrowRight, Sun, CloudRain, Snowflake, Sparkles, Car, Home } from "lucide-react";
import { Button } from "./ui/Button";
import { useState, useEffect } from "react";
import { COST_LEVELS, ACTIVITY_LEVELS, TIME_OF_DAY, WEATHER_TYPES } from "@/lib/constants";

interface SpinFiltersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSpin: (filters: { maxDuration?: number; maxCost?: string; maxActivityLevel?: string; timeOfDay?: string; category?: string; weather?: string; localOnly?: boolean }) => void;
    jarTopic?: string | null;
    ideas: any[];
    customCategories?: any[];
}

export function SpinFiltersModal({ isOpen, onClose, onSpin, jarTopic, ideas, customCategories }: SpinFiltersModalProps) {
    const [maxDuration, setMaxDuration] = useState<number | undefined>(undefined);
    const [maxCost, setMaxCost] = useState<string | undefined>(undefined);
    const [maxActivityLevel, setMaxActivityLevel] = useState<string | undefined>(undefined);
    const [timeOfDay, setTimeOfDay] = useState<string | undefined>(undefined);
    const [category, setCategory] = useState<string | undefined>(undefined);
    const [weather, setWeather] = useState<string | undefined>(undefined);
    const [localOnly, setLocalOnly] = useState<boolean>(false);

    // 1. Get unique category IDs present in unselected ideas
    const availableCategoryIds = Array.from(new Set(
        ideas
            .filter(i => !i.selectedAt)
            .map(i => i.category)
    ));

    // 2. Build definitions for these categories
    // This handles both topic defaults AND "extra" categories present in the jar
    const filteredCategories = availableCategoryIds.map(id => getCategoryDef(id, customCategories));


    useEffect(() => {
        if (isOpen) {
            setMaxDuration(undefined);
            setMaxCost(undefined);
            setMaxActivityLevel(undefined);
            setTimeOfDay(undefined);
            setCategory(undefined);
            setWeather(undefined);
            setLocalOnly(false);
        }
    }, [isOpen]);

    const handleSpin = () => {
        onSpin({ maxDuration, maxCost, maxActivityLevel, timeOfDay, category, weather, localOnly });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className="glass-card w-full max-w-md relative overflow-hidden p-0 max-h-[90vh] flex flex-col bg-white/80 dark:bg-slate-900/80 backend-blur-xl"
                    >
                        <div className="px-6 py-4 border-b dark:border-white/5 flex-shrink-0">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center">
                                    <Filter className="w-5 h-5 text-secondary" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Filter Your Spin</h2>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar min-w-0">
                            {/* Category Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Category</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {filteredCategories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setCategory(category === cat.id ? undefined : cat.id)}
                                            className={`p-2 rounded-lg text-sm font-medium transition-colors border flex flex-col items-center justify-center gap-1 min-h-[60px] ${category === cat.id
                                                ? "bg-secondary text-white border-secondary shadow-md"
                                                : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white"
                                                }`}
                                        >
                                            <cat.icon className="w-4 h-4" />
                                            <span className="truncate w-full text-center">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Duration Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Max Duration (Hours)</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 2, 4, 8].map((hours) => (
                                        <button
                                            key={hours}
                                            onClick={() => setMaxDuration(maxDuration === hours ? undefined : hours)}
                                            className={`p-2 rounded-lg text-sm font-medium transition-colors border ${maxDuration === hours
                                                ? "bg-secondary text-white border-secondary shadow-md"
                                                : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white"
                                                }`}
                                        >
                                            {hours}h
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Max Cost</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {COST_LEVELS.map((level) => (
                                        <button
                                            key={level.id}
                                            onClick={() => setMaxCost(maxCost === level.id ? undefined : level.id)}
                                            className={`p-2 rounded-lg text-sm font-medium transition-colors border ${maxCost === level.id
                                                ? "bg-secondary text-white border-secondary shadow-md"
                                                : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white"
                                                }`}
                                        >
                                            {level.id}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Max Activity Level</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {ACTIVITY_LEVELS.map((level) => (
                                        <button
                                            key={level.id}
                                            onClick={() => setMaxActivityLevel(maxActivityLevel === level.id ? undefined : level.id)}
                                            className={`p-2 rounded-lg text-sm font-medium transition-colors border ${maxActivityLevel === level.id
                                                ? "bg-secondary text-white border-secondary shadow-md"
                                                : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white"
                                                }`}
                                        >
                                            {level.id}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time of Day Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Time of Day</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {TIME_OF_DAY.map((time) => (
                                        <button
                                            key={time.id}
                                            onClick={() => setTimeOfDay(timeOfDay === time.id ? undefined : time.id)}
                                            className={`p-2 rounded-lg text-sm font-medium transition-colors border ${timeOfDay === time.id
                                                ? "bg-secondary text-white border-secondary shadow-md"
                                                : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white"
                                                }`}
                                        >
                                            {time.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">What's the weather like?</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {WEATHER_TYPES.map((w) => {
                                        const Icon = w.id === 'ANY' ? Sparkles : w.id === 'SUNNY' ? Sun : w.id === 'RAINY' ? CloudRain : Snowflake;
                                        return (
                                            <button
                                                key={w.id}
                                                onClick={() => setWeather(weather === w.id ? undefined : w.id)}
                                                className={`p-2 rounded-lg text-xs font-medium transition-colors border flex flex-col items-center gap-1 ${weather === w.id
                                                    ? "bg-amber-500 text-white border-amber-500 shadow-md"
                                                    : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {w.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Traveling Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Commitment / Travel</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setLocalOnly(false)}
                                        className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${!localOnly
                                            ? "bg-blue-500 text-white border-blue-400 shadow-md"
                                            : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400"
                                            }`}
                                    >
                                        <Car className="w-5 h-5 shrink-0" />
                                        <div className="text-left">
                                            <div className="font-bold text-xs uppercase opacity-80">Include Travel</div>
                                            <div className="text-[10px]">Trips & Outings</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setLocalOnly(true)}
                                        className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${localOnly
                                            ? "bg-green-600 text-white border-green-500 shadow-md"
                                            : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400"
                                            }`}
                                    >
                                        <Home className="w-5 h-5 shrink-0" />
                                        <div className="text-left">
                                            <div className="font-bold text-xs uppercase opacity-80">Local Only</div>
                                            <div className="text-[10px]">No Driving</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <Button onClick={handleSpin} className="w-full mt-4 shadow-lg shadow-secondary/25">
                                Spin the Jar! <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
