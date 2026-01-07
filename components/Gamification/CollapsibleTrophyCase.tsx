"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Trophy } from "lucide-react";
import { LevelBanner } from "./LevelBanner";
import { AchievementCase } from "./AchievementCase";

interface CollapsibleTrophyCaseProps {
    xp: number;
    level: number;
    unlockedIds: string[];
}

export function CollapsibleTrophyCase({ xp, level, unlockedIds }: CollapsibleTrophyCaseProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group shadow-sm dark:shadow-none"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 dark:bg-yellow-500/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400 ring-1 ring-yellow-500/30 dark:ring-yellow-500/50 group-hover:scale-110 transition-transform">
                        <Trophy className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <span className="block text-sm font-bold text-slate-900 dark:text-white">Level {level}</span>
                        <span className="text-xs text-slate-500">{unlockedIds.length} Achievements</span>
                    </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4">
                            <LevelBanner xp={xp} level={level} />
                            <div className="mt-[-2rem]">
                                {/* Negative margin to pull AchievementCase closer since LevelBanner has huge bottom margin */}
                                <AchievementCase unlockedIds={unlockedIds} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
