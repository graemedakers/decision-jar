'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Lock, Zap } from 'lucide-react';
import { Button } from './ui/Button';
import { useRouter } from 'next/navigation';

interface DemoUpgradePromptProps {
    reason?: 'ai_limit' | 'share' | 'premium' | 'save' | 'general';
    message?: string;
    compact?: boolean;
}

const PROMPT_CONFIGS = {
    ai_limit: {
        icon: Zap,
        title: 'AI Limit Reached',
        message: 'Create a free account for unlimited AI suggestions!',
        cta: 'Get Unlimited AI',
        gradient: 'from-yellow-500 to-orange-500',
    },
    share: {
        icon: Sparkles,
        title: 'Want to Share?',
        message: 'Sign up to share this jar with your partner or friends!',
        cta: 'Enable Sharing',
        gradient: 'from-pink-500 to-purple-500',
    },
    premium: {
        icon: Lock,
        title: 'Premium Feature',
        message: 'This is a premium feature. Sign up for a 7-day free trial!',
        cta: 'Start Free Trial',
        gradient: 'from-purple-500 to-indigo-500',
    },
    save: {
        icon: Sparkles,
        title: 'Save Your Progress',
        message: 'Create an account to save your ideas forever!',
        cta: 'Save My Ideas',
        gradient: 'from-emerald-500 to-teal-500',
    },
    general: {
        icon: Sparkles,
        title: 'Loving It?',
        message: 'Sign up free to unlock all features and save your data!',
        cta: 'Create Free Account',
        gradient: 'from-pink-500 to-purple-500',
    },
};

export function DemoUpgradePrompt({ reason = 'general', message, compact = false }: DemoUpgradePromptProps) {
    const [dismissed, setDismissed] = useState(false);
    const router = useRouter();
    const config = PROMPT_CONFIGS[reason];
    const Icon = config.icon;

    const handleSignup = () => {
        // Store demo data flag for migration
        localStorage.setItem('import_demo_data', 'true');
        router.push('/signup');
    };

    if (dismissed) return null;

    if (compact) {
        return (
            <div className={`flex items-center justify-between gap-3 px-4 py-2 rounded-lg bg-gradient-to-r ${config.gradient} text-white text-sm`}>
                <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{message || config.message}</span>
                </div>
                <Button
                    size="sm"
                    onClick={handleSignup}
                    className="bg-white/20 hover:bg-white/30 text-white border-none shrink-0"
                >
                    {config.cta}
                </Button>
            </div>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="relative"
            >
                <div className={`relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br ${config.gradient} text-white shadow-2xl ring-1 ring-white/20`}>
                    {/* Decorative background pulse */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-black/10 blur-3xl" />
                    <button
                        onClick={() => setDismissed(true)}
                        className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Icon className="w-6 h-6" />
                        </div>

                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">{config.title}</h3>
                            <p className="text-white/90 text-sm mb-4">
                                {message || config.message}
                            </p>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSignup}
                                    className="bg-white text-gray-900 hover:bg-white/90 font-semibold"
                                    size="sm"
                                >
                                    {config.cta}
                                </Button>
                                <Button
                                    onClick={() => setDismissed(true)}
                                    variant="ghost"
                                    className="text-white hover:bg-white/20"
                                    size="sm"
                                >
                                    Maybe Later
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Feature bullets for non-compact */}
                    {reason === 'general' && (
                        <div className="mt-4 pt-4 border-t border-white/20">
                            <ul className="text-white/80 text-xs space-y-1.5">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                                    Unlimited AI-powered suggestions
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                                    Share jars with partner & friends
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                                    Sync across all your devices
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                                    Save your ideas forever
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

/**
 * Banner version for top of page
 */
export function DemoBanner() {
    const [dismissed, setDismissed] = useState(false);
    const router = useRouter();

    if (dismissed) return null;

    return (
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-3 text-center relative">
            <button
                onClick={() => setDismissed(true)}
                className="absolute right-2 top-2 p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Dismiss"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
                <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <strong>🎮 Demo Mode:</strong> You're exploring with sample data
                </span>
                <Button
                    size="sm"
                    onClick={() => {
                        localStorage.setItem('import_demo_data', 'true');
                        router.push('/signup');
                    }}
                    className="bg-white text-purple-600 hover:bg-white/90 font-semibold border-none"
                >
                    Create Account to Save
                </Button>
            </div>
        </div>
    );
}
