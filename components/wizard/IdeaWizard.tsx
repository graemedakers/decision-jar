
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, ArrowRight, Check, Sparkles, Home, Trees, DollarSign, Activity, Clock, Sun, CloudRain, Snowflake, Car, Lock, Lightbulb, MapPin, ListChecks, ChevronDown } from "lucide-react";
import { COST_LEVELS, ACTIVITY_LEVELS, TIME_OF_DAY, WEATHER_TYPES } from "@/lib/constants";
import { WizardFrame } from "@/components/WizardFrame";

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
    photoUrls: string[];
    ideaType?: string;
    typeData?: any;
}

interface IdeaWizardProps {
    formData: IdeaFormData;
    setFormData: (data: IdeaFormData) => void;
    categories: any[]; // Or specific type
    onSubmit: (e: any) => void;
    onCancel: () => void;
    isLoading: boolean;
    onTopicChange?: (topic: string) => void;
    currentTopic?: string;
}

const steps = [
    { id: 'concept', title: 'The Concept', icon: Lightbulb, description: "What's the big idea?" },
    { id: 'vibe', title: 'The Vibe', icon: Sparkles, description: "Set the mood and setting." },
    { id: 'logistics', title: 'Logistics', icon: Clock, description: "Time, cost, and planning." },
    { id: 'details', title: 'Final Details', icon: ListChecks, description: "Any extra notes?" },
];

export function IdeaWizard({ formData, setFormData, categories, onSubmit, onCancel, isLoading, onTopicChange, currentTopic }: IdeaWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onSubmit({ preventDefault: () => { }, stopPropagation: () => { } });
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        } else {
            onCancel();
        }
    };

    const isStepValid = () => {
        if (currentStep === 0) return formData.description.length > 0;
        return true;
    };

    const currentStepConfig = steps[currentStep];

    const ProgressHeader = (
        <div className="flex items-center justify-between mb-8 px-2 max-w-lg mx-auto w-full">
            {steps.map((step, idx) => (
                <div key={step.id} className="flex flex-col items-center flex-1 relative group cursor-default">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 
                        ${idx <= currentStep
                            ? "bg-primary text-white shadow-lg scale-110"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        }`}>
                        {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    {/* Connector Line */}
                    {idx < steps.length - 1 && (
                        <div className="absolute top-4 left-1/2 w-full h-[2px] -z-0">
                            <div className={`h-full transition-all duration-500 ease-out ${idx < currentStep ? "bg-primary" : "bg-slate-100 dark:bg-slate-800"
                                }`} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <WizardFrame
            isOpen={true}
            mode="inline"
            onClose={onCancel} // Not used in inline mode usually but good practice
            hideClose={true}
            title={currentStepConfig.title}
            subtitle={currentStepConfig.description}
            icon={currentStepConfig.icon}
            maxWidth="max-w-3xl"
            footer={
                <div className="flex justify-between items-center w-full gap-4">
                    <Button variant="ghost" onClick={handleBack} disabled={isLoading} className="text-slate-500 hover:text-slate-700">
                        {currentStep === 0 ? "Cancel" : "Back"}
                    </Button>

                    <div className="flex gap-2"> {/* Spacer or secondary actions if needed */} </div>

                    <Button
                        onClick={handleNext}
                        disabled={!isStepValid() || isLoading}
                        className={currentStep === steps.length - 1 ? "bg-green-600 hover:bg-green-700 text-white min-w-[120px]" : "min-w-[120px]"}
                        size="lg"
                    >
                        {isLoading ? "Saving..." : currentStep === steps.length - 1 ? "Create Idea" : "Next Step"}
                        {!isLoading && currentStep !== steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                </div>
            }
        >
            <div className="w-full max-w-2xl mx-auto py-2">
                {ProgressHeader}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {currentStep === 0 && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">
                                            Choose a Category
                                        </label>
                                        {onTopicChange && currentTopic && (
                                            <div className="relative">
                                                <select
                                                    value={currentTopic}
                                                    onChange={(e) => onTopicChange(e.target.value)}
                                                    className="text-xs font-bold bg-transparent text-primary dark:text-primary outline-none cursor-pointer text-right appearance-none pr-5 hover:opacity-80 transition-opacity"
                                                >
                                                    <option className="text-left" value="Activities">Activities</option>
                                                    <option className="text-left" value="Restaurants">Restaurants</option>
                                                    <option className="text-left" value="Bars">Bars</option>
                                                    <option className="text-left" value="Nightclubs">Nightclubs</option>
                                                    <option className="text-left" value="Movies">Movies</option>
                                                    <option className="text-left" value="Travel">Travel</option>
                                                    <option className="text-left" value="Hotel Stays">Hotel Stays</option>
                                                    <option className="text-left" value="Wellness">Wellness</option>
                                                    <option className="text-left" value="Fitness">Fitness</option>
                                                    <option className="text-left" value="Cooking & Recipes">Cooking & Recipes</option>
                                                    <option className="text-left" value="Books">Books</option>
                                                    <option className="text-left" value="Game">Gaming</option>
                                                    <option className="text-left" value="Romantic">Romantic</option>
                                                    <option className="text-left" value="System Development">System Development</option>
                                                    <option className="text-left" value="Custom">Custom</option>
                                                </select>
                                                <ChevronDown className="w-3 h-3 text-primary absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setFormData({ ...formData, category: cat.id })}
                                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 group relative overflow-hidden ${formData.category === cat.id
                                                    ? "bg-primary/5 border-primary text-primary dark:text-white shadow-md"
                                                    : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                                    }`}
                                            >
                                                <cat.icon className={`w-7 h-7 mb-3 transition-transform group-hover:scale-110 ${formData.category === cat.id ? "text-primary dark:text-white" : "text-slate-400 group-hover:text-primary"}`} />
                                                <span className="text-xs font-bold">{cat.label}</span>
                                                {formData.category === cat.id && (
                                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">
                                        What's the idea?
                                    </label>
                                    <div className="relative">
                                        <Input
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="e.g. Build a blanket fort"
                                            className="h-16 text-xl px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary/20"
                                            autoFocus
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                                            <Lightbulb className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 ml-1">Give it a catchy name or short description.</p>
                                </div>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            Setting
                                        </label>
                                        <div className="flex bg-slate-100 dark:bg-black/20 rounded-2xl p-1.5">
                                            <button
                                                onClick={() => setFormData({ ...formData, indoor: true })}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${formData.indoor ? "bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                                            >
                                                <Home className="w-4 h-4" /> Indoor
                                            </button>
                                            <button
                                                onClick={() => setFormData({ ...formData, indoor: false })}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${!formData.indoor ? "bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                                            >
                                                <Trees className="w-4 h-4" /> Outdoor
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            Weather
                                        </label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {WEATHER_TYPES.map((w) => {
                                                const Icon = w.id === 'ANY' ? Sparkles : w.id === 'SUNNY' ? Sun : w.id === 'RAINY' ? CloudRain : Snowflake;
                                                return (
                                                    <button
                                                        key={w.id}
                                                        onClick={() => setFormData({ ...formData, weather: w.id })}
                                                        className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${formData.weather === w.id
                                                            ? "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400"
                                                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                                                        title={w.label}
                                                    >
                                                        <Icon className="w-5 h-5 mb-1" />
                                                        <span className="text-[10px] font-bold">{w.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Cost Level
                                    </label>
                                    <div className="flex justify-between items-center bg-slate-100 dark:bg-black/20 rounded-2xl p-1.5 gap-1">
                                        {COST_LEVELS.map(level => (
                                            <button
                                                key={level.id}
                                                onClick={() => setFormData({ ...formData, cost: level.id })}
                                                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${formData.cost === level.id
                                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 shadow-sm ring-1 ring-green-200 dark:ring-green-800"
                                                    : "text-slate-500 hover:bg-white/50 dark:hover:bg-white/5"}`}
                                            >
                                                {level.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Energy Level
                                    </label>
                                    <div className="flex justify-between items-center bg-slate-100 dark:bg-black/20 rounded-2xl p-1.5 gap-1">
                                        {ACTIVITY_LEVELS.map(level => (
                                            <button
                                                key={level.id}
                                                onClick={() => setFormData({ ...formData, activityLevel: level.id })}
                                                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${formData.activityLevel === level.id
                                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800"
                                                    : "text-slate-500 hover:bg-white/50 dark:hover:bg-white/5"}`}
                                            >
                                                {level.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">How long will it take?</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                                                className={`py-4 px-4 rounded-2xl border-2 text-sm font-bold transition-all ${formData.duration === opt.val
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/30"}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Best Time of Day</label>
                                    <div className="flex gap-2 bg-slate-100 dark:bg-black/20 p-1.5 rounded-2xl">
                                        {TIME_OF_DAY.map((time) => (
                                            <button
                                                key={time.id}
                                                onClick={() => setFormData({ ...formData, timeOfDay: time.id })}
                                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${formData.timeOfDay === time.id
                                                    ? "bg-white dark:bg-slate-700 shadow-sm text-secondary"
                                                    : "text-slate-500 hover:text-slate-700"}`}
                                            >
                                                {time.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div
                                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer group ${formData.requiresTravel
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                                        : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200"}`}
                                    onClick={() => setFormData({ ...formData, requiresTravel: !formData.requiresTravel })}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${formData.requiresTravel ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                                        <Car className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-bold text-base transition-colors ${formData.requiresTravel ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-white"}`}>Requires Travel</p>
                                        <p className="text-xs text-slate-500 font-medium">Is this a trip or outing?</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.requiresTravel ? "bg-blue-500 border-blue-500" : "border-slate-300"}`}>
                                        {formData.requiresTravel && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Extra Details (Optional)
                                    </label>
                                    <textarea
                                        value={formData.details}
                                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                        placeholder="Links, packing lists, reservation info..."
                                        className="w-full h-40 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary/20 resize-none transition-shadow"
                                    />
                                </div>

                                <div
                                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer group ${formData.isPrivate
                                        ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10"
                                        : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-200"}`}
                                    onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${formData.isPrivate ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                                        <Lock className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-bold text-base transition-colors ${formData.isPrivate ? "text-amber-700 dark:text-amber-300" : "text-slate-700 dark:text-white"}`}>Keep Private</p>
                                        <p className="text-xs text-slate-500 font-medium">Only visible to you until selected</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.isPrivate ? "bg-amber-500 border-amber-500" : "border-slate-300"}`}>
                                        {formData.isPrivate && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-white/5 space-y-3">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Summary</p>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                                            {(() => {
                                                const Icon = categories.find(c => c.id === formData.category)?.icon || Sparkles;
                                                return <Icon className="w-5 h-5 text-primary" />;
                                            })()}
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold">{categories.find(c => c.id === formData.category)?.label}</p>
                                            <p className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{formData.description || "Untitled Idea"}</p>
                                        </div>
                                    </div>
                                    <div className="pt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                                        <span className="bg-white dark:bg-black/20 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-white/5">{COST_LEVELS.find(c => c.id === formData.cost)?.label}</span>
                                        <span className="bg-white dark:bg-black/20 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-white/5">{formData.duration}h</span>
                                        <span className="bg-white dark:bg-black/20 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-white/5">{ACTIVITY_LEVELS.find(l => l.id === formData.activityLevel)?.label}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </WizardFrame>
    );
}
