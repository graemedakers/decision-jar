"use client";
import { getItinerary, getApiUrl } from "@/lib/utils";
import { getCategoriesForTopic } from "@/lib/categories";

import { ItineraryPreview } from "./ItineraryPreview";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Clock, Activity, DollarSign, Home, Trees, Loader2, Utensils, Calendar, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

interface AddIdeaModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any; // If provided, we are in "Edit" mode
    isPremium?: boolean;
    onUpgrade?: () => void;
    jarTopic?: string | null;
}

export function AddIdeaModal({ isOpen, onClose, initialData, isPremium, onUpgrade, jarTopic }: AddIdeaModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        description: "",
        details: "",
        indoor: true,
        duration: "0.5",
        activityLevel: "MEDIUM",
        cost: "$",
        timeOfDay: "ANY",
        category: "ACTIVITY",
    });

    useEffect(() => {
        if (isOpen) {
            let initialFormData;
            if (initialData) {
                initialFormData = {
                    description: initialData.description,
                    details: initialData.details || "",
                    indoor: initialData.indoor,
                    duration: Number.isInteger(initialData.duration) ? `${initialData.duration}.0` : String(initialData.duration),
                    activityLevel: initialData.activityLevel,
                    cost: initialData.cost,
                    timeOfDay: initialData.timeOfDay || "ANY",
                    category: initialData.category || "ACTIVITY",
                };
            } else {
                initialFormData = {
                    description: "",
                    details: "",
                    indoor: true,
                    duration: "0.5",
                    activityLevel: "MEDIUM",
                    cost: "$",
                    timeOfDay: "ANY",
                    category: "ACTIVITY",
                };
            }
            setFormData(initialFormData);
        }

    }, [isOpen, initialData]);

    const categories = getCategoriesForTopic(jarTopic);

    // Ensure category is valid for topic
    useEffect(() => {
        if (isOpen && categories.length > 0) {
            const isValid = categories.some(c => c.id === formData.category);
            if (!isValid) {
                setFormData(prev => ({ ...prev, category: categories[0].id }));
            }
        }
    }, [jarTopic, isOpen, categories]);

    const itinerary = getItinerary(formData.details);



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // If initialData has an ID, we are editing. Otherwise we are creating (duplicating).
            const isEditing = initialData && initialData.id;
            const url = isEditing ? getApiUrl(`/api/ideas/${initialData.id}`) : getApiUrl("/api/ideas");
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            if (res.ok) {
                onClose();
            } else {
                alert("Failed to save idea");
            }
        } catch (error) {
            console.error(error);
            alert("Error saving idea");
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
                        className="glass-card w-full max-w-lg relative bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors z-20"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center justify-between pr-12 mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                {itinerary ? "Itinerary Preview" :
                                    initialData && initialData.id ? "Edit Idea" : initialData ? "Duplicate Idea" : "Add New Idea"}
                            </h2>
                        </div>

                        <div className="max-h-[85vh] overflow-y-auto px-4 pb-6">
                            {itinerary ? (
                                <ItineraryPreview itinerary={itinerary} />
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
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

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                            {formData.category === 'MEAL' || formData.category === 'RESTAURANT' ? "Name of place" : "Short Description"}
                                        </label>
                                        <Input
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder={
                                                formData.category === 'MEAL' ? "e.g. Try that new Italian place downtown" :
                                                    formData.category === 'EVENT' ? "e.g. Jazz in the Park" :
                                                        "e.g. Build a blanket fort"
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Details (Optional)</label>
                                            {formData.details.match(/https?:\/\/[^\s]+/) && !getItinerary(formData.details) && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 px-2"
                                                    onClick={() => {
                                                        const match = formData.details.match(/https?:\/\/[^\s]+/);
                                                        if (match) window.open(match[0], '_blank');
                                                    }}
                                                >
                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                    Visit Website
                                                </Button>
                                            )}
                                        </div>
                                        <textarea
                                            value={formData.details}
                                            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                            placeholder="Add more info, e.g. what to bring, specific location..."
                                            className={`glass-input w-full min-h-[80px] py-2 px-3 resize-none text-slate-800 dark:text-white placeholder:text-slate-400 ${getItinerary(formData.details) ? 'font-mono text-xs opacity-70' : ''}`}
                                        />
                                        {getItinerary(formData.details) && (
                                            <p className="text-[10px] text-slate-400 text-right">
                                                This contains a structured itinerary (Night Out Plan). Switch to Preview to view nicely.
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Setting</label>
                                            <div className="flex bg-slate-100 dark:bg-black/20 rounded-xl p-1 border border-slate-200 dark:border-white/10">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, indoor: true })}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${formData.indoor
                                                        ? "bg-primary text-white shadow-lg"
                                                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                                                        }`}
                                                >
                                                    <Home className="w-4 h-4" /> Indoor
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, indoor: false })}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${!formData.indoor
                                                        ? "bg-primary text-white shadow-lg"
                                                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                                                        }`}
                                                >
                                                    <Trees className="w-4 h-4" /> Outdoor
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Duration</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <select
                                                    value={formData.duration}
                                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                    className="glass-input pl-10 appearance-none cursor-pointer w-full text-slate-800 dark:text-white"
                                                >
                                                    <option value="0.25">15 mins</option>
                                                    <option value="0.5">30 mins</option>
                                                    <option value="1.0">1 hour</option>
                                                    <option value="2.0">2 hours</option>
                                                    <option value="4.0">Half Day</option>
                                                    <option value="8.0">Full Day</option>
                                                </select>
                                            </div>
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
                                                    className="glass-input pl-10 appearance-none cursor-pointer w-full text-slate-800 dark:text-white"
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
                                                    className="glass-input pl-10 appearance-none cursor-pointer w-full text-slate-800 dark:text-white"
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

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="submit"
                                            className="w-full inline-flex items-center justify-center transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none glass-button px-8 py-3 text-base"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            ) : null}
                                            {initialData && initialData.id ? "Save Changes" : <><Plus className="w-5 h-5 mr-2" /> Add to Jar</>}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div >
            )
            }
        </AnimatePresence >
    );
}
