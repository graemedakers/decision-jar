"use client";

import { motion } from "framer-motion";
import { Plus, Users, Sparkles, Layers, ArrowRight, Dices } from "lucide-react";
import { Button } from "./ui/Button";
import { useState } from "react";
import { CreateJarModal } from "./CreateJarModal";
import { JoinJarModal } from "./JoinJarModal";
import { useRouter } from "next/navigation";

interface DashboardOnboardingProps {
    onJarCreated: () => void;
    isPro?: boolean;
}

export function DashboardOnboarding({ onJarCreated, isPro }: DashboardOnboardingProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isJoinOpen, setIsJoinOpen] = useState(false);
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <CreateJarModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                currentJarCount={0}
                isPro={!!isPro}
            />
            <JoinJarModal
                isOpen={isJoinOpen}
                onClose={() => setIsJoinOpen(false)}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full space-y-8"
            >
                {/* Header */}
                <div className="space-y-4">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                        <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        Your Journey <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Starts Here.</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                        Welcome to Decision Jar! You're just moments away from making better decisions with your partner, friends, or family.
                    </p>
                </div>

                {/* Actions */}
                <div className="grid md:grid-cols-2 gap-6 pt-4">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-primary/50 transition-colors group cursor-pointer"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Plus className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create a Jar</h3>
                            <p className="text-sm text-slate-500 mt-1">Start fresh with your own custom categories and ideas.</p>
                        </div>
                        <Button className="w-full mt-auto">Create Now</Button>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-purple-500/50 transition-colors group cursor-pointer"
                        onClick={() => setIsJoinOpen(true)}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                            <Users className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Join a Friend</h3>
                            <p className="text-sm text-slate-500 mt-1">Have an invite code? Join an existing jar instantly.</p>
                        </div>
                        <Button variant="secondary" className="w-full mt-auto">Join Jar</Button>
                    </motion.div>
                </div>

                {/* Community Link */}
                <div className="pt-8 border-t border-slate-200 dark:border-white/5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl">
                        <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                <Layers className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Browse Community Jars</h4>
                                <p className="text-xs text-slate-500">Discover public jars for movies, food, and more.</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/community')}
                            className="bg-accent/10 hover:bg-accent/20 text-accent font-bold"
                        >
                            Explore <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>

                {/* Pro Tip */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-600 italic">
                    <Dices className="w-4 h-4" />
                    <span>Tip: You can have multiple jars for different groups!</span>
                </div>
            </motion.div>
        </div>
    );
}
