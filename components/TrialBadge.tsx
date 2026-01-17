"use client";

import { Clock, Sparkles } from "lucide-react";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { UserData } from "@/lib/types";
import { motion } from "framer-motion";

interface TrialBadgeProps {
    userData: UserData | null | undefined;
    variant?: 'default' | 'compact' | 'urgent';
    className?: string;
}

/**
 * Displays a contextual "X days left" badge for trial users.
 * Automatically hides for premium/paid users.
 */
export function TrialBadge({ userData, variant = 'default', className = '' }: TrialBadgeProps) {
    const { isInTrial, daysRemaining, isTrialExpired } = useTrialStatus(userData);

    // Don't show for premium users or if not in trial
    if (!isInTrial || userData?.isPremium || userData?.hasPaid || userData?.isLifetimePro) {
        return null;
    }

    // Determine urgency level for styling
    const isUrgent = daysRemaining <= 3;
    const isWarning = daysRemaining <= 7 && daysRemaining > 3;

    if (variant === 'compact') {
        return (
            <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                    isUrgent
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : isWarning
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                } ${className}`}
            >
                <Clock className="w-3 h-3" />
                {daysRemaining}d
            </motion.span>
        );
    }

    if (variant === 'urgent' || isUrgent) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold shadow-lg ${className}`}
            >
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left in trial</span>
                <Sparkles className="w-3.5 h-3.5" />
            </motion.div>
        );
    }

    // Default variant
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                isWarning
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
            } ${className}`}
        >
            <Clock className="w-3 h-3" />
            <span>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left</span>
        </motion.div>
    );
}

/**
 * Inline version for use in headers/titles
 */
export function TrialBadgeInline({ userData }: { userData: UserData | null | undefined }) {
    return <TrialBadge userData={userData} variant="compact" />;
}
