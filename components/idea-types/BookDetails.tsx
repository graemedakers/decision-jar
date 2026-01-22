import React from 'react';
import { Book, User, Hash, Calendar, ExternalLink } from 'lucide-react';
import { BookTypeData } from '@/lib/types/idea-types';

interface BookDetailsProps {
    data: BookTypeData;
    compact?: boolean;
    idea?: any;
}

export function BookDetails({ data, compact, idea }: BookDetailsProps) {
    if (!data) return null;

    if (compact) {
        return (
            <div className="text-xs text-slate-500 flex items-center gap-1">
                <Book className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{data.author}</span>
                {data.yearPublished && <span>• {data.yearPublished}</span>}
            </div>
        );
    }

    const coverImage = idea?.photoUrls?.[0];
    const plot = data.plot || idea?.details;
    const link = data.goodreadsLink || idea?.website;

    return (
        <div className="space-y-6 mt-4">
            <div className="flex gap-4">
                {/* Cover Image */}
                {coverImage && (
                    <div className="w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden shadow-md border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800">
                        <img src={coverImage} alt={data.title || "Book cover"} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="space-y-4 flex-1 min-w-0">
                    {/* Header Stats */}
                    <div className="flex flex-wrap gap-2 text-sm">
                        {data.author && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                                <User className="w-4 h-4" />
                                <span className="font-medium">{data.author}</span>
                            </div>
                        )}
                        {data.yearPublished && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">{data.yearPublished}</span>
                            </div>
                        )}
                        {data.pageCount && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                                <Hash className="w-4 h-4" />
                                <span className="font-medium">{data.pageCount} pages</span>
                            </div>
                        )}
                        {data.format && (
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${data.format === 'any' ? 'bg-slate-100 dark:bg-white/5 text-slate-500' : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
                                <Book className="w-4 h-4" />
                                <span className="font-medium capitalize">{data.format === 'any' ? 'Any Format' : data.format}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Plot / Description */}
            {(plot || idea?.description) && (
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Plot Summary</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {plot || idea?.description}
                    </p>
                </div>
            )}

            {/* Genres */}
            {(data.genre && data.genre.length > 0) && (
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/10">
                    <p className="text-[10px] uppercase text-slate-500 font-bold mb-2">Genres</p>
                    <div className="flex flex-wrap gap-1">
                        {data.genre.map(g => (
                            <span key={g} className="text-xs px-2 py-0.5 bg-white dark:bg-black/20 rounded border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400">
                                {g}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Links & IDs */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-white/5">
                {data.isbn && (
                    <div className="text-xs text-slate-400 font-mono">
                        ISBN: {data.isbn}
                    </div>
                )}

                {link && (
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        View on Goodreads <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>
        </div>
    );
}
