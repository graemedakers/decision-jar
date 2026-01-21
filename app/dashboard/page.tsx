"use client";

import { Suspense, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Plus, Settings, LogOut, Sparkles, Lock, Trash2, Copy, Calendar,
    Activity, Utensils, Check, Star, ArrowRight, History, Layers,
    Users, Crown, Shield, Share, Moon, Heart, HelpCircle, Dices, Filter, Image as ImageIcon, Loader2, Download, Gift, Wand2
} from "lucide-react";
import { SessionTracker } from "@/lib/session-tracker";

import { Jar3D } from "@/components/Jar3D";
import { PremiumBanner } from "@/components/PremiumBanner";
import { CollapsibleTrophyCase } from "@/components/Gamification/CollapsibleTrophyCase";
import { StreakBadge } from "@/components/Gamification/StreakBadge";
import { MiniProgressBar } from "@/components/Gamification/MiniProgressBar";
import { JarSwitcher } from "@/components/JarSwitcher";
import { getThemeForTopic } from "@/lib/categories";
import { VotingManager } from "@/components/VotingManager";
import { OnboardingWizard } from "@/components/Onboarding/OnboardingWizard";
import { EnhancedEmptyState } from "@/components/EnhancedEmptyState";
import { useXpAnimation, XpGainToast } from "@/hooks/useXpAnimation";
import { SmartToolsGrid } from "@/components/SmartToolsGrid";
import { DashboardModals } from "@/components/DashboardModals";
import { useDashboardLogic } from "@/hooks/useDashboardLogic";
import { getOnboardingSteps } from "@/lib/onboarding-steps";
import { getJarLabels } from "@/lib/labels";
import { COST_VALUES, ACTIVITY_VALUES } from "@/lib/constants";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import React from "react";
// import { SmartInputBar } from "@/components/SmartInputBar"; // Replaced by SmartPromptInput
import { SmartPromptInput } from "@/components/SmartPromptInput";
import { useLoadingState } from "@/hooks/useLoadingState";
import { usePWA } from "@/hooks/usePWA";
import { UnifiedConciergeButton } from "@/components/UnifiedConciergeButton";
import { VerificationBanner } from "@/components/VerificationBanner";

// Lazy Loading
const PreferenceQuizModal = dynamic(() => import("@/components/PreferenceQuizModal").then(m => m.PreferenceQuizModal), { ssr: false });
const OnboardingTour = dynamic(() => import("@/components/Onboarding/OnboardingTour").then(m => m.OnboardingTour), { ssr: false });

function InviteCodeDisplay({ code, topic }: { code: string | null; topic?: string }) {
    const labels = getJarLabels(topic);
    const [copied, setCopied] = useState(false);

    const handleInvite = async () => {
        if (!code) return;
        try {
            const url = `${window.location.origin}/join?code=${code}`;
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    if (!code) return null;

    return (
        <div className="w-full bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[1.75rem] p-4 flex items-center justify-between shadow-lg ring-1 ring-black/5 group hover:border-primary/30 transition-all">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <span className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-0.5 leading-tight">{labels.connectionAction}</span>
                    <code className="text-base font-mono font-black text-primary tracking-widest">{code}</code>
                </div>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={handleInvite}
                className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 px-4 h-8 text-[10px] font-black uppercase tracking-wider shadow-sm"
            >
                {copied ? <><Check className="w-3 h-3 mr-1.5" /> Copied</> : <><Copy className="w-3 h-3 mr-1.5" /> Copy</>}
            </Button>
        </div>
    );
}

function QuickFilterChip({ label, icon, onClick, variant = "primary" }: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: "orange" | "indigo" | "red" | "amber" | "primary"
}) {
    const themes = {
        primary: "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-primary/50 hover:bg-primary/5 shadow-sm",
        orange: "border-orange-200 dark:border-orange-500/20 bg-orange-50/50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 hover:border-orange-400 shadow-orange-500/5",
        indigo: "border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:border-indigo-400 shadow-indigo-500/5",
        red: "border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/10 text-red-700 dark:text-red-300 hover:border-red-400 shadow-red-500/5",
        amber: "border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:border-amber-400 shadow-amber-500/5",
    };

    return (
        <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all text-[11px] md:text-xs font-black uppercase tracking-tight shrink-0 shadow-lg whitespace-nowrap ${themes[variant]}`}
        >
            <span className="shrink-0">{icon}</span>
            <span>{label}</span>
        </motion.button>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-slate-400">Loading...</div></div>}>
            <ErrorBoundary>
                <DashboardContent />
            </ErrorBoundary>
        </Suspense>
    );
}

function DashboardContent() {
    const router = useRouter();
    const {
        // State
        userData, isLoadingUser, isPremium, xp, level, achievements, hasPaid, coupleCreatedAt, isTrialEligible,
        currentStreak, longestStreak,
        ideas, isLoadingIdeas, isFetchingIdeas, favoritesCount,
        isSpinning, userLocation, inviteCode, showConfetti, showOnboarding, showQuiz,

        // State Setters (explicitly destructured for usage)
        setUserLocation, setShowConfetti, setShowOnboarding, setShowQuiz,

        // Actions
        handleSpinJar, handleDeleteClick, handleDuplicate, handleQuizComplete,
        handleAddIdeaClick, handleContentUpdate, handleLogout,
        refreshUser, fetchIdeas, fetchFavorites,
        handleCompleteOnboarding, handleSkipOnboarding,
        handleSmartPrompt, // Newly exposed action
        isGeneratingSmartIdeas, // Loading state
        aiUsage, // Usage stats for counter

        // Utils
        openModal
    } = useDashboardLogic();

    // Initialize session tracking for time-to-first-idea analytics
    useEffect(() => {
        SessionTracker.initSession();
    }, []);

    const { installPrompt, install } = usePWA();

    // XP gain animation
    const { xpGain } = useXpAnimation(xp || 0, level);

    // --- View Logic / Layout Calculations ---
    const jarTopic = userData?.jarTopic;
    const jarSelectionMode = userData?.jarSelectionMode;

    const isVotingMode = jarSelectionMode === 'VOTE';
    const isAllocationMode = jarSelectionMode === 'ALLOCATION';
    // const theme = getThemeForTopic(jarTopic); // Theme usage removed from Jar3D as it accepts no props

    const labels = getJarLabels(jarTopic);
    const activityPlannerTitle = labels.plannerTitle;
    const titleText = labels.jarBranding;
    const isAdminPickMode = jarSelectionMode === 'ADMIN_PICK';

    // Extract available jars for Move Idea feature (only if user has 2+ jars)
    const availableJars = (userData?.memberships || [])
        .filter((m: any) => m.jar?.id)
        .map((m: any) => ({
            id: m.jar.id,
            name: m.jar.name || 'Unnamed Jar',
            topic: m.jar.topic,
        }));

    const showNoJars = !userData?.activeJarId && userData?.memberships?.length === 0;
    const showEmptyState = userData?.activeJarId && ideas.length === 0 && !isLoadingIdeas;
    const showAdminStatus = isAdminPickMode;
    const showStatusSection = showNoJars || showAdminStatus || showEmptyState;

    // Check if we should show QuickStart modal for empty jar on dashboard
    useEffect(() => {
        // Did we just sign up? (Only show if we didn't use an invite code)
        // If inviteCode is present, we are likely transitioning to another jar, so don't show "My First Jar" modal.
        if (showEmptyState && userData?.activeJarId && !inviteCode) {
            // Only show modal if user is ADMIN/OWNER of this jar (not just a member)
            const currentJarMembership = userData?.memberships?.find(
                (m: any) => m.jarId === userData.activeJarId
            );
            const isOwnerOrAdmin = currentJarMembership?.role === 'ADMIN' ||
                currentJarMembership?.role === 'OWNER';

            // Only prompt to add ideas if you OWN the jar
            if (isOwnerOrAdmin) {
                try {
                    const dismissed = localStorage.getItem(`quickstart_dismissed_${userData.activeJarId}`);
                    if (!dismissed) {
                        openModal('JAR_QUICKSTART', {
                            jarId: userData.activeJarId,
                            jarName: userData.jarName || 'Your Jar',
                            jarTopic: userData.jarTopic || 'General'
                        });
                    }
                } catch (e) { }
            }
        }
    }, [showEmptyState, userData?.activeJarId, userData?.jarTopic, userData?.memberships, openModal, inviteCode]);

    // ✅ CRITICAL: Auto-prompt for users without personal jars
    // This covers: New users who sign up and only have access to community jars (Bug Reports, etc.)
    useEffect(() => {
        // Wait for user data to be loaded
        if (isLoadingUser || !userData) return;

        // Get all memberships
        const memberships = userData.memberships || [];

        // Count personal (non-community) jars
        const personalJars = memberships;
        const hasPersonalJars = personalJars.length > 0;

        // Check if current active jar is a personal jar
        const activeJarIsPersonal = userData.activeJarId &&
            personalJars.some((m: any) => m.jar?.id === userData.activeJarId);

        // If user has NO personal jars, prompt them to create one
        if (!hasPersonalJars) {
            // Check for pending gift FIRST
            const pendingGift = sessionStorage.getItem('pending_gift_token');
            if (pendingGift) {
                router.push(`/gift/${pendingGift}`);
                return;
            }

            // Use a longer delay to ensure page is fully loaded on mobile
            setTimeout(() => {
                openModal('CREATE_JAR');
            }, 500);
        }
    }, [userData, isLoadingUser, openModal]);

    const availableIdeasCount = ideas.filter((i: any) => !i.selectedAt && (!isAllocationMode || !i.isMasked)).length;
    const combinedLocation = userLocation || "";

    const handleCloseLevelUp = () => {
        localStorage.setItem('datejar_user_level', level.toString());
    };

    // 7. Loading State
    const isLoading = useLoadingState({
        isLoadingUser,
        isLoadingIdeas,
        isFetchingIdeas,
        userData,
        ideas
    });

    // --- Quick Filter Chips Logic ---
    const allQuickChips = [
        {
            label: "Quick Bite",
            variant: "orange" as const,
            icon: <Utensils className="w-3.5 h-3.5" />,
            filter: { category: 'MEAL', maxDuration: 2 },
            match: (i: any) => i.category === 'MEAL' && i.duration <= 2
        },
        {
            label: "Night Out",
            variant: "indigo" as const,
            icon: <Moon className="w-3.5 h-3.5" />,
            filter: { timeOfDay: 'EVENING' },
            match: (i: any) => i.timeOfDay === 'EVENING' || i.timeOfDay === 'ANY'
        },
        {
            label: "Adventure",
            variant: "red" as const,
            icon: <Activity className="w-3.5 h-3.5" />,
            filter: { maxActivityLevel: 'HIGH', minDuration: 3 },
            match: (i: any) => (ACTIVITY_VALUES[i.activityLevel] || 0) >= 2 || i.duration >= 3
        },
        {
            label: "Free/Cheap",
            variant: "amber" as const,
            icon: <Sparkles className="w-3.5 h-3.5" />,
            filter: { maxCost: '$' },
            match: (i: any) => (COST_VALUES[i.cost] || 0) <= 1
        }
    ];

    const activeQuickChips = allQuickChips.filter(chip => ideas.some(chip.match)).slice(0, 4);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 transition-colors duration-500">
                <div className="relative mb-8">
                    <div className="w-20 h-20 bg-primary/20 rounded-3xl animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                </div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest text-center">Finding your jar...</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Getting the good times ready</p>
            </div>
        );
    }

    return (
        <main className="page-with-nav min-h-screen bg-slate-50 dark:bg-slate-950 px-4 md:px-8 relative overflow-hidden w-full transition-colors duration-500">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 dark:bg-primary/20 blur-[120px] rounded-full animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 dark:bg-accent/20 blur-[120px] rounded-full animate-pulse-slow delay-700" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* HEADER - Sticky on mobile */}
                <header className="flex flex-col gap-6 mb-8 md:mt-4 lg:static lg:bg-transparent sticky top-0 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm z-40 -mx-4 px-4 md:mx-0 md:px-0 pt-4 pb-2 lg:pt-0 lg:pb-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                {isPremium && (
                                    <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm flex items-center gap-0.5">
                                        <Crown className="w-2.5 h-2.5" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {userData && (
                                        <JarSwitcher
                                            user={userData as any}
                                            variant="title"
                                            onSwitch={handleContentUpdate}
                                        />
                                    )}
                                    {!userData && <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">Decision Jar</h1>}
                                    {isPremium && (
                                        <div className="hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 shadow-sm shrink-0">
                                            <Crown className="w-3.5 h-3.5 fill-current" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1">
                                        make moments happen
                                    </p>
                                    {currentStreak > 0 && (
                                        <div className="hidden sm:block">
                                            <StreakBadge currentStreak={currentStreak} longestStreak={longestStreak} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Center: Removed redundancy as stats are now in the sidebar */}
                        <div className="hidden xl:flex flex-1" />

                        {/* Right: Utility Tools - Desktop Only (Wide) */}
                        <div className="hidden lg:flex items-center justify-end gap-2 shrink-0">
                            {installPrompt && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={install}
                                    className="hidden md:flex gap-2 rounded-full border border-primary/20 text-primary hover:bg-primary/5 transition-colors px-4 h-11"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="text-sm font-bold">Install App</span>
                                </Button>
                            )}

                            {userData?.activeJarId && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const el = document.getElementById('smart-prompt-input');
                                        if (el) {
                                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            // Focus input if possible
                                            const input = el.querySelector('input');
                                            if (input) input.focus();
                                        }
                                    }}
                                    className="hidden md:flex gap-2 rounded-full border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors px-4 h-11"
                                >
                                    <Wand2 className="w-4 h-4 text-purple-500" />
                                    <span className="text-sm font-bold">Smart Fill</span>
                                </Button>
                            )}

                            {userData?.activeJarId && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openModal('GIFT_JAR', {
                                        jarId: userData.activeJarId,
                                        jarName: userData.jarName || 'My Jar',
                                        ideaCount: ideas.filter((i: any) => i.status === 'APPROVED').length
                                    })}
                                    className="hidden md:flex gap-2 rounded-full border-slate-200 dark:border-white/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors px-4 h-11"
                                >
                                    <Gift className="w-4 h-4" />
                                    <span className="text-sm font-bold">Gift Jar</span>
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openModal('FAVORITES')}
                                className="hidden md:flex gap-2 rounded-full border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors px-4 h-11"
                            >
                                <Heart className={`w-4 h-4 ${favoritesCount > 0 ? "text-red-500 fill-red-500" : "text-slate-600 dark:text-slate-300"}`} />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Favorites</span>
                                {favoritesCount > 0 && (
                                    <span className="ml-1 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ring-2 ring-white dark:ring-slate-900">
                                        {favoritesCount}
                                    </span>
                                )}
                            </Button>

                            <Link href="/memories" className="hidden md:block" aria-label="View Memories" data-tour="vault-button">
                                <Button variant="outline" size="icon" className="w-11 h-11 rounded-full border-slate-200 dark:border-white/10 text-slate-400 hover:text-primary transition-colors hover:border-primary/30">
                                    <ImageIcon className="w-5 h-5" />
                                </Button>
                            </Link>

                            <Link href="/community" aria-label="Discover Communities">
                                <Button variant="outline" size="icon" className="w-11 h-11 rounded-full border-slate-200 dark:border-white/10 text-slate-400 hover:text-primary transition-colors hover:border-primary/30">
                                    <Users className="w-5 h-5" />
                                </Button>
                            </Link>

                            <Button variant="outline" size="icon" onClick={() => openModal('HELP')} className="w-11 h-11 rounded-full border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" aria-label="Help">
                                <HelpCircle className="w-5 h-5" />
                            </Button>

                            <Button variant="outline" size="icon" onClick={() => openModal('SETTINGS')} className="w-11 h-11 rounded-full border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" aria-label="Settings">
                                <Settings className="w-5 h-5" />
                            </Button>


                            <Button variant="ghost" size="icon" onClick={handleLogout} className="w-11 h-11 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors" aria-label="Logout">
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Mobile/Tablet Quick Actions Row (Stacked when narrow) */}
                    <div className="flex flex-col lg:hidden gap-4">
                        <div className="flex justify-center px-4">
                            <MiniProgressBar xp={xp || 0} level={level} />
                        </div>
                        <div className="flex justify-center -mb-2">
                            <CollapsibleTrophyCase
                                xp={xp || 0}
                                level={level}
                                unlockedIds={achievements || []}
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 h-12">
                            {userData?.activeJarId && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => openModal('GIFT_JAR', {
                                        jarId: userData.activeJarId,
                                        jarName: userData.jarName || 'My Jar',
                                        ideaCount: ideas.filter((i: any) => i.status === 'APPROVED').length
                                    })}
                                    className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-500/30 shrink-0 text-indigo-600 dark:text-indigo-400"
                                    aria-label="Gift Jar"
                                >
                                    <Gift className="w-5 h-5" />
                                </Button>
                            )}

                            {installPrompt && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={install}
                                    className="w-11 h-11 rounded-xl bg-primary/5 border-primary/20 shrink-0 text-primary"
                                    aria-label="Install App"
                                >
                                    <Download className="w-5 h-5" />
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => openModal('FAVORITES')}
                                className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shrink-0 relative"
                                aria-label="Favorites"
                            >
                                <Heart className={`w-5 h-5 ${favoritesCount > 0 ? "text-red-500 fill-red-500" : "text-slate-400"}`} />
                                {favoritesCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full border-2 border-white dark:border-slate-900">
                                        {favoritesCount}
                                    </span>
                                )}
                            </Button>

                            <Link href="/memories" className="shrink-0" aria-label="View Memories">
                                <Button variant="outline" size="icon" className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
                                    <ImageIcon className="w-5 h-5 text-slate-500" />
                                </Button>
                            </Link>



                            <Button variant="outline" size="icon" onClick={() => openModal('HELP')} className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shrink-0" aria-label="Help">
                                <HelpCircle className="w-5 h-5 text-slate-500" />
                            </Button>

                            <Button variant="outline" size="icon" onClick={() => openModal('SETTINGS')} className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shrink-0" aria-label="Settings">
                                <Settings className="w-5 h-5 text-slate-500" />
                            </Button>

                            <Button variant="ghost" size="icon" onClick={handleLogout} className="w-11 h-11 rounded-xl shrink-0 text-slate-400 hover:text-red-500" aria-label="Logout">
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* MAIN DASHBOARD CONTAINER: Responsive Grid */}
                <div className="max-w-7xl mx-auto pb-12">
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12">

                        {/* LEFT COLUMN/TOP: Core Jar Actions */}
                        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">

                            {/* JAR VISUALIZATION SECTION */}
                            <div className="flex flex-col items-center">
                                {/* Premium Info / Alerts - Centered on main action */}
                                <div className="w-full max-w-2xl">
                                    {!isPremium && !isLoadingUser && !hasPaid && (
                                        <PremiumBanner
                                            hasPaid={hasPaid}
                                            coupleCreatedAt={coupleCreatedAt || ''}
                                            isTrialEligible={isTrialEligible}
                                            isPremium={isPremium}
                                        />
                                    )}

                                    {showStatusSection && (
                                        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                            {showNoJars && (
                                                <OnboardingWizard onComplete={handleContentUpdate} userName={userData?.name} />
                                            )}
                                            {showEmptyState && (
                                                <div className="space-y-6">
                                                    <SmartPromptInput
                                                        jarTopic={userData?.jarTopic || 'General'}
                                                        onGenerate={handleSmartPrompt}
                                                        isGenerating={isGeneratingSmartIdeas}
                                                        aiUsage={aiUsage}
                                                        className="w-full"
                                                    />
                                                    <EnhancedEmptyState
                                                        jarTopic={userData?.jarTopic || 'General'}
                                                        jarName={userData?.jarName || 'Your Jar'}
                                                        jarId={userData?.activeJarId || ''}
                                                        inviteCode={inviteCode}
                                                        onTemplateClick={() => openModal('TEMPLATE_BROWSER')}
                                                        onAddIdeaClick={() => openModal('ADD_IDEA')}
                                                    />
                                                </div>
                                            )}
                                            {showAdminStatus && (
                                                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-5 rounded-[2.5rem] flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                                                        <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-amber-900 dark:text-amber-100 uppercase tracking-wider text-sm">Admin Pick Mode</h3>
                                                        <p className="text-sm text-amber-700 dark:text-amber-300/80 mt-1 font-medium">
                                                            An admin is manually selecting the next {labels.plannerTitle.includes('Date') ? 'date' : 'idea'}. Spinning is disabled.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {!showEmptyState && !showNoJars && (
                                    <div className="relative z-10 w-full flex flex-col items-center py-4 lg:py-8 animate-in fade-in zoom-in duration-1000 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] border border-white/40 dark:border-white/10 shadow-2xl ring-1 ring-black/5">
                                        <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-center w-full gap-8 lg:gap-16 px-6">

                                            {/* Left side: Jar Visual */}
                                            <motion.div
                                                animate={isSpinning
                                                    ? { rotate: [0, -8, 8, -8, 8, 0], scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 0.5 } }
                                                    : { rotate: 0, scale: 1 }
                                                }
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                className="relative shrink-0 flex items-center justify-center"
                                                data-tour="jar-visual"
                                            >
                                                <div
                                                    onClick={() => router.push('/jar')}
                                                    className={`scale-[1.1] md:scale-[1.3] lg:scale-[1.1] xl:scale-[1.3] transform transition-transform duration-700 ease-out cursor-pointer hover:scale-[1.2] md:hover:scale-[1.4] lg:hover:scale-[1.2] xl:hover:scale-[1.4] active:scale-110`}
                                                    title="View Ideas in Jar"
                                                >
                                                    <Jar3D />
                                                </div>

                                                <div className="absolute top-2 md:top-8 -right-4 md:right-0 lg:-right-6 xl:-right-10 z-20">
                                                    <motion.div
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ delay: 0.5, type: "spring" }}
                                                        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-2.5 py-1 rounded-xl text-[9px] md:text-xs font-black shadow-2xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white flex items-center gap-1.5 ring-4 ring-white/10"
                                                    >
                                                        <Layers className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                                                        {availableIdeasCount}
                                                    </motion.div>
                                                </div>
                                            </motion.div>

                                            {/* Right side: Spin Controls (Side-by-side on desktop) */}
                                            {isVotingMode && userData ? (
                                                <div className="w-full max-w-lg lg:max-w-md animate-in zoom-in-95 duration-500">
                                                    <VotingManager
                                                        jarId={userData.activeJarId || ''}
                                                        userId={userData.id}
                                                        isAdmin={!!userData.isCreator}
                                                        onVoteComplete={handleContentUpdate}
                                                        onAddIdea={() => openModal('ADD_IDEA')}
                                                        voteCandidatesCount={userData.jarVoteCandidatesCount}
                                                    />
                                                </div>
                                            ) : !isAdminPickMode && (
                                                <div className="flex flex-col items-center lg:items-start gap-4 w-full max-w-lg lg:max-w-[400px] animate-in fade-in slide-in-from-right-6 duration-1000 delay-300 relative z-20">

                                                    <div className="flex items-center gap-3 w-full">
                                                        <Button
                                                            size="lg"
                                                            className="flex-1 h-14 md:h-16 lg:h-16 xl:h-20 rounded-2xl md:rounded-[1.75rem] bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 shadow-[0_20px_40px_rgba(236,72,153,0.3)] hover:shadow-[0_20px_40px_rgba(236,72,153,0.5)] text-lg md:text-xl xl:text-2xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] border-none text-white ring-2 ring-white/20 px-8"
                                                            onClick={() => handleSpinJar()}
                                                            disabled={ideas.length === 0 || isSpinning}
                                                            data-tour="spin-button-desktop"
                                                        >
                                                            {isSpinning ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                    <span>...</span>
                                                                </div>
                                                            ) : "Spin the Jar!"}
                                                        </Button>

                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-14 w-14 md:h-16 md:w-16 lg:h-16 lg:w-16 xl:h-20 xl:w-20 border-2 rounded-2xl md:rounded-[1.75rem] bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-xl text-slate-500 hover:text-primary transition-all hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-white/5"
                                                            onClick={() => openModal('SPIN_FILTERS')}
                                                            title="Filter Spin"
                                                            aria-label="Filter Spin"
                                                        >
                                                            <Filter className="w-6 h-6 md:w-8 md:h-8" />
                                                        </Button>
                                                    </div>

                                                    {/* Quick Filter Chips (Wrapping on desktop for better visibility) */}
                                                    {activeQuickChips.length > 0 && (
                                                        <div className="w-full">
                                                            <div
                                                                className="flex items-center gap-2 flex-wrap pb-2 pt-1 w-full justify-center lg:justify-start"
                                                            >
                                                                {activeQuickChips.map((chip, idx) => (
                                                                    <QuickFilterChip
                                                                        key={idx}
                                                                        label={chip.label}
                                                                        variant={chip.variant}
                                                                        icon={chip.icon}
                                                                        onClick={() => handleSpinJar(chip.filter)}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* EXTRA TOOLS SECTION */}
                            {!showEmptyState && !showNoJars && (
                                <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 flex flex-col gap-6" id="smart-prompt-input">
                                    <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] p-6 lg:p-8 border border-white/40 dark:border-white/10 shadow-xl ring-1 ring-black/5">
                                        <div className="flex items-center gap-2 mb-4 ml-2">
                                            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Smart Assistant</h3>
                                        </div>
                                        <SmartPromptInput
                                            jarTopic={jarTopic || 'General'}
                                            onGenerate={handleSmartPrompt}
                                            isGenerating={isGeneratingSmartIdeas}
                                            aiUsage={aiUsage}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                                        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2rem] p-4 lg:p-6 border border-white/40 dark:border-white/10 shadow-lg ring-1 ring-black/5 flex flex-col justify-center transform transition-all hover:scale-[1.01]">
                                            <UnifiedConciergeButton isPremium={isPremium} />
                                        </div>
                                        <div className="bg-indigo-50/60 dark:bg-indigo-950/20 backdrop-blur-2xl rounded-[2rem] p-4 lg:p-6 border border-indigo-200/50 dark:border-indigo-500/10 shadow-lg ring-1 ring-black/5 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-indigo-100/70 dark:hover:bg-indigo-950/40 transition-all hover:scale-[1.01]" onClick={() => openModal('TOOLS')}>
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                <Sparkles className="w-5 h-5 text-indigo-500" />
                                            </div>
                                            <span className="text-[10px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest">All AI Tools</span>
                                            <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 mt-1 font-medium italic">Explore all planners</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT SIDEBAR: Stats & Secondary Actions */}
                        <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-8 order-last lg:order-none">

                            {/* XP & Trophies - Moved to Sidebar on Desktop */}
                            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/20 dark:border-white/10 shadow-xl space-y-6">
                                <MiniProgressBar xp={xp || 0} level={level} />
                                <div className="pt-2">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Your Progress</h3>
                                    <CollapsibleTrophyCase
                                        xp={xp || 0}
                                        level={level}
                                        unlockedIds={achievements || []}
                                        compact={true}
                                    />
                                </div>
                            </div>

                            {/* Invite Code Display */}
                            <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                                <InviteCodeDisplay code={inviteCode} topic={jarTopic} />
                            </div>

                            {/* Email Verification Banner */}
                            {userData?.email && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-150">
                                    <VerificationBanner
                                        email={userData.email}
                                        isVerified={!!userData.emailVerified || !userData.verificationToken}
                                    />
                                </div>
                            )}

                            {/* Jar Summary Info (Optional) */}
                            {!showEmptyState && !showNoJars && (
                                <div className="bg-gradient-to-br from-indigo-500/5 to-purple-600/5 dark:from-indigo-400/10 dark:to-purple-500/10 rounded-[2rem] p-6 border border-indigo-500/10 dark:border-indigo-400/10 shadow-inner">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                                        <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Jar Insights</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center group">
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider">Topic</span>
                                            <span className="text-xs text-slate-900 dark:text-white font-bold px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm">{jarTopic}</span>
                                        </div>
                                        <div className="flex justify-between items-center group">
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider">Total Ideas</span>
                                            <span className="text-xs text-slate-900 dark:text-white font-bold px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm">{ideas.length} ideas</span>
                                        </div>
                                        <div className="flex justify-between items-center group">
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider">Spin Mode</span>
                                            <span className="text-xs text-slate-900 dark:text-white font-bold px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm capitalize">{jarSelectionMode?.toLowerCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </div>

            {/* MODALS CONTAINER */}
            <DashboardModals
                // Data
                isPremium={isPremium}
                userData={userData}
                ideas={ideas}
                userLocation={userLocation}
                setUserLocation={setUserLocation}
                combinedLocation={combinedLocation}
                jarTopic={jarTopic || 'General'}
                level={level}
                favoritesCount={favoritesCount}
                hasPaid={hasPaid}
                coupleCreatedAt={coupleCreatedAt || ''}
                isTrialEligible={isTrialEligible}
                availableJars={availableJars}

                // Callbacks
                handleContentUpdate={handleContentUpdate}
                fetchFavorites={fetchFavorites}
                fetchIdeas={fetchIdeas}
                refreshUser={refreshUser}
                handleSpinJar={handleSpinJar}

                // UI
                showConfetti={showConfetti}
                setShowConfetti={setShowConfetti}
                onCloseLevelUp={handleCloseLevelUp}
                onRestartTour={() => setShowOnboarding(true)}
            />

            {/* Preference Quiz (Lazy) */}
            {showQuiz && (
                <PreferenceQuizModal
                    isOpen={showQuiz}
                    onClose={() => setShowQuiz(false)}
                    onComplete={handleQuizComplete}
                />
            )}

            {/* Onboarding Tour (Lazy) */}
            <OnboardingTour
                isOpen={showOnboarding}
                onClose={() => {
                    handleSkipOnboarding();
                    setShowOnboarding(false);
                }}
                onComplete={() => {
                    handleCompleteOnboarding();
                    setShowOnboarding(false);
                }}
                steps={getOnboardingSteps(jarSelectionMode)}
            />

            {/* Confetti Effect handled via state passed to Modals, but separate container if needed */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-[100]" id="confetti-container">
                    {/* Placeholder for optional direct confetti */}
                </div>
            )}

            {/* XP Gain Toast */}
            <XpGainToast xpGain={xpGain} />

        </main>
    );
}
