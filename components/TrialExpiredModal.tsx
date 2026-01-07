"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Sparkles, Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TrialExpiredModalProps {
    isTrialExpired: boolean;
    hasPaid: boolean;
    isPremiumCandidate: boolean; // Renamed to clarify we check effective premium status
}

export function TrialExpiredModal({ isTrialExpired, hasPaid, isPremiumCandidate }: TrialExpiredModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Show modal if trial is expired AND they are not effectively premium
        // If they are premium (paid or otherwise), never show this.
        if (isTrialExpired && !hasPaid && !isPremiumCandidate) {
            const hasSeenRecently = sessionStorage.getItem('trial_expired_modal_shown');
            if (!hasSeenRecently) {
                setIsOpen(true);
                sessionStorage.setItem('trial_expired_modal_shown', 'true');
            }
        }
    }, [isTrialExpired, hasPaid, isPremiumCandidate]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-slate-900 border border-yellow-500/20 rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
                >
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[60px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/10 rounded-full blur-[40px] pointer-events-none" />

                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>

                    <div className="text-center space-y-6 relative z-10">
                        <div className="w-20 h-20 mx-auto rounded-3xl bg-yellow-500/10 flex items-center justify-center ring-1 ring-yellow-500/20">
                            <Clock className="w-10 h-10 text-yellow-500" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
                                Your Pro Trial has Concluded
                            </h2>
                            <p className="text-slate-400 leading-relaxed font-medium">
                                We hope you enjoyed the AI-powered features! Upgrade now to restore your full access.
                            </p>
                        </div>

                        <div className="text-left space-y-3 bg-white/5 p-6 rounded-[2rem] border border-white/5">
                            <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Restores Pro Features:</h4>
                            <div className="flex items-center gap-3 text-sm text-slate-200">
                                <div className="w-5 h-5 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-3 h-3 text-yellow-500" />
                                </div>
                                <span>Unlimited AI Concierges</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-200">
                                <div className="w-5 h-5 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-3 h-3 text-yellow-500" />
                                </div>
                                <span>Advanced Activity Planning</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-200">
                                <div className="w-5 h-5 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-3 h-3 text-yellow-500" />
                                </div>
                                <span>Up to 50 Jars & Partners</span>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <Button
                                onClick={() => {
                                    setIsOpen(false);
                                    router.push('/premium');
                                }}
                                className="w-full h-14 bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-white font-bold text-lg rounded-2xl shadow-xl shadow-yellow-500/20 border-none transition-transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Restore Pro Access
                            </Button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-sm font-semibold text-slate-500 hover:text-slate-300 transition-colors py-2"
                            >
                                Continue with Free Plan
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
