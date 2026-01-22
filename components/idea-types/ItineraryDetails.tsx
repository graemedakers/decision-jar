import React, { useState } from 'react';
import { ItineraryTypeData } from '@/lib/types/idea-types';
import { Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ItineraryDetails({ data, compact, idea }: { data: ItineraryTypeData; compact?: boolean; idea?: any }) {
    // If compact, only show first 2 steps
    const stepsToShow = compact ? data.steps.slice(0, 2) : data.steps;

    return (
        <div className={cn("space-y-4", compact ? "p-0" : "p-4 bg-slate-50 dark:bg-white/5 rounded-xl")}>
            {/* Header Info */}
            {!compact && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                        {data.totalDuration && (
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{data.totalDuration}</span>
                            </div>
                        )}
                        {data.vibe && (
                            <div className="px-2 py-0.5 bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 rounded-full text-xs font-medium">
                                {data.vibe} Vibe
                            </div>
                        )}
                    </div>
                    {idea?.description &&
                        idea.description.toLowerCase().trim() !== idea?.name?.toLowerCase().trim() &&
                        idea.description.toLowerCase().trim() !== idea?.title?.toLowerCase().trim() && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 italic bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-pink-100/50 dark:border-white/5">
                                {idea.description}
                            </p>
                        )}
                </div>
            )}

            {/* Timeline */}
            <div className="relative space-y-4">
                {/* Vertical line connecting steps */}
                {!compact && <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-700/50" />}

                {stepsToShow.map((step, idx) => {
                    const showDayHeader = !compact && step.day && (idx === 0 || stepsToShow[idx - 1].day !== step.day);

                    return (
                        <React.Fragment key={idx}>
                            {showDayHeader && (
                                <div className="relative z-10 pt-4 pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-0.5 bg-slate-200 dark:bg-slate-800" />
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Day {step.day}</span>
                                        <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-800" />
                                    </div>
                                </div>
                            )}

                            <div className="relative flex gap-4">
                                {/* Circle Marker */}
                                <div className="relative z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm text-xs font-bold text-slate-500">
                                    {step.order || idx + 1}
                                </div>

                                {/* Content Card */}
                                <div className="flex-1 min-w-0">
                                    <div className="bg-white dark:bg-black/20 rounded-lg p-3 border border-slate-200 dark:border-white/5 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                {step.time && <div className="text-xs font-bold text-slate-400 mb-0.5">{step.time}</div>}
                                                <h4 className="font-medium text-slate-900 dark:text-white leading-tight">{step.activity}</h4>
                                            </div>
                                        </div>

                                        {step.location && (
                                            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="truncate">{step.location.name}</span>
                                            </div>
                                        )}

                                        {/* Expandable details if present */}
                                        {step.notes && !compact && (
                                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 text-sm text-slate-500">
                                                {step.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}

                {compact && data.steps.length > 2 && (
                    <div className="pl-14 text-xs text-slate-400 italic">
                        + {data.steps.length - 2} more steps...
                    </div>
                )}
            </div>
        </div>
    );
}
