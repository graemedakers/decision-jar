import React from 'react';
import { TravelTypeData } from '@/lib/types/idea-types';
import { Plane, Map, Hotel, Car, Train } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TravelDetails({ data, compact, idea }: { data: TravelTypeData; compact?: boolean; idea?: any }) {
    const TravelIcon = data.travelType === 'flight' ? Plane : data.travelType === 'road_trip' ? Car : Train;

    return (
        <div className={cn("space-y-4", compact ? "p-0" : "p-4 bg-slate-50 dark:bg-white/5 rounded-xl")}>
            {/* Header / Destination */}
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                        Destination
                    </h4>
                    <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Map className="w-5 h-5 text-blue-500" />
                        {data.destination.name || "Unknown Destination"}
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                        <TravelIcon className="w-4 h-4 text-slate-400" />
                        {data.travelType.replace('_', ' ')}
                    </div>
                </div>
            </div>

            {/* Accommodation */}
            {data.accommodationName && (
                <div className="bg-white dark:bg-black/20 p-3 rounded-lg border border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <Hotel className="w-4 h-4 text-indigo-500" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{data.accommodationName}</span>
                    </div>
                    {data.amenities && data.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {data.amenities.map((a, i) => (
                                <span key={i} className="text-[10px] uppercase px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 rounded text-slate-500">
                                    {a}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Dates / Booking Reference */}
            {data.bookingReference && (
                <div className="text-xs text-slate-500 mt-2 text-center">
                    Ref: {data.bookingReference}
                </div>
            )}

            {idea?.description &&
                idea.description.toLowerCase().trim() !== (data.destination?.name || "").toLowerCase().trim() &&
                idea.description.toLowerCase().trim() !== (data.accommodationName || "").toLowerCase().trim() && (
                    <div className="bg-white/40 dark:bg-black/20 p-3 rounded-lg border border-blue-100/50 dark:border-white/5 mt-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic whitespace-pre-wrap">
                            {idea.description}
                        </p>
                    </div>
                )}
        </div>
    );
}
