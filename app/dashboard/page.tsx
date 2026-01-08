"use client";

import { Suspense, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Plus, Settings, LogOut, Sparkles, Lock, Trash2, Copy, Calendar,
    Activity, Utensils, Check, Star, ArrowRight, History, Layers,
    Users, Crown, Shield, Share, Moon, Heart, HelpCircle, Dices, Filter, Image as ImageIcon, Loader2
} from "lucide-react";

import { Jar3D } from "@/components/Jar3D";
import { PremiumBanner } from "@/components/PremiumBanner";
import { CollapsibleTrophyCase } from "@/components/Gamification/CollapsibleTrophyCase";
import { JarSwitcher } from "@/components/JarSwitcher";
import { getThemeForTopic } from "@/lib/categories";
import { VotingManager } from "@/components/VotingManager";
import { OnboardingWizard } from "@/components/Onboarding/OnboardingWizard";
import { EnhancedEmptyState } from "@/components/EnhancedEmptyState";
import { SmartToolsGrid } from "@/components/SmartToolsGrid";
import { DashboardModals } from "@/components/DashboardModals";
import { useDashboardLogic } from "@/hooks/useDashboardLogic";
import { ONBOARDING_STEPS } from "@/lib/onboarding-steps";
import { getJarLabels } from "@/lib/labels";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import React from "react";
import { SmartInputBar } from "@/components/SmartInputBar";

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
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl md:rounded-3xl p-3 md:p-6 flex items-center justify-between shadow-sm group hover:border-primary/30 transition-all">
            <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="text-left">
                    <span className="block text-[9px] md:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] md:tracking-[0.2em] mb-0.5 md:mb-1 leading-tight">{labels.connectionAction}</span>
                    <code className="text-lg md:text-xl font-mono font-black text-primary tracking-[0.15em] md:tracking-[0.2em]">{code}</code>
                </div>
            </div>
            <Button
                variant="outline"
                onClick={handleInvite}
                className="rounded-xl md:rounded-2xl border-primary/20 text-primary hover:bg-primary/5 px-4 md:px-6 h-9 md:h-12 text-xs md:text-sm font-bold shadow-sm"
            >
                {copied ? <><Check className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" /> Copied</> : <><Copy className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" /> Copy</>}
            </Button>
        </div>
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
    const {
        // State
        userData, isLoadingUser, isPremium, xp, level, achievements, hasPaid, coupleCreatedAt, isTrialEligible,
        ideas, isLoadingIdeas, isFetchingIdeas, favoritesCount,
        isSpinning, userLocation, inviteCode, showConfetti, showOnboarding, showQuiz,

        // State Setters (explicitly destructured for usage)
        setUserLocation, setShowConfetti, setShowOnboarding, setShowQuiz,

        // Actions
        handleSpinJar, handleDeleteClick, handleDuplicate, handleQuizComplete,
        handleAddIdeaClick, handleContentUpdate, handleLogout,
        refreshUser, fetchIdeas, fetchFavorites,
        handleCompleteOnboarding, handleSkipOnboarding,

        // Utils
        openModal
    } = useDashboardLogic();

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

    const showNoJars = !userData?.activeJarId && userData?.memberships?.length === 0;
    const showEmptyState = userData?.activeJarId && ideas.length === 0 && !isLoadingIdeas && !isFetchingIdeas;
    const showAdminStatus = isAdminPickMode;
    const showStatusSection = showNoJars || showAdminStatus || showEmptyState;

    // Check if we should show QuickStart modal for empty jar on dashboard
    useEffect(() => {
        if (showEmptyState && userData?.activeJarId) {
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
    }, [showEmptyState, userData?.activeJarId, userData?.jarTopic, openModal]);

    const availableIdeasCount = ideas.filter((i: any) => !i.selectedAt && (!isAllocationMode || !i.isMasked)).length;
    const combinedLocation = userLocation || "";

    const handleCloseLevelUp = () => {
        localStorage.setItem('datejar_user_level', level.toString());
    };

    const isLoading = isLoadingUser || isLoadingIdeas || (isFetchingIdeas && ideas.length === 0);

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
                {/* HEADER */}
                <header className="flex flex-col gap-6 mb-8 md:mt-4">
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
                                <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1">
                                    make moments happen
                                </p>
                            </div>
                        </div>

                        {/* Center: Trophy Case - Desktop Only (Wide) */}
                        <div className="hidden lg:flex justify-center flex-1 px-4 lg:px-8" data-tour="trophy-case">
                            <CollapsibleTrophyCase
                                xp={xp || 0}
                                level={level}
                                unlockedIds={achievements || []}
                            />
                        </div>

                        {/* Right: Utility Tools - Desktop Only (Wide) */}
                        <div className="hidden lg:flex items-center justify-end gap-2 shrink-0">
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

                            <Button variant="outline" size="icon" onClick={() => openModal('QUICK_TOOLS')} className="w-11 h-11 rounded-full border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" aria-label="Quick Tools">
                                <Dices className="w-5 h-5" />
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
                        <div className="flex justify-center -mb-2">
                            <CollapsibleTrophyCase
                                xp={xp || 0}
                                level={level}
                                unlockedIds={achievements || []}
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 h-12">
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

                            <Link href="/community" className="shrink-0" aria-label="Discover Communities">
                                <Button variant="outline" size="icon" className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
                                    <Users className="w-5 h-5 text-slate-500" />
                                </Button>
                            </Link>

                            <Button variant="outline" size="icon" onClick={() => openModal('QUICK_TOOLS')} className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shrink-0" aria-label="Quick Tools">
                                <Dices className="w-5 h-5 text-slate-500" />
                            </Button>

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

                {/* MAIN DASHBOARD CONTAINER: Centered Single Column */}
                <div className="max-w-4xl mx-auto space-y-8 pb-12">

                    {/* Invite Code Banner */}
                    <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                        <InviteCodeDisplay code={inviteCode} topic={jarTopic} />
                    </div>

                    {/* JAR VISUALIZATION SECTION */}
                    <div className="flex flex-col items-center">
                        {/* Premium Info / Alerts */}
                        <div className="w-full max-w-2xl mb-6">
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
                                        <EnhancedEmptyState
                                            jarTopic={userData?.jarTopic || 'General'}
                                            jarName={userData?.jarName || 'Your Jar'}
                                            jarId={userData?.activeJarId || ''}
                                            inviteCode={inviteCode}
                                            onTemplateClick={() => openModal('TEMPLATE_BROWSER')}
                                            onAddIdeaClick={() => openModal('ADD_IDEA')}
                                        />
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
                            <div className="relative z-10 w-full flex flex-col items-center py-4 md:py-8 animate-in fade-in zoom-in duration-1000">
                                <motion.div
                                    animate={isSpinning
                                        ? { rotate: [0, -8, 8, -8, 8, 0], scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 0.5 } }
                                        : { rotate: 0, scale: 1 }
                                    }
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="relative mb-8 md:mb-12"
                                    data-tour="jar-visual"
                                >
                                    <div className="scale-110 md:scale-[1.35] transform transition-transform duration-700 ease-out">
                                        <Jar3D />
                                    </div>

                                    <div className="absolute top-8 md:top-10 right-4 md:right-0 z-20">
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.5, type: "spring" }}
                                            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] md:text-xs font-black shadow-2xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white flex items-center gap-2 ring-4 ring-white/10"
                                        >
                                            <Layers className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                                            {availableIdeasCount} Ideas
                                        </motion.div>
                                    </div>
                                </motion.div>

                                {/* Main Spin Action */}
                                {!isVotingMode && !isAdminPickMode && (
                                    <div className="flex items-center gap-4 w-full max-w-sm md:max-w-md animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
                                        <Button
                                            size="lg"
                                            className="flex-1 h-14 md:h-16 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 shadow-[0_20px_50px_rgba(236,72,153,0.3)] hover:shadow-[0_20px_50px_rgba(236,72,153,0.5)] text-lg md:text-xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] border-none text-white ring-2 ring-white/20"
                                            onClick={() => handleSpinJar()}
                                            disabled={ideas.length === 0 || isSpinning}
                                            data-tour="spin-button-desktop"
                                        >
                                            {isSpinning ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Spinning...</span>
                                                </div>
                                            ) : "Spin the Jar!"}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-14 w-14 md:h-16 md:w-16 border-2 rounded-2xl md:rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-xl text-slate-500 hover:text-primary transition-all hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-white/5"
                                            onClick={() => openModal('SPIN_FILTERS')}
                                            title="Filter Spin"
                                            aria-label="Filter Spin"
                                        >
                                            <Filter className="w-6 h-6 md:w-7 md:h-7" />
                                        </Button>
                                    </div>
                                )}

                                {!isVotingMode && !isAdminPickMode && (
                                    <div className="mt-8 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 flex flex-col items-center gap-4">
                                        <SmartInputBar />

                                        <button
                                            onClick={() => openModal('TOOLS')}
                                            className="text-xs font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5 py-2"
                                        >
                                            <Dices className="w-3.5 h-3.5" />
                                            Browse specialized tools & finders
                                        </button>
                                    </div>
                                )}

                                {isVotingMode && userData && (
                                    <div className="w-full max-w-2xl animate-in zoom-in-95 duration-500">
                                        <VotingManager
                                            jarId={userData.activeJarId || ''}
                                            userId={userData.id}
                                            isAdmin={userData.memberships?.[0]?.role === 'ADMIN'}
                                            onVoteComplete={handleContentUpdate}
                                            onAddIdea={() => openModal('ADD_IDEA')}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
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
                steps={ONBOARDING_STEPS}
            />

            {/* Confetti Effect handled via state passed to Modals, but separate container if needed */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-[100]" id="confetti-container">
                    {/* Placeholder for optional direct confetti */}
                </div>
            )}

        </main>
    );
}
