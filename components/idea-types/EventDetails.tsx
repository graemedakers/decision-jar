import React from 'react';
import { EventTypeData } from '@/lib/types/idea-types';
import { Calendar, MapPin, ExternalLink, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function EventDetails({ data, compact, idea }: { data: EventTypeData; compact?: boolean; idea?: any }) {
    return (
        <div className={cn("space-y-4", compact ? "p-0" : "p-4 bg-slate-50 dark:bg-white/5 rounded-xl")}>
            <div className="flex flex-col gap-3">
                {/* Time & Date */}
                <div className="flex items-start justify-between">
                    <div>
                        {data.date && (
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                                <Calendar className="w-4 h-4 text-pink-500" />
                                {new Date(data.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                            </div>
                        )}
                        {data.startTime && (
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm mt-1">
                                <Clock className="w-4 h-4" />
                                {data.startTime}
                            </div>
                        )}
                    </div>
                </div>

                {/* Venue Info */}
                {data.venue && (
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-black/20 p-2 rounded-lg border border-slate-100 dark:border-white/5">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                            {data.venue.name && <div className="font-medium truncate">{data.venue.name}</div>}
                            {data.venue.address && <div className="text-xs text-slate-500 truncate">{data.venue.address}</div>}
                        </div>
                        {data.venue.mapLink && (
                            <a href={data.venue.mapLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline px-2">
                                Map
                            </a>
                        )}
                    </div>
                )}

                {/* Tickets & Links */}
                {(data.ticketUrl || (data as any).officialWebsite) && (
                    <div className="flex justify-end items-center gap-2 mt-1">
                        {(data as any).officialWebsite && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600 dark:text-blue-400" onClick={() => window.open((data as any).officialWebsite, '_blank')}>
                                <ExternalLink className="w-3 h-3 mr-1" /> Visit Website
                            </Button>
                        )}
                        {data.ticketUrl && (
                            <Button size="sm" variant="outline" className="h-7 text-xs border-pink-200 text-pink-600 hover:bg-pink-50" onClick={() => window.open(data.ticketUrl, '_blank')}>
                                Book Now <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                        )}
                    </div>
                )}

                {/* Lineup */}
                {data.lineup && data.lineup.length > 0 && (
                    <div className="text-xs text-slate-500 mt-2">
                        <span className="font-bold">Lineup:</span> {data.lineup.join(', ')}
                    </div>
                )}

                {idea?.description && idea.description.toLowerCase().trim() !== (data.eventName || "").toLowerCase().trim() && (
                    <div className="bg-white/40 dark:bg-black/20 p-3 rounded-lg border border-pink-100/50 dark:border-white/5 mt-2">
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic whitespace-pre-wrap">
                            {idea.description}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
