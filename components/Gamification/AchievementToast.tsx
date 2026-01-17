"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { AchievementDef } from "@/lib/achievements-shared";
import { trackAchievementNotificationShown } from "@/lib/analytics";

interface AchievementToastProps {
    achievement: AchievementDef;
    onDismiss?: () => void;
}

/**
 * Custom Achievement Toast Component
 * Shows a celebratory toast with confetti when user unlocks an achievement
 */
function AchievementToastContent({ achievement, onDismiss }: AchievementToastProps) {
    // Get the Lucide icon dynamically
    const IconComponent = (Icons as any)[achievement.icon] || Icons.Trophy;

    // Category colors
    const categoryColors = {
        CREATION: "from-blue-500 to-cyan-500",
        ACTION: "from-purple-500 to-pink-500",
        COMPLETION: "from-green-500 to-emerald-500",
        STREAK: "from-orange-500 to-red-500"
    };

    const bgGradient = categoryColors[achievement.category] || "from-yellow-500 to-orange-500";

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`bg-gradient-to-r ${bgGradient} p-4 rounded-xl shadow-2xl border-2 border-white/20 min-w-[300px] max-w-[400px]`}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="bg-white/20 backdrop-blur-sm p-2 rounded-full"
                >
                    <IconComponent className="w-6 h-6 text-white" />
                </motion.div>

                {/* Content */}
                <div className="flex-1">
                    <div className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">
                        Achievement Unlocked! 🎉
                    </div>
                    <h4 className="text-white font-bold text-lg mb-1">
                        {achievement.title}
                    </h4>
                    <p className="text-white/90 text-sm">
                        {achievement.description}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

/**
 * Show achievement toast with confetti animation
 */
export function showAchievementToast(achievement: AchievementDef) {
    // Track analytics
    trackAchievementNotificationShown(achievement.id, achievement.title, 'toast');

    // Fire confetti
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    // Confetti burst (more intense for certain categories)
    const burstIntensity = achievement.category === 'STREAK' || achievement.targetCount >= 20 ? 200 : 100;
    
    const interval = window.setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = burstIntensity * (timeLeft / duration);
        
        // Two bursts from different angles
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
    }, 250);

    // Show custom toast
    toast.custom(
        (t) => <AchievementToastContent achievement={achievement} onDismiss={() => toast.dismiss(t)} />,
        {
            duration: 5000,
            position: "top-center",
        }
    );
}
