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
        <div className="min-h-screen pb-32 bg-gradient-to-b from-purple-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
            <DemoBanner />

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {/* Header */}
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                        {jar.name}
                    </h1>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        {availableIdeas.length} ideas ready
                        <span className="mx-1">•</span>
                        {DEMO_LIMITS.AI_REQUESTS - aiCount} AI requests left
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-16">
                    {/* Jar & Spin */}
                    <div className="space-y-6">
                        {/* Simple Jar Visualization */}
                        <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative w-56 h-56 mx-auto mb-8 transition-transform duration-500 group-hover:scale-105">
                                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full opacity-20 animate-pulse blur-xl" />
                                <div className="absolute inset-4 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
                                    <Heart className="w-24 h-24 text-white drop-shadow-md" />
                                </div>
                            </div>

                            <p className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                                {availableIdeas.length}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium uppercase tracking-widest text-sm">
                                ideas in your jar
                            </p>

                            <Button
                                onClick={handleSpin}
                                disabled={spinning || availableIdeas.length === 0}
                                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:scale-[1.02] shadow-xl shadow-purple-500/20 py-6 text-lg font-bold"
                                size="lg"
                            >
                                {spinning ? (
                                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Spinning...</>
                                ) : (
                                    <><Sparkles className="w-5 h-5 mr-2" /> Spin the Jar!</>
                                )}
                            </Button>
                        </div>

                        {/* Revealed Idea */}
                        {revealedIdea && (
                            <div className="glass-card p-8 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200 dark:border-pink-800/50 overflow-hidden shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-black text-2xl text-slate-900 dark:text-white leading-tight">
                                        {revealedIdea.description}
                                    </h3>
                                    <span className="text-2xl animate-bounce">🎉</span>
                                </div>

                                {revealedIdea.details && (
                                    <p className="text-slate-700 dark:text-slate-300 mb-6 text-lg leading-relaxed">
                                        {revealedIdea.details}
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-3 py-1.5 bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm text-slate-700 dark:text-slate-200">
                                        <DollarSign className="w-3.5 h-3.5" /> {revealedIdea.cost}
                                    </span>
                                    <span className="px-3 py-1.5 bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm text-slate-700 dark:text-slate-200">
                                        <Clock className="w-3.5 h-3.5" /> {revealedIdea.duration}h
                                    </span>
                                    <span className="px-3 py-1.5 bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm text-slate-700 dark:text-slate-200 capitalize">
                                        <Sparkles className="w-3.5 h-3.5" /> {revealedIdea.activityLevel?.toLowerCase()}
                                    </span>
                                </div>
                                <Button
                                    onClick={() => setRevealedIdea(null)}
                                    variant="outline"
                                    className="w-full border-pink-200 hover:bg-pink-100/50 dark:border-pink-700 dark:hover:bg-pink-900/30"
                                >
                                    Close Result
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Ideas List */}
                    <div className="glass-card p-6 md:p-8 flex flex-col h-full min-h-[500px]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-500" /> Your Ideas
                            </h2>
                            <Button
                                onClick={() => setAddModalOpen(true)}
                                size="sm"
                                className="shadow-lg shadow-purple-500/10"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Idea
                            </Button>
                        </div>

                        <div className="space-y-3 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                            {availableIdeas.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                                    <Sparkles className="w-12 h-12 text-slate-400 mb-4" />
                                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                                        Your jar is empty! <br /> Add some fun ideas to get started.
                                    </p>
                                </div>
                            ) : (
                                availableIdeas.map(idea => (
                                    <div
                                        key={idea.id}
                                        className="group bg-slate-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 p-4 rounded-xl border border-transparent hover:border-purple-200 dark:hover:border-purple-500/30 transition-all cursor-pointer shadow-sm hover:shadow-md"
                                        onClick={() => setEditingIdea(idea)}
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                {idea.description}
                                            </h3>
                                        </div>
                                        {idea.details && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mb-3 font-medium">
                                                {idea.details}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="w-3.5 h-3.5" /> {idea.cost}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" /> {idea.duration}h
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {completedIdeas.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                                    Completed Memories ({completedIdeas.length})
                                </h3>
                                <p className="text-sm text-slate-500 italic">
                                    Sign up to unlock and revisit your memories!
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Premium Tools Section */}
                <div className="mb-16">
                    <div className="glass-card p-8 md:p-10 relative overflow-hidden">
                        {/* Subtle bg decoration */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 relative z-10">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 text-amber-500" />
                                    Premium Concierge Tools
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 max-w-xl text-lg">
                                    AI-powered tools to plan your perfect date in seconds.
                                </p>
                            </div>
                            <span className="self-start md:self-center text-xs font-black px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-500/20 shadow-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                1 FREE TRIAL AVAILABLE
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10">
                            {[
                                { icon: Utensils, label: 'Dining Concierge', color: 'orange', action: () => setDiningModalOpen(true) },
                                { icon: Wine, label: 'Bar Concierge', color: 'purple', action: () => setBarModalOpen(true) },
                                { icon: Film, label: 'Movie Concierge', color: 'blue', action: () => setMovieModalOpen(true) },
                                { icon: Key, label: 'Escape Room', color: 'green', action: () => setEscapeModalOpen(true) },
                                { icon: Book, label: 'Book Finder', color: 'blue', action: () => setBookModalOpen(true) },
                            ].map((tool, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleConciergeClick(tool.action)}
                                    className="group flex flex-col items-center justify-center gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className={`w-14 h-14 rounded-2xl bg-${tool.color}-100 dark:bg-${tool.color}-900/20 flex items-center justify-center text-${tool.color}-600 dark:text-${tool.color}-400 group-hover:scale-110 transition-transform`}>
                                        <tool.icon className="w-7 h-7" />
                                    </div>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm text-center">{tool.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Upgrade Prompts Area */}
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    {/* Only show if a specific prompt is triggered */}
                    {(showConciergeUpgrade || showAILimitPrompt || showSavePrompt) && (
                        <div className="animate-in slide-in-from-bottom-6 fade-in duration-500">
                            {showConciergeUpgrade && (
                                <DemoUpgradePrompt
                                    reason="premium"
                                    message="You've used your free premium trial! Upgrade to unlock unlimited access."
                                />
                            )}
                            {showAILimitPrompt && <DemoUpgradePrompt reason="ai_limit" />}
                            {showSavePrompt && !showAILimitPrompt && <DemoUpgradePrompt reason="save" />}
                        </div>
                    )}

                    {/* Always visible 'Save Progress' if no other prompt is dominating and sufficient usage */}
                    {!showAILimitPrompt && !showSavePrompt && !showConciergeUpgrade && ideas.length > 0 && (
                        <div className="relative pt-8 md:pt-12">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
                            <DemoUpgradePrompt reason="save" />
                        </div>
                    )}

                    <p className="text-slate-400 text-sm">
                        Decision Jar &copy; {new Date().getFullYear()} • <button onClick={resetConciergeTrial} className="hover:underline">Reference ID: DEMO-{new Date().getTime().toString().slice(-4)}</button>
                    </p>
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
