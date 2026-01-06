"use client";

import { signOut } from "next-auth/react";
import { SoundEffects, triggerHaptic } from "@/lib/feedback";
import { Button } from "@/components/ui/Button";
import { getApiUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus, Settings, LogOut, Sparkles, Lock, Trash2, Copy, Calendar, Activity, Utensils, Check, Star, ArrowRight, History, Layers, Users, Crown, Shield, Share } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { Jar3D } from "@/components/Jar3D";
import { useRouter, useSearchParams } from "next/navigation";
import { PremiumBanner } from "@/components/PremiumBanner";
import { Moon, Heart } from "lucide-react";
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { CollapsibleTrophyCase } from "@/components/Gamification/CollapsibleTrophyCase";
import { HelpCircle, Dices } from "lucide-react";
import { JarSwitcher } from "@/components/JarSwitcher";
import { getThemeForTopic } from "@/lib/categories";
import { VotingManager } from "@/components/VotingManager";
import { DashboardOnboarding } from "@/components/DashboardOnboarding";
import { resetConciergeTrial } from "@/lib/demo-storage";
import { EmptyJarMessage } from "@/components/EmptyJarMessage";
import { trackEvent } from "@/lib/analytics";
import { SmartToolsGrid } from "@/components/SmartToolsGrid";
import { DashboardModals } from "@/components/DashboardModals";
import { useModalSystem } from "@/components/ModalProvider";
import { UserData } from "@/lib/types";
import { useUser } from "@/hooks/useUser";
import { useIdeas } from "@/hooks/useIdeas";
import { useFavorites } from "@/hooks/useFavorites";
import { spinJar } from "@/app/actions/spin";
import { deleteIdea } from "@/app/actions/ideas";

function InviteCodeDisplay({ mobile, code }: { mobile?: boolean; code: string | null }) {
    const [copied, setCopied] = useState(false);

    const handleInvite = async () => {
        if (!code) return;
        const url = `${window.location.origin}/signup?code=${code}`;

        if ((navigator as any).share) {
            try {
                await (navigator as any).share({
                    title: 'Join my Decision Jar',
                    text: `Use my invite code ${code} to join our jar!`,
                    url: url
                });
                return;
            } catch (err) {
                // Ignore abort
            }
        }

        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!code) return null;

    if (mobile) {
        return (
            <button
                onClick={handleInvite}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 active:scale-95 transition-all"
            >
                <span className="text-xs text-slate-400">Invite Partner:</span>
                <span className="text-sm font-mono text-white font-bold">{code}</span>
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Share className="w-3 h-3 text-slate-400" />}
            </button>
        );
    }

    return (
        <button onClick={handleInvite} className="flex items-center gap-2 hover:text-white transition-colors group" title="Click to share or copy invite link">
            <span>{code}</span>
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-500 group-hover:text-white" />}
        </button>
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
    // Modal System
    const { openModal } = useModalSystem();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Custom Hooks
    const { userData, isLoading: isLoadingUser, isPremium, refreshUser, xp, level, achievements, hasPaid, coupleCreatedAt, isTrialEligible } = useUser({
        onLevelUp: (newLevel) => openModal('LEVEL_UP', { level: newLevel })
    });
    const { ideas, isLoading: isLoadingIdeas, fetchIdeas } = useIdeas();
    const { favoritesCount, fetchFavorites } = useFavorites();

    const [isSpinning, setIsSpinning] = useState(false);
    const [userLocation, setUserLocation] = useState<string | null>(null);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    // Sync user location and invite code when userData loads
    useEffect(() => {
        if (userData) {
            if (userData.location) setUserLocation(userData.location);
            if (userData.coupleReferenceCode) setInviteCode(userData.coupleReferenceCode);
        }
    }, [userData]);

    // Check if we should show the premium welcome tip
    useEffect(() => {
        const success = searchParams?.get('success');
        const hasSeenTip = localStorage.getItem('premium_shortcuts_tip_seen');

        if (success === 'true' && !hasSeenTip && isPremium && !isLoadingUser) {
            openModal('PREMIUM_WELCOME_TIP', { showPremiumTip: true });
            trackEvent('premium_shortcuts_tip_shown', { trigger: 'post_upgrade' });
        }
    }, [searchParams, isPremium, isLoadingUser, openModal]);

    // Handle PWA shortcuts with premium gating
    useEffect(() => {
        const tool = searchParams?.get('tool');
        if (!tool) return;

        trackEvent('pwa_shortcut_used', { tool, from_home_screen: true });

        const checkAndOpenTool = async () => {
            if (isLoadingUser || !userData) {
                setTimeout(checkAndOpenTool, 100);
                return;
            }

            if (!isPremium) {
                trackEvent('pwa_shortcut_blocked', { tool, reason: 'requires_premium' });
                openModal('PREMIUM');
                return;
            }

            if (!userData.activeJarId && userData.memberships && userData.memberships.length > 0) {
                const firstJar = userData.memberships[0];
                try {
                    await fetch('/api/jar/set-active', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ jarId: firstJar.jarId }),
                        credentials: 'include'
                    });
                    trackEvent('pwa_shortcut_jar_auto_selected', { tool, jarId: firstJar.jarId });
                    refreshUser();
                } catch (error) {
                    console.error('Failed to auto-select jar:', error);
                }
            }

            trackEvent('pwa_shortcut_opened', { tool, user_type: 'premium' });

            switch (tool) {
                case 'dining': openModal('CONCIERGE', { toolId: 'DINING' }); break;
                case 'bar': openModal('CONCIERGE', { toolId: 'BAR' }); break;
                case 'weekend': openModal('WEEKEND_PLANNER'); break;
                case 'movie': openModal('CONCIERGE', { toolId: 'MOVIE' }); break;
                default: console.warn(`Unknown PWA shortcut tool: ${tool}`);
            }
        };

        checkAndOpenTool();
    }, [searchParams, isPremium, isLoadingUser, userData, openModal, refreshUser]);

    const jarTopic = userData?.jarTopic;
    const jarSelectionMode = userData?.jarSelectionMode;
    const isVotingMode = jarSelectionMode === 'VOTING';
    const isAllocationMode = jarSelectionMode === 'ALLOCATION';
    const theme = getThemeForTopic(jarTopic);
    const activityPlannerTitle = (jarTopic === 'Dates' || jarTopic === 'Romantic') ? "Date Night Planner" : `${jarTopic && jarTopic !== 'General' && jarTopic !== 'Activities' ? jarTopic : "Activity"} Planner`;
    const isAdminPickMode = jarSelectionMode === 'ADMIN_PICK';

    const handleContentUpdate = () => {
        fetchIdeas();
        refreshUser();
    };

    // Stripe Success Handler
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const success = params.get('success');
        const sessionId = params.get('session_id');

        if (success && sessionId && refreshUser) {
            triggerHaptic(50);
            setShowConfetti(true);
            window.history.replaceState({}, '', window.location.pathname);
            refreshUser();
        }
    }, [refreshUser]);

    const handleCloseLevelUp = () => {
        localStorage.setItem('datejar_user_level', level.toString());
    };

    const handleLogout = async () => {
        await signOut({ redirect: false });
        await fetch(getApiUrl('/api/auth/logout'), { method: 'POST' });
        window.location.href = '/';
    };

    const handleSpinJar = async (filters: { maxDuration?: number; maxCost?: string; maxActivityLevel?: string; timeOfDay?: string; category?: string } = {}) => {
        if (ideas.length === 0) {
            alert("Add some ideas first!");
            return;
        }
        setIsSpinning(true);

        const spinDuration = 2000;
        const tickInterval = 150; // ms
        let elapsed = 0;

        const tickLoop = setInterval(() => {
            SoundEffects.playTick();
            triggerHaptic(10);
            elapsed += tickInterval;
            if (elapsed >= spinDuration) clearInterval(tickLoop);
        }, tickInterval);

        await new Promise(resolve => setTimeout(resolve, spinDuration));

        clearInterval(tickLoop);
        triggerHaptic([50, 50, 50]);
        SoundEffects.playFanfare();

        try {
            const res = await spinJar(filters);

            if ('success' in res && res.success && 'idea' in res) {
                openModal('DATE_REVEAL', { idea: (res as any).idea });
                handleContentUpdate();
            } else {
                alert((res as any).error || "Failed to pick a date. Try adding more ideas!");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSpinning(false);
        }
    };

    const handleDeleteClick = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        openModal('DELETE_CONFIRM', {
            onConfirm: async () => {
                try {
                    const res = await deleteIdea(id);

                    if ('success' in res && res.success) {
                        fetchIdeas();
                    } else {
                        alert(`Failed to delete idea: ${(res as any).error || "Unknown error"}`);
                        console.error("Delete failed:", res);
                    }
                } catch (error: any) {
                    console.error("Error deleting idea:", error);
                    alert(`Error deleting idea: ${error.message}`);
                }
            }
        });
    };

    const handleDuplicate = (idea: any, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const { id, selectedAt, selectedDate, createdBy, createdAt, updatedAt, ...ideaData } = idea;
        openModal('ADD_IDEA', { initialData: ideaData });
    };

    const handleAddIdeaClick = () => {
        openModal('ADD_IDEA');
    };

    const availableIdeasCount = ideas.filter(i => !i.selectedAt && (!isAllocationMode || !i.isMasked)).length;
    const combinedLocation = userLocation || "";

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pb-32 relative overflow-hidden w-full transition-colors duration-500">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 dark:bg-primary/20 blur-[120px] rounded-full animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 dark:bg-accent/20 blur-[120px] rounded-full animate-pulse-slow delay-700" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            </div>

            <div className="relative z-10 w-full max-w-[1400px] mx-auto">
                <DashboardModals
                    isPremium={isPremium} userData={userData} ideas={ideas}
                    userLocation={userLocation} setUserLocation={setUserLocation}
                    combinedLocation={combinedLocation} jarTopic={jarTopic ?? 'General'} level={level} favoritesCount={favoritesCount}
                    hasPaid={hasPaid} coupleCreatedAt={coupleCreatedAt} isTrialEligible={isTrialEligible}

                    handleContentUpdate={handleContentUpdate} fetchFavorites={fetchFavorites} fetchIdeas={fetchIdeas}
                    refreshUser={refreshUser} handleSpinJar={handleSpinJar}
                    showConfetti={showConfetti} setShowConfetti={setShowConfetti}
                />

                {/* Header */}
                <header className="mb-8 md:mb-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex flex-col gap-1 min-w-0">
                            {userData ? (
                                <>
                                    <JarSwitcher
                                        user={userData}
                                        variant="title"
                                        className="min-w-0"
                                        onSwitch={handleContentUpdate}
                                    />
                                    <div className="flex items-center gap-2 mt-1 px-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Live Session</span>
                                    </div>
                                </>
                            ) : (
                                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Your Workspace</h1>
                            )}
                        </div>

                        <div className="flex gap-2 items-center justify-end">
                            {!isLoadingUser && !isPremium && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-700 dark:text-yellow-200 border-yellow-400/30 hover:bg-yellow-400/30 rounded-full"
                                    onClick={() => openModal('PREMIUM')}
                                >
                                    <Sparkles className="w-4 h-4 md:mr-2" />
                                    <span className="hidden md:inline">Upgrade</span>
                                </Button>
                            )}

                            <InviteCodeDisplay mobile={false} code={inviteCode} />

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openModal('SETTINGS')}
                                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            >
                                <Settings className="w-5 h-5" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                            >
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Invite Code (Below header on small screens) */}
                    {inviteCode && (
                        <div className="md:hidden mt-4 flex justify-center">
                            <InviteCodeDisplay mobile={true} code={inviteCode} />
                        </div>
                    )}

                    <div className="mt-6 md:mt-8">
                        <PremiumBanner hasPaid={!!hasPaid} coupleCreatedAt={coupleCreatedAt || ''} isTrialEligible={isTrialEligible} />
                        <CollapsibleTrophyCase
                            xp={xp || 0}
                            level={level || 1}
                            unlockedIds={achievements || []}
                        />
                    </div>
                </header>

                <div className="flex flex-col gap-6 mb-8">
                    {/* Jar Status Indicators */}
                    {(!userData?.activeJarId && userData?.memberships?.length === 0) && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                                <HelpCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-amber-700 dark:text-amber-400 text-sm">No Jars Found</h3>
                                <p className="text-xs text-amber-600/80 dark:text-amber-400/60">Create a new jar or join one to get started.</p>
                            </div>
                            <Button size="sm" onClick={() => openModal('CREATE_JAR')} variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400">
                                Create Jar
                            </Button>
                        </div>
                    )}
                    {isAdminPickMode && (
                        userData?.isCreator ? (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <Crown className="w-5 h-5 text-amber-500" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200">Admin Pick Mode Active</h3>
                                    <p className="text-xs text-amber-700/70 dark:text-amber-300/70">As the jar admin, you choose the winner directly.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full flex justify-center py-4">
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center border bg-slate-700 text-slate-400 border-slate-600">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-base font-bold text-slate-400">
                                            Waiting for Admin
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>

                {/* Upper Section: Jar Control Center */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-center relative">

                    {/* Left Column: Input & Management */}
                    <div className="space-y-6 order-2 xl:order-1">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAddIdeaClick}
                            className="w-full relative overflow-hidden rounded-2xl p-6 flex flex-row items-center justify-start gap-4 cursor-pointer transition-all bg-gradient-to-br from-violet-600/20 to-violet-900/40 border border-violet-500/30 hover:border-violet-500/50 shadow-lg shadow-violet-900/10 group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 shrink-0 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-200 group-hover:scale-110 transition-transform relative z-10 border border-violet-500/30">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div className="text-left relative z-10">
                                <span className="block text-lg font-bold text-violet-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-200 transition-colors flex items-center gap-2">
                                    {userData?.isCommunityJar && !userData?.isCreator ? "Suggest Idea" : "Add Idea"}
                                    <span className="bg-violet-500/30 text-violet-700 dark:text-violet-200 text-[10px] px-1.5 py-0.5 rounded-full font-bold">+15 XP</span>
                                </span>
                                <span className="text-sm text-violet-700 dark:text-violet-200/60 group-hover:text-violet-900 dark:group-hover:text-violet-200/80 transition-colors leading-tight">
                                    {userData?.isCommunityJar && !userData?.isCreator ? "Submit for review" : "Fill your jar"}
                                </span>
                            </div>
                        </motion.button>

                        {!userData?.isCommunityJar && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openModal('ADD_IDEA', { initialMode: 'magic' })}
                                className="w-full relative overflow-hidden rounded-2xl p-6 flex flex-row items-center justify-start gap-4 cursor-pointer transition-all bg-gradient-to-br from-yellow-500/20 to-orange-600/40 border border-yellow-500/30 hover:border-yellow-500/50 shadow-lg shadow-yellow-900/10 group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-12 h-12 shrink-0 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-200 group-hover:scale-110 transition-transform relative z-10 border border-yellow-500/30">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div className="text-left relative z-10">
                                    <span className="block text-lg font-bold text-yellow-900 dark:text-white group-hover:text-yellow-700 dark:group-hover:text-yellow-200 transition-colors flex items-center gap-2">
                                        Surprise Me
                                        <span className="bg-yellow-500/30 text-yellow-700 dark:text-yellow-200 text-[10px] px-1.5 py-0.5 rounded-full font-bold">+15 XP</span>
                                    </span>
                                    <span className="text-sm text-yellow-700 dark:text-yellow-200/60 group-hover:text-yellow-900 dark:group-hover:text-yellow-200/80 transition-colors leading-tight">Add a secret idea</span>
                                </div>
                            </motion.button>
                        )}

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push('/jar')}
                            className="glass-card p-6 hidden md:flex items-center gap-4 cursor-pointer group hover:bg-white/10"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/30 transition-colors shrink-0">
                                <Layers className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Open Jar</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">
                                    {isLoadingIdeas ? "Loading..." : `View ${ideas.filter(i => !i.selectedAt).length} ideas`}
                                </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                        </motion.div>

                    </div>

                    {/* Center Column: The Visualization */}
                    <div className="order-1 xl:order-2 flex flex-col items-center justify-center relative py-8">
                        {isVotingMode && userData ? (
                            <div className="w-full max-w-md">
                                <VotingManager
                                    jarId={userData.activeJarId!}
                                    isAdmin={!!userData.isCreator}
                                    userId={userData.id}
                                    onVoteComplete={() => {
                                        refreshUser();
                                        fetchIdeas();
                                    }}
                                    onAddIdea={() => openModal('ADD_IDEA')}
                                />
                            </div>
                        ) : (
                            <>
                                {/* Show empty state message when no ideas */}
                                {!isLoadingIdeas && availableIdeasCount === 0 ? (
                                    <EmptyJarMessage
                                        onOpenTemplates={() => openModal('TEMPLATE_BROWSER')}
                                        onAddIdea={() => openModal('ADD_IDEA')}
                                        isCommunityJar={!!userData?.isCommunityJar}
                                    />
                                ) : (
                                    <>
                                        <div className="relative w-full aspect-square max-w-[450px] flex items-center justify-center">
                                            {/* Cinematic Podium / Stage */}
                                            <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[70%] h-[15%] rounded-[100%] bg-gradient-to-t from-slate-200 dark:from-white/10 to-transparent blur-md opacity-50" />
                                            <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[40%] h-[20px] rounded-[100%] bg-slate-400/20 dark:bg-white/5 blur-sm" />

                                            {/* Decorative Rings */}
                                            <div className="absolute inset-0 border-[1px] border-slate-200 dark:border-white/5 rounded-full scale-[0.85] opacity-50 animate-[spin_20s_linear_infinite]" />
                                            <div className="absolute inset-0 border-[1px] border-slate-200 dark:border-white/5 rounded-full scale-[0.95] opacity-20 animate-[spin_30s_linear_infinite_reverse]" />

                                            <div className="relative z-10 scale-110 transform transition-all hover:scale-125 duration-700 cursor-help">
                                                <Jar3D />
                                            </div>
                                        </div>
                                        <div className="mt-4 relative z-10 text-center">
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex flex-col items-center"
                                            >
                                                {isLoadingIdeas ? (
                                                    <div className="h-12 flex items-center justify-center">
                                                        <div className="flex gap-1">
                                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-5xl font-black text-slate-900 dark:text-white drop-shadow-sm">{availableIdeasCount}</p>
                                                )}
                                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mt-1">Ready for Selection</p>

                                                {/* Mobile Spin Button */}
                                                {!isVotingMode && !isAllocationMode && !isAdminPickMode && !userData?.isCommunityJar && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.2 }}
                                                        className="mt-6 xl:hidden w-full max-w-[280px]"
                                                    >
                                                        <Button
                                                            onClick={() => availableIdeasCount > 0 && openModal('FILTERS')}
                                                            disabled={availableIdeasCount === 0 || isLoadingIdeas}
                                                            className="w-full h-14 rounded-full text-lg font-bold shadow-xl shadow-pink-500/20 bg-gradient-to-r from-pink-500 to-rose-600 border-none hover:opacity-90 transition-opacity"
                                                        >
                                                            <Sparkles className={`w-5 h-5 mr-2 ${isSpinning ? 'animate-spin' : ''}`} />
                                                            {isSpinning ? 'Spinning...' : 'Spin the Jar'}
                                                        </Button>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>


                    {/* Right Column: Action & History */}
                    <div className="space-y-6 order-3 xl:order-3">
                        {/* Desktop Spin Button (Hidden on Mobile) */}
                        <div className="hidden xl:block">
                            {userData?.jarSelectionMode === 'ALLOCATION' && userData?.memberships?.find((m: any) => m.jarId === userData.activeJarId)?.role === 'ADMIN' && (
                                <Button
                                    onClick={() => openModal('ADMIN_CONTROLS')}
                                    className="w-full mb-4 bg-slate-800 hover:bg-slate-700 text-white border-2 border-slate-700 hover:border-slate-600 h-16 rounded-2xl text-lg font-bold shadow-lg shadow-black/20"
                                >
                                    <Users className="w-6 h-6 mr-2" />
                                    Distribute Tasks
                                </Button>
                            )}

                            {/* Community Jar Admin Button */}
                            {userData?.isCommunityJar && userData?.isCreator && (
                                <Button
                                    onClick={() => openModal('COMMUNITY_ADMIN')}
                                    className="w-full mb-4 bg-violet-800 hover:bg-violet-700 text-white border-2 border-violet-700 hover:border-violet-600 h-16 rounded-2xl text-lg font-bold shadow-lg shadow-violet-900/20 flex items-center justify-center gap-3"
                                >
                                    <Shield className="w-6 h-6" />
                                    Manage Community
                                </Button>
                            )}

                            {isAdminPickMode && (
                                userData?.isCreator ? (
                                    <Button
                                        onClick={() => router.push('/jar')}
                                        className="w-full relative overflow-hidden rounded-2xl p-6 flex flex-row items-center justify-start gap-4 transition-all cursor-pointer border shadow-lg group bg-gradient-to-br from-amber-500/10 to-amber-600/20 dark:from-amber-500/20 dark:to-amber-700/40 border-amber-500/20 hover:border-amber-500/50 h-auto"
                                    >
                                        <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-200 border border-amber-500/20 dark:border-amber-500/30">
                                            <Crown className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <span className="block text-lg font-bold text-amber-900 dark:text-amber-100">Pick a Winner</span>
                                            <span className="text-sm text-amber-700/70 dark:text-amber-200/60">
                                                {availableIdeasCount} ideas waiting for your decision
                                            </span>
                                        </div>
                                    </Button>
                                ) : (
                                    <div
                                        className="w-full relative overflow-hidden rounded-2xl p-6 flex flex-row items-center justify-start gap-4 border shadow-lg bg-slate-800/20 border-slate-700 opacity-70 cursor-not-allowed"
                                    >
                                        <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-slate-700 text-slate-400 border border-slate-600">
                                            <Lock className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <span className="block text-lg font-bold text-slate-400">Waiting for Admin</span>
                                            <span className="text-sm text-slate-500">
                                                Admin will pick the winner
                                            </span>
                                        </div>
                                    </div>
                                )
                            )}

                            {!isVotingMode && !isAllocationMode && !isAdminPickMode && !userData?.isCommunityJar && (
                                <motion.button
                                    whileHover={availableIdeasCount > 0 ? { scale: 1.02 } : {}}
                                    whileTap={availableIdeasCount > 0 ? { scale: 0.95 } : {}}
                                    onClick={() => availableIdeasCount > 0 && openModal('FILTERS')}
                                    className={`w-full relative overflow-hidden rounded-2xl p-6 flex flex-row items-center justify-start gap-4 transition-all cursor-pointer border shadow-lg group ${availableIdeasCount > 0
                                        ? 'bg-gradient-to-br from-pink-600/20 to-pink-900/40 border-pink-500/30 hover:border-pink-500/50 shadow-pink-900/10'
                                        : 'bg-slate-800/20 border-slate-700 opacity-50 grayscale cursor-not-allowed'}`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center relative z-10 border transition-transform group-hover:scale-110 ${availableIdeasCount > 0 ? 'bg-pink-500/20 text-pink-200 border-pink-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                                        <Sparkles className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
                                    </div>
                                    <div className="text-left relative z-10">
                                        <span className={`block text-lg font-bold transition-colors flex items-center gap-2 ${availableIdeasCount > 0 ? 'text-pink-900 dark:text-white group-hover:text-pink-700 dark:group-hover:text-pink-200' : 'text-slate-400'}`}>
                                            {isSpinning ? 'Spinning...' : isLoadingIdeas ? 'Loading...' : 'Spin the Jar'}
                                            {!isSpinning && !isLoadingIdeas && availableIdeasCount > 0 && <span className="bg-pink-500/30 text-pink-700 dark:text-pink-200 text-[10px] px-1.5 py-0.5 rounded-full font-bold">+5 XP</span>}
                                        </span>
                                        <span className={`text-sm transition-colors leading-tight ${availableIdeasCount > 0 ? 'text-pink-700 dark:text-pink-200/60 group-hover:text-pink-900 dark:group-hover:text-pink-200/80' : 'text-slate-500'}`}>Let fate decide</span>
                                    </div>
                                </motion.button>
                            )}

                            {isAllocationMode && (
                                <Button
                                    onClick={() => router.push('/jar')}
                                    className="w-full relative overflow-hidden rounded-2xl p-6 flex flex-row items-center justify-start gap-4 transition-all cursor-pointer border shadow-lg group bg-gradient-to-br from-emerald-600/20 to-emerald-900/40 border-emerald-500/30 hover:border-emerald-500/50 h-auto"
                                >
                                    <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                                        <Layers className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-lg font-bold text-emerald-100">View My Tasks</span>
                                        <span className="text-sm text-emerald-200/60">
                                            You have {availableIdeasCount} assigned tasks
                                        </span>
                                    </div>
                                </Button>
                            )}
                        </div>

                        {!userData?.isCommunityJar && (
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push('/memories')}
                                className="glass-card p-6 hidden md:flex items-center gap-4 cursor-pointer group hover:bg-white/10"
                            >
                                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/30 transition-colors shrink-0">
                                    <History className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Vault</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">
                                        {isLoadingIdeas ? "Loading..." : `${ideas.filter(i => i.selectedAt).length} completed`}
                                    </p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Lower Section: Smart Tools Grid */}
                {!userData?.isCommunityJar && (
                    <SmartToolsGrid
                        isPremium={isPremium}
                        jarTopic={jarTopic ?? 'General'}
                        activityPlannerTitle={activityPlannerTitle}
                    />
                )}
            </div>

            {/* Setup / Personalize Prompts (Bottom area if needed) */}

            {/* Footer Review CTA */}
            <div className="text-center pb-8 border-t border-slate-200 dark:border-white/5 pt-8 mt-12 space-y-4">
                <button
                    onClick={() => openModal('REVIEW_APP')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium group"
                >
                    <Heart className="w-4 h-4 group-hover:fill-primary transition-colors" />
                    Love Decision Jar? Rate the app!
                </button>

                {userData?.email === 'graemedakers@gmail.com' && (
                    <button
                        onClick={() => {
                            resetConciergeTrial();
                            alert('Demo usage reset for this browser!');
                        }}
                        className="block mx-auto text-xs font-mono text-slate-400 hover:text-red-500 transition-colors"
                    >
                        [Admin] Reset Demo Concierge Trial
                    </button>
                )}
            </div>
        </main>
    );
}
