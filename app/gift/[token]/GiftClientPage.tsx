"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Gift, Loader2, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

interface GiftData {
    token: string;
    gifterName: string;
    gifterAvatar: string | null;
    personalMessage: string | null;
    jar: {
        name: string;
        topic: string;
        ideaCount: number;
        previewIdeas: { description: string }[];
    };
    expiresAt: string | null;
    isExpired?: boolean;
}

export function GiftClientPage({
    token,
    initialGift,
    initialError,
    initialSession
}: {
    token: string,
    initialGift: GiftData | null,
    initialError: string | null,
    initialSession?: any // Accept server-side session
}) {
    const router = useRouter();
    const { data: session, status: clientStatus } = useSession();

    // Compute auth status immediately from server session if available
    // This bypasses the 'loading' state and prevents the redirect loop
    const isAuthenticated = !!initialSession || clientStatus === 'authenticated';
    const isLoadingAuth = !initialSession && clientStatus === 'loading';

    // Status normalization for logic
    const status = isAuthenticated ? 'authenticated' : (isLoadingAuth ? 'loading' : 'unauthenticated');

    const [gift, setGift] = useState<GiftData | null>(initialGift);
    const [isLoading, setIsLoading] = useState(!initialGift && !initialError);
    const [isAccepting, setIsAccepting] = useState(false);
    const [error, setError] = useState<string | null>(initialError);

    useEffect(() => {
        if (!initialGift && !initialError) {
            // Fallback fetch if server fetch failed or skipped
            const fetchGift = async () => {
                try {
                    const res = await fetch(`/api/gift/${token}`);
                    if (!res.ok) {
                        if (res.status === 410) throw new Error("This gift has expired.");
                        if (res.status === 404) throw new Error("Gift not found. It may have been deactivated.");
                        throw new Error("Failed to load gift.");
                    }
                    const data = await res.json();
                    setGift(data.gift);
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchGift();
        }
    }, [token, initialGift, initialError]);

    const handleAccept = useCallback(async () => {
        if (isAccepting) return;

        // Don't act while session is still loading
        if (status === 'loading') {
            return;
        }

        if (status === 'unauthenticated') {
            sessionStorage.setItem('pending_gift_token', token);
            // CRITIONAL CHANGE: Redirect to DASHBOARD after login, not back here.
            // The dashboard will handle the actual acceptance.
            signIn(undefined, { callbackUrl: '/dashboard' });
            return;
        }

        // Must be authenticated to proceed
        if (status !== 'authenticated') {
            return;
        }

        setIsAccepting(true);

        try {
            const res = await fetch(`/api/gift/${token}/accept`, {
                method: 'POST'
            });

            if (!res.ok) {
                const data = await res.json();

                // Clear token on failure paths to prevent redirect loop
                sessionStorage.removeItem('pending_gift_token');

                if (data.error === 'JAR_LIMIT_REACHED') {
                    alert("You've reached your jar limit! Please upgrade or delete a jar to accept this gift.");
                    router.push('/dashboard');
                    return;
                }
                throw new Error(data.message || "Failed to accept gift");
            }

            const data = await res.json();
            sessionStorage.removeItem('pending_gift_token');

            // Use window.location.href for a HARD refresh to ensure all caches are busted
            window.location.href = `/dashboard?newGift=${data.jarId}`;

        } catch (err: any) {
            console.error('[GiftAccept] Error:', err);
            sessionStorage.removeItem('pending_gift_token'); // Final safety clear
            alert(err.message);
            setIsAccepting(false);
        }
    }, [status, token, isAccepting, router]);

    useEffect(() => {
        if (status === 'authenticated' && !isAccepting) {
            const pendingToken = sessionStorage.getItem('pending_gift_token');
            if (pendingToken === token) {
                handleAccept();
            }
        }
    }, [status, token, handleAccept, isAccepting]);

    if (isLoading || status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !gift) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-outfit">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl max-w-md text-center space-y-4">
                    <AlertCircle className="w-12 h-12 mx-auto" />
                    <h1 className="text-xl font-bold">Oops! Something went wrong.</h1>
                    <p>{error || "We couldn't find that gift."}</p>
                    <Button onClick={() => router.push('/')} variant="outline" className="mt-4">
                        Go Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-4 md:p-8 font-outfit">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden relative"
            >
                <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center mb-4 text-4xl overflow-hidden ring-4 ring-white/50 dark:ring-white/10">
                            {gift.gifterAvatar ? (
                                <img src={gift.gifterAvatar} alt={gift.gifterName} className="w-full h-full object-cover" />
                            ) : (
                                <span>🎁</span>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-2">
                            {gift.gifterName} sent you a gift!
                        </h1>
                        {gift.personalMessage && (
                            <div className="mt-4 bg-white/60 dark:bg-black/20 backdrop-blur-sm p-4 rounded-xl text-lg italic text-slate-700 dark:text-slate-200 max-w-xs relative">
                                <span className="absolute -top-2 -left-1 text-4xl text-primary/20">"</span>
                                {gift.personalMessage}
                                <span className="absolute -bottom-4 -right-1 text-4xl text-primary/20">"</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden group">
                        <div className="absolute top-3 right-3 bg-white dark:bg-slate-800 shadow-sm px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-slate-100 dark:border-white/5">
                            {gift.jar.topic}
                        </div>
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xl shadow-inner">
                                🫙
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                    {gift.jar.name}
                                </h2>
                                <p className="text-sm text-primary font-medium flex items-center gap-1 mt-0.5">
                                    <Sparkles className="w-3.5 h-3.5" /> {gift.jar.ideaCount} handcrafted ideas
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2 relative">
                            {gift.jar.previewIdeas.map((idea, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 opacity-80 blur-[1px]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
                                </div>
                            ))}
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent to-slate-50/90 dark:to-slate-950/90 pt-8">
                                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                                    Unlock full list
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center space-y-4">
                        <Button
                            size="lg"
                            onClick={handleAccept}
                            disabled={isAccepting}
                            className="w-full text-lg h-14 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold"
                        >
                            {isAccepting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> {status === 'authenticated' ? "Adding to your jars..." : "Signing in..."}
                                </>
                            ) : (
                                <>
                                    Accept Gift & Open Jar <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            {status === 'authenticated' ? (
                                <span>Signed in as <strong>{session?.user?.name || session?.user?.email}</strong></span>
                            ) : (
                                <span>You'll need to sign up for free to claim this gift.</span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/50 p-4 text-center text-[10px] text-slate-400 border-t border-slate-100 dark:border-white/5">
                    Powered by <strong>Decision Jar</strong> • The app for indecisive people
                </div>
            </motion.div>
        </div>
    );
}
