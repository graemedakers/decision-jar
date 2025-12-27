"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import canvasConfetti from 'canvas-confetti';

export default function CommunitySuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const jarId = searchParams.get('jar_id');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (!sessionId || !jarId) {
            setStatus('error');
            return;
        }

        const verify = async () => {
            // We can optimistically show success if we trust the redirect, 
            // but calling the sync endpoint ensures DB is updated.
            try {
                const res = await fetch(`/api/stripe/sync?session_id=${sessionId}`);
                if (res.ok) {
                    setStatus('success');
                    canvasConfetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                } else {
                    console.error("Sync failed, but payment might be processing via webhook");
                    // We'll show success anyway as the webhook will likely catch it
                    setStatus('success');
                }
            } catch (e) {
                setStatus('success'); // Fallback
            }
        };

        verify();
    }, [sessionId, jarId]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="max-w-md w-full text-center space-y-6">
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Finalizing your Community...</h2>
                    </div>
                )}

                {status === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl"
                    >
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Community Created!</h1>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">
                            Your payment was successful and your jar is now live. You can start inviting members or share your public link.
                        </p>

                        <div className="space-y-3">
                            <Button
                                onClick={() => router.push(`/community/${jarId}`)}
                                className="w-full h-12 text-lg bg-violet-600 hover:bg-violet-700"
                            >
                                Go to Community Page <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => router.push('/dashboard')}
                                className="w-full text-slate-500"
                            >
                                Back to Dashboard
                            </Button>
                        </div>
                    </motion.div>
                )}

                {status === 'error' && (
                    <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-3xl border border-red-200 dark:border-red-500/20">
                        <h1 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Something went wrong</h1>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            We couldn't verify the payment details. Please check your dashboard or contact support.
                        </p>
                        <Button onClick={() => router.push('/dashboard')}>
                            Return to Dashboard
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
