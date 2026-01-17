"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { getNextLevelProgress } from "@/lib/gamification-shared";
import { Sparkles } from "lucide-react";
import { trackProgressBarViewed } from "@/lib/analytics";

interface MiniProgressBarProps {
    xp: number;
    level: number;
}

export function MiniProgressBar({ xp, level }: MiniProgressBarProps) {
    const { progressPercent, xpToNext, nextTitle, currentTitle } = getNextLevelProgress(xp, level);
    const hasTracked = useRef(false);
    
    const isMaxLevel = progressPercent === 100 && xpToNext === 0;

    // Track progress bar view once on mount
    useEffect(() => {
        if (!hasTracked.current) {
            trackProgressBarViewed(level, xp, progressPercent);
            hasTracked.current = true;
        }
    }, [level, xp, progressPercent]);

    return (
        <div className="w-full max-w-md">
            {/* Level Info */}
            <div className="flex items-center justify-between mb-1 px-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Level {level}
                    </span>
                    {!isMaxLevel && (
                        <>
                            <span className="text-xs text-slate-400 dark:text-slate-500">→</span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Level {level + 1}
                            </span>
                        </>
                    )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                    {isMaxLevel ? (
                        <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-semibold">
                            <Sparkles className="w-3 h-3" />
                            Max Level!
                        </span>
                    ) : (
                        <span>{Math.round(progressPercent)}%</span>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                {/* Animated Progress Fill */}
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    {/* Shimmer effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        initial={{ x: "-100%" }}
                        animate={{ x: "200%" }}
                        transition={{ 
                            repeat: Infinity, 
                            duration: 2, 
                            ease: "linear",
                            repeatDelay: 1
                        }}
                    />
                </motion.div>

                {/* Milestone markers (every 25%) */}
                {!isMaxLevel && [25, 50, 75].map((milestone) => (
                    <div
                        key={milestone}
                        className="absolute top-0 bottom-0 w-px bg-slate-300 dark:bg-slate-600"
                        style={{ left: `${milestone}%` }}
                    />
                ))}
            </div>

            {/* XP Details */}
            {!isMaxLevel && (
                <div className="flex items-center justify-between mt-1 px-1">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {xp} XP
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {xpToNext} XP to next level
                    </span>
                </div>
            )}
        </div>
    );
}
