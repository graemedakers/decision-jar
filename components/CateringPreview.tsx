"use client";

import { ChefHat, Clock, Info, Plus } from "lucide-react";

interface CateringPreviewProps {
    plan: any;
}

export function CateringPreview({ plan }: CateringPreviewProps) {
    if (!plan) return null;

    // If it's a list of options (raw tool output), we just show the first one or a summary
    // But usually when saved to jar, it's a single option.
    const courses = plan.courses || [];
    const strategy = plan.strategy || null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 flex items-center gap-2">
                    <ChefHat className="w-3 h-3" /> The Menu
                </h5>
                {courses.map((course: any, cIdx: number) => (
                    <div key={cIdx} className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm pdf-item">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-100 dark:bg-orange-500/10 px-3 py-1 rounded-full">Course {cIdx + 1}</span>
                            <h6 className="font-black text-slate-900 dark:text-white text-lg">{course.name}</h6>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 font-medium leading-relaxed">{course.description}</p>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Plus className="w-3 h-3 text-orange-500" /> Ingredients</p>
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
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Clock className="w-3 h-3 text-blue-500" /> Instructions</p>
                                <ul className="space-y-3">
                                    {course.instructions.map((ins: string, iIdx: number) => (
                                        <li key={iIdx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3 leading-relaxed">
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

            {strategy && (
                <div className="bg-blue-600/5 dark:bg-blue-500/5 p-8 rounded-[2rem] border border-blue-200 dark:border-blue-500/20">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-6 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Prep & Timing Strategy
                    </h5>
                    <div className="grid gap-6 mb-8">
                        {strategy.prepSteps?.map((step: any, sIdx: number) => (
                            <div key={sIdx} className="flex gap-4">
                                <div className="font-black text-sm text-blue-600 dark:text-blue-400 w-24 shrink-0">{step.time}</div>
                                <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">{step.task}</div>
                            </div>
                        ))}
                    </div>
                    {strategy.advice && (
                        <div className="flex gap-4 p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-blue-200 dark:border-blue-500/10">
                            <Info className="w-5 h-5 text-blue-500 shrink-0" />
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                {strategy.advice}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
