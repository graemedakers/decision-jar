"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ExternalLink, Trash2, MapPin, Star, Share2, Users } from "lucide-react";
import { Button } from "./ui/Button";
import { getJarLabels } from "@/lib/labels";

interface FavoritesModalProps {
    isOpen: boolean;
    onClose: () => void;
    topic?: string;
}

export function FavoritesModal({ isOpen, onClose, topic }: FavoritesModalProps) {
    const labels = getJarLabels(topic);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchFavorites();
        }
    }, [isOpen]);

    const fetchFavorites = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/favorites');
            if (res.ok) {
                const data = await res.json();
                setFavorites(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this favorite?")) return;
        try {
            const res = await fetch(`/api/favorites/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setFavorites(favorites.filter(f => f.id !== id));
            } else {
                alert("Failed to delete.");
            }
        } catch (error) {
            console.error(error);
            alert("Error deleting favorite.");
        }
    };

    const handleShare = async (id: string, status: boolean) => {
        try {
            const res = await fetch('/api/favorites', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isShared: status })
            });
            if (res.ok) {
                setFavorites(favorites.map(f => f.id === id ? { ...f, isShared: status } : f));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card w-full max-w-2xl relative max-h-[90vh] flex flex-col"
                    >
                        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-pink-500/10 dark:bg-pink-500/20 flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Favorites</h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Ideas you want to remember</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {isLoading ? (
                                <p className="text-center text-slate-500 dark:text-slate-400">Loading favorites...</p>
                            ) : favorites.length === 0 ? (
                                <p className="text-center text-slate-500 dark:text-slate-400">No favorites yet. Go find some cool spots!</p>
                            ) : (
                                <div className="space-y-4">
                                    {favorites.map((fav) => (
                                        <div key={fav.id} className="bg-slate-50/80 dark:bg-white/5 p-4 rounded-xl flex flex-col sm:flex-row gap-4 relative group border border-slate-200/50 dark:border-white/5">
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{fav.name}</h4>
                                                        {fav.isShared && (
                                                            <div title={labels.sharedLabel} className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
                                                                <Users className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-bold px-2 py-1 bg-slate-200 dark:bg-white/10 rounded text-slate-600 dark:text-slate-300">{fav.type}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{fav.description}</p>
                                                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                                                    {fav.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {fav.address}</span>}
                                                    {fav.googleRating && (
                                                        <span className="flex items-center gap-1 text-orange-500 dark:text-yellow-400">
                                                            <Star className="w-3 h-3 fill-current" /> {fav.googleRating}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-row sm:flex-col gap-2 justify-end">
                                                <Button size="sm" variant="ghost" className="text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fav.name + " " + (fav.address || ""))}`, '_blank')}>
                                                    <ExternalLink className="w-4 h-4 mr-1" /> Map
                                                </Button>
                                                {fav.websiteUrl && (
                                                    <Button size="sm" variant="ghost" className="text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10" onClick={() => window.open(fav.websiteUrl, '_blank')}>
                                                        <ExternalLink className="w-4 h-4 mr-1" /> Web
                                                    </Button>
                                                )}

                                                {fav.isOwner && (
                                                    <Button size="sm" variant="ghost" onClick={() => handleShare(fav.id, !fav.isShared)} className={`text-xs ${fav.isShared ? "text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300" : "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"} hover:bg-slate-200 dark:hover:bg-white/10`}>
                                                        {fav.isShared ? (
                                                            <>
                                                                <Share2 className="w-4 h-4 mr-1 fill-current" /> Unshare
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Share2 className="w-4 h-4 mr-1" /> Share
                                                            </>
                                                        )}
                                                    </Button>
                                                )}

                                                {fav.isOwner && (
                                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(fav.id)} className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10">
                                                        <Trash2 className="w-4 h-4 mr-1" /> Remove
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
