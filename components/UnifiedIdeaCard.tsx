"use client";
import React from "react";
import { StandardizedIdeaHeader } from "./StandardizedIdeaHeader";
import { IdeaTypeRenderer } from "./idea-types/IdeaTypeRenderer";

interface UnifiedIdeaCardProps {
    idea: any;
    effectiveType?: string;
    typeData?: any;
    compact?: boolean;
    hideHeader?: boolean;
}

export function UnifiedIdeaCard({
    idea,
    effectiveType,
    typeData,
    compact = false,
    hideHeader = false
}: UnifiedIdeaCardProps) {
    if (!idea) return null;

    // Helper to extract link from markdown if it exists
    const extractLink = (text: string) => {
        if (!text) return null;
        const match = text.match(/\[.*?\]\((https?:\/\/[^\s)]+)\)/);
        return match ? match[1] : null;
    };

    const rawDescription = idea.details || idea.description || '';
    const extractedWebsite = extractLink(rawDescription);

    // Helper to clean up redundant lines from description/details
    const cleanDescription = (text: string) => {
        if (!text) return "";
        return text
            .split('\n')
            .filter(line => {
                const lower = line.trim().toLowerCase();
                // Remove lines that are just keys or keys with values we likely render elsewhere
                return !lower.match(/^[*_]*(address|price|rating|website|menu|hours|phone|summary)[*_]*:/);
            })
            // Remove raw markdown links like [Visit Website](...)
            .filter(line => !line.match(/^\[.*\]\(.*\)$/))
            .join('\n')
            .trim();
    };

    const description = cleanDescription(idea.details || idea.description || '');

    // Sanitize address: Remove venue name if it's included (e.g. "Venue Name - 123 Street")
    const rawAddress = idea.address || typeData?.address || typeData?.location?.address || typeData?.venue?.address;
    const isGenericTitle = !idea.description || idea.description === 'Shared Link' || idea.description === 'YouTube Video' || idea.description === 'Loading video info...';
    const name = (isGenericTitle && (typeData?.title || typeData?.videoId))
        ? (typeData.title || `YouTube: ${typeData.videoId}`)
        : (idea.description || idea.name || idea.title || 'Untitled Idea');

    let address = rawAddress;
    if (address && name && address.toLowerCase().startsWith(name.toLowerCase())) {
        // Remove name and potential separator
        address = address.substring(name.length).replace(/^[\s-–,]+/, '').trim();
    }

    const finalWebsite = idea.website || typeData?.officialWebsite || typeData?.website || extractedWebsite;
    const finalTypeData = { ...typeData, website: finalWebsite, watchUrl: typeData?.watchUrl || finalWebsite };

    const cleanedIdea = {
        ...idea,
        // We keep the original description (title) for headers
        details: description, // Override details with the cleaned summary
        address: address,
        website: finalWebsite
    };

    // SPECIAL RENDERER FOR SIMPLE TEXT (Quotes, Affirmations, Jokes)
    if (effectiveType === 'simple' && typeData) {
        return (
            <div className={`flex flex-col items-center justify-center p-8 gap-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm ${compact ? 'min-h-[200px]' : 'min-h-[300px]'}`}>
                <div className="max-w-xl space-y-4">
                    <p className={`font-serif text-slate-800 dark:text-slate-100 leading-relaxed ${compact ? 'text-xl' : 'text-2xl md:text-3xl'}`}>
                        "{typeData.text}"
                    </p>
                    {typeData.author && (
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-4">
                            — {typeData.author}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-6 ${compact ? '' : 'w-full'}`}>
            {!hideHeader && (
                <StandardizedIdeaHeader
                    name={name}
                    description={description}
                    address={address}
                    price={idea.price || idea.cost || typeData?.price || typeData?.cost}
                    rating={idea.google_rating || idea.googleRating || typeData?.rating || typeData?.googleRating}
                    website={finalWebsite}
                    menuUrl={idea.menuUrl || idea.menu_url || typeData?.menuUrl || typeData?.menuLink || typeData?.menu_url}
                    category={idea.categoryId || idea.category}
                    showtimes={idea.showtimes || idea.openingHours || typeData?.showtimes || typeData?.openingHours || typeData?.hours || (typeData?.date ? new Date(typeData.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined)}
                    showDates={idea.show_dates || typeData?.showDates || (typeData?.date ? new Date(typeData.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : undefined)}
                    cinemaName={idea.cinema_name || typeData?.cinemaName || typeData?.location?.name || typeData?.venue?.name}
                    compact={compact}
                />
            )}

            {(effectiveType || typeData) && (
                <div className="bg-slate-50 dark:bg-white/5 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 p-1 shadow-sm">
                    <IdeaTypeRenderer
                        type={effectiveType || 'generic'}
                        data={finalTypeData}
                        compact={compact}
                        idea={cleanedIdea}
                    />
                </div>
            )}
        </div>
    );
}
