"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Plus, Settings, LogOut, Sparkles, Lock, Trash2, Copy, Calendar,
    Activity, Utensils, Check, Star, ArrowRight, History, Layers,
    Users, Crown, Shield, Share, Moon, Heart, HelpCircle, Dices, Filter, Image as ImageIcon
} from "lucide-react";

import { Jar3D } from "@/components/Jar3D";
import { PremiumBanner } from "@/components/PremiumBanner";
import { CollapsibleTrophyCase } from "@/components/Gamification/CollapsibleTrophyCase";
import { JarSwitcher } from "@/components/JarSwitcher";
import { getThemeForTopic } from "@/lib/categories";
import { VotingManager } from "@/components/VotingManager";
import { DashboardOnboarding } from "@/components/DashboardOnboarding";
import { EnhancedEmptyState } from "@/components/EnhancedEmptyState";
import { SmartToolsGrid } from "@/components/SmartToolsGrid";
import { DashboardModals } from "@/components/DashboardModals";
import { useDashboardLogic } from "@/hooks/useDashboardLogic";
import { ONBOARDING_STEPS } from "@/lib/onboarding-steps";

// Lazy Loading
const PreferenceQuizModal = dynamic(() => import("@/components/PreferenceQuizModal").then(m => m.PreferenceQuizModal), { ssr: false });
const OnboardingTour = dynamic(() => import("@/components/Onboarding/OnboardingTour").then(m => m.OnboardingTour), { ssr: false });

function InviteCodeDisplay({ mobile, code }: { mobile?: boolean; code: string | null }) {
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

    if (mobile) {
        return (
            <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Users className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Invite Partner</span>
                        <code className="text-lg font-mono font-black text-primary tracking-widest">{code}</code>
                    </div>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={handleInvite}
                    className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 px-4 h-10"
                >
                    {copied ? <><Check className="w-4 h-4 mr-2" /> Copied</> : <><Copy className="w-4 h-4 mr-2" /> Copy Link</>}
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:flex flex-col gap-2 bg-white/50 dark:bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-sm"
        >
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Pair Code</span>
                <Users className="w-3 h-3" />
            </div>
            <button
                onClick={handleInvite}
                className="flex items-center gap-3 group relative"
            >
                <div className="text-2xl font-mono font-bold text-slate-800 dark:text-white tracking-widest group-hover:scale-105 transition-transform">
                    {code}
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </div>
            </button>
        </motion.div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-slate-400">Loading...</div></div>}>
            <DashboardContent />
        </Suspense>
    );
}

function DashboardContent() {
    const {
        // State
        userData, isLoadingUser, isPremium, xp, level, achievements, hasPaid, coupleCreatedAt, isTrialEligible,
        ideas, isLoadingIdeas, favoritesCount,
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
    const isVotingMode = jarSelectionMode === 'VOTING';
    const isAllocationMode = jarSelectionMode === 'ALLOCATION';
    // const theme = getThemeForTopic(jarTopic); // Theme usage removed from Jar3D as it accepts no props

    const activityPlannerTitle = (jarTopic === 'Dates' || jarTopic === 'Romantic')
        ? "Date Night Planner"
        : `${jarTopic && jarTopic !== 'General' && jarTopic !== 'Activities' ? jarTopic : "Activity"} Planner`;

    const titleText = jarTopic === 'Dates' ? 'Date Jar' : `${jarTopic || 'Date'} Jar`;
    const isAdminPickMode = jarSelectionMode === 'ADMIN_PICK';

    const showNoJars = !userData?.activeJarId && userData?.memberships?.length === 0;
    const showAdminStatus = isAdminPickMode;
    const showStatusSection = showNoJars || showAdminStatus;

    const availableIdeasCount = ideas.filter(i => !i.selectedAt && (!isAllocationMode || !i.isMasked)).length;
    const combinedLocation = userLocation || "";

    const handleCloseLevelUp = () => {
        localStorage.setItem('datejar_user_level', level.toString());
    };

    return (
        <main className="page-with-nav min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 relative overflow-hidden w-full transition-colors duration-500">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 dark:bg-primary/20 blur-[120px] rounded-full animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 dark:bg-accent/20 blur-[120px] rounded-full animate-pulse-slow delay-700" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-8 gap-4 md:mt-4">
                    <div className="flex flex-col gap-1">
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
                                <div className="flex items-center gap-2">
                                    {userData && <JarSwitcher user={userData as any} variant="title" />}
                                    {!userData && <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">Decision Jar</h1>}
                                </div>
                                <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1">
                                    make moments happen
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 justify-between md:justify-end w-full md:w-auto">
                        {/* Gamification Trophy Case - Hidden on mobile, moved to a badge below if needed, or kept but styled */}
                        <div className="flex-1 md:flex-initial">
                            <CollapsibleTrophyCase
                                xp={xp || 0}
                                level={level}
                                unlockedIds={achievements || []}
                            />
                        </div>

                        {/* Desktop Only Displays */}
                        <div className="hidden lg:flex">
                            <InviteCodeDisplay code={inviteCode} />
                        </div>

                        {/* Mobile Logout - Separate to keep main row clean */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="w-10 h-10 rounded-full text-slate-400 hover:text-red-50 hover:bg-red-50 dark:hover:bg-red-500/10 md:hidden"
                        >
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Mobile Action Bar - Horizontal Scroll on Small Screens */}
                    <div className="flex md:hidden items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal('FAVORITES')}
                            className="bg-white dark:bg-slate-900 flex items-center gap-2 h-10 px-4 rounded-xl border-slate-200 dark:border-white/10 shrink-0"
                        >
                            <Heart className={`w-4 h-4 ${favoritesCount > 0 ? "text-red-500 fill-red-500" : "text-slate-400"}`} />
                            <span className="text-xs font-bold">{favoritesCount} Favorites</span>
                        </Button>

                        <Link href="/memories" className="shrink-0">
                            <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
                                <ImageIcon className="w-4 h-4 text-slate-500" />
                            </Button>
                        </Link>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openModal('QUICK_TOOLS')}
                            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shrink-0"
                        >
                            <Dices className="w-4 h-4 text-slate-500" />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openModal('HELP')}
                            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shrink-0"
                        >
                            <HelpCircle className="w-4 h-4 text-slate-500" />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openModal('SETTINGS')}
                            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shrink-0"
                        >
                            <Settings className="w-4 h-4 text-slate-500" />
                        </Button>
                    </div>

                    {/* Desktop Utility Group */}
                    <div className="hidden md:flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal('FAVORITES')}
                            className="gap-2 rounded-full border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors relative px-3 h-10"
                        >
                            <Heart className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Favorites</span>
                            {favoritesCount > 0 && (
                                <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">
                                    {favoritesCount}
                                </span>
                            )}
                        </Button>

                        <Link href="/memories">
                            <Button variant="outline" size="icon" className="w-10 h-10 rounded-full border-slate-200 dark:border-white/10"><ImageIcon className="w-5 h-5" /></Button>
                        </Link>
                        <Button variant="outline" size="icon" onClick={() => openModal('HELP')} className="w-10 h-10 rounded-full border-slate-200 dark:border-white/10"><HelpCircle className="w-5 h-5" /></Button>
                        <Button variant="outline" size="icon" onClick={() => openModal('QUICK_TOOLS')} className="w-10 h-10 rounded-full border-slate-200 dark:border-white/10"><Dices className="w-5 h-5" /></Button>
                        <Button variant="outline" size="icon" onClick={() => openModal('SETTINGS')} className="w-10 h-10 rounded-full border-slate-200 dark:border-white/10"><Settings className="w-5 h-5" /></Button>
                        <Button variant="ghost" size="icon" onClick={handleLogout} className="w-10 h-10 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500"><LogOut className="w-5 h-5" /></Button>
                    </div>
                </header>

                {/* MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">

                    {/* LEFT COLUMN: Controls & Jar */}
                    <div className="lg:col-span-4 space-y-4 md:space-y-6 flex flex-col h-full">

                        {/* Premium Banner (Mobile) */}
                        {!isPremium && !isLoadingUser && !hasPaid && (
                            <div className="lg:hidden">
                                <PremiumBanner
                                    hasPaid={hasPaid}
                                    coupleCreatedAt={coupleCreatedAt || ''}
                                    isTrialEligible={isTrialEligible}
                                    isPremium={isPremium}
                                />
                            </div>
                        )}

                        {/* Invite Code (Mobile) */}
                        <div className="lg:hidden">
                            <InviteCodeDisplay mobile code={inviteCode} />
                        </div>

                        {/* STATUS ALERTS */}
                        {showStatusSection && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                {showNoJars && (
                                    <DashboardOnboarding onJarCreated={refreshUser} isPro={isPremium} />
                                )}
                                {showAdminStatus && (
                                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-2xl flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                                            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-amber-900 dark:text-amber-100">Admin Pick Mode</h3>
                                            <p className="text-sm text-amber-700 dark:text-amber-300/80 mt-1">
                                                An admin is manually selecting the next date. Spinning is disabled.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* JAR VISUALIZATION & CONTROLS */}
                        <div className="relative z-10 flex-1 min-h-[320px] md:min-h-[400px] flex flex-col items-center justify-center">

                            {/* Jar Image with Spin Animation */}
                            <motion.div
                                animate={isSpinning ? { rotate: [0, -5, 5, -5, 5, 0], transition: { repeat: Infinity, duration: 0.5 } } : {}}
                                className="relative mb-6"
                            >
                                <Jar3D />

                                <div className="absolute top-0 right-0 z-20">
                                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5" />
                                        {availableIdeasCount} Ideas
                                    </div>
                                </div>
                            </motion.div>

                            {/* Spin Controls */}
                            {!isVotingMode && !isAdminPickMode && (
                                <div className="flex gap-2 w-full max-w-xs">
                                    <Button
                                        size="lg"
                                        className="flex-1 bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25 hover:shadow-primary/40 h-14 text-lg font-bold"
                                        onClick={() => handleSpinJar()}
                                        disabled={ideas.length === 0 || isSpinning}
                                    >
                                        {isSpinning ? "Spinning..." : "Spin the Jar!"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-14 w-14 border-2 rounded-xl"
                                        onClick={() => openModal('SPIN_FILTERS')}
                                        title="Filter Spin"
                                    >
                                        <Filter className="w-6 h-6 text-slate-500" />
                                    </Button>
                                </div>
                            )}

                            {isVotingMode && userData && (
                                <VotingManager
                                    jarId={userData.activeJarId || ''}
                                    userId={userData.id}
                                    isAdmin={userData.memberships?.[0]?.role === 'ADMIN'}
                                    onVoteComplete={handleContentUpdate}
                                    onAddIdea={() => openModal('ADD_IDEA')}
                                />
                            )}
                        </div>

                        {/* Premium Banner (Desktop) */}
                        {!isPremium && !isLoadingUser && !hasPaid && (
                            <div className="hidden lg:block">
                                <PremiumBanner
                                    hasPaid={hasPaid}
                                    coupleCreatedAt={coupleCreatedAt || ''}
                                    isTrialEligible={isTrialEligible}
                                    isPremium={isPremium}
                                />
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Ideas & Tools */}
                    <div className="lg:col-span-8 flex flex-col space-y-6">

                        {/* Smart Tools Grid Removed for "Clean Home" Option 1 - Now exclusive to Explore page */}
                        {/* <SmartToolsGrid ... /> */}

                        {/* Idea List / Empty State */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-white/5 flex-1 flex flex-col overflow-hidden relative min-h-[500px]">
                            {/* List Header */}
                            <div className="p-4 md:p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <History className="w-5 h-5 text-slate-400" />
                                        In the Jar
                                    </h2>
                                </div>

                                <Button
                                    onClick={handleAddIdeaClick}
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90 text-white gap-1.5 shadow-lg shadow-primary/20"
                                >
                                    <Plus className="w-4 h-4" /> Add Idea
                                </Button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative">
                                {isLoadingIdeas ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                            <p className="text-sm text-slate-400 font-medium">Loading your jar...</p>
                                        </div>
                                    </div>
                                ) : ideas.length === 0 ? (
                                    <EnhancedEmptyState
                                        onAddIdea={handleAddIdeaClick}
                                        onSurpriseMe={() => openModal('SURPRISE_ME')}
                                        onBrowseTemplates={() => openModal('TEMPLATE_BROWSER')}
                                        onTakeQuiz={() => setShowQuiz(true)}
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {ideas.map((idea) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                key={idea.id}
                                                onClick={() => openModal('DATE_REVEAL', { idea, viewOnly: true })}
                                                className={`group relative p-4 rounded-xl border transition-all cursor-pointer overflow-hidden hover:shadow-md ${idea.selectedAt ? 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 opacity-60 grayscale' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50'}`}
                                            >
                                                {/* Card Content */}
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-slate-900 dark:text-white truncate pr-6">{idea.title || idea.description}</h3>

                                                        {idea.details && typeof idea.details === 'object' && (idea.details as any).location && (
                                                            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                                {(idea.details as any).location}
                                                            </div>
                                                        )}

                                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                                            {idea.category && (
                                                                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                                                                    {idea.category}
                                                                </span>
                                                            )}
                                                            {idea.cost && (
                                                                <span className="px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-500/10 text-[10px] font-medium text-green-700 dark:text-green-400">
                                                                    {idea.cost}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 absolute top-2 right-2">
                                                        <button
                                                            onClick={(e) => handleDeleteClick(idea.id, e)}
                                                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDuplicate(idea, e)}
                                                            className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 rounded-lg transition-colors"
                                                            title="Duplicate/Edit"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
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
                jarTopic={jarTopic || 'Date'}
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
