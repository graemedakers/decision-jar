"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Utensils, Loader2, Sparkles, ChefHat, Users, Clock, Info, Plus, Zap, Heart, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/Button";
import { useConciergeActions } from "@/hooks/useConciergeActions";

interface CateringPlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onIdeaAdded?: () => void;
}

export function CateringPlannerModal({ isOpen, onClose, onIdeaAdded }: CateringPlannerModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [numPeople, setNumPeople] = useState(4);
    const [ageGroup, setAgeGroup] = useState("Adults");
    const [complexity, setComplexity] = useState("Moderate");
    const [theme, setTheme] = useState("");
    const [numCourses, setNumCourses] = useState(3);
    const [includeDessert, setIncludeDessert] = useState(true);
    const [portionSize, setPortionSize] = useState("Normal");
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const resultsRef = useRef<HTMLDivElement>(null);
    const [expandedOption, setExpandedOption] = useState<number | null>(null);

    const { handleAddToJar } = useConciergeActions({
        onIdeaAdded,
        onClose,
        setRecommendations
    });

    const handleGetPlans = async () => {
        if (!theme.trim()) {
            alert("Please enter a theme or food style.");
            return;
        }
        setIsLoading(true);
        setRecommendations([]);
        try {
            const res = await fetch('/api/catering-planner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    numPeople,
                    ageGroup,
                    complexity,
                    theme,
                    numCourses,
                    includeDessert,
                    portionSize
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setRecommendations(data.options || []);
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(`Error: ${errorData.error || "Failed to generate plans."}`);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while generating your plans.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (recommendations.length > 0 && resultsRef.current) {
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [recommendations]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="glass-card w-full max-w-2xl relative max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl rounded-[2rem]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-500/5 dark:to-red-500/5">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center shadow-inner">
                                    <ChefHat className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Catering Planner</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Professional menus for any occasion</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-all hover:rotate-90"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-8 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Input Groups */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-orange-500" /> Number of People
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={numPeople}
                                        onChange={(e) => setNumPeople(parseInt(e.target.value))}
                                        className="glass-input w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-blue-500" /> Complexity
                                    </label>
                                    <select
                                        value={complexity}
                                        onChange={(e) => setComplexity(e.target.value)}
                                        className="glass-input w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                                    >
                                        <option>Simple</option>
                                        <option>Moderate</option>
                                        <option>Gourmet</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-yellow-500" /> Theme or Style
                                </label>
                                <input
                                    type="text"
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    placeholder="e.g. Italian Summer, 5yo Birthday, Romantic French Night"
                                    className="glass-input w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-500 transition-all font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Audience</label>
                                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                                        {['Adults', 'Children', 'Mixed'].map((a) => (
                                            <button
                                                key={a}
                                                onClick={() => setAgeGroup(a)}
                                                className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${ageGroup === a ? 'bg-white dark:bg-white/10 shadow-sm text-orange-600 scale-105' : 'text-slate-500'}`}
                                            >
                                                {a}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Portion Size</label>
                                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                                        {['Light', 'Normal', 'Hearty'].map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setPortionSize(p)}
                                                className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${portionSize === p ? 'bg-white dark:bg-white/10 shadow-sm text-blue-600 scale-105' : 'text-slate-500'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Courses</label>
                                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                                        <button onClick={() => setNumCourses(Math.max(1, numCourses - 1))} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg text-slate-600">-</button>
                                        <span className="flex-1 text-center font-black text-slate-900 dark:text-white">{numCourses}</span>
                                        <button onClick={() => setNumCourses(Math.min(7, numCourses + 1))} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg text-slate-600">+</button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-500/5 rounded-2xl border border-orange-200/50 dark:border-orange-500/10">
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Include Dessert?</p>
                                    <p className="text-xs text-slate-500">One of your courses will be a dessert option.</p>
                                </div>
                                <button
                                    onClick={() => setIncludeDessert(!includeDessert)}
                                    className={`w-12 h-6 rounded-full transition-all relative ${includeDessert ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${includeDessert ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            <Button
                                onClick={handleGetPlans}
                                disabled={isLoading}
                                className="w-full h-16 bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 hover:scale-[1.02] transition-all text-white font-black text-lg shadow-2xl shadow-orange-500/30 rounded-2xl"
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-6 h-6 animate-spin mr-3" /> Designing Your Menu...</>
                                ) : (
                                    <><Sparkles className="w-6 h-6 mr-3" /> Generate Catering Plans</>
                                )}
                            </Button>

                            {/* Results */}
                            {recommendations.length > 0 && (
                                <div ref={resultsRef} className="space-y-6 pt-6 border-t border-slate-200 dark:border-white/10">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Your Custom Menus</h3>
                                        <div className="text-[10px] uppercase tracking-widest font-black text-orange-600 bg-orange-100 dark:bg-orange-500/20 px-3 py-1 rounded-full">3 Options Generated</div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        {recommendations.map((option, idx) => (
                                            <div key={idx} className="group glass-card border-slate-200 dark:border-white/10 overflow-hidden rounded-[2rem] hover:shadow-2xl transition-all duration-500 bg-white dark:bg-white/5">
                                                <div className="p-8">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex-1">
                                                            <h4 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">{option.title}</h4>
                                                            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium italic leading-relaxed">{option.description}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => setExpandedOption(expandedOption === idx ? null : idx)}
                                                            className="p-3 bg-slate-100 dark:bg-white/10 rounded-2xl hover:bg-orange-100 dark:hover:bg-orange-500/20 text-slate-500 dark:text-slate-400 transition-all"
                                                        >
                                                            {expandedOption === idx ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                                                        </button>
                                                    </div>

                                                    <AnimatePresence>
                                                        {expandedOption === idx && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="space-y-8 mt-8 pb-4">
                                                                    {/* Courses */}
                                                                    <div className="space-y-6">
                                                                        <h5 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                                                            <ChefHat className="w-4 h-4" /> The Menu
                                                                        </h5>
                                                                        {option.courses.map((course: any, cIdx: number) => (
                                                                            <div key={cIdx} className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/10">
                                                                                <div className="flex justify-between items-center mb-4">
                                                                                    <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-100 dark:bg-orange-500/10 px-3 py-1 rounded-full">Course {cIdx + 1}</span>
                                                                                    <h6 className="font-black text-slate-900 dark:text-white text-lg">{course.name}</h6>
                                                                                </div>
                                                                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 font-medium">{course.description}</p>

                                                                                <div className="grid md:grid-cols-2 gap-8">
                                                                                    <div>
                                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Plus className="w-3 h-3" /> Ingredients ({numPeople} people)</p>
                                                                                        <ul className="space-y-2">
                                                                                            {course.ingredients.map((ing: string, iIdx: number) => (
                                                                                                <li key={iIdx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                                                                                                    {ing}
                                                                                                </li>
                                                                                            ))}
                                                                                        </ul>
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Clock className="w-3 h-3" /> Instructions</p>
                                                                                        <ul className="space-y-3">
                                                                                            {course.instructions.map((ins: string, iIdx: number) => (
                                                                                                <li key={iIdx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
                                                                                                    <span className="font-black text-orange-500 shrink-0">{iIdx + 1}.</span>
                                                                                                    {ins}
                                                                                                </li>
                                                                                            ))}
                                                                                        </ul>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    {/* Strategy */}
                                                                    <div className="bg-blue-600/5 dark:bg-blue-500/5 p-8 rounded-[2rem] border border-blue-200 dark:border-blue-500/20">
                                                                        <h5 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-6 flex items-center gap-2">
                                                                            <Clock className="w-4 h-4" /> Prep & Timing Strategy
                                                                        </h5>
                                                                        <div className="grid gap-6 mb-8">
                                                                            {option.strategy.prepSteps.map((step: any, sIdx: number) => (
                                                                                <div key={sIdx} className="flex gap-4">
                                                                                    <div className="font-black text-sm text-blue-600 dark:text-blue-400 w-24 shrink-0">{step.time}</div>
                                                                                    <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">{step.task}</div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        <div className="flex gap-4 p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-blue-200 dark:border-blue-500/10">
                                                                            <Info className="w-5 h-5 text-blue-500 shrink-0" />
                                                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                                                                <strong className="text-slate-900 dark:text-white block mb-1">Catering Advice for {ageGroup}:</strong>
                                                                                {option.strategy.advice}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <Button
                                                                        onClick={() => handleAddToJar({
                                                                            name: option.title,
                                                                            description: option.description,
                                                                            details: JSON.stringify(option)
                                                                        }, "CATERING")}
                                                                        className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm shadow-xl"
                                                                    >
                                                                        Add This Menu to My Jar
                                                                    </Button>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
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
