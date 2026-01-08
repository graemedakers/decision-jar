"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";

function JoinRedirect() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const params = searchParams.toString();
        // Artificial delay for smooth transition and branding impression
        const timer = setTimeout(() => {
            router.replace(`/signup${params ? `?${params}` : ""}`);
        }, 1500);
        return () => clearTimeout(timer);
    }, [router, searchParams]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 dark:bg-primary/30 blur-[120px] rounded-full animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 dark:bg-accent/30 blur-[120px] rounded-full animate-pulse-slow delay-700" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-[2rem] flex items-center justify-center shadow-2xl transform rotate-6 animate-bounce-subtle">
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <div className="w-3 h-3 bg-primary rounded-full" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        You're Invited!
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                        Preparing your Decision Jar experience. <br className="hidden md:block" />
                        We're getting things ready for you...
                    </p>
                </div>

                <div className="flex flex-col items-center gap-4 pt-4">
                    <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0) rotate(6deg); }
                    50% { transform: translateY(-10px) rotate(8deg); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 3s ease-in-out infinite;
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.1); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 8s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

export default function JoinPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <JoinRedirect />
        </Suspense>
    );
}
