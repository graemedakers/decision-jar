"use client";

import { ACHIEVEMENTS } from "@/lib/achievements-shared";
import { Hammer, Lightbulb, Dices, RefreshCw, Heart, Flame, Crown, Award, Warehouse } from "lucide-react";

// Map icon strings to components
const IconMap: any = { Hammer, Lightbulb, Dices, RefreshCw, Heart, Flame, Crown, Award, Warehouse };

export function AchievementCase({ unlockedIds }: { unlockedIds: string[] }) {
    const unlockedSet = new Set(unlockedIds);

    return (
        <div className="w-full min-w-[320px] bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl p-4 md:p-6 shadow-md dark:shadow-none transition-all">
            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Trophy Case
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4">
                {ACHIEVEMENTS.map((ach) => {
                    const isUnlocked = unlockedSet.has(ach.id);
                    const Icon = IconMap[ach.icon] || Award; // Fallback

                    return (
                        <div
                            key={ach.id}
                            className={`flex flex-col items-center text-center p-2 md:p-3 rounded-lg border transition-all ${isUnlocked
                                ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 shadow-sm"
                                : "bg-slate-100 dark:bg-white/5 border-transparent opacity-60 grayscale"
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isUnlocked ? "bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg" : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-400"
                                }`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <h4 className={`text-xs font-bold mb-1 ${isUnlocked ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                                {ach.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 leading-tight">
                                {ach.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
