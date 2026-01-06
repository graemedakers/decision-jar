"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, ArrowRight, Check, Sparkles, Home, Trees, DollarSign, Activity, Clock, Sun, CloudRain, Snowflake, Car, Lock } from "lucide-react";
import { COST_LEVELS, ACTIVITY_LEVELS, TIME_OF_DAY, WEATHER_TYPES } from "@/lib/constants";

interface IdeaFormData {
    description: string;
    details: string;
    indoor: boolean;
    duration: string;
    activityLevel: string;
    cost: string;
    timeOfDay: string;
    category: string;
    suggestedBy: string;
    isPrivate: boolean;
    weather: string;
    requiresTravel: boolean;
}

interface IdeaWizardProps {
    formData: IdeaFormData;
    setFormData: (data: IdeaFormData) => void;
    categories: any[]; // Or specific type
    onSubmit: (e: any) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const steps = [
    { id: 'concept', title: 'The Concept' },
    { id: 'vibe', title: 'The Vibe' },
    { id: 'logistics', title: 'Logistics' },
    { id: 'details', title: 'Final Details' },
];

export function IdeaWizard({ formData, setFormData, categories, onSubmit, onCancel, isLoading }: IdeaWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(0);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setDirection(1);
            setCurrentStep(prev => prev + 1);
        } else {
            onSubmit({ preventDefault: () => { } });
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep(prev => prev - 1);
        } else {
            onCancel();
        }
    };

    const isStepValid = () => {
        if (currentStep === 0) return formData.description.length > 0;
        return true;
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -50 : 50,
            opacity: 0
        })
    };

    return (
        <div className="flex flex-col h-full max-h-[70vh]">
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-6 px-1">
                {steps.map((step, idx) => (
                    <div key={step.id} className="flex flex-col items-center flex-1 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${idx <= currentStep
                                ? "bg-primary text-white shadow-lg"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                            }`}>
                            {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span className={`text-[10px] mt-1 font-medium hidden sm:block ${idx <= currentStep ? "text-primary dark:text-white" : "text-slate-400"
                            }`}>
                            {step.title}
                        </span>
                        {idx < steps.length - 1 && (
                            <div className={`absolute top-4 left-1/2 w-full h-[2px] -z-10 ${idx < currentStep ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
                                }`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-1 py-2 mb-4">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {currentStep === 0 && (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Choose a Category</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setFormData({ ...formData, category: cat.id })}
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${formData.category === cat.id
                                                        ? "bg-primary/10 border-primary text-primary dark:text-white"
                                                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/50"
                                                    }`}
                                            >
                                                <cat.icon className="w-6 h-6 mb-2" />
                                                <span className="text-xs font-bold">{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">What's the idea?</label>
                                    <Input
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="e.g. Build a blanket fort"
                                        className="h-12 text-lg"
                                        autoFocus
                                    />
                                    <p className="text-xs text-slate-500">Give it a catchy name or short description.</p>
                                </div>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Setting</label>
                                        <div className="flex bg-slate-100 dark:bg-black/20 rounded-xl p-1">
                                            <button
                                                onClick={() => setFormData({ ...formData, indoor: true })}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${formData.indoor ? "bg-white shadow text-primary" : "text-slate-500"}`}
                                            >
                                                <Home className="w-4 h-4" /> Indoor
                                            </button>
                                            <button
                                                onClick={() => setFormData({ ...formData, indoor: false })}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${!formData.indoor ? "bg-white shadow text-primary" : "text-slate-500"}`}
                                            >
                                                <Trees className="w-4 h-4" /> Outdoor
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Weather</label>
                                        <div className="grid grid-cols-4 gap-1">
                                            {WEATHER_TYPES.map((w) => {
                                                const Icon = w.id === 'ANY' ? Sparkles : w.id === 'SUNNY' ? Sun : w.id === 'RAINY' ? CloudRain : Snowflake;
                                                return (
                                                    <button
                                                        key={w.id}
                                                        onClick={() => setFormData({ ...formData, weather: w.id })}
                                                        className={`flex items-center justify-center p-2 rounded-lg transition-all ${formData.weather === w.id ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}
                                                        title={w.label}
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Cost Level</label>
                                    <div className="flex justify-between items-center bg-slate-100 dark:bg-black/20 rounded-xl p-1">
                                        {COST_LEVELS.map(level => (
                                            <button
                                                key={level.id}
                                                onClick={() => setFormData({ ...formData, cost: level.id })}
                                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.cost === level.id ? "bg-green-500 text-white shadow" : "text-slate-500"}`}
                                            >
                                                {level.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Energy Level</label>
                                    <div className="flex justify-between items-center bg-slate-100 dark:bg-black/20 rounded-xl p-1">
                                        {ACTIVITY_LEVELS.map(level => (
                                            <button
                                                key={level.id}
                                                onClick={() => setFormData({ ...formData, activityLevel: level.id })}
                                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.activityLevel === level.id ? "bg-blue-500 text-white shadow" : "text-slate-500"}`}
                                            >
                                                {level.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">How long will it take?</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { val: "0.25", label: "15 mins" },
                                            { val: "0.5", label: "30 mins" },
                                            { val: "1.0", label: "1 hour" },
                                            { val: "2.0", label: "2 hours" },
                                            { val: "4.0", label: "Half Day" },
                                            { val: "8.0", label: "Full Day" }
                                        ].map(opt => (
                                            <button
                                                key={opt.val}
                                                onClick={() => setFormData({ ...formData, duration: opt.val })}
                                                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${formData.duration === opt.val ? "border-primary bg-primary/5 text-primary" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Best Time of Day</label>
                                    <div className="flex gap-2">
                                        {TIME_OF_DAY.map((time) => (
                                            <button
                                                key={time.id}
                                                onClick={() => setFormData({ ...formData, timeOfDay: time.id })}
                                                className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${formData.timeOfDay === time.id ? "border-secondary bg-secondary/5 text-secondary" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"}`}
                                            >
                                                {time.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div
                                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${formData.requiresTravel ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"}`}
                                    onClick={() => setFormData({ ...formData, requiresTravel: !formData.requiresTravel })}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.requiresTravel ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                                        <Car className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">Requires Travel</p>
                                        <p className="text-xs text-slate-500">Is this a trip or outing?</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.requiresTravel ? "bg-blue-500 border-blue-500" : "border-slate-300"}`}>
                                        {formData.requiresTravel && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Extra Details (Optional)</label>
                                    <textarea
                                        value={formData.details}
                                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                        placeholder="Links, packing lists, reservation info..."
                                        className="w-full h-32 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/50 resize-none"
                                    />
                                </div>

                                <div
                                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${formData.isPrivate ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"}`}
                                    onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.isPrivate ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">Keep Private</p>
                                        <p className="text-xs text-slate-500">Only visible to you until selected</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.isPrivate ? "bg-amber-500 border-amber-500" : "border-slate-300"}`}>
                                        {formData.isPrivate && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </div>

                                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl space-y-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase">Summary</p>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-primary">{categories.find(c => c.id === formData.category)?.label}</span>
                                        <span className="text-slate-300">•</span>
                                        <span className="font-medium">{formData.description}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                                        <span className="bg-white dark:bg-black/20 px-2 py-1 rounded">{COST_LEVELS.find(c => c.id === formData.cost)?.label}</span>
                                        <span className="bg-white dark:bg-black/20 px-2 py-1 rounded">{formData.duration}h</span>
                                        {/* Simplified duration display */}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button variant="ghost" onClick={handleBack} disabled={isLoading}>
                    {currentStep === 0 ? "Cancel" : <><ArrowLeft className="w-4 h-4 mr-2" /> Back</>}
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={!isStepValid() || isLoading}
                    className={currentStep === steps.length - 1 ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                >
                    {isLoading ? "Saving..." : currentStep === steps.length - 1 ? "Create Idea" : <>{currentStep === 0 ? "Start" : "Next"} <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
            </div>
        </div>
    );
}
