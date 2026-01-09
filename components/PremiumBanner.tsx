"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sparkles, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isCapacitor } from "@/lib/utils";

interface PremiumBannerProps {
    hasPaid: boolean;
    coupleCreatedAt: string;
    isTrialEligible?: boolean;
    isPremium?: boolean;
}

export function PremiumBanner({ hasPaid, coupleCreatedAt, isTrialEligible = true, isPremium = false }: PremiumBannerProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [daysRemaining, setDaysRemaining] = useState<number>(0);
    const [isNative, setIsNative] = useState(false);

    useEffect(() => {
        setIsNative(isCapacitor());
    }, []);

    useEffect(() => {
        if (!isTrialEligible) {
            setDaysRemaining(0);
            return;
        }

        if (coupleCreatedAt) {
            const created = new Date(coupleCreatedAt);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - created.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const remaining = 14 - diffDays;
            setDaysRemaining(remaining > 0 ? remaining : 0);
        }
    }, [coupleCreatedAt, isTrialEligible]);

    const router = useRouter();

    if (hasPaid || isPremium) return null; // Don't show if already paid or premium

    return (
        <div className="mb-8">
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative overflow-hidden p-6 rounded-3xl bg-slate-900 border border-yellow-500/20 shadow-2xl shadow-yellow-500/5 group transition-all"
                    >
                        {/* Background Accents */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-yellow-400/10 transition-colors" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/5 rounded-full blur-[60px] pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-start gap-5 flex-1">
                                <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 ring-1 ring-yellow-500/30 shrink-0">
                                    <Sparkles className="w-7 h-7" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        {daysRemaining > 0
                                            ? `${daysRemaining} Days of Pro Remaining`
                                            : "Your Free Trial has Concluded"}
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black ${daysRemaining > 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'
                                            }`}>
                                            {daysRemaining > 0 ? 'TRIAL ACTIVE' : 'EXPIRED'}
                                        </span>
                                    </h3>
                                    <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                                        {daysRemaining > 0
                                            ? "You currently have full access to our AI Suite. Subscribe to maintain your status and unlock unlimited jar growth."
                                            : "Upgrade to Pro to restore your unlimited AI Suite access and continue growing your jars."}
                                    </p>
                                    {daysRemaining <= 3 && daysRemaining > 0 && (
                                        <div className="mt-2 px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-lg inline-block">
                                            <p className="text-orange-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                                                <span className="animate-pulse">⏰</span>
                                                Hurry! Only {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {!isNative && (
                                    <Button
                                        onClick={() => router.push('/premium')}
                                        className="w-full md:w-auto h-12 px-8 bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-white border-none shadow-xl shadow-yellow-500/20 font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
                                    >
                                        Upgrade to Pro
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
