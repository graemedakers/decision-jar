"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Sparkles, Plus, BookOpen, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useModalSystem } from "./ModalProvider";

interface JarQuickStartModalProps {
    isOpen: boolean;
    onClose: () => void;
    jarId: string;
    jarName: string;
    jarTopic: string;
}

export function JarQuickStartModal({ isOpen, onClose, jarId, jarName, jarTopic }: JarQuickStartModalProps) {
    const router = useRouter();
    const { openModal } = useModalSystem();

    // Determine which concierge to suggest based on topic
    const getSuggestedConcierge = () => {
        const topicLower = jarTopic.toLowerCase();

        if (topicLower.includes('date') || topicLower.includes('romantic')) {
            return { id: 'dining_concierge', name: 'Dining Concierge', description: 'Find romantic restaurants nearby' };
        }
        if (topicLower.includes('food') || topicLower.includes('restaurant')) {
            return { id: 'dining_concierge', name: 'Dining Concierge', description: 'Discover great places to eat' };
        }
        if (topicLower.includes('drink') || topicLower.includes('bar')) {
            return { id: 'bar_scout', name: 'Bar Scout', description: 'Find bars and lounges nearby' };
        }
        if (topicLower.includes('movie') || topicLower.includes('film')) {
            return { id: 'movie_scout', name: 'Movie Scout', description: 'Browse current films and streaming picks' };
        }
        if (topicLower.includes('book')) {
            return { id: 'book_scout', name: 'Book Scout', description: 'Get reading recommendations' };
        }
        if (topicLower.includes('game')) {
            return { id: 'game_scout', name: 'Game Scout', description: 'Find games for your group' };
        }
        if (topicLower.includes('activity') || topicLower.includes('adventure')) {
            return { id: 'escape_room_scout', name: 'Activity Scout', description: 'Discover fun activities nearby' };
        }

        // Default fallback
        return { id: 'dining_concierge', name: 'AI Concierge', description: 'Get AI-powered suggestions' };
    };

    const suggestedConcierge = getSuggestedConcierge();

    const handleUseAI = () => {
        onClose();
        openModal('CONCIERGE', { toolId: suggestedConcierge.id });
    };

    const handleBrowseTemplates = () => {
        onClose();
        openModal('TEMPLATE_BROWSER');
    };

    const handleAddManually = () => {
        onClose();
        openModal('ADD_IDEA');
    };

    const handleSkip = () => {
        onClose();
        // Refresh to show the new jar
        window.location.reload();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg bg-white dark:bg-slate-900">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center mb-2">
                        🎉 Your "{jarName}" jar is ready!
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 pt-4">
                    <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
                        How would you like to fill it?
                    </p>

                    {/* AI Quick-Fill */}
                    <button
                        onClick={handleUseAI}
                        className="w-full p-5 rounded-xl border-2 border-purple-200 dark:border-purple-500/30 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/30 dark:hover:to-indigo-900/30 transition-all text-left group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-purple-900 dark:text-purple-300 mb-1">
                                    {suggestedConcierge.name}
                                </h3>
                                <p className="text-sm text-purple-700 dark:text-purple-400">
                                    {suggestedConcierge.description}
                                </p>
                                <p className="text-xs text-purple-600 dark:text-purple-500 mt-2 font-medium">
                                    Premium feature
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Browse Templates */}
                    <button
                        onClick={handleBrowseTemplates}
                        className="w-full p-5 rounded-xl border-2 border-blue-200 dark:border-blue-500/30 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 transition-all text-left group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-blue-900 dark:text-blue-300 mb-1">
                                    Import from Templates
                                </h3>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    Browse pre-made idea collections for {jarTopic}
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Manual Add */}
                    <button
                        onClick={handleAddManually}
                        className="w-full p-5 rounded-xl border-2 border-emerald-200 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30 transition-all text-left group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <Plus className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-300 mb-1">
                                    Add Ideas Manually
                                </h3>
                                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                    Start from scratch with your own suggestions
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Skip */}
                    <button
                        onClick={handleSkip}
                        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-center"
                    >
                        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            I'll add ideas later
                        </span>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
