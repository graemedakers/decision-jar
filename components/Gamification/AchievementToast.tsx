"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { useEffect } from "react";

interface AchievementToastProps {
    achievement: { title: string, description: string, xp: number } | null;
    onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
    useEffect(() => {
        if (achievement) {
            const timer = setTimeout(onClose, 5000);
            return () => clearTimeout(timer);
        }
    }, [achievement, onClose]);

    return (
        <AnimatePresence>
            {achievement && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
                >
                    <div className="glass-card bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 p-4 rounded-xl shadow-2xl backdrop-blur-xl flex items-center gap-4 relative overflow-hidden">

                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 animate-pulse" />

                        <div className="relative p-3 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full shadow-lg shrink-0">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>

                        <div className="flex-1 min-w-0 relative">
                            <h4 className="font-bold text-yellow-500 text-xs uppercase tracking-wider mb-0.5">Achievement Unlocked!</h4>
                            <h3 className="font-bold text-slate-900 dark:text-white truncate">{achievement.title}</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{achievement.description}</p>
                        </div>

                        <div className="relative font-bold text-yellow-600 dark:text-yellow-400 text-sm whitespace-nowrap">
                            +{achievement.xp} XP
                        </div>

                        <button onClick={onClose} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
