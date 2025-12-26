"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, User, Users, MapPin, AlertCircle, X, Layers } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TOPIC_CATEGORIES } from "@/lib/categories";

export function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const inviteCode = searchParams.get("code");
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(!!inviteCode);
    const [codeError, setCodeError] = useState<string | null>(null);

    const [isVerificationSent, setIsVerificationSent] = useState(false);

    useEffect(() => {
        if (inviteCode) {
            setIsValidating(true);
            fetch('/api/couple/validate-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: inviteCode })
            })
                .then(res => res.json())
                .then(data => {
                    if (!data.valid) {
                        setCodeError(data.error || "Invalid invite code");
                    }
                })
                .catch(err => {
                    console.error("Validation error:", err);
                    setCodeError("Failed to validate code");
                })
                .finally(() => setIsValidating(false));
        } else {
            setIsValidating(false);
            setCodeError(null);
        }
    }, [inviteCode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const location = formData.get("location") as string;
        const topic = formData.get("topic") as string;
        const type = formData.get("type") as string;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    inviteCode,
                    location,
                    topic,
                    type
                }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.requiresVerification) {
                    setIsVerificationSent(true);
                } else if (data.checkoutUrl) {
                    window.location.href = data.checkoutUrl;
                } else {
                    router.push("/dashboard");
                }
            } else {
                const errorMessage = data.details ? `${data.error}: ${data.details}` : (data.error || "Signup failed");
                alert(errorMessage);
            }
        } catch (error: any) {
            console.error("Signup Fetch Error:", error);
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                alert("Network Error: Could not reach the server. Please ensure your dev server is running and your DATABASE_URL is correct in your local .env file.");
            } else {
                alert("An unexpected error occurred: " + (error.message || "Unknown error"));
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isValidating) {
        return (
            <div className="w-full max-w-md glass-card p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-slate-300">Validating invite code...</p>
            </div>
        );
    }

    if (isVerificationSent) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="glass-card p-8 text-center">
                    <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                        <Mail className="w-8 h-8 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Check your inbox</h2>
                    <p className="text-slate-400 mb-8">
                        We've sent a verification link to your email address. Please click the link to activate your account.
                    </p>
                    <p className="text-xs text-slate-500">
                        Can't find it? Check your spam folder.
                    </p>
                </div>
            </motion.div>
        );
    }

    if (codeError) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="glass-card p-8 text-center">
                    <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Invalid Invite Link</h2>
                    <p className="text-slate-400 mb-8">
                        {codeError === 'This jar is full'
                            ? "This jar handles a maximum number of members. You can create your own jar instead."
                            : "This invite link is invalid or has expired. Please ask for a new link, or create your own jar."}
                    </p>
                    <Button
                        onClick={() => router.push('/signup')}
                        className="w-full"
                    >
                        Create a New Jar
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
        >
            <div className="glass-card relative overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-none p-8">
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
                        <Users className="w-8 h-8 text-accent fill-accent" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        {inviteCode ? "Join Group" : "Create Account"}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        {inviteCode ? "Enter your details to join" : "Start deciding together"}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Your Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                className="pl-12 bg-slate-50 border-slate-200 text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white placeholder:text-slate-400"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                className="pl-12 bg-slate-50 border-slate-200 text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white placeholder:text-slate-400"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                className="pl-12 bg-slate-50 border-slate-200 text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white placeholder:text-slate-400"
                                required
                            />
                        </div>
                    </div>

                    {!inviteCode && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Jar Type</label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select
                                        name="type"
                                        className="w-full h-10 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-md text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none"
                                        defaultValue="SOCIAL"
                                    >
                                        <option value="ROMANTIC">Couple (Romantic)</option>
                                        <option value="SOCIAL">Friends & Family (Social)</option>
                                        <option value="GENERIC">Solo (Personal)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Jar Topic</label>
                                <div className="relative">
                                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select
                                        name="topic"
                                        className="w-full h-10 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-md text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none"
                                        defaultValue="Activities"
                                    >
                                        {Object.keys(TOPIC_CATEGORIES).filter(k => k !== 'Custom' && k !== 'General').map(topic => (
                                            <option key={topic} value={topic}>
                                                {topic}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Your Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                name="location"
                                type="text"
                                placeholder="e.g. New York, NY"
                                className="pl-12 bg-slate-50 border-slate-200 text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white placeholder:text-slate-400"
                                required
                            />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 ml-1">Used to find options near you.</p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg shadow-lg shadow-accent/25 mt-4"
                        isLoading={isLoading}
                    >
                        {inviteCode ? "Join Jar" : "Get Started"} <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="text-accent hover:text-accent/80 font-bold transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
