"use client";
import { getCategoriesForTopic } from "@/lib/categories";

import { motion, AnimatePresence } from "framer-motion";
import { X, Filter, ArrowRight } from "lucide-react";
import { Button } from "./ui/Button";
import { useState, useEffect } from "react";

interface SpinFiltersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSpin: (filters: { maxDuration?: number; maxCost?: string; maxActivityLevel?: string; timeOfDay?: string; category?: string }) => void;
    jarTopic?: string | null;
}

export function SpinFiltersModal({ isOpen, onClose, onSpin, jarTopic }: SpinFiltersModalProps) {
    const [maxDuration, setMaxDuration] = useState<number | undefined>(undefined);
    const [maxCost, setMaxCost] = useState<string | undefined>(undefined);
    const [maxActivityLevel, setMaxActivityLevel] = useState<string | undefined>(undefined);
    const [timeOfDay, setTimeOfDay] = useState<string | undefined>(undefined);
    const [category, setCategory] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (isOpen) {
            setMaxDuration(undefined);
            setMaxCost(undefined);
            setMaxActivityLevel(undefined);
            setTimeOfDay(undefined);
            setCategory(undefined);
        }
    }, [isOpen]);

    const handleSpin = () => {
        onSpin({ maxDuration, maxCost, maxActivityLevel, timeOfDay, category });
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
                        className="glass-card w-full max-w-md relative overflow-hidden p-6 max-h-[90vh] overflow-y-auto bg-white/80 dark:bg-slate-900/80 backend-blur-xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center">
                                <Filter className="w-5 h-5 text-secondary" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Filter Your Spin</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Category Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Category</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {getCategoriesForTopic(jarTopic).map((cat) => (
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

                            {/* Cost Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Max Cost</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['FREE', '$', '$$', '$$$'].map((cost) => (
                                        <button
                                            key={cost}
                                            onClick={() => setMaxCost(maxCost === cost ? undefined : cost)}
                                            className={`p-2 rounded-lg text-sm font-medium transition-colors border ${maxCost === cost
                                                ? "bg-secondary text-white border-secondary shadow-md"
                                                : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white"
                                                }`}
                                        >
                                            {cost}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Activity Level Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Max Activity Level</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['LOW', 'MEDIUM', 'HIGH'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setMaxActivityLevel(maxActivityLevel === level ? undefined : level)}
                                            className={`p-2 rounded-lg text-sm font-medium transition-colors border ${maxActivityLevel === level
                                                ? "bg-secondary text-white border-secondary shadow-md"
                                                : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white"
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time of Day Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Time of Day</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['ANY', 'DAY', 'EVENING'].map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => setTimeOfDay(timeOfDay === time ? undefined : time)}
                                            className={`p-2 rounded-lg text-sm font-medium transition-colors border ${timeOfDay === time
                                                ? "bg-secondary text-white border-secondary shadow-md"
                                                : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white"
                                                }`}
                                        >
                                            {time === 'ANY' ? 'Anytime' : time === 'DAY' ? 'Day' : 'Evening'}
                                        </button>
                                    ))}
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
