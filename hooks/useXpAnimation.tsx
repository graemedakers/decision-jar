"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackXpGained } from "@/lib/analytics";

interface XpGainNotification {
    amount: number;
    timestamp: number;
}

/**
 * Hook to track XP changes and trigger gain animations
 */
export function useXpAnimation(currentXp: number, currentLevel?: number) {
    const [xpGain, setXpGain] = useState<XpGainNotification | null>(null);
    const previousXp = useRef(currentXp);

    useEffect(() => {
        if (previousXp.current !== undefined && currentXp > previousXp.current) {
            const gain = currentXp - previousXp.current;
            setXpGain({
                amount: gain,
                timestamp: Date.now()
            });

            // Track XP gain
            if (currentLevel !== undefined) {
                trackXpGained(gain, 'user_action', currentXp, currentLevel);
            }

            // Auto-dismiss after 2 seconds
            const timeout = setTimeout(() => {
                setXpGain(null);
            }, 2000);

            previousXp.current = currentXp;

            return () => clearTimeout(timeout);
        } else {
            previousXp.current = currentXp;
        }
    }, [currentXp, currentLevel]);

    return { xpGain, clearXpGain: () => setXpGain(null) };
}

/**
 * Component to display XP gain toast
 */
export function XpGainToast({ xpGain }: { xpGain: XpGainNotification | null }) {
    return (
        <AnimatePresence>
            {xpGain && (
                <motion.div
                    initial={{ y: -50, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -50, opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-[90] pointer-events-none"
                >
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                        <span className="text-lg font-bold">+{xpGain.amount} XP</span>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="text-yellow-300"
                        >
                            ✨
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
