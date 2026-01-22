import React from 'react';
import { Utensils, DollarSign, Star, MapPin, Clock } from "lucide-react";
import { DiningTypeData } from "@/lib/types/idea-types";
import { Badge } from "@/components/ui/Badge";

interface DiningDetailsProps {
    data: DiningTypeData;
    compact?: boolean;
    idea?: any;
}

export function DiningDetails({ data, compact, idea }: DiningDetailsProps) {
    if (compact) {
        return (
            <div className="flex flex-col gap-1">
                {data.cuisine && (
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {data.cuisine}
                    </span>
                )}
                <div className="flex items-center gap-2 text-slate-500">
                    {data.priceRange && <span className="text-[10px] bg-slate-100 px-1 rounded">{data.priceRange}</span>}
                    {data.rating && (
                        <span className="flex items-center gap-0.5 text-[10px]">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            {data.rating}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    const coverImage = idea?.photoUrls?.[0];
    const description = idea?.details || idea?.description;

    return (
        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-4 border border-orange-100 dark:border-orange-900/30 space-y-4">

            {/* Cover Image */}
            {coverImage && (
                <div className="w-full h-40 rounded-lg overflow-hidden shadow-sm border border-orange-100 dark:border-orange-900/50">
                    <img src={coverImage} alt={data.establishmentName} className="w-full h-full object-cover" />
                </div>
            )}

            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-orange-500" />
                        {data.establishmentName || "Establishment Details"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        {data.cuisine && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">{data.cuisine}</span>
                        )}
                        {data.priceRange && (
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-black/20 px-1.5 py-0.5 rounded">
                                {data.priceRange}
                            </span>
                        )}
                    </div>
                </div>
                {data.rating && (
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 bg-white dark:bg-black/20 px-2 py-1 rounded-lg">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-slate-700 dark:text-slate-200">{data.rating}</span>
                        </div>
                    </div>
                )}
            </div>

            {((data as any).address || data.location) && (
                <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-black/5 p-2 rounded-lg">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <span>{(data as any).address || data.location?.address || data.location?.name}</span>
                </div>
            )}

            {description &&
                description.toLowerCase().trim() !== (data.establishmentName || "").toLowerCase().trim() &&
                description.toLowerCase().trim() !== (idea?.description || "").toLowerCase().trim() &&
                idea?.details !== idea?.description && (
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {description}
                    </p>
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

            {(data.menuHighlights?.length ?? 0) > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase">Menu Highlights</h4>
                    <div className="flex flex-wrap gap-2">
                        {data.menuHighlights!.map((item, i) => (
                            <Badge key={i} variant="outline" className="bg-white dark:bg-black/20">
                                {item}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {data.website && (
                <a
                    href={data.website}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full py-2 px-3 text-center text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 rounded-lg hover:bg-orange-200 transition-colors"
                >
                    View Menu & Reserve
                </a>
            )}
        </div>
    );
}
