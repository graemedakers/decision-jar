import React from 'react';
import { FileText, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface GenericDetailsProps {
    data?: any;
    idea?: any; // Fallback if data is not structured
    compact?: boolean;
}

export function GenericDetails({ data, idea, compact }: GenericDetailsProps) {
    if (compact) {
        return (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-500">
                    <Info className="w-3 h-3" />
                    <span className="text-xs">General Idea</span>
                </div>
            </div>
        );
    }

    // Try to get description from robust sources
    const description = data?.description || idea?.description || "No description provided.";
    const notes = data?.notes || idea?.details;

    return (
        <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/5 space-y-4">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        Details
                    </h3>
                </div>
                {idea?.category && (
                    <Badge variant="secondary" className="text-xs">
                        {idea.category}
                    </Badge>
                )}
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
                <p className="leading-relaxed">{description}</p>

                {notes && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Notes</h4>
                        <div className="whitespace-pre-wrap">{notes}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
