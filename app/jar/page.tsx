"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Lock, Trash2, Activity, Utensils, Calendar, Moon, Loader2, Crown, Layers, Move } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AddIdeaModal } from "@/components/AddIdeaModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { PremiumModal } from "@/components/PremiumModal";
import { TemplateBrowserModal } from "@/components/TemplateBrowserModal";
import { MoveIdeaModal } from "@/components/MoveIdeaModal";

export default function JarPage() {
    const router = useRouter();
    const [ideas, setIdeas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingIdea, setEditingIdea] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ideaToDelete, setIdeaToDelete] = useState<string | null>(null);
    const [isPremium, setIsPremium] = useState(false);
    const [hasPartner, setHasPartner] = useState(true);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [isTemplateBrowserOpen, setIsTemplateBrowserOpen] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [ideaToMove, setIdeaToMove] = useState<any>(null);
    const [availableJars, setAvailableJars] = useState<any[]>([]);

    const [currentUser, setCurrentUser] = useState<any>(null);

    const fetchIdeas = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/ideas', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setIdeas(data);
            }
        } catch (error) {
            console.error('Failed to fetch ideas', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                if (data?.user) {
                    setIsPremium(!!data.user.isPremium);
                    setHasPartner(!!data.user.hasPartner);
                    setCurrentUser(data.user);
                }
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    useEffect(() => {
        fetchIdeas();
        fetchUser();
        fetchAvailableJars();
    }, []);

    const fetchAvailableJars = async () => {
        try {
            const res = await fetch('/api/jar/list');
            if (res.ok) {
                const data = await res.json();
                setAvailableJars(data.jars || []);
            }
        } catch (error) {
            console.error('Failed to fetch jars', error);
        }
    };

    const handleDeleteClick = (id: string) => {
        setIdeaToDelete(id);
    };

    const confirmDelete = async () => {
        if (!ideaToDelete) return;

        try {
            const res = await fetch(`/api/ideas/${ideaToDelete}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (res.ok) {
                fetchIdeas();
            } else {
                const data = await res.json();
                alert(`Failed to delete idea: ${data.error || "Unknown error"}`);
            }
        } catch (error: any) {
            alert(`Error deleting idea: ${error.message}`);
        } finally {
            setIdeaToDelete(null);
        }
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
                // Navigate to dashboard implies selecting it.
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

    const activeIdeas = ideas.filter(i => !i.selectedAt);
    const isAdminPickMode = currentUser?.jarSelectionMode === 'ADMIN_PICK';
    const isAdmin = !!currentUser?.isCreator; // Assuming creator is admin for now, or check role if available

    return (
        <main className="min-h-screen p-4 md:p-8 relative overflow-hidden w-full max-w-[1600px] mx-auto">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px]" />
            </div>

            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="rounded-full p-2 hidden md:flex" onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">In the Jar</h1>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">{isLoading ? '...' : activeIdeas.length} ideas waiting</p>
                    </div>
                </div>
            </div>


            {

                isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                        <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
                        <p className="text-slate-400">Opening your jar...</p>
                    </div>
                ) : activeIdeas.length === 0 ? (
                    <div className="max-w-2xl mx-auto">
                        <div className="glass-card p-8 md:p-12 text-center border-2 border-dashed border-slate-300 dark:border-white/20 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 mx-auto flex items-center justify-center mb-6 shadow-lg">
                                <Plus className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Your Journey Starts Here!</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                                Fill your jar with ideas that excite you. Start with a pre-made template or create your own custom ideas from scratch.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <Button
                                    onClick={() => setIsTemplateBrowserOpen(true)}
                                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white border-none shadow-lg shadow-pink-500/25 h-12 px-6"
                                >
                                    <Layers className="w-5 h-5 mr-2" />
                                    Browse Templates
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsModalOpen(true)}
                                    className="h-12 px-6 border-2"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Add Custom Idea
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {activeIdeas.map((idea) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={idea.id}
                                onClick={() => idea.canEdit && !idea.isMasked && setEditingIdea(idea)}
                                className={`glass-card p-5 relative group cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition-all ${idea.isMasked ? 'opacity-75 bg-slate-100 dark:bg-slate-900/50' : 'hover:-translate-y-1 bg-white dark:bg-slate-900/40'}`}
                            >

                                <div className="absolute top-4 right-4 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {idea.canEdit && !idea.isMasked && availableJars.length > 1 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIdeaToMove(idea);
                                                setIsMoveModalOpen(true);
                                            }}
                                            className="p-1.5 rounded-full bg-slate-200 dark:bg-black/40 text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-black/60 transition-colors"
                                            title="Move to another jar"
                                        >
                                            <Move className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    {idea.canDelete && !idea.isMasked && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(idea.id);
                                            }}
                                            className="p-1.5 rounded-full bg-slate-200 dark:bg-black/40 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-black/60 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
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
                            </motion.div>
                        ))}
                    </div>
                )
            }

            <AddIdeaModal
                isOpen={isModalOpen || !!editingIdea}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingIdea(null);
                    fetchIdeas();
                }}
                initialData={editingIdea}
                isPremium={isPremium}
                onUpgrade={() => {
                    setIsModalOpen(false);
                    setIsPremiumModalOpen(true);
                }}
                currentUser={currentUser}
                jarTopic={currentUser?.jarTopic}
                customCategories={currentUser?.customCategories}
            />

            <DeleteConfirmModal
                isOpen={!!ideaToDelete}
                onClose={() => setIdeaToDelete(null)}
                onConfirm={confirmDelete}
            />

            <PremiumModal
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
            />

            <TemplateBrowserModal
                isOpen={isTemplateBrowserOpen}
                onClose={() => {
                    setIsTemplateBrowserOpen(false);
                    fetchIdeas(); // Refresh ideas after template is applied
                }}
                currentJarId={currentUser?.currentJarId}
                currentJarName={currentUser?.currentJarName}
                hasJars={!!currentUser?.currentJarId}
            />

            <MoveIdeaModal
                isOpen={isMoveModalOpen}
                onClose={() => {
                    setIsMoveModalOpen(false);
                    setIdeaToMove(null);
                }}
                idea={ideaToMove}
                availableJars={availableJars}
                onMoveComplete={() => {
                    fetchIdeas();
                    fetchAvailableJars();
                }}
            />
        </main >
    );
}
