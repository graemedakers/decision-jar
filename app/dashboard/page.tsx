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
import { NightClubConciergeModal } from "@/components/NightClubConciergeModal";
import { HotelConciergeModal } from "@/components/HotelConciergeModal";
import { MovieConciergeModal } from "@/components/MovieConciergeModal";
import { WellnessConciergeModal } from "@/components/WellnessConciergeModal";
import { FitnessConciergeModal } from "@/components/FitnessConciergeModal";
import { Wine, Disc, Bed, Clapperboard, Leaf, Dumbbell } from "lucide-react";
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
import { HelpCircle, Dices } from "lucide-react";
import { JarSwitcher } from "@/components/JarSwitcher";
import { getThemeForTopic } from "@/lib/categories";
import { QuickDecisionsModal } from "@/components/QuickDecisionsModal";
import { VotingManager } from "@/components/VotingManager";

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
    const [isNightClubModalOpen, setIsNightClubModalOpen] = useState(false);
    const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
    const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
    const [isWellnessModalOpen, setIsWellnessModalOpen] = useState(false);
    const [isFitnessModalOpen, setIsFitnessModalOpen] = useState(false);
    const [isDateNightOpen, setIsDateNightOpen] = useState(false);
    const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
    const [isSurpriseModalOpen, setIsSurpriseModalOpen] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isQuickToolsOpen, setIsQuickToolsOpen] = useState(false);
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

    const jarTopic = userData?.jarTopic;
    const jarSelectionMode = userData?.jarSelectionMode;
    const isVotingMode = jarSelectionMode === 'VOTING';
    const theme = getThemeForTopic(jarTopic);

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

    // Previously calculated
    // const activeMembership = ...
    // const jarTopic = ...

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pb-32 relative overflow-hidden w-full transition-colors duration-500">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 dark:bg-primary/20 blur-[120px] rounded-full animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 dark:bg-accent/20 blur-[120px] rounded-full animate-pulse-slow delay-700" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            </div>

            <div className="relative z-10 w-full max-w-[1400px] mx-auto">
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
                    customCategories={userData?.customCategories}
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
                    currentUser={userData}
                />

                <SurpriseMeModal
                    isOpen={isSurpriseModalOpen}
                    onClose={() => setIsSurpriseModalOpen(false)}
                    onIdeaAdded={fetchIdeas}
                    initialLocation={userLocation || ""}
                    jarTopic={jarTopic}
                    customCategories={userData?.customCategories}
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

                <QuickDecisionsModal
                    isOpen={isQuickToolsOpen}
                    onClose={() => setIsQuickToolsOpen(false)}
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

                <NightClubConciergeModal
                    isOpen={isNightClubModalOpen}
                    onClose={() => {
                        setIsNightClubModalOpen(false);
                    }}
                    userLocation={combinedLocation || undefined}
                    onIdeaAdded={handleContentUpdate}
                    onGoTonight={(idea) => {
                        setSelectedIdea(idea);
                    }}
                    onFavoriteUpdated={fetchFavorites}
                />

                <HotelConciergeModal
                    isOpen={isHotelModalOpen}
                    onClose={() => {
                        setIsHotelModalOpen(false);
                    }}
                    userLocation={combinedLocation || undefined}
                    onIdeaAdded={handleContentUpdate}
                    onGoTonight={(idea) => {
                        setSelectedIdea(idea);
                    }}
                    onFavoriteUpdated={fetchFavorites}
                />

                <MovieConciergeModal
                    isOpen={isMovieModalOpen}
                    onClose={() => {
                        setIsMovieModalOpen(false);
                    }}
                    userLocation={combinedLocation || undefined}
                    onIdeaAdded={handleContentUpdate}
                    onGoTonight={(idea) => {
                        setSelectedIdea(idea);
                    }}
                    onFavoriteUpdated={fetchFavorites}
                />

                <WellnessConciergeModal
                    isOpen={isWellnessModalOpen}
                    onClose={() => {
                        setIsWellnessModalOpen(false);
                    }}
                    userLocation={combinedLocation || undefined}
                    onIdeaAdded={handleContentUpdate}
                    onGoTonight={(idea) => {
                        setSelectedIdea(idea);
                    }}
                    onFavoriteUpdated={fetchFavorites}
                />

                <FitnessConciergeModal
                    isOpen={isFitnessModalOpen}
                    onClose={() => {
                        setIsFitnessModalOpen(false);
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
                    jarTopic={jarTopic}
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

                {/* Background Elements removed from here and moved to top-level for better coverage */}

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
                                <Button variant="ghost" size="sm" className="!p-2 rounded-full hover:bg-white/10" title="Quick Tools" onClick={() => setIsQuickToolsOpen(true)}>
                                    <Dices className="w-5 h-5 text-slate-400" />
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
                <div className="flex flex-col gap-12">

                    {/* Mobile: Spin Button at Top - Compact Banner Style (Hide if Voting) */}
                    <div className="xl:hidden">
                        {!isVotingMode && (
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
                        <div className="order-1 xl:order-2 flex flex-col items-center justify-center relative py-8">
                            {isVotingMode && userData ? (
                                <div className="w-full max-w-md">
                                    <VotingManager
                                        jarId={userData.activeJarId!}
                                        isAdmin={userData.isCreator}
                                        userId={userData.id}
                                        onVoteComplete={() => {
                                            refreshUser();
                                            fetchIdeas();
                                        }}
                                        onAddIdea={() => setIsModalOpen(true)}
                                    />
                                </div>
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
                                            <p className="text-5xl font-black text-slate-900 dark:text-white drop-shadow-sm">{availableIdeasCount}</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mt-1">Ready for Selection</p>
                                        </motion.div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Right Column: Action & History */}
                        <div className="space-y-6 order-3 xl:order-3">
                            {/* Desktop Spin Button (Hidden on Mobile) */}
                            <div className="hidden xl:block">
                                {!isVotingMode && (
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
                                )}
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
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Vault</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">{ideas.filter(i => i.selectedAt).length} completed</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                            </motion.div>
                        </div>
                    </div>

                    {/* Lower Section: Smart Tools Grid */}
                    <div>
                        <h3 className="text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-8">Executive Decision Suite</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                            <motion.div
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative h-full"
                                onClick={() => isPremium ? setIsPlannerOpen(true) : setIsPremiumModalOpen(true)}
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-b from-purple-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500" />
                                <div className="relative h-full bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col gap-6 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/10 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500 shadow-inner">
                                            <Calendar className="w-7 h-7" />
                                        </div>
                                        {!isPremium && <Lock className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
                                    </div>
                                    <div>
                                        <span className="block text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">Weekend Planner</span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed block">Hand-picked events and activities for your next adventure.</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative h-full"
                                onClick={() => isPremium ? setIsDiningModalOpen(true) : setIsPremiumModalOpen(true)}
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-b from-orange-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500" />
                                <div className="relative h-full bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col gap-6 cursor-pointer hover:shadow-2xl hover:shadow-orange-500/10 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 ring-1 ring-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 shadow-inner">
                                            <Utensils className="w-7 h-7" />
                                        </div>
                                        {!isPremium && <Lock className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
                                    </div>
                                    <div>
                                        <span className="block text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">Dining Concierge</span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed block">Find the perfect breakfast, lunch or dinner spot nearby.</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative h-full"
                                onClick={() => isPremium ? setIsBarModalOpen(true) : setIsPremiumModalOpen(true)}
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-b from-pink-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500" />
                                <div className="relative h-full bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col gap-6 cursor-pointer hover:shadow-2xl hover:shadow-pink-500/10 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400 ring-1 ring-pink-500/20 group-hover:bg-pink-500 group-hover:text-white transition-all duration-500 shadow-inner">
                                            <Wine className="w-7 h-7" />
                                        </div>
                                        {!isPremium && <Lock className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
                                    </div>
                                    <div>
                                        <span className="block text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">Bar Scout</span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed block">The ultimate guide to bars and social venues nearby.</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative h-full"
                                onClick={() => isPremium ? setIsDateNightOpen(true) : setIsPremiumModalOpen(true)}
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-b from-rose-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500" />
                                <div className="relative h-full bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col gap-6 cursor-pointer hover:shadow-2xl hover:shadow-rose-500/10 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500 shadow-inner">
                                            <Moon className="w-7 h-7" />
                                        </div>
                                        {!isPremium && <Lock className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
                                    </div>
                                    <div>
                                        <span className="block text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">Activity Planner</span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed block">Step-by-step itineraries for any occasion.</span>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative h-full"
                                onClick={() => isPremium ? setIsNightClubModalOpen(true) : setIsPremiumModalOpen(true)}
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-b from-indigo-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500" />
                                <div className="relative h-full bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col gap-6 cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500 shadow-inner">
                                            <Disc className="w-7 h-7" />
                                        </div>
                                        {!isPremium && <Lock className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
                                    </div>
                                    <div>
                                        <span className="block text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">Nightclub Scout</span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed block">Discover the hottest clubs and dance venues.</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative h-full"
                                onClick={() => isPremium ? setIsHotelModalOpen(true) : setIsPremiumModalOpen(true)}
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-b from-cyan-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500" />
                                <div className="relative h-full bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col gap-6 cursor-pointer hover:shadow-2xl hover:shadow-cyan-500/10 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 ring-1 ring-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500 shadow-inner">
                                            <Bed className="w-7 h-7" />
                                        </div>
                                        {!isPremium && <Lock className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
                                    </div>
                                    <div>
                                        <span className="block text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">Hotel Finder</span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed block">Find the perfect stay for your getaway.</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative h-full"
                                onClick={() => isPremium ? setIsMovieModalOpen(true) : setIsPremiumModalOpen(true)}
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-b from-red-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500" />
                                <div className="relative h-full bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col gap-6 cursor-pointer hover:shadow-2xl hover:shadow-red-500/10 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 ring-1 ring-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-all duration-500 shadow-inner">
                                            <Clapperboard className="w-7 h-7" />
                                        </div>
                                        {!isPremium && <Lock className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
                                    </div>
                                    <div>
                                        <span className="block text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">Movie Scout</span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed block">Find the best movies and cinemas playing near you.</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative h-full"
                                onClick={() => isPremium ? setIsWellnessModalOpen(true) : setIsPremiumModalOpen(true)}
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-b from-emerald-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500" />
                                <div className="relative h-full bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col gap-6 cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/10 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-inner">
                                            <Leaf className="w-7 h-7" />
                                        </div>
                                        {!isPremium && <Lock className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
                                    </div>
                                    <div>
                                        <span className="block text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">Wellness</span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed block">Find spas, yoga, and relaxation spots.</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative h-full"
                                onClick={() => isPremium ? setIsFitnessModalOpen(true) : setIsPremiumModalOpen(true)}
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-b from-orange-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500" />
                                <div className="relative h-full bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col gap-6 cursor-pointer hover:shadow-2xl hover:shadow-orange-500/10 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 ring-1 ring-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 shadow-inner">
                                            <Dumbbell className="w-7 h-7" />
                                        </div>
                                        {!isPremium && <Lock className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
                                    </div>
                                    <div>
                                        <span className="block text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">Fitness</span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed block">Gyms, trails, and classes to get you moving.</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Setup / Personalize Prompts (Bottom area if needed) */}

                    {/* Footer Review CTA */}
                    <div className="text-center pb-8 border-t border-slate-200 dark:border-white/5 pt-8 mt-12">
                        <button
                            onClick={() => setIsReviewModalOpen(true)}
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium group"
                        >
                            <Heart className="w-4 h-4 group-hover:fill-primary transition-colors" />
                            Love Decision Jar? Rate the app!
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
