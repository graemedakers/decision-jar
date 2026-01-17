"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakBadgeProps {
    currentStreak: number;
    longestStreak: number;
}

export function StreakBadge({ currentStreak, longestStreak }: StreakBadgeProps) {
    if (currentStreak === 0) return null;

    const isNewRecord = currentStreak === longestStreak && currentStreak > 1;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 border border-orange-500/30 dark:border-orange-500/50 rounded-full"
        >
            <motion.div
                animate={currentStreak >= 7 ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                } : {}}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                }}
            >
                <Flame 
                    className={`w-4 h-4 ${
                        currentStreak >= 7 
                            ? "text-orange-500 dark:text-orange-400" 
                            : "text-orange-600 dark:text-orange-500"
                    }`}
                    fill={currentStreak >= 7 ? "currentColor" : "none"}
                />
            </motion.div>
            
            <div className="flex flex-col leading-tight">
                <span className="text-xs font-bold text-orange-700 dark:text-orange-400">
                    {currentStreak} Day{currentStreak !== 1 ? 's' : ''}{isNewRecord && ' 🎉'}
                </span>
                {longestStreak > currentStreak && (
                    <span className="text-[9px] text-orange-600/70 dark:text-orange-500/70">
                        Best: {longestStreak}
                    </span>
                )}
            </div>
        </motion.div>
    );
}
