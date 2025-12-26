
"use client";

import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, DollarSign, MapPin, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { getCategoriesForTopic } from "@/lib/categories";

interface SurpriseMeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onIdeaAdded: () => void;
    initialLocation?: string;
    jarTopic?: string | null;
    customCategories?: any[];
}

export function SurpriseMeModal({ isOpen, onClose, onIdeaAdded, initialLocation, jarTopic, customCategories }: SurpriseMeModalProps) {
    const categories = getCategoriesForTopic(jarTopic, customCategories);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        location: "",
        activityLevel: "MEDIUM",
        cost: "$",
        timeOfDay: "ANY",
        category: categories[0].id, // Default to first valid category
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({
                ...prev,
                location: initialLocation || prev.location || "",
                category: categories.find(c => c.id === prev.category) ? prev.category : categories[0].id
            }));
        }
    }, [isOpen, initialLocation, jarTopic]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/ideas/generate-surprise', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, topic: jarTopic }),
            });

            if (res.ok) {
                // Force reload to ensure everything is synced and new idea appears
                window.location.reload();
            } else {
                const data = await res.json();
                alert(`Failed to create surprise: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error creating surprise idea");
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
                        className="glass-card w-full max-w-lg relative flex flex-col max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors z-20"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex-shrink-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-lg shadow-orange-500/20">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Surprise Me
                                </h2>
                            </div>

                            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                                Set your preferences and we'll generate a secret jar idea. It will remain hidden in your jar until you spin it!
                            </p>
                        </div>

                        <div className="overflow-y-auto overflow-x-hidden px-1 -mx-1 pb-4 custom-scrollbar">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="e.g. New York, NY"
                                            className="glass-input pl-10 w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Category</label>
                                    <div className="flex bg-slate-100 dark:bg-black/20 rounded-xl p-1 border border-slate-200 dark:border-white/10 overflow-x-auto">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, category: cat.id })}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${formData.category === cat.id
                                                    ? "bg-primary text-white shadow-lg"
                                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                                                    }`}
                                            >
                                                <cat.icon className="w-4 h-4" /> {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Cost</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select
                                                value={formData.cost}
                                                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                                className="glass-input pl-10 appearance-none cursor-pointer w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                                            >
                                                <option value="FREE">Free</option>
                                                <option value="$">$ (Cheap)</option>
                                                <option value="$$">$$ (Moderate)</option>
                                                <option value="$$$">$$$ (Expensive)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Energy</label>
                                        <div className="relative">
                                            <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select
                                                value={formData.activityLevel}
                                                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                                                className="glass-input pl-10 appearance-none cursor-pointer w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                                            >
                                                <option value="LOW">Chill</option>
                                                <option value="MEDIUM">Moderate</option>
                                                <option value="HIGH">Active</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Time of Day</label>
                                    <div className="flex bg-slate-100 dark:bg-black/20 rounded-xl p-1 border border-slate-200 dark:border-white/10">
                                        {['ANY', 'DAY', 'EVENING'].map((time) => (
                                            <button
                                                key={time}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, timeOfDay: time })}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.timeOfDay === time
                                                    ? "bg-secondary text-white shadow-lg"
                                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                                                    }`}
                                            >
                                                {time === 'ANY' ? 'Anytime' : time === 'DAY' ? 'Day' : 'Evening'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2 px-4">
                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 border-none relative overflow-hidden group"
                                        disabled={isLoading}
                                        whileHover={{ scale: 1 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Generating...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-5 h-5 fill-white" />
                                                Create Secret Surprise
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
