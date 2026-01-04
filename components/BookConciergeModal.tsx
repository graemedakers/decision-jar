"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, X, Search, Sparkles, Loader2, BookOpen, Clock, Star, Library } from 'lucide-react';
import { Button } from './ui/Button';
import { ConciergeResultCard } from './ConciergeResultCard';
import { DemoUpgradePrompt } from './DemoUpgradePrompt';
import { useConciergeActions } from '@/hooks/useConciergeActions';

interface BookConciergeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onIdeaAdded?: () => void;
    onGoTonight?: (idea: any) => void;
    demoConcierge?: {
        triesRemaining: number;
        hasUsedTrial: boolean;
        onUse: () => void;
    };
}

const GENRE_OPTIONS = [
    "Fiction", "Non-Fiction", "Mystery/Thriller", "Sci-Fi/Fantasy",
    "Romance", "Biography", "Self-Help", "History", "Horror"
];

const VIBE_OPTIONS = [
    "Light & Easy", "Deep & Thought-provoking", "Fast-paced/Exciting",
    "Emotional/Touching", "Inspiring", "Educational", "Dark & Moody"
];

const LENGTH_OPTIONS = [
    "Short (< 200 pages)", "Medium (200-400 pages)", "Long (400+ pages)"
];

const ERA_OPTIONS = [
    "Contemporary (Last 5 years)", "Modern (Last 20 years)",
    "20th Century", "Classics", "Historical"
];

export function BookConciergeModal({ isOpen, onClose, onIdeaAdded, onGoTonight, demoConcierge }: BookConciergeModalProps) {
    const [genre, setGenre] = useState<string>("");
    const [vibe, setVibe] = useState<string>("");
    const [length, setLength] = useState<string>("");
    const [era, setEra] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [showTrialUsedPrompt, setShowTrialUsedPrompt] = useState(false);

    const { handleAddToJar, handleGoTonight, handleFavorite, toggleSelection } = useConciergeActions({
        onIdeaAdded,
        onGoTonight,
        onClose,
        setRecommendations
    });

    const handleGetRecommendations = async () => {
        setIsLoading(true);
        setRecommendations([]);

        try {
            const res = await fetch('/api/book-concierge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-demo-mode': demoConcierge ? 'true' : 'false'
                },
                body: JSON.stringify({ genre, vibe, length, era }),
            });

            if (res.ok) {
                const data = await res.json();
                setRecommendations(data.recommendations || []);

                if (demoConcierge && !demoConcierge.hasUsedTrial) {
                    demoConcierge.onUse();
                }

                if (demoConcierge && demoConcierge.triesRemaining === 0) {
                    setTimeout(() => setShowTrialUsedPrompt(true), 3000);
                }
            }
        } catch (error) {
            console.error("Book Search Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="glass-card w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] bg-white dark:bg-slate-900 shadow-2xl"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800 dark:text-white">Book Finder</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Discover your next favorite read</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            {recommendations.length === 0 ? (
                                <div className="space-y-6 animate-in fade-in duration-500">
                                    {/* Genre Selection */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <Library className="w-4 h-4 text-blue-500" /> What do you feel like reading?
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {GENRE_OPTIONS.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setGenre(opt === genre ? "" : opt)}
                                                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${genre === opt
                                                        ? 'bg-blue-500 text-white border-blue-600'
                                                        : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-blue-400'
                                                        }`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Vibe Selection */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-amber-500" /> What's the vibe?
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {VIBE_OPTIONS.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setVibe(opt === vibe ? "" : opt)}
                                                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${vibe === opt
                                                        ? 'bg-amber-500 text-white border-amber-600'
                                                        : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-amber-400'
                                                        }`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Length */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-emerald-500" /> Preferred Length
                                            </label>
                                            <select
                                                value={length}
                                                onChange={(e) => setLength(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Any Length</option>
                                                {LENGTH_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </div>

                                        {/* Era */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-purple-500" /> Era / Period
                                            </label>
                                            <select
                                                value={era}
                                                onChange={(e) => setEra(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Any Era</option>
                                                {ERA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleGetRecommendations}
                                        disabled={isLoading}
                                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg mt-4"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" /> Curating your reading list...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2 font-bold uppercase tracking-wider">
                                                <Search className="w-5 h-5" /> Find My Next Book
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-amber-500" /> Curated For You
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setRecommendations([])}
                                            className="text-xs text-blue-500"
                                        >
                                            Change Filters
                                        </Button>
                                    </div>
                                    {recommendations.map((rec, i) => (
                                        <ConciergeResultCard
                                            key={i}
                                            rec={rec}
                                            categoryType="BOOK"
                                            mainIcon={BookOpen}
                                            subtext={rec.cuisine}
                                            secondIcon={Clock}
                                            secondSubtext={rec.price}
                                            isPrivate={true}
                                            onFavorite={handleFavorite}
                                            onAddToJar={handleAddToJar}
                                            onGoAction={handleGoTonight}
                                            goActionLabel="View"
                                            goActionClass="bg-gradient-to-r from-blue-400/20 to-indigo-400/20 text-blue-700 dark:text-blue-200 border border-blue-400/30"
                                            ratingClass="text-emerald-500"
                                        />
                                    ))}
                                </div>
                            )}

                            {demoConcierge && showTrialUsedPrompt && (
                                <DemoUpgradePrompt reason="premium" message="You've used your free book finder trial! Upgrade for unlimited book recommendations." />
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
