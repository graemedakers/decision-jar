import React from 'react';
import { Clapperboard, Clock, Video, Monitor, Star, Ticket, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MovieTypeData } from '@/lib/types/idea-types';

interface MovieDetailsProps {
    data: MovieTypeData;
    compact?: boolean;
    idea?: any;
}

export function MovieDetails({ data, compact, idea }: MovieDetailsProps) {
    if (!data) return null;

    if (compact) {
        return (
            <div className="text-xs text-slate-500 flex items-center gap-1">
                <Clapperboard className="w-3 h-3" />
                <span>{data.year}</span>
                {data.runtime && <span>• {Math.floor(data.runtime / 60)}h {data.runtime % 60}m</span>}
            </div>
        );
    }

    const poster = idea?.photoUrls?.[0];
    const plot = data.plot || idea?.details;

    // Normalize array fields
    const castString = Array.isArray(data.cast) ? data.cast.join(', ') : data.cast;
    const genres = Array.isArray(data.genre) ? data.genre : (typeof data.genre === 'string' ? [data.genre] : []);
    const platforms = Array.isArray(data.streamingPlatform) ? data.streamingPlatform : (typeof data.streamingPlatform === 'string' ? [data.streamingPlatform] : (data.platform ? [data.platform] : []));

    return (
        <div className="space-y-6 mt-4">
            {data.title && (
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {data.title}
                </h3>
            )}
            <div className="flex gap-4">
                {/* Poster Image */}
                {poster && (
                    <div className="w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden shadow-md border border-slate-200 dark:border-white/10 bg-slate-900 border-l-4 border-l-slate-900">
                        <img src={poster} alt={data.title || "Movie Poster"} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="space-y-4 flex-1 min-w-0">
                    {/* Header Stats */}
                    <div className="flex flex-wrap gap-2 text-sm">
                        {data.year && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">{data.year}</span>
                            </div>
                        )}
                        {data.runtime && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                                <Video className="w-4 h-4" />
                                <span className="font-medium">{Math.floor(data.runtime / 60)}h {data.runtime % 60}m</span>
                            </div>
                        )}
                        {data.watchMode && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300">
                                <Monitor className="w-4 h-4" />
                                <span className="font-medium capitalize">{data.watchMode}</span>
                            </div>
                        )}
                        {data.rottenTomatoesScore && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-300">
                                <span className="font-bold">🍅 {data.rottenTomatoesScore}%</span>
                            </div>
                        )}
                    </div>

                    {/* Streaming Platforms */}
                    {platforms.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {platforms.map(platform => (
                                <span key={platform} className="text-[10px] px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md font-medium border border-blue-100 dark:border-blue-900/30">
                                    {platform}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Plot / Overview */}
            {(plot || idea?.description) && (
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Overview</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {plot || idea?.description}
                    </p>
                </div>
            )}

            {/* Director & Cast */}
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/10 space-y-3">
                {data.director && (
                    <div>
                        <p className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Director</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{data.director}</p>
                    </div>
                )}
                {castString && castString.length > 0 && (
                    <div>
                        <p className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Cast</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{castString}</p>
                    </div>
                )}
                {genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                        {genres.map(g => (
                            <span key={g} className="text-[10px] px-2 py-0.5 bg-white dark:bg-black/20 rounded border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400">
                                {g}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Smart Actions */}
            <div className="flex flex-col gap-2">
                {data.watchMode?.toLowerCase() === 'cinema' && (
                    <a
                        href={`https://www.google.com/search?q=${encodeURIComponent((data.title || "") + " showtimes near me")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 px-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg transition-colors shadow-sm"
                    >
                        <Ticket className="w-4 h-4" />
                        Find Showtimes & Tickets
                    </a>
                )}

                {data.imdbLink && (
                    <a
                        href={data.imdbLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 px-3 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        View on IMDb
                    </a>
                )}
            </div>
        </div>
    );
}
