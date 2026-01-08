"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { Heart, ArrowRight, Lock, Mail, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { signIn } from "next-auth/react";

export function LoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const inviteCode = searchParams?.get('code');
    const premiumToken = searchParams?.get('pt');

    const handleSocialLogin = async (provider: string) => {
        setIsSocialLoading(provider);
        try {
            const callbackUrl = inviteCode ? `/dashboard?code=${inviteCode}${premiumToken ? `&pt=${premiumToken}` : ''}` : "/dashboard";
            await signIn(provider, { callbackUrl });
        } catch (error) {
            console.error(`${provider} login error:`, error);
            setIsSocialLoading(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            const data = await res.json();

            if (res.ok) {
                // If invite code exists, try to join the jar
                if (inviteCode) {
                    try {
                        const joinRes = await fetch('/api/jar/join', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                code: inviteCode,
                                premiumToken
                            }),
                        });
                        const joinData = await joinRes.json();
                        if (joinRes.ok) {
                            if (joinData.premiumGifted) {
                                alert("Login successful! You have joined the jar and been upgraded to Premium via the invite link.");
                            } else {
                                alert("Login successful! You have joined the jar.");
                            }
                        }
                    } catch (joinError) {
                        console.error("Error joining jar:", joinError);
                    }
                }

                // Use hard redirect to ensure cookies are fully propogated
                window.location.href = "/dashboard";
            } else {
                alert(data.error || "Login failed");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="glass-card relative overflow-hidden bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xl p-8">
                    {/* Close Button */}
                    <Link href="/" className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors z-10">
                        <X className="w-5 h-5" />
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="w-16 h-16 mx-auto bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md mb-4"
                        >
                            <Heart className="w-8 h-8 text-secondary fill-secondary" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h1>
                        <p className="text-slate-600 dark:text-slate-400">Sign in to access your jars</p>
                    </div>

                    {/* Social Logins */}
                    {process.env.NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN === 'true' && (
                        <>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <Button
                                    variant="secondary"
                                    onClick={() => handleSocialLogin('google')}
                                    className="flex items-center justify-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all py-6 group"
                                    isLoading={isSocialLoading === 'google'}
                                    disabled={!!isSocialLoading}
                                >
                                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                                        <path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.9 3.28-2.06 4.45-1.12 1.12-2.82 2.37-5.78 2.37-4.66 0-8.23-3.79-8.23-8.35s3.57-8.35 8.23-8.35c2.56 0 4.46.99 5.86 2.38l2.31-2.31C18.59 2.4 15.91 1 12.48 1 5.91 1 1 5.91 1 12.48S5.91 23.96 12.48 23.96c3.74 0 6.6-1.22 8.78-3.5 2.22-2.22 2.92-5.32 2.92-7.88 0-.54-.04-1.06-.11-1.66h-11.59z" />
                                    </svg>
                                    <span className="text-sm font-bold text-slate-700">Google</span>
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => handleSocialLogin('facebook')}
                                    className="flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166fe5] border-transparent shadow-sm transition-all py-6 group"
                                    isLoading={isSocialLoading === 'facebook'}
                                    disabled={!!isSocialLoading}
                                >
                                    <svg className="w-5 h-5 shrink-0" fill="white" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    <span className="text-sm font-bold text-white">Facebook</span>
                                </Button>
                            </div>

                            <div className="relative mb-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-slate-900 px-4 text-slate-500 font-medium tracking-wider">Or continue with</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    defaultValue={searchParams?.get('email') || ''}
                                    className="pl-12 h-12 bg-slate-50 border-slate-200 text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                                <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 font-bold transition-colors">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-12 h-12 bg-slate-50 border-slate-200 text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 text-lg shadow-lg shadow-primary/25 mt-6 font-bold"
                            isLoading={isLoading}
                        >
                            Sign In <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-sm">
                            Don't have a jar yet?{" "}
                            <Link
                                href={`/signup${inviteCode ? `?code=${inviteCode}${premiumToken ? `&pt=${premiumToken}` : ''}` : ''}`}
                                className="text-primary hover:text-primary/80 font-bold transition-colors"
                            >
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}
