"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, User, Users, MapPin, AlertCircle, X, Layers, Download } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TOPIC_CATEGORIES } from "@/lib/categories";
import { signIn } from "next-auth/react";
import { trackSignup, identifyUser } from "@/lib/analytics";

export function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const inviteCode = searchParams.get("code");
    const premiumToken = searchParams.get("pt");
    const [isLoading, setIsLoading] = useState(false);
    const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(!!inviteCode);
    const [codeError, setCodeError] = useState<string | null>(null);
    const [showMore, setShowMore] = useState(false);

    const [isVerificationSent, setIsVerificationSent] = useState(false);
    const [accountExistsError, setAccountExistsError] = useState(false);
    const [existingEmail, setExistingEmail] = useState("");
    const [savedPassword, setSavedPassword] = useState("");
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    useEffect(() => {
        if (inviteCode) {
            setIsValidating(true);
            fetch('/api/jars/validate-invite', {
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
        }
    }, [inviteCode]);

    const handleSocialLogin = async (provider: string) => {
        setIsSocialLoading(provider);

        // Track social signup attempt
        const utmSource = searchParams.get('utm_source') || 'direct';
        const utmMedium = searchParams.get('utm_medium') || undefined;
        const utmCampaign = searchParams.get('utm_campaign') || undefined;
        await trackSignup(provider, utmSource, utmMedium, utmCampaign);

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
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const location = formData.get("location") as string;
        const topic = formData.get("topic") as string;
        const type = formData.get("type") as string;
        const selectionMode = formData.get("selectionMode") as string;

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
                    topic: showMore ? topic : undefined,
                    type: showMore ? type : undefined,
                    selectionMode: showMore ? selectionMode : undefined,
                    premiumToken
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // Track successful signup
                const utmSource = searchParams.get('utm_source') || 'direct';
                const utmMedium = searchParams.get('utm_medium') || undefined;
                const utmCampaign = searchParams.get('utm_campaign') || undefined;
                await trackSignup('email', utmSource, utmMedium, utmCampaign);

                // Identify user in PostHog
                if (data.user?.id) {
                    identifyUser(data.user.id, {
                        email: email,
                        name: name,
                        signup_method: 'email',
                        utm_source: utmSource,
                    });
                }

                if (data.premiumGifted) {
                    alert("Welcome! You have been upgraded to Premium via the invite link.");
                } else if (data.premiumTokenInvalid) {
                    alert("Account created, but the Premium link was invalid or expired. You are on the Free plan.");
                }

                if (data.requiresVerification) {
                    setIsVerificationSent(true);
                } else if (data.checkoutUrl) {
                    window.location.href = data.checkoutUrl;
                } else {
                    router.push("/dashboard");
                }
            } else {
                if (data.error === "User already exists") {
                    setExistingEmail(email);
                    setSavedPassword(password);
                    setAccountExistsError(true);
                } else {
                    const errorMessage = data.details ? `${data.error}: ${data.details}` : (data.error || "Signup failed");
                    alert(errorMessage);
                }
            }
        } catch (error: any) {
            console.error("Signup Fetch Error:", error);
            alert("An error occurred during signup.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAutoLogin = async () => {
        if (!existingEmail || !savedPassword) return;
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: existingEmail, password: savedPassword }),
                credentials: 'include',
            });

            const data = await res.json();

            if (res.ok) {
                // If invite code exists, the dashboard will handle the join via the useEffect hook we added
                window.location.href = `/dashboard?code=${inviteCode || ""}${premiumToken ? `&pt=${premiumToken}` : ""}`;
            } else {
                // If login fails (maybe wrong password), fall back to manual login page
                router.push(`/login?email=${encodeURIComponent(existingEmail)}&code=${inviteCode || ""}${premiumToken ? `&pt=${premiumToken}` : ""}`);
            }
        } catch (error) {
            console.error("Auto-login error:", error);
            router.push(`/login?email=${encodeURIComponent(existingEmail)}&code=${inviteCode || ""}${premiumToken ? `&pt=${premiumToken}` : ""}`);
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
                    <h2 className="text-2xl font-bold text-white mb-2" id="verification-header">Check your inbox</h2>
                    <p className="text-slate-400 mb-8">
                        We've sent a verification link to your email address. Please click the link to activate your account.
                    </p>
                </div>
            </motion.div>
        );
    }

    if (accountExistsError) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="glass-card p-8 text-center bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-white/10">
                    <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-6">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Account Already Exists</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        It looks like you already have an account with this email. Would you like to sign in to join this jar instead?
                    </p>
                    <div className="space-y-4">
                        <Button
                            onClick={handleAutoLogin}
                            isLoading={isLoading}
                            className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                        >
                            Sign In & Join Now <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => router.push(`/login${inviteCode ? `?code=${inviteCode}${premiumToken ? `&pt=${premiumToken}` : ''}` : ''}${existingEmail ? `&email=${encodeURIComponent(existingEmail)}` : ''}`)}
                                className="text-sm text-primary hover:text-primary/80 font-bold transition-colors"
                            >
                                Use a different password
                            </button>
                            <button
                                onClick={() => setAccountExistsError(false)}
                                className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white font-medium transition-colors"
                            >
                                Use a different email
                            </button>
                        </div>
                    </div>
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
                            : "This invite link is invalid or has expired. Please ask for a new link, or sign up to create your own jar."}
                    </p>
                    <Button
                        onClick={() => router.push('/signup')}
                        className="w-full"
                    >
                        Sign Up
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
                        <Users className="w-8 h-8 text-accent fill-accent" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        {inviteCode ? "Join Group" : "Get Started"}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Join thousands of people making decisions together.
                    </p>
                </div>

                {/* PWA Install Banner */}
                {inviteCode && deferredPrompt && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mb-6 bg-gradient-to-r from-primary to-accent p-4 rounded-xl shadow-lg relative overflow-hidden"
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="bg-white/20 p-3 rounded-full">
                                <Download className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-white font-bold text-sm">Install App for Best Experience</h3>
                                <p className="text-white/80 text-xs">Join the jar seamlessly with the native app.</p>
                            </div>
                            <Button onClick={handleInstallClick} size="sm" variant="secondary" className="bg-white text-primary border-none hover:bg-white/90">
                                Install
                            </Button>
                        </div>
                    </motion.div>
                )}

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
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">Your Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                className="pl-12 h-12 bg-slate-50 border-slate-200 text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                className="pl-12 h-12 bg-slate-50 border-slate-200 text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">Password</label>
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

                    <div className="py-2">
                        <button
                            type="button"
                            onClick={() => setShowMore(!showMore)}
                            className="text-xs text-primary hover:text-primary/80 font-bold transition-colors flex items-center gap-1"
                        >
                            {showMore ? "Hide advanced options" : "Set up your first jar now (optional)"}
                        </button>
                    </div>

                    {showMore && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="space-y-4 pt-2"
                        >

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">Jar Topic</label>
                                <div className="relative">
                                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select
                                        name="topic"
                                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none text-sm"
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

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">Play Mode</label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select
                                        name="selectionMode"
                                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none text-sm"
                                        defaultValue="RANDOM"
                                    >
                                        <option value="RANDOM">Random Spin (Classic)</option>
                                        <option value="VOTING">Voting Session</option>
                                        <option value="ALLOCATION">Task Allocation (System)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">Your Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        name="location"
                                        type="text"
                                        placeholder="e.g. New York, NY"
                                        className="pl-12 h-12 bg-slate-50 border-slate-200 text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-14 text-lg shadow-lg shadow-accent/25 mt-6 font-bold"
                        isLoading={isLoading}
                    >
                        Create Account <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Already have an account?{" "}
                        <Link
                            href={`/login${inviteCode ? `?code=${inviteCode}${premiumToken ? `&pt=${premiumToken}` : ''}` : ''}`}
                            className="text-primary hover:text-primary/80 font-bold transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
