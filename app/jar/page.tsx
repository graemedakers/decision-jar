"use client";

import { Suspense, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Lock, Trash2, Activity, Utensils, Calendar, Moon, Loader2, Crown, Layers, Move, Clock, CheckCircle, XCircle, Users, Gift, Book, Popcorn, Gamepad2, ChefHat, Plane, Ticket, Music, Map as MapIcon, ListChecks, Check, Share } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EnhancedEmptyState } from "@/components/EnhancedEmptyState";
import { useUser } from "@/hooks/useUser";
import { useIdeas } from "@/hooks/useIdeas";
import { useModalSystem } from "@/components/ModalProvider";
import { useFavorites } from "@/hooks/useFavorites";
import { ACTION_LABELS } from "@/lib/ui-constants";
import { getCategoryDef } from "@/lib/categories";
import { getVenueDetails, getShortHours } from "@/lib/utils";
import { getStandardizedData, suggestIdeaType } from "@/lib/idea-standardizer";
import { showInfo, showError, showSuccess } from "@/lib/toast";
import React from "react";



export default function JarPage() {
    const router = useRouter();
    const [searchParams] = useState(new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''));

    // Custom Hooks
    const { userData, isPremium, refreshUser, isLoading: isLoadingUser, level, hasPaid, coupleCreatedAt, isTrialEligible } = useUser();
    const { ideas, isLoading: isIdeasLoading, isFetching, fetchIdeas } = useIdeas();
    const { favoritesCount, fetchFavorites } = useFavorites();
    const { openModal, closeModal, activeModal } = useModalSystem();

    // Local State
    const [userLocation, setUserLocation] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [availableJars, setAvailableJars] = useState<any[]>([]);

    // Bulk Actions State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Sync location from userData
    useEffect(() => {
        if (userData?.location) {
            setUserLocation(userData.location);
        }
    }, [userData]);

    // Check if we should show QuickStart modal for empty jar
    useEffect(() => {
        if (!isIdeasLoading && ideas.length === 0 && userData?.activeJarId) {
            try {
                // User requested to redirect to dashboard on empty jar instead of showing empty state
                router.push('/dashboard');

                // Legacy QuickStart logic kept but unreachable if we redirect
                // const dismissed = localStorage.getItem(`quickstart_dismissed_${userData.activeJarId}`);
                // if (!dismissed) {
                //    openModal('JAR_QUICKSTART', { ... });
                // }
            } catch (e) { }
        }
    }, [ideas.length, isIdeasLoading, userData?.activeJarId, router]);

    useEffect(() => {
        const fetchAvailableJars = async () => {
            try {
                const res = await fetch('/api/jars/list');
                if (res.ok) {
                    const data = await res.json();
                    setAvailableJars(data || []);
                }
            } catch (error) {
                console.error('Failed to fetch jars', error);
            }
        };
        fetchAvailableJars();
        fetchAvailableJars();
    }, []);

    // Check for Gift Acceptance
    useEffect(() => {
        const newGift = searchParams.get('newGift');
        if (newGift) {
            setShowConfetti(true);
            // Clean URL
            const url = new URL(window.location.href);
            url.searchParams.delete('newGift');
            window.history.replaceState({}, '', url);
        }
    }, [searchParams]);

    const handleContentUpdate = () => {
        fetchIdeas();
        refreshUser();
    };

    const handleGoTonight = async (e: React.MouseEvent, idea: any) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/ideas/${idea.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selectedAt: new Date().toISOString(),
                    selectedDate: new Date().toISOString(),
                    userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }),
                credentials: 'include',
            });

            if (res.ok) {
                const updatedIdea = await res.json();
                await fetchIdeas();
                // Show the reveal modal instead of redirecting
                openModal('DATE_REVEAL', { idea: { ...idea, ...updatedIdea }, isDirectSelection: true });
            } else {
                let errorMessage = "Failed to start date night";

                if (res.status === 429) {
                    errorMessage = "Patience! You can only open one mystery idea per day. Come back tomorrow!";
                }

                try {
                    const clonedRes = res.clone();
                    const errData = await clonedRes.json();
                    errorMessage = errData.error || (typeof errData === 'string' ? errData : errorMessage);
                } catch (e) {
                    const rawText = await res.text().catch(() => null);
                    if (rawText) errorMessage = rawText;
                }
                showError(errorMessage);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleApprove = async (e: React.MouseEvent, ideaId: string) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/ideas/${ideaId}/approve`, { method: 'POST' });
            if (res.ok) {
                fetchIdeas();
            } else {
                alert("Failed to approve idea.");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleReject = async (e: React.MouseEvent, ideaId: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to reject this submission? It will be archived.")) return;
        try {
            const res = await fetch(`/api/ideas/${ideaId}/reject`, { method: 'POST' });
            if (res.ok) {
                fetchIdeas();
            } else {
                alert("Failed to reject idea.");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const toggleSelection = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} ideas? This cannot be undone.`)) return;

        try {
            const res = await fetch('/api/ideas/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ideaIds: Array.from(selectedIds) })
            });

            if (res.ok) {
                const data = await res.json();
                // alert(data.message); // Optional: show success message
                setSelectedIds(new Set());
                setIsSelectionMode(false);
                fetchIdeas();
            } else {
                const err = await res.json();
                alert(`Failed to delete: ${err.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Bulk delete failed:', error);
            alert('Failed to delete ideas');
        }
    };

    const activeIdeas = ideas.filter(i => !i.selectedAt);
    const isAdminPickMode = userData?.jarSelectionMode === 'ADMIN_PICK';
    const isAdmin = !!userData?.isCreator;
    const hasPartner = !!userData?.partnerName;
    const isLoading = isIdeasLoading || isLoadingUser;

    return (
        <main className="page-with-nav min-h-screen bg-slate-50 dark:bg-slate-950 px-4 md:px-8 relative overflow-hidden w-full max-w-5xl mx-auto transition-colors duration-500">
            {/* Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 dark:bg-primary/20 blur-[120px] rounded-full animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 dark:bg-accent/20 blur-[120px] rounded-full animate-pulse-slow delay-700" />
            </div>

            <div className="mb-8 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-white dark:bg-white/5 shadow-sm border border-slate-200 dark:border-white/10 hidden md:flex"
                        onClick={() => router.push('/dashboard')}
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">In the Jar</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{isLoading ? '...' : activeIdeas.length} ideas waiting</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {userData?.activeJarId && isAdmin && (
                        <Button
                            onClick={() => openModal('GIFT_JAR', {
                                jarId: userData.activeJarId,
                                jarName: userData.jarName || 'My Jar',
                                ideaCount: ideas.filter(i => i.status === 'APPROVED').length
                            })}
                            variant="outline"
                            className="border-slate-200 dark:border-white/10 rounded-full font-bold h-11 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                        >
                            <Gift className="w-4 h-4" />
                            <span className="hidden sm:inline">Gift Jar</span>
                        </Button>
                    )}

                    {userData?.activeJarId && isAdmin && (
                        <Button
                            onClick={() => openModal('JAR_MEMBERS')}
                            variant="outline"
                            className="border-slate-200 dark:border-white/10 rounded-full font-bold h-11 flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                        >
                            <Share className="w-4 h-4" />
                            <span className="hidden sm:inline">Share Jar</span>
                        </Button>
                    )}

                    {/* Add Idea button removed */}

                    {userData?.activeJarId && isAdmin && (
                        <Button
                            onClick={() => openModal('JAR_MEMBERS')}
                            variant="outline"
                            className="border-slate-200 dark:border-white/10 rounded-full font-bold h-11 flex items-center gap-2"
                        >
                            <Users className="w-4 h-4" />
                            <span className="hidden sm:inline">Members</span>
                        </Button>
                    )}

                    {/* Bulk Actions Toggle */}
                    {activeIdeas.length > 0 && isAdmin && (
                        <>
                            <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-1" />

                            {isSelectionMode ? (
                                <>
                                    <Button
                                        onClick={handleBulkDelete}
                                        disabled={selectedIds.size === 0}
                                        className="rounded-full font-bold h-11 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="hidden sm:inline">Delete ({selectedIds.size})</span>
                                        <span className="sm:hidden">({selectedIds.size})</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setIsSelectionMode(false);
                                            setSelectedIds(new Set());
                                        }}
                                        className="rounded-full h-11 w-11 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                                    >
                                        <XCircle className="w-6 h-6" />
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsSelectionMode(true)}
                                    className="border-slate-200 dark:border-white/10 rounded-full font-bold h-11 w-11 p-0 flex items-center justify-center text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white"
                                    title="Select Multiple"
                                >
                                    <ListChecks className="w-5 h-5" />
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {
                isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                        <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
                        <p className="text-slate-400">Opening your jar...</p>
                    </div>
                ) : activeIdeas.length === 0 ? (
                    <EnhancedEmptyState
                        jarTopic={userData?.jarTopic || 'General'}
                        jarName={userData?.jarName || 'Your Jar'}
                        jarId={userData?.activeJarId || ''}
                        inviteCode={userData?.coupleReferenceCode || userData?.referenceCode}
                        onTemplateClick={() => openModal('TEMPLATE_BROWSER')}
                        onAddIdeaClick={() => openModal('ADD_IDEA')}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {activeIdeas.map((idea) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={idea.id}
                                onClick={(e) => {
                                    if (isSelectionMode) {
                                        toggleSelection(e, idea.id);
                                    } else if (idea.isMasked) {
                                        showInfo(isAdminPickMode
                                            ? "It's a mystery! Use the 'Pick Mystery' button to select it."
                                            : "It's a mystery! Spin the jar to reveal it."
                                        );
                                    } else {
                                        // Allow viewing details
                                        openModal('ADD_IDEA', { initialData: idea });
                                    }
                                }}
                                className={`glass-card p-5 relative group cursor-pointer transition-all ${isSelectionMode && selectedIds.has(idea.id)
                                    ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[0.98]'
                                    : isSelectionMode
                                        ? 'hover:bg-slate-50 dark:hover:bg-white/5 opacity-80 hover:opacity-100' // Dim unselected in select mode
                                        : idea.isMasked
                                            ? 'opacity-75 bg-slate-100 dark:bg-slate-900/50'
                                            : 'hover:-translate-y-1 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-white/20'
                                    } ${idea.status === 'PENDING' ? 'ring-2 ring-yellow-500/20 bg-yellow-500/5' : ''}`}
                            >
                                {/* Selection Checkbox Overlay */}
                                {isSelectionMode && (
                                    <div className="absolute top-3 left-3 z-30">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedIds.has(idea.id)
                                            ? 'bg-indigo-500 border-indigo-500 text-white'
                                            : 'border-slate-300 dark:border-white/20 bg-white dark:bg-black/40'
                                            }`}>
                                            {selectedIds.has(idea.id) && <Check className="w-3.5 h-3.5" />}
                                        </div>
                                    </div>
                                )}
                                {idea.status === 'PENDING' && (
                                    <div className="absolute -top-3 left-4 z-20 flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-yellow-500/20 ring-2 ring-white dark:ring-slate-900">
                                        <Clock className="w-3 h-3" />
                                        Review Required
                                    </div>
                                )}

                                <div className="absolute top-4 right-4 z-10 flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    {idea.canEdit && !idea.isMasked && availableJars.length > 1 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openModal('MOVE_IDEA', { idea });
                                            }}
                                            className="p-2 rounded-full bg-slate-100 dark:bg-black/40 text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-black/60 transition-colors shadow-sm"
                                            title="Move to another jar"
                                        >
                                            <Move className="w-4 h-4" />
                                        </button>
                                    )}
                                    {idea.canEdit && !idea.isMasked && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openModal('DELETE_CONFIRM', {
                                                    onConfirm: async () => {
                                                        try {
                                                            const res = await fetch(`/api/ideas/${idea.id}`, {
                                                                method: 'DELETE',
                                                                credentials: 'include',
                                                            });

                                                            if (res.ok) {
                                                                fetchIdeas();
                                                                closeModal();
                                                            } else {
                                                                const data = await res.json();
                                                                alert(`Failed to delete idea: ${data.error || "Unknown error"}`);
                                                            }
                                                        } catch (error: any) {
                                                            alert(`Error deleting idea: ${error.message}`);
                                                        }
                                                    }
                                                });
                                            }}
                                            className="p-2 rounded-full bg-slate-100 dark:bg-black/40 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-black/60 transition-colors shadow-sm"
                                            title="Delete Idea"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="mb-3 flex items-start justify-between">
                                    {(() => {
                                        const category = (idea.categoryId || idea.category) || 'ACTIVITY';
                                        const effectiveType = idea.ideaType || suggestIdeaType(idea);
                                        const categoryDef = getCategoryDef(category);

                                        // Start with category icon, but override with specialized types
                                        let Icon = categoryDef.icon;
                                        let colorClass = "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"; // Default Blue

                                        // Type-based Overrides (Priority 1)
                                        if (effectiveType === 'book') {
                                            Icon = Book;
                                            colorClass = "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400";
                                        } else if (effectiveType === 'movie') {
                                            Icon = Popcorn;
                                            colorClass = "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400";
                                        } else if (effectiveType === 'game') {
                                            Icon = Gamepad2;
                                            colorClass = "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400";
                                        } else if (effectiveType === 'recipe') {
                                            Icon = ChefHat;
                                            colorClass = "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400";
                                        } else if (effectiveType === 'travel') {
                                            Icon = Plane;
                                            colorClass = "bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400";
                                        } else if (effectiveType === 'event') {
                                            Icon = Ticket;
                                            colorClass = "bg-fuchsia-100 dark:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400";
                                        } else if (effectiveType === 'dining') {
                                            Icon = Utensils;
                                            colorClass = "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400";
                                        } else if (effectiveType === 'music') {
                                            Icon = Music;
                                            colorClass = "bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400";
                                        } else if (effectiveType === 'itinerary') {
                                            Icon = Layers;
                                            colorClass = "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400";
                                        } else if (effectiveType === 'activity') {
                                            if (['WELLNESS', 'SPA', 'MEDITATION'].includes(category)) {
                                                colorClass = "bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400";
                                            } else if (['FITNESS', 'STRENGTH', 'CARDIO', 'YOGA'].includes(category)) {
                                                colorClass = "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400";
                                            }
                                        } else {
                                            // Category-based Themes (Priority 2)
                                            if (['MEAL', 'DINING', 'CASUAL', 'FINE_DINING', 'BRUNCH', 'FAST_FOOD'].includes(category)) {
                                                colorClass = "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400";
                                            } else if (['BAR', 'COCKTAIL', 'PUB', 'WINE_BAR', 'ROOFTOP', 'SPEAKEASY', 'NIGHTLIFE'].includes(category)) {
                                                colorClass = "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400";
                                            } else if (['EVENT', 'SOCIAL', 'CULTURAL'].includes(category)) {
                                                colorClass = "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400";
                                            } else if (category === 'PLANNED_DATE') {
                                                colorClass = "bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400";
                                            } else if (['WELLNESS', 'SPA', 'MEDITATION'].includes(category)) {
                                                colorClass = "bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400";
                                            } else if (['FITNESS', 'STRENGTH', 'CARDIO', 'YOGA', 'FITNESS_CLASS'].includes(category)) {
                                                colorClass = "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400";
                                            }
                                        }

                                        return (
                                            <div className={`p-2 rounded-lg ${colorClass}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                        );
                                    })()}
                                    <div className="flex gap-2 items-center">
                                        {(idea.category === 'PLANNED_DATE' && !idea.isMasked) || (isAdminPickMode && isAdmin) ? (
                                            <Button
                                                size="sm"
                                                className={`h-7 text-[10px] border-0 text-white ${isAdminPickMode ? 'bg-amber-500 hover:bg-amber-600' : 'bg-pink-500 hover:bg-pink-600'}`}
                                                onClick={(e) => handleGoTonight(e, idea)}
                                            >
                                                {isAdminPickMode ? (
                                                    <span className="flex items-center gap-1">
                                                        <Crown className="w-3 h-3" />
                                                        {idea.isMasked ? "Pick Mystery" : "Pick Winner"}
                                                    </span>
                                                ) : ACTION_LABELS.DO_THIS}
                                            </Button>
                                        ) : null}
                                        <div className={`w-2 h-2 rounded-full ${idea.activityLevel === 'HIGH' ? 'bg-red-400' : idea.activityLevel === 'MEDIUM' ? 'bg-yellow-400' : 'bg-green-400'}`} title={`Activity: ${idea.activityLevel}`} />
                                    </div>
                                </div>

                                <h3 className={`font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 ${idea.isMasked ? 'italic text-slate-500 dark:text-slate-400' : ''}`}>
                                    {idea.isMasked
                                        ? (idea.isSurprise
                                            ? (hasPartner ? "✨ Shared Surprise" : "✨ Surprise")
                                            : (idea.createdBy?.name === userData?.name || idea.createdBy?.id === userData?.id) ? "🔒 Mystery Idea" : `${idea.createdBy?.name || "Partner"}'s Secret`)
                                        : idea.description}
                                </h3>

                                {(() => {
                                    const venueDetails = getVenueDetails(idea.details);
                                    const shortHours = getShortHours(venueDetails?.hours);

                                    // Use standardizer for metadata fallback
                                    const typeData = idea.typeData || getStandardizedData(idea);
                                    const effectiveType = idea.ideaType || suggestIdeaType(idea);

                                    let typeBadge = null;
                                    if (effectiveType === 'book' && typeData) {
                                        typeBadge = (
                                            <span className="text-[10px] font-bold text-indigo-500 truncate max-w-[120px]">
                                                {typeData.author}
                                            </span>
                                        );
                                    } else if (effectiveType === 'movie' && typeData) {
                                        typeBadge = (
                                            <span className="text-[10px] font-bold text-rose-500">
                                                {typeData.year}
                                            </span>
                                        );
                                    } else if (effectiveType === 'game' && typeData) {
                                        typeBadge = (
                                            <span className="text-[10px] font-bold text-purple-500">
                                                {typeData.platform?.[0]}
                                            </span>
                                        );
                                    }


                                    return (
                                        <div className="flex flex-wrap gap-2 mt-auto pt-2 items-center">
                                            {/* Duration & Cost */}
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                                                {idea.duration}h
                                            </span>
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                                                {idea.cost}
                                            </span>

                                            {/* Type-Specific Meta */}
                                            {effectiveType === 'recipe' && typeData?.servings && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 flex items-center gap-1">
                                                    <Users className="w-2.5 h-2.5" />
                                                    Serves {typeData.servings}
                                                </span>
                                            )}

                                            {effectiveType === 'travel' && typeData?.destination?.name && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20 flex items-center gap-1">
                                                    <MapIcon className="w-2.5 h-2.5" />
                                                    {typeData.destination.name}
                                                </span>
                                            )}

                                            {effectiveType === 'event' && typeData?.venue?.name && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-100 dark:border-fuchsia-500/20 flex items-center gap-1">
                                                    <MapIcon className="w-2.5 h-2.5" />
                                                    {typeData.venue.name}
                                                </span>
                                            )}

                                            {shortHours && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 flex items-center gap-1">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    {shortHours}
                                                </span>
                                            )}

                                            {typeBadge}

                                            {idea.category === 'PLANNED_DATE' ? (
                                                <>
                                                    {idea.notes && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-pink-500/30 w-full text-center mt-1">
                                                            {idea.notes.replace('Planned for: ', '')}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                                                    {idea.indoor ? 'Indoor' : 'Outdoor'}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })()}

                                {idea.isMasked && (
                                    <div className="mt-auto pt-2 flex items-center justify-center">
                                        <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    </div>
                                )}
                                {idea.status === 'PENDING' && isAdmin && (
                                    <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                                        <Button
                                            size="sm"
                                            onClick={(e) => handleApprove(e, idea.id)}
                                            className="h-9 flex-1 bg-green-600 hover:bg-green-700 text-white font-bold group/btn"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => handleReject(e, idea.id)}
                                            className="h-9 flex-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )
            }

            <DashboardModals
                isPremium={isPremium}
                userData={userData}
                ideas={ideas}
                userLocation={userLocation}
                setUserLocation={setUserLocation}
                combinedLocation={userLocation || ''}
                jarTopic={userData?.jarTopic || 'General'}
                level={level || 1}
                favoritesCount={favoritesCount}
                hasPaid={hasPaid || false}
                coupleCreatedAt={coupleCreatedAt || ''}
                isTrialEligible={isTrialEligible !== false}
                handleContentUpdate={handleContentUpdate}
                fetchFavorites={fetchFavorites}
                fetchIdeas={fetchIdeas}
                refreshUser={refreshUser}
                handleSpinJar={() => { }} // Not used on this page but required by prop
                showConfetti={showConfetti}
                setShowConfetti={setShowConfetti}
                availableJars={availableJars}
            />
        </main >
    );
}

const DashboardModals = dynamic(() => import("@/components/DashboardModals").then(m => m.DashboardModals), { ssr: false });
