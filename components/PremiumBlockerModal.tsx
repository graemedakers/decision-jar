'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { resetConciergeTrial } from '@/lib/demo-storage';

interface PremiumBlockerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PremiumBlockerModal({ isOpen, onClose }: PremiumBlockerModalProps) {
    const router = useRouter();

    // Since this is mounted conditionally in parent, AnimatePresence here might need the parent to keep it mounted?
    // Actually, usually we pass `isOpen` to AnimatePresence inside. 
    // If the parent unmounts this component when isOpen is false, exit animations won't run.
    // Ideally the parent keeps it mounted or we wrap AnimatePresence around the conditional render in the parent.
    // BUT, for simplicity in quick refactor, I will assume parent conditionally renders it.
    // To support exit animations, the parent should render `<AnimatePresence> {isOpen && <Modal />}</AnimatePresence>`
    // OR this component returns null if !isOpen but handles AnimatePresence internally? 
    // Yes, if parent passes `isOpen` and always renders `<PremiumBlockerModal isOpen={state} />`.

    // I'll assume the parent renders it always.

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-slate-900 rounded-3xl overflow-hidden border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.2)]"
                    >
                        {/* Background Effects */}
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-amber-500/20 to-transparent pointer-events-none" />
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="relative p-8 text-center">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20 ring-4 ring-amber-500/10">
                                <Crown className="w-8 h-8 text-white" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">Unlock Premium Concierge</h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                You've used your free trial. Upgrade to Decision Jar Premium for unlimited AI recommendations, custom vibes, and curated date plans.
                            </p>

                            <div className="space-y-3 mb-8 text-left bg-slate-800/50 p-4 rounded-xl border border-white/5">
                                <FeatureItem text="Unlimited AI Concierge Requests" />
                                <FeatureItem text="Advanced Mood & Filter Controls" />
                                <FeatureItem text="Save & Sync Across Devices" />
                            </div>

                            <Button
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold h-12 rounded-xl shadow-lg shadow-amber-500/25 border-none transform active:scale-95 transition-all text-base"
                                onClick={() => {
                                    if (typeof window !== 'undefined') localStorage.setItem('import_demo_data', 'true');
                                    router.push('/signup');
                                }}
                            >
                                Start 7-Day Free Trial
                            </Button>

                            {/* Dev Helper */}
                            <button
                                onClick={() => {
                                    resetConciergeTrial();
                                    // No reload here, the function reloads. 
                                    // If not, we might want to reload manually or call onClose
                                }}
                                className="mt-6 text-xs text-slate-600 hover:text-amber-500 transition-colors"
                            >
                                (Dev) Reset Trial Limit
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 text-sm text-slate-300">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-emerald-400" />
            </div>
            {text}
        </div>
    );
}
