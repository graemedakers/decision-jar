"use client";

import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { SmartToolsGrid } from "@/components/SmartToolsGrid";
import { UserData } from "@/lib/types";
import { X } from "lucide-react";

interface ToolsModalProps {
    isOpen: boolean;
    onClose: () => void;
    isPremium: boolean;
    jarTopic: string;
    activityPlannerTitle: string;
}

export function ToolsModal({
    isOpen,
    onClose,
    isPremium,
    jarTopic,
    activityPlannerTitle
}: ToolsModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent raw className="max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-slate-50 dark:bg-slate-900 border-none outline-none">
                <div className="sticky top-0 z-20 flex items-center justify-between p-4 md:p-6 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            Explore Tools
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Specialized planners and finders for any occasion
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500 dark:text-slate-300" />
                    </button>
                </div>

                <div className="p-4 md:p-8">
                    <SmartToolsGrid
                        isPremium={isPremium}
                        jarTopic={jarTopic}
                        activityPlannerTitle={activityPlannerTitle}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
