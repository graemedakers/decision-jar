"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Star, Copy, Trash2, Eye, Camera, Plus, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RateDateModal } from "@/components/RateDateModal";
import { AddIdeaModal } from "@/components/AddIdeaModal";
import { AddMemoryModal } from "@/components/AddMemoryModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { ViewMemoryModal } from "@/components/ViewMemoryModal";

export default function MemoriesPage() {
    const router = useRouter();
    const [ideas, setIdeas] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [ratingIdea, setRatingIdea] = useState<any>(null);
    const [viewingIdea, setViewingIdea] = useState<any>(null);
    const [duplicatingIdea, setDuplicatingIdea] = useState<any>(null);
    const [ideaToDelete, setIdeaToDelete] = useState<string | null>(null);
    const [addingMemory, setAddingMemory] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(false);

    const fetchIdeas = async () => {
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

    const fetchFavorites = async () => {
        try {
            const res = await fetch('/api/favorites', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setFavorites(data);
            }
        } catch (error) {
            console.error('Failed to fetch favorites', error);
        }
    };

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    setIsPremium(!!data.user.isPremium);
                }
            }
        } catch (error) {
            console.error('Failed to fetch user', error);
        }
    };

    useEffect(() => {
        fetchIdeas();
        fetchFavorites();
        fetchUser();
    }, []);

    const isFavorite = (idea: any) => {
        return favorites.some(f => f.name === idea.description);
    };

    const toggleFavorite = async (idea: any) => {
        if (isFavorite(idea)) {
            // Remove
            try {
                const res = await fetch(`/api/favorites?name=${encodeURIComponent(idea.description)}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (res.ok) {
                    setFavorites(prev => prev.filter(f => f.name !== idea.description));
                }
            } catch (err) {
                console.error("Failed to remove favorite", err);
            }
        } else {
            // Add
            try {
                const res = await fetch('/api/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: idea.description,
                        address: idea.address || idea.location || idea.details || "", // Fallback
                        description: `Memory from ${new Date(idea.selectedDate || idea.selectedAt).toLocaleDateString()}`,
                        type: idea.category === 'MEAL' ? 'RESTAURANT' : 'VENUE'
                    }),
                    credentials: 'include'
                });
                if (res.ok) {
                    fetchFavorites(); // Refresh full list
                }
            } catch (err) {
                console.error("Failed to add favorite", err);
            }
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
            if (res.ok) fetchIdeas();
        } catch (error) {
            console.error("Error deleting idea:", error);
        } finally {
            setIdeaToDelete(null);
        }
    };

    const handleDuplicate = (idea: any) => {
        // Create a copy of the idea without the ID
        const { id, selectedAt, selectedDate, createdBy, createdAt, updatedAt, ...ideaData } = idea;
        setDuplicatingIdea(ideaData);
    };

    const memories = ideas
        .filter(i => i.selectedAt)
        .sort((a, b) => new Date(a.selectedDate || a.selectedAt).getTime() - new Date(b.selectedDate || b.selectedAt).getTime()); // Ascending order

    return (
        <main className="min-h-screen p-4 md:p-8 pb-32 relative overflow-hidden w-full max-w-[1600px] mx-auto">
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
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Vault</h1>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            {isLoading ? 'Loading records...' : `${memories.length} items completed`}
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="hidden sm:flex border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white transition-colors"
                    onClick={() => setAddingMemory(true)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Manual Entry
                </Button>
                {/* Mobile FAB */}
                <button
                    onClick={() => setAddingMemory(true)}
                    className="sm:hidden fixed bottom-24 right-6 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center z-40 text-black hover:scale-105 transition-transform"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="glass-card rounded-2xl overflow-hidden h-64 animate-pulse">
                            <div className="h-full w-full bg-slate-200 dark:bg-slate-800/50 flex items-center justify-center">
                                <div className="text-slate-500 dark:text-slate-600 font-medium">Loading vault...</div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : memories.length === 0 ? (
                <div className="glass-card p-12 text-center border-dashed border-slate-300 dark:border-white/20 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 mx-auto flex items-center justify-center mb-4">
                        <Check className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Vault is Empty</h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-xs mx-auto">Spin the jar and complete some items to see them here!</p>
                </div>
            ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                    {memories.map((idea) => (
                        <div key={idea.id} className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6 group hover:bg-slate-50 dark:hover:bg-white/5 bg-white dark:bg-slate-900/40 transition-colors">
                            <div className="flex flex-col items-center sm:items-start shrink-0 min-w-[120px] text-center sm:text-left">
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                    {new Date(idea.selectedDate || idea.selectedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                </span>
                                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                    {new Date(idea.selectedDate || idea.selectedAt).getDate()}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {new Date(idea.selectedDate || idea.selectedAt).toLocaleDateString(undefined, { weekday: 'long' })}
                                </span>
                            </div>

                            <div className="w-full sm:w-px h-px sm:h-16 bg-slate-200 dark:bg-white/10" />

                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-xl font-bold mb-2 line-through decoration-slate-400 dark:decoration-slate-600 decoration-2 text-slate-400 dark:text-slate-300">
                                    {idea.description}
                                </h3>
                                <div className="flex items-center justify-center sm:justify-start gap-3">
                                    {idea.rating ? (
                                        <div
                                            className="flex items-center gap-1 cursor-pointer hover:scale-110 transition-transform bg-slate-100 dark:bg-black/20 px-3 py-1 rounded-full border border-slate-200 dark:border-white/5"
                                            onClick={() => setRatingIdea(idea)}
                                        >
                                            <span className="text-sm font-bold mr-1 text-yellow-600 dark:text-yellow-500">{idea.rating}</span>
                                            <Star className="w-4 h-4 fill-yellow-500 dark:fill-yellow-400 text-yellow-500 dark:text-yellow-400" />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setRatingIdea(idea)}
                                            className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5"
                                        >
                                            Rate Decision
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 shrink-0">
                                <button
                                    onClick={() => setViewingIdea(idea)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                    title="View Details"
                                >
                                    <Eye className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => toggleFavorite(idea)}
                                    className={`p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors ${isFavorite(idea) ? "text-pink-500 hover:text-pink-600 dark:hover:text-pink-400" : "text-slate-500 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400"} `}
                                    title={isFavorite(idea) ? "Remove from Favorites" : "Add to Favorites"}
                                >
                                    <Heart className={`w-5 h-5 ${isFavorite(idea) ? "fill-pink-500" : ""}`} />
                                </button>
                                <button
                                    onClick={() => setRatingIdea(idea)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                                    title="Add Photos"
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDuplicate(idea)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    title="Add Again"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(idea.id)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ViewMemoryModal
                isOpen={!!viewingIdea}
                onClose={() => setViewingIdea(null)}
                idea={viewingIdea}
            />

            <RateDateModal
                isOpen={!!ratingIdea}
                onClose={() => {
                    setRatingIdea(null);
                    fetchIdeas();
                }}
                idea={ratingIdea}
                isPro={isPremium}
            />

            <AddIdeaModal
                isOpen={!!duplicatingIdea}
                onClose={() => {
                    setDuplicatingIdea(null);
                    fetchIdeas();
                }}
                initialData={duplicatingIdea}
                isPremium={isPremium}
                onUpgrade={() => { }}
            />

            <DeleteConfirmModal
                isOpen={!!ideaToDelete}
                onClose={() => setIdeaToDelete(null)}
                onConfirm={confirmDelete}
            />

            <AddMemoryModal
                isOpen={addingMemory}
                onClose={() => setAddingMemory(false)}
                onSuccess={fetchIdeas}
                isPro={isPremium}
            />
        </main>
    );
}
