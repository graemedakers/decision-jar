import React from 'react';
import { Activity, Clock, Users, MapPin, ExternalLink } from "lucide-react";
import { ActivityTypeData } from "@/lib/types/idea-types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ActivityDetailsProps {
    data: ActivityTypeData;
    compact?: boolean;
    idea?: any;
}

export function ActivityDetails({ data, compact, idea }: ActivityDetailsProps) {
    if (compact) {
        return (
            <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">
                    {data.activityType}
                </span>
                <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                    {data.duration && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {data.duration}h
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/30 space-y-4">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 capitalize">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        {data.activityType || "Activity Details"}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        {data.duration && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {data.duration} hours
                            </span>
                        )}
                        {data.participants && (
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {data.participants.min}-{data.participants.max} people
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {((data as any).location || (data as any).address) && (
                <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-black/5 p-2 rounded-lg">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                        <div className="font-medium">{(data as any).location?.name || idea?.description || idea?.title}</div>
                        <div className="text-xs text-slate-500">{(data as any).location?.address || (data as any).address}</div>
                    </div>
                </div>
            )}

            {(data as any).hours && (
                <div className="flex items-start gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 p-2 rounded-lg">
                    <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Operating Hours</span>
                        <span className="italic">{(data as any).hours}</span>
                    </div>
                </div>
            )}

            {(() => {
                const equipment = (data as any).equipmentNeeded;
                // Handle legacy data where equipmentNeeded might be a string instead of array
                const items = Array.isArray(equipment)
                    ? equipment
                    : (typeof equipment === 'string' && equipment.length > 0 ? [equipment] : []);

                if (items.length === 0) return null;

                return (
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase">Equipment Needed</h4>
                        <div className="flex flex-wrap gap-2">
                            {items.map((item, i) => (
                                <Badge key={i} variant="secondary" className="bg-white dark:bg-black/20 text-slate-600">
                                    {item}
                                </Badge>
                            ))}
                        </div>
                    </div>
                );
            })()}

            {idea?.details &&
                idea.details.toLowerCase().trim() !== (data.activityType || "").toLowerCase().trim() &&
                idea.details !== idea.description && (
                    <div className="bg-white/40 dark:bg-black/20 p-3 rounded-lg border border-emerald-100/50 dark:border-white/5">
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic whitespace-pre-wrap">
                            {idea.details}
                        </p>
                    </div>
                )}
        </div>
    );
}
