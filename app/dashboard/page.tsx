"use client";

import { Button } from "@/components/ui/Button";
import { getApiUrl } from "@/lib/utils";
import { AddIdeaModal } from "@/components/AddIdeaModal";
import { motion } from "framer-motion";
import { Plus, Settings, LogOut, Sparkles, Lock, Trash2, Copy, Calendar, Activity, Utensils, Check, Star, ArrowRight, History, Layers } from "lucide-react";
import { useState, useEffect } from "react";
import { Jar3D } from "@/components/Jar3D";
import { useRouter } from "next/navigation";
import { DateReveal } from "@/components/DateReveal";
import { SpinFiltersModal } from "@/components/SpinFiltersModal";
import { SettingsModal } from "@/components/SettingsModal";
import { WeekendPlannerModal } from "@/components/WeekendPlannerModal";
import { RateDateModal } from "@/components/RateDateModal";
import { PremiumModal } from "@/components/PremiumModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { DiningConciergeModal } from "@/components/DiningConciergeModal";
import { BarConciergeModal } from "@/components/BarConciergeModal";
import { Wine } from "lucide-react";
import { PremiumBanner } from "@/components/PremiumBanner";
import { DateNightPlannerModal } from "@/components/DateNightPlannerModal";
import { Moon, Heart } from "lucide-react";
import { FavoritesModal } from "@/components/FavoritesModal";
import { SurpriseMeModal } from "@/components/SurpriseMeModal";
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LevelBanner } from "@/components/Gamification/LevelBanner";
import { LevelUpModal } from "@/components/Gamification/LevelUpModal";
import { AchievementCase } from "@/components/Gamification/AchievementCase";
import { CollapsibleTrophyCase } from "@/components/Gamification/CollapsibleTrophyCase";
import { ReviewAppModal } from "@/components/ReviewAppModal";
import { HelpModal } from "@/components/HelpModal";
import { HelpCircle } from "lucide-react";
import { JarSwitcher } from "@/components/JarSwitcher";

interface UserData {
    id: string;
    activeJarId: string | null;
    memberships: any[];
    jarType?: 'ROMANTIC' | 'SOCIAL';
    [key: string]: any;
}

function InviteCodeDisplay({ mobile, code }: { mobile?: boolean; code: string | null }) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        if (!code) return;
        const url = `${window.location.origin}/signup?code=${code}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!code) return null;

    if (mobile) {
        return (
            <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 active:scale-95 transition-all"
            >
                <span className="text-xs text-slate-400">Invite Partner:</span>
                <span className="text-sm font-mono text-white font-bold">{code}</span>
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
            </button>
        );
    }

    return (
        <button onClick={copyToClipboard} className="flex items-center gap-2 hover:text-white transition-colors group" title="Click to copy invite link">
            <span>{code}</span>
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-500 group-hover:text-white" />}
        </button>
    );
}

export default function DashboardPage() {
    const [ideas, setIdeas] = useState<any[]>([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState<any>(null);
    const [userLocation, setUserLocation] = useState<string | null>(null);
    const [interests, setInterests] = useState<string | null>(null);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [editingIdea, setEditingIdea] = useState<any>(null);
    const [ratingIdea, setRatingIdea] = useState<any>(null);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPlannerOpen, setIsPlannerOpen] = useState(false);
    const [isDiningModalOpen, setIsDiningModalOpen] = useState(false);
    const [isBarModalOpen, setIsBarModalOpen] = useState(false);
    const [isDateNightOpen, setIsDateNightOpen] = useState(false);
    const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
    const [isSurpriseModalOpen, setIsSurpriseModalOpen] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const router = useRouter();

    const [diningSearchLocation, setDiningSearchLocation] = useState<string | null>(null);

    const [favoritesCount, setFavoritesCount] = useState(0);
    const [userData, setUserData] = useState<UserData | null>(null);

    // New state for Premium Banner
    const [hasPaid, setHasPaid] = useState(false);
    const [coupleCreatedAt, setCoupleCreatedAt] = useState<string>("");
    const [isTrialEligible, setIsTrialEligible] = useState(true);
    const [xp, setXp] = useState<number | undefined>(undefined);
    const [level, setLevel] = useState(1);
    const [achievements, setAchievements] = useState<string[]>([]);
    const [showLevelUp, setShowLevelUp] = useState(false);

    const fetchIdeas = async () => {
        try {
            const res = await fetch(getApiUrl('/api/ideas'), { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setIdeas(data);
            }
        } catch (error) {
            console.error('Failed to fetch ideas', error);
        }
    };

    const fetchFavorites = async () => {
        try {
            const res = await fetch(getApiUrl('/api/favorites'), { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setFavoritesCount(data.length);
            }
        } catch (error) {
            console.error('Failed to fetch favorites', error);
        }
    };

    const refreshUser = async () => {
        try {
            const res = await fetch(`${getApiUrl('/api/auth/me')}?_=${Date.now()}`, {
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
            });
            if (!res.ok) throw new Error('Failed to fetch user');
            const data = await res.json();

            if (data?.user) {
                setUserData(data.user);
                if (data.user.location) {
                    setUserLocation(data.user.location);
                    localStorage.setItem('datejar_user_location', data.user.location);
                }
                if (data.user.coupleReferenceCode) setInviteCode(data.user.coupleReferenceCode);
                if (data.user.interests) setInterests(data.user.interests);
                const userIsPremium = !!data.user.isPremium;
                setIsPremium(userIsPremium);
                localStorage.setItem('datejar_is_premium', userIsPremium.toString());
            } else {
                // Middleware let us through, but API says invalid. Logout and Redirect.
                console.warn("Invalid session detected on dashboard. Logging out.");
                await fetch(getApiUrl('/api/auth/logout'), { method: 'POST' });
                window.location.href = '/';
                return;
            }

            setHasPaid(!!data.user.hasPaid);
            setCoupleCreatedAt(data.user.coupleCreatedAt);
            setIsTrialEligible(data.user.isTrialEligible !== false);

            if (data.user.xp !== undefined) {
                setXp(data.user.xp);
                localStorage.setItem('datejar_xp', data.user.xp.toString());
            }
            if (data.user.unlockedAchievements) {
                setAchievements(data.user.unlockedAchievements);
                localStorage.setItem('datejar_achievements', JSON.stringify(data.user.unlockedAchievements));
            }
            if (data.user.level !== undefined) {
                const newLevel = data.user.level;
                setLevel(newLevel);

                const storedLevelStr = localStorage.getItem('datejar_user_level');
                if (storedLevelStr) {
                    const storedLevel = parseInt(storedLevelStr, 10);
                    if (newLevel > storedLevel) {
                        setShowLevelUp(true);
                        // Don't update localStorage here - wait for modal close
                    } else if (newLevel === storedLevel) {
                        // Level hasn't changed, no action needed
                    } else {
                        // Level went down somehow, sync it
                        localStorage.setItem('datejar_user_level', newLevel.toString());
                    }
                } else {
                    // First time, just store it without showing modal
                    localStorage.setItem('datejar_user_level', newLevel.toString());
                }
            }
            // End of logic

        } catch (err) {
            console.error("Error fetching user:", err);
        }
    };

    const handleContentUpdate = () => {
        fetchIdeas();
        refreshUser();
    };

    useEffect(() => {
        fetchIdeas();
        fetchFavorites();

        // Check for Stripe success return
        const params = new URLSearchParams(window.location.search);
        const success = params.get('success');
        const sessionId = params.get('session_id');

        const init = async () => {
            // Optimistic Load from Cache
            try {
                const cachedXp = localStorage.getItem('datejar_xp');
                const cachedLevel = localStorage.getItem('datejar_user_level');
                const cachedAch = localStorage.getItem('datejar_achievements');
                const cachedPremium = localStorage.getItem('datejar_is_premium');
                const cachedLocation = localStorage.getItem('datejar_user_location');

                if (cachedXp) setXp(parseInt(cachedXp, 10));
                if (cachedLevel) setLevel(parseInt(cachedLevel, 10));
                if (cachedAch) setAchievements(JSON.parse(cachedAch));
                if (cachedPremium) setIsPremium(cachedPremium === 'true');
                if (cachedLocation) setUserLocation(cachedLocation);
            } catch (e) {
                // Ignore cache errors
            }

            setIsLoadingUser(true);

            if (success && sessionId) {
                try {
                    // Manually sync stripe status immediately
                    await fetch(`${getApiUrl('/api/stripe/sync')}?session_id=${sessionId}`);
                    // Clear params from URL without refresh
                    window.history.replaceState({}, '', '/dashboard');
                } catch (e) {
                    console.error("Sync failed", e);
                }
            }

            await refreshUser();
            setIsLoadingUser(false);
        };

        init();
    }, []);

    const handleCloseLevelUp = () => {
        setShowLevelUp(false);
        localStorage.setItem('datejar_user_level', level.toString());
    };

    const handleLogout = async () => {
        await fetch(getApiUrl('/api/auth/logout'), { method: 'POST' });
        router.push('/');
        router.refresh();
    };

    const handleSpinJar = async (filters: { maxDuration?: number; maxCost?: string; maxActivityLevel?: string; timeOfDay?: string; category?: string } = {}) => {
        if (ideas.length === 0) {
            alert("Add some ideas first!");
            return;
        }
        setIsSpinning(true);
        try {
            await Haptics.impact({ style: ImpactStyle.Heavy });
        } catch (e) {
            // Ignore haptic errors on web
        }
        // Simulate animation
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const res = await fetch(getApiUrl('/api/pick-date'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters),
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setSelectedIdea(data);
                handleContentUpdate(); // Refresh to show idea as used (removed from list)
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Failed to pick a date. Try adding more ideas!");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSpinning(false);
        }
    };

    const [ideaToDelete, setIdeaToDelete] = useState<string | null>(null);

    const handleDeleteClick = (id: string) => {
        setIdeaToDelete(id);
    };

    const confirmDelete = async () => {
        if (!ideaToDelete) return;

        try {
            const res = await fetch(getApiUrl(`/api/ideas/${ideaToDelete}`), {
                method: 'DELETE',
                credentials: 'include',
            });

            if (res.ok) {
                fetchIdeas();
            } else {
                const data = await res.json();
                alert(`Failed to delete idea: ${data.error || "Unknown error"}`);
                console.error("Delete failed:", data);
            }
        } catch (error: any) {
            console.error("Error deleting idea:", error);
            alert(`Error deleting idea: ${error.message}`);
        } finally {
            setIdeaToDelete(null);
        }
    };

    const handleDuplicate = (idea: any) => {
        // Create a copy of the idea without the ID, so the modal treats it as a new entry
        const { id, selectedAt, selectedDate, createdBy, createdAt, updatedAt, ...ideaData } = idea;
        setEditingIdea(ideaData);
    };

    const handleAddIdeaClick = () => {
        setIsModalOpen(true);
    };

    const availableIdeasCount = ideas.filter(i => !i.selectedAt).length;

    const combinedLocation = userLocation || "";

    const activeMembership = userData?.memberships?.find((m: any) => m.jarId === userData.activeJarId) || userData?.memberships?.[0];
    const jarTopic = activeMembership?.jar?.topic;

    return (
        <main className="min-h-screen p-4 md:p-8 pb-24 relative overflow-hidden w-full max-w-[1600px] mx-auto">
            <PremiumModal
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
            />

            <ReviewAppModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
            />

            <HelpModal
                isOpen={isHelpOpen}
                onClose={() => setIsHelpOpen(false)}
                initialSection="dashboard"
            />


            <FavoritesModal
                isOpen={isFavoritesOpen}
                onClose={() => {
                    setIsFavoritesOpen(false);
                    fetchFavorites();
                }}
            />

            <AddIdeaModal
                isOpen={isModalOpen || !!editingIdea}
                jarTopic={jarTopic}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingIdea(null);
                    handleContentUpdate(); // Refresh list after adding
                }}
                initialData={editingIdea}
                isPremium={isPremium}
                onUpgrade={() => {
                    setIsModalOpen(false);
                    setIsPremiumModalOpen(true);
                }}
            />

            <SurpriseMeModal
                isOpen={isSurpriseModalOpen}
                onClose={() => setIsSurpriseModalOpen(false)}
                onIdeaAdded={fetchIdeas}
                initialLocation={userLocation || ""}
                jarTopic={jarTopic}
            />

            <SpinFiltersModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onSpin={handleSpinJar}
                jarTopic={jarTopic}
            />

            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => {
                    setIsSettingsModalOpen(false);
                    // Refresh location
                    fetch(getApiUrl('/api/auth/me'))
                        .then(res => res.json())
                        .then(data => {
                            if (data?.user) {
                                if (data.user.location) setUserLocation(data.user.location);
                                if (data.user.interests) setInterests(data.user.interests);
                            }
                        });
                }}
                currentLocation={userLocation ?? undefined}
            />

            <WeekendPlannerModal
                isOpen={isPlannerOpen}
                onClose={() => setIsPlannerOpen(false)}
                userLocation={combinedLocation || undefined}
                onIdeaAdded={handleContentUpdate}
            />

            <DiningConciergeModal
                isOpen={isDiningModalOpen}
                onClose={() => {
                    setIsDiningModalOpen(false);
                    setDiningSearchLocation(null);
                }}
                userLocation={diningSearchLocation || combinedLocation || undefined}
                onIdeaAdded={handleContentUpdate}
                onGoTonight={(idea) => {
                    setSelectedIdea(idea);
                }}
                onFavoriteUpdated={fetchFavorites}
            />

            <BarConciergeModal
                isOpen={isBarModalOpen}
                onClose={() => {
                    setIsBarModalOpen(false);
                }}
                userLocation={combinedLocation || undefined}
                onIdeaAdded={handleContentUpdate}
                onGoTonight={(idea) => {
                    setSelectedIdea(idea);
                }}
                onFavoriteUpdated={fetchFavorites}
            />

            <DateNightPlannerModal
                isOpen={isDateNightOpen}
                onClose={() => setIsDateNightOpen(false)}
                userLocation={userLocation || undefined}
                onIdeaAdded={handleContentUpdate}
            />

            <RateDateModal
                isOpen={!!ratingIdea}
                onClose={() => {
                    setRatingIdea(null);
                    handleContentUpdate();
                }}
                idea={ratingIdea}
                isPro={isPremium}
            />

            <DateReveal
                idea={selectedIdea}
                onClose={() => setSelectedIdea(null)}
                userLocation={userLocation ?? undefined}
                onFindDining={(location) => {
                    setDiningSearchLocation(location);
                    setIsDiningModalOpen(true);
                    setSelectedIdea(null);
                }}
            />

            <DeleteConfirmModal
                isOpen={!!ideaToDelete}
                onClose={() => setIdeaToDelete(null)}
                onConfirm={confirmDelete}
            />

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <header className="flex flex-col gap-2 mb-6 md:mb-16">
                <div className="flex flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {userData ? (
                            <JarSwitcher
                                user={userData}
                                variant="title"
                                className="min-w-0"
                                onSwitch={handleContentUpdate}
                            />
                        ) : (
                            <h1 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
                        )}
                    </div>

                    <div className="flex gap-2 items-center justify-end">
                        {/* Invite Code available in Settings */}

                        {!isLoadingUser && !isPremium && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-700 dark:text-yellow-200 border-yellow-400/30 hover:bg-yellow-400/30 rounded-full"
                                onClick={() => setIsPremiumModalOpen(true)}
                            >
                                <Sparkles className="w-4 h-4 md:mr-2" />
                                <span className="hidden md:inline">Upgrade</span>
                            </Button>
                        )}

                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="!p-2 rounded-full hover:bg-white/10 md:hidden" onClick={() => setIsHelpOpen(true)}>
                                <HelpCircle className="w-5 h-5 text-slate-400" />
                            </Button>
                            <Button variant="ghost" size="sm" className="!p-2 rounded-full hover:bg-white/10 relative" onClick={() => setIsFavoritesOpen(true)}>
                                <Heart className="w-5 h-5 text-pink-400" />
                                {favoritesCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border border-slate-900 pointer-events-none">
                                        {favoritesCount}
                                    </span>
                                )}
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white border border-slate-300 dark:border-white/10 rounded-full px-2 md:px-4"
                                onClick={() => setIsSettingsModalOpen(true)}
                            >
                                <Settings className="w-4 h-4 md:mr-2" />
                                <span className="hidden md:inline">Personalise</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="!p-2 rounded-full hover:bg-white/10" onClick={handleLogout}>
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>


            </header>

            {/* No Jar Banner */}
            {userData && (!userData.memberships || userData.memberships.length === 0) && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border border-purple-500/20 dark:border-purple-500/30 rounded-2xl"
                >
                    <div className="flex flex-col gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-purple-500" />
                                Welcome! You're not a member of any jar yet.
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                To start adding and spinning ideas, you'll need to join an existing jar or create your own.
                                You can also request an invite from someone who already has a jar.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={() => {
                                    // Trigger jar switcher to open
                                    const trigger = document.querySelector('[role="combobox"]');
                                    if (trigger) (trigger as HTMLElement).click();
                                }}
                                className="bg-purple-500 hover:bg-purple-600 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create or Join a Jar
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Premium Banner */}
            {!isLoadingUser && (
                <div className="mb-4">
                    <PremiumBanner hasPaid={hasPaid} coupleCreatedAt={coupleCreatedAt} isTrialEligible={isTrialEligible} />
                </div>
            )}

            {/* Gamification Level Banner */}
            {/* Gamification Level Banner */}
            {xp !== undefined ? (
                <CollapsibleTrophyCase xp={xp} level={level} unlockedIds={achievements} />
            ) : (
                <div className="w-full mb-6 relative overflow-hidden rounded-xl bg-slate-900/40 border border-white/5 p-4">
                    <div className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-slate-800" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-800 rounded w-1/3" />
                            <div className="h-3 bg-slate-800 rounded w-1/4" />
                        </div>
                    </div>
                </div>
            )}

            <LevelUpModal
                isOpen={showLevelUp}
                level={level}
                onClose={handleCloseLevelUp}
            />

            {/* Main Layout Grid */}
            <div className="flex flex-col gap-12 max-w-6xl mx-auto">

                {/* Mobile: Spin Button at Top - Compact Banner Style */}
                <div className="xl:hidden">
                    <motion.button
                        whileHover={availableIdeasCount > 0 ? { scale: 1.02 } : {}}
                        whileTap={availableIdeasCount > 0 ? { scale: 0.95 } : {}}
                        onClick={() => availableIdeasCount > 0 && setIsFilterModalOpen(true)}
                        className={`w-full relative overflow-hidden rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer border shadow-lg group ${availableIdeasCount > 0
                            ? 'bg-gradient-to-r from-pink-600/20 to-pink-900/40 border-pink-500/30 hover:border-pink-500/50 shadow-pink-900/10'
                            : 'bg-slate-800/20 border-slate-700 opacity-50 grayscale cursor-not-allowed'}`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex items-center gap-3 relative z-10">
                            <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center border transition-transform group-hover:scale-110 ${availableIdeasCount > 0 ? 'bg-pink-500/20 text-pink-200 border-pink-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                                <Sparkles className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                            </div>
                            <div className="text-left">
                                <span className={`block text-base font-bold transition-colors flex items-center gap-2 ${availableIdeasCount > 0 ? 'text-pink-900 dark:text-white group-hover:text-pink-700 dark:group-hover:text-pink-200' : 'text-slate-400'}`}>
                                    {isSpinning ? 'Spinning...' : 'Spin the Jar'}
                                </span>
                            </div>
                        </div>

                        {/* Right Side Info */}
                        <div className="relative z-10 flex items-center gap-2">
                            {!isSpinning && availableIdeasCount > 0 && (
                                <span className="bg-pink-500/30 text-pink-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                    +5 XP
                                </span>
                            )}
                            <Sparkles className="w-4 h-4 text-pink-500/50" />
                        </div>
                    </motion.button>
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
                                    Add Idea
                                    <span className="bg-violet-500/30 text-violet-700 dark:text-violet-200 text-[10px] px-1.5 py-0.5 rounded-full font-bold">+15 XP</span>
                                </span>
                                <span className="text-sm text-violet-700 dark:text-violet-200/60 group-hover:text-violet-900 dark:group-hover:text-violet-200/80 transition-colors leading-tight">Fill your jar</span>
                            </div>
                        </motion.button>


                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsSurpriseModalOpen(true)}
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
                                <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">View {ideas.filter(i => !i.selectedAt).length} ideas</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                        </motion.div>

                    </div>

                    {/* Center Column: The Visualization */}
                    <div className="order-1 xl:order-2 flex flex-col items-center justify-center relative">
                        <div className="relative w-full aspect-square max-w-[400px] flex items-center justify-center">
                            {/* Decorative Glow */}
                            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-50 pointer-events-none" />

                            <div className="relative z-10 scale-100 transform transition-transform hover:scale-105 duration-700">
                                <Jar3D />
                            </div>
                        </div>
                        <div className="mt-8 relative z-10 text-center">
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{availableIdeasCount}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">Ideas Waiting</p>
                        </div>
                    </div>

                    {/* Right Column: Action & History */}
                    <div className="space-y-6 order-3 xl:order-3">
                        {/* Desktop Spin Button (Hidden on Mobile) */}
                        <div className="hidden xl:block">
                            <motion.button
                                whileHover={availableIdeasCount > 0 ? { scale: 1.02 } : {}}
                                whileTap={availableIdeasCount > 0 ? { scale: 0.95 } : {}}
                                onClick={() => availableIdeasCount > 0 && setIsFilterModalOpen(true)}
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
                                        {isSpinning ? 'Spinning...' : 'Spin the Jar'}
                                        {!isSpinning && availableIdeasCount > 0 && <span className="bg-pink-500/30 text-pink-700 dark:text-pink-200 text-[10px] px-1.5 py-0.5 rounded-full font-bold">+5 XP</span>}
                                    </span>
                                    <span className={`text-sm transition-colors leading-tight ${availableIdeasCount > 0 ? 'text-pink-700 dark:text-pink-200/60 group-hover:text-pink-900 dark:group-hover:text-pink-200/80' : 'text-slate-500'}`}>Let fate decide</span>
                                </div>
                            </motion.button>
                        </div>

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
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Memories</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">{ideas.filter(i => i.selectedAt).length} dates done</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                        </motion.div>
                    </div>
                </div>

                {/* Lower Section: Smart Tools Grid */}
                <div className="hidden md:block">
                    <h3 className="text-center text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Concierge & Tools</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                        <motion.div
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 flex flex-col gap-4 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-500/40 transition-all shadow-lg shadow-black/5 dark:shadow-black/20"
                            onClick={() => isPremium ? setIsPlannerOpen(true) : setIsPremiumModalOpen(true)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-300 ring-1 ring-purple-500/30">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                {!isPremium && <Lock className="w-5 h-5 text-slate-400" />}
                            </div>
                            <div>
                                <span className="block text-xl font-bold text-slate-900 dark:text-white mb-2">Weekend Planner</span>
                                <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed block group-hover:text-purple-700 dark:group-hover:text-purple-200/70 transition-colors">Discover great ideas of what to do in your area this weekend</span>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-orange-500/20 rounded-2xl p-6 flex flex-col gap-4 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-500/40 transition-all shadow-lg shadow-black/5 dark:shadow-black/20"
                            onClick={() => isPremium ? setIsDiningModalOpen(true) : setIsPremiumModalOpen(true)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-300 ring-1 ring-orange-500/30">
                                    <Utensils className="w-6 h-6" />
                                </div>
                                {!isPremium && <Lock className="w-5 h-5 text-slate-400" />}
                            </div>
                            <div>
                                <span className="block text-xl font-bold text-slate-900 dark:text-white mb-2">Dining Concierge</span>
                                <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed block group-hover:text-orange-700 dark:group-hover:text-orange-200/70 transition-colors">Find the perfect dining spot for breakfast, lunch or dinner</span>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-pink-500/20 rounded-2xl p-6 flex flex-col gap-4 cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-pink-500/40 transition-all shadow-lg shadow-black/5 dark:shadow-black/20"
                            onClick={() => isPremium ? setIsBarModalOpen(true) : setIsPremiumModalOpen(true)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-xl bg-pink-500/10 dark:bg-pink-500/20 flex items-center justify-center text-pink-600 dark:text-pink-300 ring-1 ring-pink-500/30">
                                    <Wine className="w-6 h-6" />
                                </div>
                                {!isPremium && <Lock className="w-5 h-5 text-slate-400" />}
                            </div>
                            <div>
                                <span className="block text-xl font-bold text-slate-900 dark:text-white mb-2">Bar Key</span>
                                <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed block group-hover:text-pink-700 dark:group-hover:text-pink-200/70 transition-colors">Discover top-rated bars and lounges nearby.</span>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-rose-500/20 rounded-2xl p-6 flex flex-col gap-4 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-500/40 transition-all shadow-lg shadow-black/5 dark:shadow-black/20"
                            onClick={() => isPremium ? setIsDateNightOpen(true) : setIsPremiumModalOpen(true)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-300 ring-1 ring-rose-500/30">
                                    <Moon className="w-6 h-6" />
                                </div>
                                {!isPremium && <Lock className="w-5 h-5 text-slate-400" />}
                            </div>
                            <div>

                                <span className="block text-xl font-bold text-slate-900 dark:text-white mb-2">Night Out Planner</span>
                                <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed block group-hover:text-rose-700 dark:group-hover:text-rose-200/70 transition-colors">Plan a complete evening: Drinks, Dinner & Event.</span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Setup / Personalize Prompts (Bottom area if needed) */}

                {/* Footer Review CTA */}
                <div className="text-center pb-8 border-t border-white/5 pt-8 mt-12">
                    <button
                        onClick={() => setIsReviewModalOpen(true)}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-pink-400 transition-colors text-sm font-medium group"
                    >
                        <Heart className="w-4 h-4 group-hover:fill-pink-400 transition-colors" />
                        Love Date Jar? Rate the app!
                    </button>
                </div>
            </div>
        </main>
    );
}
