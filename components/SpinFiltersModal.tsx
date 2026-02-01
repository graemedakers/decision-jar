"use client";
import React from "react";
import { Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { MadLibSpinFilters } from "./MadLibSpinFilters";

interface SpinFiltersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSpin: (filters: { maxDuration?: number; maxCost?: string; maxActivityLevel?: string; timeOfDay?: string; category?: string; weather?: string; localOnly?: boolean; ideaTypes?: string[] }) => void;
    jarTopic?: string | null;
    ideas: any[];
    customCategories?: any[];
}

export function SpinFiltersModal({ isOpen, onClose, onSpin, jarTopic, ideas, customCategories }: SpinFiltersModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent raw className="bg-slate-50 dark:bg-slate-900 border-none max-w-2xl">
                <DialogHeader onClose={onClose} className="border-b dark:border-white/5 py-4 shrink-0">
                    <DialogTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center">
                            <Filter className="w-5 h-5 text-secondary" />
                        </div>
                        <span className="text-xl font-bold text-slate-800 dark:text-white">Tune Your Vibe</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 md:p-8 overflow-y-auto max-h-[85vh]">
                    <MadLibSpinFilters
                        onSpin={(filters) => {
                            onSpin(filters);
                            onClose();
                        }}
                        jarTopic={jarTopic}
                        ideas={ideas}
                        customCategories={customCategories}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
