'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Sparkles, Heart, Clock, DollarSign, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AddIdeaModal } from '@/components/AddIdeaModal';
import { DemoBanner, DemoUpgradePrompt } from '@/components/DemoUpgradePrompt';
import {
    initializeDemoData,
    getDemoIdeas,
    getDemoJar,
    addDemoIdea,
    updateDemoIdea,
    deleteDemoIdea,
    selectDemoIdea,
    getDemoAICount,
    isDemoAILimitReached,
    DEMO_LIMITS,
    getDemoConciergeCount,
    isConciergeLimitReached,
    resetConciergeTrial,
} from '@/lib/demo-storage';
import { DiningConciergeModal } from '@/components/DiningConciergeModal';
import { BarConciergeModal } from '@/components/BarConciergeModal';
import { MovieConciergeModal } from '@/components/MovieConciergeModal';
import { EscapeRoomConciergeModal } from '@/components/EscapeRoomConciergeModal';
import { PremiumBlockerModal } from '@/components/PremiumBlockerModal';
import { Utensils, Wine, Film, Key } from 'lucide-react';
import { useDemoConcierge } from '@/lib/use-demo-concierge';
import { trackEvent } from '@/lib/analytics';
import { BookConciergeModal } from '@/components/BookConciergeModal';
import { Book } from 'lucide-react';

export default function DemoPage() {
    const router = useRouter();
    const [ideas, setIdeas] = useState<any[]>([]);
    const [jar, setJar] = useState<any>(null);
    const [spinning, setSpinning] = useState(false);
    const [revealedIdea, setRevealedIdea] = useState<any>(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editingIdea, setEditingIdea] = useState<any>(null);
    const [aiCount, setAiCount] = useState(0);
    const [showAILimitPrompt, setShowAILimitPrompt] = useState(false);
    const [showSavePrompt, setShowSavePrompt] = useState(false);

    // Concierge Modals
    const [diningModalOpen, setDiningModalOpen] = useState(false);
    const [barModalOpen, setBarModalOpen] = useState(false);
    const [movieModalOpen, setMovieModalOpen] = useState(false);
    const [escapeModalOpen, setEscapeModalOpen] = useState(false);
    const [bookModalOpen, setBookModalOpen] = useState(false);

    // Concierge Trial State
    const demoConcierge = useDemoConcierge();

    const [showConciergeUpgrade, setShowConciergeUpgrade] = useState(false); // Keeps existing banner logic
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false); // New modal logic

    const handleConciergeClick = (opener: () => void) => {
        if (demoConcierge && demoConcierge.triesRemaining === 0) {
            // Already used trial? Show upgrade prompt!
            setUpgradeModalOpen(true);
        } else {
            opener();
        }
    };

    useEffect(() => {
        initializeDemoData();
        loadDemoData();

        // Show save prompt after 10 minutes
        const savePromptTimer = setTimeout(() => {
            setShowSavePrompt(true);
        }, 10 * 60 * 1000);

        return () => clearTimeout(savePromptTimer);
    }, []);

    const loadDemoData = () => {
        setIdeas(getDemoIdeas());
        setJar(getDemoJar());
        setAiCount(getDemoAICount());
    };



    const handleSpin = () => {
        const availableIdeas = ideas.filter(i => !i.selectedAt);

        if (availableIdeas.length === 0) {
            alert('No ideas left! Add more or check your memories.');
            return;
        }

        trackEvent('spin_jar', 'ACTION', 1, { demo: true, ideaCount: availableIdeas.length });
        setSpinning(true);

        setTimeout(() => {
            const randomIdea = availableIdeas[Math.floor(Math.random() * availableIdeas.length)];
            const selected = selectDemoIdea(randomIdea.id);
            setRevealedIdea(selected);
            setSpinning(false);
            loadDemoData();
        }, 2000);
    };

    const handleCloseAddModal = () => {
        setAddModalOpen(false);
        setEditingIdea(null);
        loadDemoData();
    };

    const handleAIRequest = () => {
        if (isDemoAILimitReached()) {
            setShowAILimitPrompt(true);
            return false;
        }
        return true;
    };

    if (!jar) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    const availableIdeas = ideas.filter(i => !i.selectedAt);
    const completedIdeas = ideas.filter(i => i.selectedAt);

    return (
        <div className="min-h-screen pb-32">
            <DemoBanner />

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        {jar.name}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        {availableIdeas.length} ideas ready • {DEMO_LIMITS.AI_REQUESTS - aiCount} AI requests left
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Jar & Spin */}
                    <div className="space-y-6">
                        {/* Simple Jar Visualization */}
                        <div className="glass-card p-8 text-center">
                            <div className="relative w-48 h-48 mx-auto mb-6">
                                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full opacity-20 animate-pulse" />
                                <div className="absolute inset-4 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                                    <Heart className="w-20 h-20 text-white" />
                                </div>
                            </div>

                            <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                {availableIdeas.length}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                ideas in your jar
                            </p>

                            <Button
                                onClick={handleSpin}
                                disabled={spinning || availableIdeas.length === 0}
                                className="w-full bg-gradient-to-r from-pink-600 to-purple-600"
                                size="lg"
                            >
                                {spinning ? 'Spinning...' : 'Spin the Jar!'}
                            </Button>
                        </div>

                        {/* Revealed Idea */}
                        {revealedIdea && (
                            <div className="glass-card p-6 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200 dark:border-pink-800 overflow-hidden">
                                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2 break-words">
                                    🎉 {revealedIdea.description}
                                </h3>
                                {revealedIdea.details && (
                                    <p className="text-slate-700 dark:text-slate-300 mb-4 break-words overflow-wrap-anywhere">
                                        {revealedIdea.details}
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-white dark:bg-white/10 rounded-full text-sm">
                                        {revealedIdea.cost}
                                    </span>
                                    <span className="px-3 py-1 bg-white dark:bg-white/10 rounded-full text-sm">
                                        {revealedIdea.duration}h
                                    </span>
                                    <span className="px-3 py-1 bg-white dark:bg-white/10 rounded-full text-sm capitalize">
                                        {revealedIdea.activityLevel?.toLowerCase()}
                                    </span>
                                </div>
                                <Button
                                    onClick={() => setRevealedIdea(null)}
                                    variant="outline"
                                    className="w-full mt-4"
                                    size="sm"
                                >
                                    Close
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Ideas List */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Your Ideas
                            </h2>
                            <Button
                                onClick={() => setAddModalOpen(true)}
                                size="sm"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Idea
                            </Button>
                        </div>

                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                            {availableIdeas.map(idea => (
                                <div
                                    key={idea.id}
                                    className="glass-card p-4 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => setEditingIdea(idea)}
                                >
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                                        {idea.description}
                                    </h3>
                                    {idea.details && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 mb-2">
                                            {idea.details}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" /> {idea.cost}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {idea.duration}h
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {availableIdeas.length === 0 && (
                                <div className="glass-card p-12 text-center">
                                    <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-600 dark:text-slate-400">
                                        No ideas yet - add your first!
                                    </p>
                                </div>
                            )}
                        </div>

                        {completedIdeas.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                                    Completed ({completedIdeas.length})
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Sign up to save your memories forever!
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Premium Tools Section - NEW! */}
                <div className="mt-12 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Premium Concierge Tools
                            </h2>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/30">
                            1 FREE TRIAL LEFT
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Try one of our AI-powered concierge tools for free. Premium includes 15+ specialized tools for dining, entertainment, wellness, and more.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Dining */}
                        <Button
                            variant="outline"
                            className="h-auto py-6 flex flex-col gap-2 border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all"
                            onClick={() => handleConciergeClick(() => setDiningModalOpen(true))}
                        >
                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <Utensils className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">Dining Concierge</span>
                        </Button>

                        {/* Bar */}
                        <Button
                            variant="outline"
                            className="h-auto py-6 flex flex-col gap-2 border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all"
                            onClick={() => handleConciergeClick(() => setBarModalOpen(true))}
                        >
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <Wine className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">Bar Concierge</span>
                        </Button>

                        {/* Movie */}
                        <Button
                            variant="outline"
                            className="h-auto py-6 flex flex-col gap-2 border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                            onClick={() => handleConciergeClick(() => setMovieModalOpen(true))}
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Film className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">Movie Concierge</span>
                        </Button>

                        {/* Escape Room */}
                        <Button
                            variant="outline"
                            className="h-auto py-6 flex flex-col gap-2 border-slate-200 dark:border-slate-800 hover:border-green-500/50 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all"
                            onClick={() => handleConciergeClick(() => setEscapeModalOpen(true))}
                        >
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                <Key className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">Escape Room</span>
                        </Button>

                        {/* Book Finder */}
                        <Button
                            variant="outline"
                            className="h-auto py-6 flex flex-col gap-2 border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                            onClick={() => handleConciergeClick(() => setBookModalOpen(true))}
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Book className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">Book Finder</span>
                        </Button>
                    </div>
                </div>

                {/* Upgrade Prompts */}
                <div className="mt-8 space-y-4 max-w-2xl mx-auto">
                    {showConciergeUpgrade && (
                        <DemoUpgradePrompt
                            reason="premium"
                            message="You've used your free premium trial! Upgrade to unlock unlimited access."
                        />
                    )}
                    {showAILimitPrompt && <DemoUpgradePrompt reason="ai_limit" />}
                    {showSavePrompt && !showAILimitPrompt && <DemoUpgradePrompt reason="save" />}
                    {!showAILimitPrompt && !showSavePrompt && !showConciergeUpgrade && ideas.length >= 3 && (
                        <DemoUpgradePrompt reason="general" />
                    )}
                </div>

                {/* Dev Helper - Visible for Testing */}
                <div className="mt-12 mb-8 text-center">
                    <button
                        onClick={resetConciergeTrial}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors font-mono"
                    >
                        🔄 (Dev) Reset Trial Status
                    </button>
                    <p className="text-xs text-slate-400 mt-2">Click to restore your 1 free concierge use</p>
                </div>
            </main>

            <AddIdeaModal
                isOpen={addModalOpen || !!editingIdea}
                onClose={handleCloseAddModal}
                initialData={editingIdea}
                isPremium={false}
                onUpgrade={() => {
                    localStorage.setItem('import_demo_data', 'true');
                    router.push('/signup');
                }}
            />

            {/* Upgrade Modal Overlay */}
            {/* Upgrade Modal Overlay */}
            <PremiumBlockerModal
                isOpen={upgradeModalOpen}
                onClose={() => setUpgradeModalOpen(false)}
            />

            {/* Concierge Modals */}
            <DiningConciergeModal
                isOpen={diningModalOpen}
                onClose={() => setDiningModalOpen(false)}
                onIdeaAdded={loadDemoData}
            />
            <BarConciergeModal
                isOpen={barModalOpen}
                onClose={() => setBarModalOpen(false)}
                onIdeaAdded={loadDemoData}
            />
            <MovieConciergeModal
                isOpen={movieModalOpen}
                onClose={() => setMovieModalOpen(false)}
                onIdeaAdded={loadDemoData}
            />
            <EscapeRoomConciergeModal
                isOpen={escapeModalOpen}
                onClose={() => setEscapeModalOpen(false)}
                onIdeaAdded={loadDemoData}
            />
            <BookConciergeModal
                isOpen={bookModalOpen}
                onClose={() => setBookModalOpen(false)}
                onIdeaAdded={loadDemoData}
                demoConcierge={demoConcierge ?? undefined}
            />
        </div>
    );
}
