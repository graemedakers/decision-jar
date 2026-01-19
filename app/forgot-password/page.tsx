
"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { ArrowRight, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            // We always show success to prevent email enumeration
            setIsSent(true);

        } catch (error) {
            console.error(error);
            // Even on error, maybe safer to verify info? But for user exp, better to just show error if it's a network issue.
            // Here we'll just set sent true or handle error UI if you prefer.
            // Let's assume network success = logical success.
            setIsSent(true);
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
                <div className="glass-card relative overflow-hidden p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link href="/login" className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>

                        <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md mb-4">
                            <Mail className="w-8 h-8 text-primary fill-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
                        <p className="text-slate-400">Enter your email to reset your password.</p>
                    </div>

                    {isSent ? (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">Check your inbox</h3>
                                <p className="text-slate-400">
                                    If an account exists for <strong>{email}</strong>, we have sent a password reset link.
                                    <br /><br />
                                    <span className="text-sm text-slate-500">Please check your spam or junk folder if you don't see it.</span>
                                </p>
                            </div>
                            <Link href="/login">
                                <Button className="w-full">
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        className="pl-12"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-lg shadow-lg shadow-primary/25"
                                isLoading={isLoading}
                            >
                                Send Reset Link <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </form>
                    )}
                </div>
            </motion.div>
        </main >
    );
}
