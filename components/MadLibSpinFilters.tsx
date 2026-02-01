"use client";

import React, { useState } from "react";
import { ArrowRight, X, Check, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { getCategoryDef } from "@/lib/categories";
import { COST_LEVELS, ACTIVITY_LEVELS, TIME_OF_DAY, WEATHER_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MadLibSpinFiltersProps {
    onSpin: (filters: any) => void;
    jarTopic?: string | null;
    ideas: any[];
    customCategories?: any[];
}

export function MadLibSpinFilters({ onSpin, jarTopic, ideas, customCategories }: MadLibSpinFiltersProps) {
    // Filter State
    const [filters, setFilters] = useState<{
        maxDuration?: number;
        maxCost?: string;
        maxActivityLevel?: string;
        timeOfDay?: string;
        category?: string;
        weather?: string;
        ideaTypes: string[];
        localOnly: boolean;
    }>({
        ideaTypes: [],
        localOnly: false
    });

    // Valid options derivation
    const availableCategoryIds = Array.from(new Set(
        ideas.filter(i => !i.selectedAt).map(i => i.category)
    ));
    const filteredCategories = availableCategoryIds.map(id => getCategoryDef(id, customCategories));

    // UI State for "Active Token" (which dropdown is open)
    const [activeToken, setActiveToken] = useState<string | null>(null);

    const updateFilter = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        // Auto-close on selection for single-value fields
        if (key !== 'ideaTypes') {
            setActiveToken(null);
        }
    };

    const handleSpin = () => {
        onSpin(filters);
    };

    const handleReset = () => {
        setFilters({
            ideaTypes: [],
            localOnly: false
        });
        setActiveToken(null);
    }

    // --- Token Component ---
    const Token = ({ id, label, value, isActive, placeholder }: { id: string, label: string, value: any, isActive: boolean, placeholder: string }) => {
        const hasValue = Array.isArray(value) ? value.length > 0 : !!value;
        const displayValue = hasValue ? label : placeholder;

        return (
            <button
                onClick={() => setActiveToken(isActive ? null : id)}
                className={cn(
                    "inline-flex items-center justify-center px-3 py-1 mx-1 rounded-lg border-2 transition-all font-bold text-lg md:text-xl align-middle shadow-sm leading-normal my-1",
                    isActive
                        ? "border-primary bg-primary/10 text-primary scale-105 z-10"
                        : hasValue
                            ? "border-secondary/50 bg-secondary/5 text-secondary hover:border-secondary hover:bg-secondary/10"
                            : "border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 dashed-border"
                )}
            >
                {displayValue}
            </button>
        );
    };

    // --- Render Helpers for Options ---
    const renderOptions = () => {
        if (!activeToken) return null;

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl relative z-20"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                        Select {activeToken.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <button onClick={() => setActiveToken(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full">
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[250px] overflow-y-auto custom-scrollbar p-1">
                    {/* IDEA TYPES */}
                    {activeToken === 'ideaTypes' && [
                        { id: 'recipe', label: 'Cook' },
                        { id: 'movie', label: 'Watch' },
                        { id: 'game', label: 'Play' },
                        { id: 'book', label: 'Read' }
                    ].map(type => (
                        <button
                            key={type.id}
                            onClick={() => {
                                const newTypes = filters.ideaTypes.includes(type.id)
                                    ? filters.ideaTypes.filter(t => t !== type.id)
                                    : [...filters.ideaTypes, type.id];
                                updateFilter('ideaTypes', newTypes);
                            }}
                            className={cn(
                                "p-3 rounded-xl border font-medium text-sm transition-all flex items-center justify-between",
                                filters.ideaTypes.includes(type.id)
                                    ? "bg-primary text-white border-primary shadow-md"
                                    : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-primary/50"
                            )}
                        >
                            {type.label}
                            {filters.ideaTypes.includes(type.id) && <Check className="w-4 h-4" />}
                        </button>
                    ))}

                    {/* CATEGORY */}
                    {activeToken === 'category' && (
                        <>
                            <button
                                onClick={() => updateFilter('category', undefined)}
                                className={cn(
                                    "p-3 rounded-xl border font-medium text-sm transition-all",
                                    !filters.category ? "bg-secondary text-white border-secondary shadow-md" : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
                                )}
                            >
                                Any Category
                            </button>
                            {filteredCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => updateFilter('category', cat.id)}
                                    className={cn(
                                        "p-3 rounded-xl border font-medium text-sm transition-all flex flex-col items-center gap-1 text-center",
                                        filters.category === cat.id
                                            ? "bg-secondary text-white border-secondary shadow-md"
                                            : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-secondary/50"
                                    )}
                                >
                                    <cat.icon className="w-4 h-4" />
                                    <span className="truncate w-full text-xs">{cat.label}</span>
                                </button>
                            ))}
                        </>
                    )}

                    {/* ACTIVITY */}
                    {activeToken === 'maxActivityLevel' && ACTIVITY_LEVELS.map(level => (
                        <button
                            key={level.id}
                            onClick={() => updateFilter('maxActivityLevel', level.id === filters.maxActivityLevel ? undefined : level.id)}
                            className={cn(
                                "p-3 rounded-xl border font-medium text-sm transition-all",
                                filters.maxActivityLevel === level.id
                                    ? "bg-secondary text-white border-secondary shadow-md"
                                    : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-secondary/50"
                            )}
                        >
                            {level.label}
                        </button>
                    ))}

                    {/* COST */}
                    {activeToken === 'maxCost' && COST_LEVELS.map(level => (
                        <button
                            key={level.id}
                            onClick={() => updateFilter('maxCost', level.id === filters.maxCost ? undefined : level.id)}
                            className={cn(
                                "p-3 rounded-xl border font-medium text-sm transition-all",
                                filters.maxCost === level.id
                                    ? "bg-secondary text-white border-secondary shadow-md"
                                    : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-secondary/50"
                            )}
                        >
                            {level.label} ({level.id})
                        </button>
                    ))}

                    {/* DURATION */}
                    {activeToken === 'maxDuration' && [1, 2, 4, 8].map(h => (
                        <button
                            key={h}
                            onClick={() => updateFilter('maxDuration', h === filters.maxDuration ? undefined : h)}
                            className={cn(
                                "p-3 rounded-xl border font-medium text-sm transition-all",
                                filters.maxDuration === h
                                    ? "bg-secondary text-white border-secondary shadow-md"
                                    : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-secondary/50"
                            )}
                        >
                            Max {h} Hour{h > 1 ? 's' : ''}
                        </button>
                    ))}

                    {/* TIME */}
                    {activeToken === 'timeOfDay' && TIME_OF_DAY.map(time => (
                        <button
                            key={time.id}
                            onClick={() => updateFilter('timeOfDay', time.id === filters.timeOfDay ? undefined : time.id)}
                            className={cn(
                                "p-3 rounded-xl border font-medium text-sm transition-all",
                                filters.timeOfDay === time.id
                                    ? "bg-secondary text-white border-secondary shadow-md"
                                    : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-secondary/50"
                            )}
                        >
                            {time.label}
                        </button>
                    ))}

                    {/* WEATHER */}
                    {activeToken === 'weather' && WEATHER_TYPES.map(w => (
                        <button
                            key={w.id}
                            onClick={() => updateFilter('weather', w.id === filters.weather ? undefined : w.id)}
                            className={cn(
                                "p-3 rounded-xl border font-medium text-sm transition-all flex flex-col items-center gap-1",
                                filters.weather === w.id
                                    ? "bg-amber-500 text-white border-amber-500 shadow-md"
                                    : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-amber-500/50"
                            )}
                        >
                            {w.label}
                        </button>
                    ))}

                    {/* LOCAL ONLY */}
                    {activeToken === 'localOnly' && (
                        <>
                            <button
                                onClick={() => updateFilter('localOnly', false)}
                                className={cn(
                                    "p-3 rounded-xl border font-medium text-sm transition-all",
                                    !filters.localOnly ? "bg-blue-500 text-white border-blue-500 shadow-md" : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
                                )}
                            >
                                Include Travel
                            </button>
                            <button
                                onClick={() => updateFilter('localOnly', true)}
                                className={cn(
                                    "p-3 rounded-xl border font-medium text-sm transition-all",
                                    filters.localOnly ? "bg-blue-500 text-white border-blue-500 shadow-md" : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
                                )}
                            >
                                Stay Local
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        );
    };

    // --- Helpers for Display Labels ---
    const getIdeaTypeLabel = () => {
        if (filters.ideaTypes.length === 0) return null;
        if (filters.ideaTypes.length === 1) {
            const map: Record<string, string> = { recipe: "Cook", movie: "Watch", game: "Play", book: "Read" };
            return map[filters.ideaTypes[0]] || filters.ideaTypes[0];
        }
        return `${filters.ideaTypes.length} Types`;
    };

    const getCategoryLabel = () => {
        if (!filters.category) return null;
        const cat = filteredCategories.find(c => c.id === filters.category);
        return cat ? cat.label : filters.category;
    };

    const getActivityLabel = () => ACTIVITY_LEVELS.find(l => l.id === filters.maxActivityLevel)?.label;
    const getCostLabel = () => filters.maxCost || null;
    const getDurationLabel = () => filters.maxDuration ? `${filters.maxDuration}h` : null;
    const getTimeLabel = () => TIME_OF_DAY.find(t => t.id === filters.timeOfDay)?.label;
    const getWeatherLabel = () => WEATHER_TYPES.find(w => w.id === filters.weather)?.label;
    const getLocalLabel = () => filters.localOnly ? "Stay Local" : "Any Distance";


    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col justify-center items-start px-2 py-4 space-y-8 min-h-[300px]">

                {/* SENTENCE BUILDER */}
                <div className="text-2xl md:text-3xl font-medium leading-relaxed text-slate-800 dark:text-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <span className="opacity-50">I want to</span>

                    <Token
                        id="ideaTypes"
                        label={getIdeaTypeLabel() || ""}
                        value={filters.ideaTypes}
                        isActive={activeToken === 'ideaTypes'}
                        placeholder="do anything"
                    />

                    <span className="opacity-50">that matches</span>

                    <Token
                        id="category"
                        label={getCategoryLabel() || ""}
                        value={filters.category}
                        isActive={activeToken === 'category'}
                        placeholder="any vibe"
                    />

                    <span className="opacity-50">.</span>
                    <br className="hidden md:block" />
                    <span className="opacity-50">Keep it</span>

                    <Token
                        id="maxActivityLevel"
                        label={getActivityLabel() || ""}
                        value={filters.maxActivityLevel}
                        isActive={activeToken === 'maxActivityLevel'}
                        placeholder="any energy"
                    />

                    <span className="opacity-50">and under</span>

                    <Token
                        id="maxCost"
                        label={getCostLabel() || ""}
                        value={filters.maxCost}
                        isActive={activeToken === 'maxCost'}
                        placeholder="any cost"
                    />

                    <span className="opacity-50">.</span>
                    <br className="hidden md:block" />
                    <span className="opacity-50">Timebox to</span>

                    <Token
                        id="maxDuration"
                        label={getDurationLabel() || ""}
                        value={filters.maxDuration}
                        isActive={activeToken === 'maxDuration'}
                        placeholder="any duration"
                    />

                    <span className="opacity-50">in the</span>

                    <Token
                        id="timeOfDay"
                        label={getTimeLabel() || ""}
                        value={filters.timeOfDay}
                        isActive={activeToken === 'timeOfDay'}
                        placeholder="any time"
                    />

                    <span className="opacity-50">.</span>
                    <br className="hidden md:block" />
                    <span className="opacity-50">Also, it's</span>

                    <Token
                        id="weather"
                        label={getWeatherLabel() || ""}
                        value={filters.weather}
                        isActive={activeToken === 'weather'}
                        placeholder="any weather"
                    />

                    <span className="opacity-50">and</span>

                    <Token
                        id="localOnly"
                        label={getLocalLabel() || ""}
                        value={filters.localOnly}
                        isActive={activeToken === 'localOnly'}
                        placeholder="travel is ok"
                    />
                    <span className="opacity-50">.</span>
                </div>

                {/* ANIMATED OPTIONS DRAWER */}
                <AnimatePresence>
                    {renderOptions()}
                </AnimatePresence>
            </div>

            <div className="pt-8 flex flex-col gap-3">
                {/* RESET BUTTON */}
                {(filters.category || filters.ideaTypes.length > 0 || filters.maxActivityLevel || filters.maxCost || filters.maxDuration || filters.timeOfDay || filters.weather || filters.localOnly) && (
                    <button
                        onClick={handleReset}
                        className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <RotateCcw className="w-3 h-3" /> Reset Filters
                    </button>
                )}

                <Button
                    onClick={handleSpin}
                    className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/25 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:scale-[1.02] transition-all"
                >
                    Find My Adventure <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    );
}
