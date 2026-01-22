"use client";

import React from 'react';
import { MapPin, Star, Clock, Globe, ExternalLink, Navigation } from "lucide-react";
import { getShortHours } from "@/lib/utils";

interface VenuePreviewProps {
    venue: {
        name?: string | null;
        address?: string | null;
        rating?: string | null;
        hours?: string | null;
        website?: string | null;
        description?: string | null;
    };
    fallbackDescription?: string | null;
    onSave?: () => void;
}

export function VenuePreview({ venue, fallbackDescription }: VenuePreviewProps) {
    if (!venue) return null;

    const { name, address, rating, hours, website } = venue;
    const description = venue.description || fallbackDescription;

    const googleMapsUrl = address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
        : null;

    // Defensive cleanup for website if it still contains markdown noise
    let cleanWebsite = website;
    if (cleanWebsite) {
        // If it contains ][ or [) etc, it's malformed markdown
        const mdMatch = cleanWebsite.match(/\]\((https?:\/\/[^\s)]+)\)/);
        if (mdMatch) {
            cleanWebsite = mdMatch[1];
        } else {
            // Remove any leading [ or trailing ]
            cleanWebsite = cleanWebsite.replace(/^[\[\s]+|[\]\s]+$/g, '');
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Title & Badges Section */}
            <div className="space-y-3">
                {name && (
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                        {name}
                    </h2>
                )}

                <div className="flex flex-wrap gap-2">
                    {rating && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-black shadow-sm border border-amber-100 dark:border-amber-500/20">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {rating}
                        </div>
                    )}
                    {hours && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black shadow-sm border border-blue-100 dark:border-blue-500/20 uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            {(() => {
                                const short = getShortHours(hours);
                                return short && short.length < 25 ? short : 'Hours Available';
                            })()}
                        </div>
                    )}
                </div>

                {/* Primary Info: Hours (Moved higher for prominent visibility) */}
                {hours && (
                    <div className="bg-blue-50/50 dark:bg-blue-500/5 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-500/10 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500/70 mb-1">Operating Hours</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic">{hours}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Description Block */}
                {description && description !== name && (
                    <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm mt-4">
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {description}
                        </p>
                    </div>
                )}
            </div>

            {/* Main Details Grid */}
            <div className="grid gap-4">
                {address && (
                    <div className="group bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5 text-rose-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Location</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">{address}</p>
                            </div>
                            {googleMapsUrl && (
                                <a
                                    href={googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                    title="Open in Maps"
                                >
                                    <Navigation className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                )}


                {cleanWebsite && (
                    <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl border border-primary/20 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <Globe className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Website</p>
                                <p className="text-xs font-bold text-primary truncate max-w-[150px]">
                                    {(() => {
                                        try {
                                            return new URL(cleanWebsite.startsWith('http') ? cleanWebsite : `https://${cleanWebsite}`).hostname;
                                        } catch (e) {
                                            return cleanWebsite.replace(/^https?:\/\//, '').split('/')[0];
                                        }
                                    })()}
                                </p>
                            </div>
                        </div>
                        <a
                            href={cleanWebsite.startsWith('http') ? cleanWebsite : `https://${cleanWebsite}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            Visit Now <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
