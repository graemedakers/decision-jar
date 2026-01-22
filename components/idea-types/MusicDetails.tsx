import React from 'react';
import { Music, Calendar, Disc, ExternalLink } from "lucide-react";
import { MusicTypeData } from "@/lib/types/idea-types";
import { Badge } from "@/components/ui/Badge";

interface MusicDetailsProps {
    data: MusicTypeData;
    compact?: boolean;
    idea?: any;
}

export function MusicDetails({ data, compact, idea }: MusicDetailsProps) {
    if (compact) {
        return (
            <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {data.title}
                </span>
                <span className="text-[10px] text-fuchsia-600 dark:text-fuchsia-400">
                    {data.artist}
                </span>
            </div>
        );
    }

    return (
        <div className="bg-fuchsia-50 dark:bg-fuchsia-950/20 rounded-xl p-4 border border-fuchsia-100 dark:border-fuchsia-900/30 space-y-4">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {data.type === 'concert' ? <Music className="w-4 h-4 text-fuchsia-500" /> : <Disc className="w-4 h-4 text-fuchsia-500" />}
                        {data.title || "Music Details"}
                    </h3>
                    {(data.artist || idea?.description) && (
                        <div className="text-sm font-medium text-fuchsia-700 dark:text-fuchsia-300 mt-1">
                            by {data.artist || idea?.description}
                        </div>
                    )}
                </div>
                {data.releaseYear && (
                    <Badge variant="outline" className="border-fuchsia-200 text-fuchsia-700">
                        {data.releaseYear}
                    </Badge>
                )}
            </div>

            {data.type === 'concert' && data.venue && (
                <div className="bg-white/50 dark:bg-black/5 p-3 rounded-lg text-sm space-y-1 text-slate-600 dark:text-slate-300">
                    <div className="font-medium flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {data.eventDate ? new Date(data.eventDate).toLocaleDateString() : 'Date TBD'}
                    </div>
                    <div className="pl-5.5 text-xs text-slate-500">
                        at {data.venue.name}
                    </div>
                </div>
            )}

            {(data.genre?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {data.genre!.map((g, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-white dark:bg-white/10 rounded-full text-slate-500 border border-slate-100 dark:border-transparent">
                            {g}
                        </span>
                    ))}
                </div>
            )}

            {data.listenLink && (
                <a
                    href={data.listenLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 px-3 text-sm font-medium text-fuchsia-700 dark:text-fuchsia-300 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-lg hover:bg-fuchsia-200 transition-colors"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Listen / Tickets
                </a>
            )}

            {idea?.details &&
                idea.details.toLowerCase().trim() !== (data.title || "").toLowerCase().trim() &&
                idea.details.toLowerCase().trim() !== (data.artist || "").toLowerCase().trim() &&
                idea.details !== idea.description && (
                    <div className="bg-white/40 dark:bg-black/20 p-3 rounded-lg border border-fuchsia-100/50 dark:border-white/5 mt-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic whitespace-pre-wrap">
                            {idea.details}
                        </p>
                    </div>
                )}
        </div>
    );
}
