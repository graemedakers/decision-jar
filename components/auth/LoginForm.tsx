"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { Heart, ArrowRight, Lock, Mail, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const inviteCode = searchParams?.get('code');
    const premiumToken = searchParams?.get('pt');

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
                        } else {
                            // If join failed, alert but still let them login
                            console.error("Join failed:", joinData.error);
                            // Optional: alert(`Login successful, but failed to join jar: ${joinData.error}`);
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
                <div className="glass-card relative overflow-hidden">
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
                        <p className="text-slate-600 dark:text-slate-400">Sign in to access your Date Jar</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-12"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end -mt-4 mb-2">
                            <Link href="/forgot-password" className="text-xs text-slate-400 hover:text-white transition-colors">
                                Forgot Password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg shadow-lg shadow-primary/25"
                            isLoading={isLoading}
                        >
                            Sign In <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-sm">
                            Don't have a jar yet?{" "}
                            <Link href="/signup" className="text-primary hover:text-primary/80 font-bold transition-colors">
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}
