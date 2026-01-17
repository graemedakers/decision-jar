"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Crown, Sparkles, Check, X, ChevronDown, ChevronUp,
    Zap, Calendar, Users, Lock, Gift, ArrowRight
} from "lucide-react";
import { trackTrialModalShown, trackTrialModalAction } from "@/lib/analytics";
import { fetchTrialUsageStats } from "@/hooks/useTrialStatus";

// Coupon ID - must match what's configured in Stripe
const TRIAL_COUPON_ID = 'TRIAL_EXPIRED_50';

interface TrialExpiredModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    onContinueFree: () => void;
}

interface UsageStats {
    conciergeUses: number;
    ideasCreated: number;
    daysActive: number;
}

const PREMIUM_FEATURES = [
    { icon: Sparkles, text: "Unlimited AI Concierge tools", highlight: true },
    { icon: Zap, text: "Priority idea recommendations" },
    { icon: Users, text: "Unlimited shared jars" },
    { icon: Calendar, text: "Calendar integration" },
    { icon: Crown, text: "Premium themes & badges" },
];

const FREE_LIMITATIONS = [
    "Limited to 3 AI Concierge uses per month",
    "Maximum 1 shared jar",
    "Basic themes only",
    "No calendar sync",
    "Standard support",
];

export function TrialExpiredModal({
    isOpen,
    onClose,
    onUpgrade,
    onContinueFree,
}: TrialExpiredModalProps) {
    const router = useRouter();
    const [stats, setStats] = useState<UsageStats | null>(null);
    const [showLimitations, setShowLimitations] = useState(false);
    const [hasTracked, setHasTracked] = useState(false);

    // Fetch usage stats when modal opens
    useEffect(() => {
        if (isOpen && !stats) {
            fetchTrialUsageStats().then(setStats);
        }
    }, [isOpen, stats]);

    // Track modal shown
    useEffect(() => {
        if (isOpen && !hasTracked) {
            trackTrialModalShown(stats || undefined);
            setHasTracked(true);
        }
    }, [isOpen, hasTracked, stats]);

    const handleUpgrade = () => {
        trackTrialModalAction('upgrade_clicked', stats || undefined);
        onClose();
        // Navigate to premium page with coupon applied
        router.push(`/premium?coupon=${TRIAL_COUPON_ID}`);
    };

    const handleContinueFree = () => {
        trackTrialModalAction('continue_free', stats || undefined);
        onContinueFree();
    };

    const handleDismiss = () => {
        trackTrialModalAction('dismissed', stats || undefined);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleDismiss}>
            <DialogContent className="max-w-lg w-full p-0 overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-none">
                {/* Header with Gradient */}
                <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-8 text-white text-center">
                    {/* Close Button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Crown Icon */}
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", duration: 0.6 }}
                        className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                    >
                        <Crown className="w-10 h-10" />
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl font-black mb-2"
                    >
                        Your Free Trial Has Ended
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-white/80 text-sm"
                    >
                        Upgrade to keep the good times rolling!
                    </motion.p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Personalized Stats */}
                    {stats && (stats.ideasCreated > 0 || stats.conciergeUses > 0) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-500/20"
                        >
                            <p className="text-sm text-purple-800 dark:text-purple-200 font-medium mb-3">
                                During your trial, you:
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                {stats.ideasCreated > 0 && (
                                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                                        <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                                            {stats.ideasCreated}
                                        </div>
                                        <div className="text-[10px] uppercase font-bold text-slate-500">
                                            Ideas Created
                                        </div>
                                    </div>
                                )}
                                {stats.conciergeUses > 0 && (
                                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                                        <div className="text-2xl font-black text-pink-600 dark:text-pink-400">
                                            {stats.conciergeUses}
                                        </div>
                                        <div className="text-[10px] uppercase font-bold text-slate-500">
                                            AI Assists
                                        </div>
                                    </div>
                                )}
                                {stats.daysActive > 0 && (
                                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                                        <div className="text-2xl font-black text-orange-600 dark:text-orange-400">
                                            {stats.daysActive}
                                        </div>
                                        <div className="text-[10px] uppercase font-bold text-slate-500">
                                            Days Active
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Premium Features */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                            Keep enjoying Premium features:
                        </p>
                        <div className="space-y-2">
                            {PREMIUM_FEATURES.map((feature, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center gap-3 p-2 rounded-lg ${
                                        feature.highlight
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/20'
                                            : ''
                                    }`}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                        feature.highlight
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                    }`}>
                                        <Check className="w-3.5 h-3.5" />
                                    </div>
                                    <span className={`text-sm ${
                                        feature.highlight
                                            ? 'font-bold text-emerald-700 dark:text-emerald-300'
                                            : 'text-slate-600 dark:text-slate-400'
                                    }`}>
                                        {feature.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Limited Time Offer */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl p-4 border border-amber-300 dark:border-amber-500/30"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            <span className="text-sm font-black text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                                Special Offer
                            </span>
                        </div>
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                            Upgrade today and get your <strong>first month at 50% off</strong>!
                        </p>
                    </motion.div>

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={handleUpgrade}
                            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-xl shadow-lg shadow-purple-500/20"
                        >
                            <Crown className="w-5 h-5 mr-2" />
                            Upgrade to Premium
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={handleContinueFree}
                            className="w-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                            Continue with Free (Limited Features)
                        </Button>
                    </div>

                    {/* What Do I Lose Accordion */}
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                        <button
                            onClick={() => setShowLimitations(!showLimitations)}
                            className="flex items-center justify-between w-full text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                What do I lose with the free plan?
                            </span>
                            {showLimitations ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </button>

                        <AnimatePresence>
                            {showLimitations && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                                        {FREE_LIMITATIONS.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
