"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ExternalLink, Trash2, MapPin, Star, Share2, Users, ArrowUpRight } from "lucide-react";
import { Button } from "./ui/Button";
import { getJarLabels } from "@/lib/labels";
import { StandardizedIdeaHeader } from "./StandardizedIdeaHeader";
import { ShareButton } from "./ShareButton";

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

    const handleNativeShare = async (fav: any) => {
        const shareData = {
            title: fav.name,
            text: `Check out ${fav.name}: ${fav.description || ''} ${fav.address || ''}`,
            url: fav.websiteUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fav.name + " " + (fav.address || ""))}`
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                alert("Link copied to clipboard!");
            } catch (err) {
                console.error("Error copying:", err);
            }
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
                                        <div key={fav.id} className="glass p-4 rounded-xl flex flex-col hover:bg-slate-50 dark:hover:bg-white/5 transition-colors relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
                                            <div className="flex-1">
                                                <StandardizedIdeaHeader
                                                    name={fav.name}
                                                    description={fav.description}
                                                    address={fav.address}
                                                    rating={fav.googleRating}
                                                    website={fav.websiteUrl}
                                                    category={fav.type === 'RESTAURANT' ? 'MEAL' : 'ACTIVITY'}
                                                    compact={true}
                                                />
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center gap-2">
                                                <ShareButton
                                                    title={`✨ ${fav.name}`}
                                                    description={fav.description}
                                                    url={fav.websiteUrl}
                                                    className="text-xs h-7 px-2 whitespace-nowrap"
                                                />

                                                {fav.isOwner && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(fav.id)}
                                                        className="text-xs h-7 px-2 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
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
