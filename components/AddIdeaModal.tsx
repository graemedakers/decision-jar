"use client";
import { getItinerary, getCateringPlan, getApiUrl } from "@/lib/utils";
import { getCategoriesForTopic, TOPIC_CATEGORIES } from "@/lib/categories";

import { ItineraryPreview } from "./ItineraryPreview";
import { CateringPreview } from "./CateringPreview";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Clock, Activity, DollarSign, Home, Trees, Loader2, Utensils, Calendar, ExternalLink, Wand2, Lock, Sun, CloudRain, Snowflake, Car, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getRandomIdeaForTopic } from "@/lib/sample-ideas";
import { COST_LEVELS, ACTIVITY_LEVELS, TIME_OF_DAY, WEATHER_TYPES } from "@/lib/constants";
import { exportToPdf } from "@/lib/pdf-export";

const DEFAULT_FORM_DATA = {
    description: "",
    details: "",
    indoor: true,
    duration: "0.5",
    activityLevel: "MEDIUM",
    cost: "$",
    timeOfDay: "ANY",
    category: "ACTIVITY",
    suggestedBy: "",
    isPrivate: false,
    weather: "ANY",
    requiresTravel: false,
};

interface AddIdeaModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any; // If provided, we are in "Edit" mode
    isPremium?: boolean;
    onUpgrade?: () => void;
    jarTopic?: string | null;
    customCategories?: any[];
    currentUser?: any;
    onSuccess?: () => void;
}

export function AddIdeaModal({ isOpen, onClose, initialData, isPremium, onUpgrade, jarTopic, customCategories, currentUser, onSuccess }: AddIdeaModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

    const [isMagicLoading, setIsMagicLoading] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);

    const handleExportPdf = async () => {
        if (!contentRef.current) return;
        setIsLoading(true);
        try {
            await exportToPdf(contentRef.current, formData.description || 'plan');
        } catch (error) {
            console.error("PDF Export failed", error);
            alert("Failed to export PDF");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRandomize = async () => {
        setIsMagicLoading(true);
        try {
            const res = await fetch(getApiUrl('/api/magic-idea'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: jarTopic,
                    location: currentUser?.location
                })
            });
            if (res.ok) {
                const randomIdea = await res.json();
                if (randomIdea) {
                    setFormData(prev => ({
                        ...prev,
                        description: randomIdea.description,
                        category: randomIdea.category,
                        indoor: randomIdea.indoor,
                        duration: String(randomIdea.duration),
                        activityLevel: randomIdea.activityLevel,
                        cost: randomIdea.cost,
                        timeOfDay: randomIdea.timeOfDay,
                        details: (randomIdea.details || "") + (randomIdea.website ? `\n\n${randomIdea.website}` : "")
                    }));
                }
            }
        } catch (e) {
            console.error("Magic fill failed", e);
        } finally {
            setIsMagicLoading(false);
        }
    };

    useEffect(() => {
        if (initialData) {
            setFormData({
                description: initialData.description,
                details: initialData.details || "",
                indoor: initialData.indoor,
                duration: Number.isInteger(initialData.duration) ? `${initialData.duration}.0` : String(initialData.duration),
                activityLevel: initialData.activityLevel,
                cost: initialData.cost,
                timeOfDay: initialData.timeOfDay || "ANY",
                category: initialData.category || "ACTIVITY",
                suggestedBy: "",
                isPrivate: initialData.isPrivate || false,
                weather: initialData.weather || "ANY",
                requiresTravel: initialData.requiresTravel || false,
            });
        } else {
            setFormData(DEFAULT_FORM_DATA);
        }

    }, [isOpen, initialData]);

    const categories = getCategoriesForTopic(jarTopic, customCategories);

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
    const cateringPlan = getCateringPlan(formData.details);



    const [viewMode, setViewMode] = useState<'PREVIEW' | 'EDIT'>('PREVIEW');

    useEffect(() => {
        if (isOpen) setViewMode('PREVIEW');
    }, [isOpen, initialData?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // If initialData has an ID, we are editing. Otherwise we are creating (duplicating).
            const isEditing = initialData && initialData.id;
            const url = isEditing ? getApiUrl(`/api/ideas/${initialData.id}`) : getApiUrl("/api/ideas");
            const method = isEditing ? "PUT" : "POST";

            const payload = { ...formData };
            if (formData.suggestedBy) {
                payload.description = `${formData.description} (via ${formData.suggestedBy})`;
                // Remove the extra field before sending to API which expects strict schema usually, 
                // but since we spread formData, we should be careful. 
                // Actually the API probably ignores extra fields.
            }

            // Reconstruct payload to match API expectation
            const apiBody = {
                description: payload.description,
                details: formData.details,
                indoor: formData.indoor,
                duration: formData.duration,
                activityLevel: formData.activityLevel,
                cost: formData.cost,
                timeOfDay: formData.timeOfDay,
                category: formData.category,
                isPrivate: formData.isPrivate,
                weather: formData.weather,
                requiresTravel: formData.requiresTravel
            };

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(apiBody),
                credentials: 'include',
            });

            if (res.ok) {
                if (method === "POST" || method === "PUT") {
                    onSuccess?.();
                }
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
                        className="glass-card w-full max-w-lg relative bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 p-0 overflow-hidden"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors z-20"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="px-4 md:px-6 pt-6 pb-4 flex flex-col gap-2">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                {viewMode === 'PREVIEW' && (itinerary || cateringPlan) ? (itinerary ? "Itinerary Preview" : "Catering Plan") :
                                    (initialData && initialData.id ? "Edit Idea" : initialData ? "Duplicate Idea" : "Add New Idea")}
                                {(!initialData || !initialData.id) && !itinerary && !cateringPlan && (
                                    <button
                                        type="button"
                                        onClick={handleRandomize}
                                        disabled={isMagicLoading}
                                        className="p-1.5 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
                                        title="Auto-fill with random idea"
                                    >
                                        {isMagicLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                    </button>
                                )}
                            </h2>

                            {(itinerary || cateringPlan) && (
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex bg-slate-100 dark:bg-black/40 p-1 rounded-lg w-fit">
                                        <button
                                            onClick={() => setViewMode('PREVIEW')}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'PREVIEW' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Formatted View
                                        </button>
                                        <button
                                            onClick={() => setViewMode('EDIT')}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'EDIT' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Edit Details
                                        </button>
                                    </div>

                                    {cateringPlan && viewMode === 'PREVIEW' && (
                                        <button
                                            onClick={handleExportPdf}
                                            className="text-xs font-bold text-slate-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
                                        >
                                            <ExternalLink className="w-3 h-3" /> Export PDF
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="max-h-[75vh] overflow-y-auto overflow-x-hidden px-4 md:px-6 pb-24 md:pb-8 custom-scrollbar">
                            {(itinerary || cateringPlan) && viewMode === 'PREVIEW' ? (
                                <div ref={contentRef} className="bg-white dark:bg-slate-900 p-2 rounded-xl"> {/* Wrap for capture */}
                                    {itinerary ? (
                                        <ItineraryPreview itinerary={itinerary} />
                                    ) : (
                                        <CateringPreview plan={cateringPlan} />
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <fieldset disabled={initialData?.id && (!currentUser || initialData.createdById !== currentUser.id)} className="space-y-6 disabled:opacity-80 min-w-0">
                                        <div className="space-y-2 min-w-0">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Category</label>
                                            <div className="bg-slate-100 dark:bg-black/20 rounded-xl p-1 border border-slate-200 dark:border-white/10 overflow-hidden w-full">
                                                <div className="flex overflow-x-auto no-scrollbar gap-1 p-0.5 w-full">
                                                    {categories.map((cat) => (
                                                        <button
                                                            key={cat.id}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, category: cat.id })}
                                                            className={`flex items-center justify-center gap-2 py-2 px-5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap min-w-fit flex-shrink-0 ${formData.category === cat.id
                                                                ? "bg-primary text-white shadow-md scale-[1.02]"
                                                                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-white/5"
                                                                }`}
                                                        >
                                                            <cat.icon className="w-4 h-4" /> {cat.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 min-w-0">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                                {formData.category === 'MEAL' || formData.category === 'RESTAURANT' ? "Name of place" : "Short Description"}
                                            </label>
                                            <Input
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder={categories.find(c => c.id === formData.category)?.placeholder || "e.g. Build a blanket fort"}
                                                className="w-full"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2 min-w-0">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Suggested By (Optional)</label>
                                            <Input
                                                value={formData.suggestedBy}
                                                onChange={(e) => setFormData({ ...formData, suggestedBy: e.target.value })}
                                                placeholder="e.g. Billy, Sarah (Leave blank for You)"
                                                className="w-full"
                                            />
                                        </div>

                                    </fieldset>

                                    <div className="space-y-2 min-w-0">
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
                                            disabled={initialData?.id && (!currentUser || initialData.createdById !== currentUser.id)}
                                            value={formData.details}
                                            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                            placeholder={
                                                (() => {
                                                    const topicKey = jarTopic ? Object.keys(TOPIC_CATEGORIES).find(k => k.toLowerCase() === jarTopic.toLowerCase()) : "Activities";
                                                    switch (topicKey) {
                                                        case "Movies": return "e.g. Streaming platform, release year, or cinema location...";
                                                        case "Restaurants": return "e.g. Reservation time, dress code, or parking info...";
                                                        case "Travel": return "e.g. Flight numbers, hotel confirmation, or packing list...";
                                                        case "Wellness": return "e.g. What to wear, arrival time...";
                                                        default: return "Add more info, e.g. what to bring, specific location...";
                                                    }
                                                })()
                                            }
                                            className={`glass-input w-full min-h-[80px] py-2 px-3 resize-none text-slate-800 dark:text-white placeholder:text-slate-400 disabled:opacity-80 ${getItinerary(formData.details) ? 'font-mono text-xs opacity-70' : ''}`}
                                        />
                                        {getItinerary(formData.details) && (
                                            <p className="text-[10px] text-slate-400 text-right">
                                                This contains a structured itinerary (Night Out Plan). Switch to Preview to view nicely.
                                            </p>
                                        )}
                                        {getCateringPlan(formData.details) && (
                                            <p className="text-[10px] text-slate-400 text-right">
                                                This contains a structured Catering Plan. Switch to Preview to view nicely.
                                            </p>
                                        )}
                                    </div>

                                    <fieldset disabled={initialData?.id && (!currentUser || initialData.createdById !== currentUser.id)} className="space-y-6 disabled:opacity-80 min-w-0">

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2 min-w-0">
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

                                            <div className="space-y-2 min-w-0">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Duration</label>
                                                <div className="relative">
                                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <select
                                                        value={formData.duration}
                                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                        className="glass-input pl-10 cursor-pointer w-full text-slate-800 dark:text-white"
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
                                            <div className="space-y-2 min-w-0">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Cost</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <select
                                                        value={formData.cost}
                                                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                                        className="glass-input pl-10 cursor-pointer w-full text-slate-800 dark:text-white"
                                                    >
                                                        {COST_LEVELS.map(level => (
                                                            <option key={level.id} value={level.id}>{level.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-2 min-w-0">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Energy</label>
                                                <div className="relative">
                                                    <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <select
                                                        value={formData.activityLevel}
                                                        onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                                                        className="glass-input pl-10 cursor-pointer w-full text-slate-800 dark:text-white"
                                                    >
                                                        {ACTIVITY_LEVELS.map(level => (
                                                            <option key={level.id} value={level.id}>{level.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 min-w-0">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Time of Day</label>
                                            <div className="flex bg-slate-100 dark:bg-black/20 rounded-xl p-1 border border-slate-200 dark:border-white/10">
                                                {TIME_OF_DAY.map((time) => (
                                                    <button
                                                        key={time.id}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, timeOfDay: time.id })}
                                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.timeOfDay === time.id
                                                            ? "bg-secondary text-white shadow-lg"
                                                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                                                            }`}
                                                    >
                                                        {time.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </fieldset>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-slate-100 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4">
                                            <div className="flex items-start justify-between group cursor-pointer"
                                                onClick={() => setFormData({ ...formData, requiresTravel: !formData.requiresTravel })}
                                            >
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${formData.requiresTravel ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-white/5 text-slate-400'}`}>
                                                        <Car className="w-5 h-5" />
                                                    </div>
                                                    <div className="min-w-0 pt-0.5">
                                                        <p className="font-bold text-slate-900 dark:text-white leading-tight">Requires Traveling?</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">e.g. driving/trip (This is an "Outing")</p>
                                                    </div>
                                                </div>
                                                <div className={`w-12 h-6 shrink-0 ml-3 rounded-full relative transition-colors ${formData.requiresTravel ? 'bg-blue-500' : 'bg-slate-300 dark:bg-white/10'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.requiresTravel ? 'left-7' : 'left-1'}`} />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Weather Vibe</label>
                                                <div className="grid grid-cols-4 gap-1">
                                                    {WEATHER_TYPES.map((w) => {
                                                        const Icon = w.id === 'ANY' ? Sparkles : w.id === 'SUNNY' ? Sun : w.id === 'RAINY' ? CloudRain : Snowflake;
                                                        return (
                                                            <button
                                                                key={w.id}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, weather: w.id })}
                                                                className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold transition-all border ${formData.weather === w.id
                                                                    ? "bg-amber-500 text-white border-amber-400 shadow-md"
                                                                    : "bg-white/5 border-transparent text-slate-500 dark:text-slate-400 hover:bg-white/10"
                                                                    }`}
                                                            >
                                                                <Icon className="w-4 h-4" />
                                                                {w.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start justify-between p-4 bg-slate-100 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/10 group cursor-pointer transition-all hover:bg-slate-200 dark:hover:bg-black/30"
                                            onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                                        >
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${formData.isPrivate ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-white/5 text-slate-400'}`}>
                                                    <Lock className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0 pt-0.5">
                                                    <p className="font-bold text-slate-900 dark:text-white leading-tight">Keep it a secret?</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Other users won't see this until it's selected.</p>
                                                </div>
                                            </div>
                                            <div className={`w-12 h-6 shrink-0 ml-3 rounded-full relative transition-colors ${formData.isPrivate ? 'bg-amber-500' : 'bg-slate-300 dark:bg-white/10'}`}>
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isPrivate ? 'left-7' : 'left-1'}`} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="submit"
                                            className="w-full inline-flex items-center justify-center transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none glass-button px-4 py-3 text-sm font-medium"
                                            disabled={isLoading || (initialData?.id && !(initialData.canEdit ?? (currentUser && initialData.createdById === currentUser.id)))}
                                        >
                                            {isLoading ? (
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            ) : null}
                                            {initialData && initialData.id
                                                ? (!(initialData.canEdit ?? (currentUser && initialData.createdById === currentUser.id))
                                                    ? "View Only (Creator Access Required)"
                                                    : "Save Changes")
                                                : <><Plus className="w-5 h-5 mr-2" /> Add to Jar</>
                                            }
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
