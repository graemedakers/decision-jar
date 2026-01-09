"use client";

import { Suspense, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Lock, Trash2, Activity, Utensils, Calendar, Moon, Loader2, Crown, Layers, Move, Clock, CheckCircle, XCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EnhancedEmptyState } from "@/components/EnhancedEmptyState";
import { useUser } from "@/hooks/useUser";
import { useIdeas } from "@/hooks/useIdeas";
import { useModalSystem } from "@/components/ModalProvider";
import { useFavorites } from "@/hooks/useFavorites";
import React from "react";

export default function JarPage() {
    const router = useRouter();

    // Custom Hooks
    const { userData, isPremium, refreshUser, isLoading: isLoadingUser, level, hasPaid, coupleCreatedAt, isTrialEligible } = useUser();
    const { ideas, isLoading: isIdeasLoading, isFetching, fetchIdeas } = useIdeas();
    const { favoritesCount, fetchFavorites } = useFavorites();
    const { openModal, closeModal, activeModal } = useModalSystem();

    // Local State
    const [userLocation, setUserLocation] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [availableJars, setAvailableJars] = useState<any[]>([]);

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
    }, [ideas.length, isIdeasLoading, userData?.activeJarId, userData?.jarTopic, openModal]);

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
    }, []);

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
                    selectedDate: new Date().toISOString()
                }),
                credentials: 'include',
            });

            if (res.ok) {
                await fetchIdeas();
                router.push('/dashboard');
            } else {
                const err = await res.text();
                console.error("Go Tonight Failed:", err);
                alert("Failed to start date night: " + err);
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

    const activeIdeas = ideas.filter(i => !i.selectedAt);
    const isAdminPickMode = userData?.jarSelectionMode === 'ADMIN_PICK';
    const isAdmin = !!userData?.isCreator;
    const hasPartner = !!userData?.partnerName;
    const isLoading = isIdeasLoading || isLoadingUser || (isFetching && ideas.length === 0);

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
                    <Button
                        onClick={() => openModal('ADD_IDEA')}
                        className="bg-primary hover:bg-primary/90 text-white rounded-full font-bold px-6 h-11 shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Idea</span>
                    </Button>

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
                                onClick={() => idea.canEdit && !idea.isMasked && openModal('ADD_IDEA', { initialData: idea })}
                                className={`glass-card p-5 relative group cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition-all ${idea.isMasked ? 'opacity-75 bg-slate-100 dark:bg-slate-900/50' : 'hover:-translate-y-1 bg-white dark:bg-slate-900/40'} ${idea.status === 'PENDING' ? 'ring-2 ring-yellow-500/20 bg-yellow-500/5' : ''}`}
                            >
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
                                    <div className={`p-2 rounded-lg ${idea.category === 'MEAL' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                                        idea.category === 'EVENT' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' :
                                            idea.category === 'PLANNED_DATE' ? 'bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400' :
                                                'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                        }`}>
                                        {idea.category === 'MEAL' && <Utensils className="w-4 h-4" />}
                                        {idea.category === 'EVENT' && <Calendar className="w-4 h-4" />}
                                        {idea.category === 'PLANNED_DATE' && <Moon className="w-4 h-4" />}
                                        {(!idea.category || idea.category === 'ACTIVITY') && <Activity className="w-4 h-4" />}
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        {(idea.category === 'PLANNED_DATE' && !idea.isMasked) || (isAdminPickMode && isAdmin && !idea.isMasked) ? (
                                            <Button
                                                size="sm"
                                                className={`h-7 text-[10px] border-0 text-white ${isAdminPickMode ? 'bg-amber-500 hover:bg-amber-600' : 'bg-pink-500 hover:bg-pink-600'}`}
                                                onClick={(e) => handleGoTonight(e, idea)}
                                            >
                                                {isAdminPickMode ? (
                                                    <span className="flex items-center gap-1"><Crown className="w-3 h-3" /> Pick Winner</span>
                                                ) : "Go Tonight"}
                                            </Button>
                                        ) : null}
                                        <div className={`w-2 h-2 rounded-full ${idea.activityLevel === 'HIGH' ? 'bg-red-400' : idea.activityLevel === 'MEDIUM' ? 'bg-yellow-400' : 'bg-green-400'}`} title={`Activity: ${idea.activityLevel}`} />
                                    </div>
                                </div>

                                <h3 className={`font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 ${idea.isMasked ? 'italic text-slate-500 dark:text-slate-400' : ''}`}>
                                    {idea.isMasked
                                        ? (idea.isSurprise
                                            ? (hasPartner ? "✨ Shared Surprise" : "✨ Surprise")
                                            : `${idea.createdBy?.name || "Partner"}'s Secret`)
                                        : idea.description}
                                </h3>

                                {!idea.isMasked && (
                                    <div className="flex flex-wrap gap-2 mt-auto pt-2">
                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                                            {idea.duration}h
                                        </span>
                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                                            {idea.cost}
                                        </span>
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
                                )}

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
