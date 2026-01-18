"use client";

import { Sparkles, Plus, BookOpen, Users } from "lucide-react";
import { useModalSystem } from "./ModalProvider";

import { getSuggestedConcierge } from "@/lib/concierge-logic";
import { showSuccess, showError } from "@/lib/toast";

interface EnhancedEmptyStateProps {
    jarTopic: string;
    jarName: string;
    jarId: string;
    inviteCode?: string | null;
    onTemplateClick: () => void;
    onAddIdeaClick: () => void;
}

export function EnhancedEmptyState({ jarTopic, jarName, jarId, inviteCode, onTemplateClick, onAddIdeaClick }: EnhancedEmptyStateProps) {
    const { openModal } = useModalSystem();

    const suggestedConcierge = getSuggestedConcierge(jarTopic, jarName);

    const handleUseAI = () => {
        openModal('CONCIERGE', { toolId: suggestedConcierge.id });
    };

    const handleInvite = async () => {
        if (!inviteCode) {
            showError("No invite code available");
            return;
        }

        try {
            const url = `${window.location.origin}/join?code=${inviteCode}`;
            await navigator.clipboard.writeText(url);
            showSuccess("Invite link copied to clipboard!");
        } catch (err) {
            showError("Failed to copy link");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-8">
            <div className="w-full max-w-2xl text-center space-y-8">
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                        Your Jar is Empty!
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                        Let's fill it with exciting ideas. Choose how you'd like to get started:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* AI Concierge */}
                    <button
                        onClick={handleUseAI}
                        className="p-6 rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/30 dark:hover:to-indigo-900/30 transition-all text-left group hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                                <h4 className="font-bold text-lg text-purple-900 dark:text-purple-300 mb-1">
                                    {suggestedConcierge.name}
                                </h4>
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
                        onClick={onTemplateClick}
                        className="p-6 rounded-2xl border-2 border-blue-200 dark:border-blue-500/30 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 transition-all text-left group hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                                <h4 className="font-bold text-lg text-blue-900 dark:text-blue-300 mb-1">
                                    Browse Templates
                                </h4>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    Import pre-made idea collections for {jarTopic}
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Add Manually */}
                    <button
                        onClick={onAddIdeaClick}
                        className="p-6 rounded-2xl border-2 border-emerald-200 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30 transition-all text-left group hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/10"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                                <Plus className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                                <h4 className="font-bold text-lg text-emerald-900 dark:text-emerald-300 mb-1">
                                    Add Ideas Manually
                                </h4>
                                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                    Start from scratch with your own suggestions
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Invite Others */}
                    <button
                        onClick={handleInvite}
                        className="p-6 rounded-2xl border-2 border-amber-200 dark:border-amber-500/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 transition-all text-left group hover:scale-105 hover:shadow-lg hover:shadow-amber-500/10"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                                <h4 className="font-bold text-lg text-amber-900 dark:text-amber-300 mb-1">
                                    Invite Others
                                </h4>
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    Share your jar so others can contribute ideas
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
