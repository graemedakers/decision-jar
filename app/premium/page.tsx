"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Sparkles, Check, ArrowLeft, Star, Utensils, Calendar, MapPin, Zap, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { PRICING } from "@/lib/config";

// Coupon configuration
const COUPON_CONFIG = {
    TRIAL_EXPIRED_50: {
        id: 'TRIAL_EXPIRED_50',
        discount: '50% OFF',
        description: 'First month',
        color: 'from-amber-500 to-orange-500',
    }
};

// Wrapper component to handle Suspense for useSearchParams
export default function PremiumPage() {
    return (
        <Suspense fallback={<PremiumPageLoading />}>
            <PremiumPageContent />
        </Suspense>
    );
}

function PremiumPageLoading() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-white/50">Loading...</div>
        </div>
    );
}

function PremiumPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    
    // Check for coupon in URL params
    const couponId = searchParams?.get('coupon') || null;
    const couponConfig = couponId ? COUPON_CONFIG[couponId as keyof typeof COUPON_CONFIG] : null;

    const handleSubscribe = async (priceType: 'price_monthly' | 'price_lifetime') => {
        setIsLoading(true);
        try {
            const priceId = priceType === 'price_lifetime'
                ? process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME
                : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                body: JSON.stringify({
                    priceId,
                    mode: priceType === 'price_lifetime' ? 'payment' : 'subscription',
                    // Pass coupon only for monthly subscriptions (not lifetime)
                    couponId: priceType === 'price_monthly' && couponId ? couponId : undefined,
                    source: couponId ? 'trial_expiry_modal' : 'premium_page',
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (res.status === 401) {
                const returnUrl = encodeURIComponent(`/premium${couponId ? `?coupon=${couponId}` : ''}`);
                router.push(`/login?redirect=${returnUrl}`);
                return;
            }

            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(`Error: ${data.error || "Unknown error"}\n${data.details || ""}`);
            }
        } catch (error) {
            console.error("Upgrade error:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-primary/30">
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-6xl w-full mx-auto p-6 md:p-12">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard')}
                    className="mb-12 text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Back to Dashboard
                </Button>

                {/* Coupon Banner */}
                {couponConfig && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-8 p-4 rounded-2xl bg-gradient-to-r ${couponConfig.color} text-white text-center shadow-lg`}
                    >
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Gift className="w-5 h-5" />
                            <span className="text-lg font-black">{couponConfig.discount}</span>
                            <span className="font-medium">your {couponConfig.description}!</span>
                        </div>
                        <p className="text-sm text-white/80">
                            Special offer applied automatically at checkout
                        </p>
                    </motion.div>
                )}

                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-bold mb-6"
                    >
                        <Sparkles className="w-4 h-4" />
                        PREMIUM ACCESS
                    </motion.div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                        Unlock Your Full <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Jar Potential</span>
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed">
                        Upgrade to Pro to remove limits and unlock AI-powered planning tools designed for groups, couples, and individuals.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
                    {/* Monthly Subscription */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group h-full"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-b from-white/10 to-transparent rounded-[32px] opacity-0 group-hover:opacity-100 transition duration-500" />
                        <div className="relative h-full bg-slate-900/50 backdrop-blur-2xl p-10 rounded-[30px] border border-white/10 flex flex-col shadow-2xl">
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">Monthly Pro</h3>
                                <p className="text-slate-500">The flexible choice for active jars.</p>
                            </div>

                            <div className="mb-10 flex items-baseline gap-1">
                                <span className="text-5xl font-bold text-white">{PRICING.MONTHLY}</span>
                                <span className="text-slate-500 font-medium">/month</span>
                            </div>

                            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-10 flex items-center gap-3">
                                <Zap className="w-5 h-5 text-green-400" />
                                <span className="text-green-400 font-bold text-sm">
                                    New Subscribers: {PRICING.TRIAL_DAYS}-Day Free Trial
                                </span>
                            </div>

                            <ul className="space-y-5 mb-10 flex-1">
                                {[
                                    "Unlimited Jars & All Members",
                                    "Smart Activity Planner (AI)",
                                    "Dining Concierge & Bar Scout",
                                    "Custom Itinerary Builder",
                                    "One-Tap Shortcuts (PWA)",
                                    "Priority Feature Access",
                                    "Cancel anytime"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-300">
                                        <div className="p-1 bg-primary/10 rounded-full">
                                            <Check className="w-4 h-4 text-primary shrink-0" />
                                        </div>
                                        <span className="font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="space-y-4">
                                <Button
                                    onClick={() => handleSubscribe('price_monthly')}
                                    isLoading={isLoading}
                                    className="w-full h-14 bg-white text-slate-900 hover:bg-slate-100 text-lg font-bold rounded-2xl shadow-xl shadow-white/5 transition-all active:scale-[0.98]"
                                >
                                    Start Monthly Subscription
                                </Button>
                                <p className="text-center text-[11px] text-slate-500 font-medium">
                                    {PRICING.MONTHLY}/mo. New subscribers get 14-day free trial. <br />
                                    Easy online cancellation at any time.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Lifetime Access */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="relative group h-full"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-tr from-primary to-accent rounded-[32px] opacity-30 blur group-hover:opacity-100 transition duration-500" />
                        <div className="relative h-full bg-slate-900/80 backdrop-blur-2xl p-10 rounded-[30px] border border-white/20 flex flex-col shadow-2xl">
                            <div className="absolute top-6 right-8 bg-gradient-to-r from-primary to-accent text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-lg">
                                BEST VALUE
                            </div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">Lifetime Access</h3>
                                <p className="text-slate-400">Pay once, own the jar forever.</p>
                            </div>

                            <div className="mb-10 flex flex-col">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold text-white">{PRICING.LIFETIME}</span>
                                    <span className="text-slate-400 font-medium">/once</span>
                                </div>
                                <span className="text-primary text-sm font-medium mt-2">✨ Never pay again. Ever.</span>
                            </div>

                            <ul className="space-y-5 mb-12 flex-1">
                                {[
                                    "All Pro Features Included",
                                    "Permanent Lifetime Status",
                                    "Zero Monthly Fees",
                                    "Early Beta Access",
                                    "Priority Support Channel",
                                    "Support Indie Development"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-200">
                                        <div className="p-1 bg-primary/20 rounded-full">
                                            <Star className="w-4 h-4 text-primary fill-primary shrink-0" />
                                        </div>
                                        <span className="font-semibold">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="space-y-4">
                                <Button
                                    onClick={() => handleSubscribe('price_lifetime')}
                                    isLoading={isLoading}
                                    className="w-full h-14 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 text-lg font-bold rounded-2xl shadow-2xl shadow-primary/20 transition-all active:scale-[0.98]"
                                >
                                    Get Lifetime Access
                                </Button>
                                <p className="text-center text-[11px] text-slate-500 font-medium">
                                    One-time payment. All future updates included.<br />
                                    No recurring charges, ever.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-20 text-slate-500">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <span className="text-sm">Secure Payment with Stripe</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <span className="text-sm">Instant Premium Activation</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <span className="text-sm">Restoration available on log-in</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
