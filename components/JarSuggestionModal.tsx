
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface JarSuggestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (jarId: string) => void;
    onStay: () => void;
    suggestedJar: {
        id: string;
        name: string;
        reason: string;
    };
    currentJarName: string;
    ideaCount: number;
}

export function JarSuggestionModal({
    isOpen,
    onClose,
    onConfirm,
    onStay,
    suggestedJar,
    currentJarName,
    ideaCount
}: JarSuggestionModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden" raw>
                <div className="p-6">
                    <DialogHeader onClose={onClose} showClose={true} className="px-0 pt-0 border-none">
                        <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900 dark:text-white leading-tight">
                            <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            Found a better Jar?
                        </DialogTitle>
                        <DialogDescription className="text-slate-600 dark:text-slate-400 text-base mt-4">
                            You're adding <span className="font-bold text-slate-900 dark:text-white">{ideaCount} ideas</span> to your <span className="font-medium">"{currentJarName}"</span> jar.
                            <br /><br />
                            These might fit better in your <span className="font-bold text-amber-600 dark:text-amber-400">"{suggestedJar.name}"</span> jar because it {suggestedJar.reason}.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-6 pb-6 space-y-3">
                    <button
                        onClick={() => onConfirm(suggestedJar.id)}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border-2 border-amber-200 dark:border-amber-500/30 hover:border-amber-400 transition-all group text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                                <Check className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white">Add to {suggestedJar.name}</div>
                                <div className="text-xs text-amber-700 dark:text-amber-400 font-medium italic">Recommended Match</div>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={onStay}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-left"
                    >
                        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center">
                            <Check className="w-6 h-6 opacity-0" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-700 dark:text-slate-300 italic opacity-80">Stay in {currentJarName}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Add them here anyway</div>
                        </div>
                    </button>
                </div>

                <DialogFooter className="bg-slate-50/50 dark:bg-black/10 px-6 py-4 flex justify-center">
                    <button
                        onClick={onClose}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest transition-colors"
                    >
                        Cancel Addition
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
