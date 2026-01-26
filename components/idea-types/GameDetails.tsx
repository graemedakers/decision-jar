import React from 'react';
import { GameTypeData } from '@/lib/types/idea-types';
import { Gamepad2, Monitor, Users, Star, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GameDetails({ data, compact, idea }: { data: GameTypeData; compact?: boolean; idea?: any }) {
    return (
        <div className={cn("space-y-4", compact ? "p-0" : "p-4 bg-slate-50 dark:bg-white/5 rounded-xl")}>
            {/* Header Stats */}
            <div className="flex flex-wrap gap-2 text-sm">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300">
                    <Gamepad2 className="w-4 h-4" />
                    <span className="font-medium capitalize">{data.gameType.replace('_', ' ')}</span>
                </div>
                {data.rating && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300">
                        <Star className="w-4 h-4" />
                        <span className="font-medium">{data.rating}</span>
                    </div>
                )}
                {data.coop && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-300">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">Co-op</span>
                    </div>
                )}
            </div>

            {/* Platforms & Genre */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.platform && data.platform.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                            <Monitor className="w-3 h-3" /> Platforms
                        </h4>
                        <div className="flex flex-wrap gap-1">
                            {data.platform.map(p => (
                                <span key={p} className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-white/10 rounded text-slate-700 dark:text-slate-300">
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {data.genre && data.genre.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> Genres
                        </h4>
                        <div className="flex flex-wrap gap-1">
                            {data.genre.map(g => (
                                <span key={g} className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-white/10 rounded text-slate-700 dark:text-slate-300">
                                    {g}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Play Button - Per User Request: Opens link without selecting idea */}
            {/* Play Button - Consistent & Robust */}
            <div className="pt-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (data.playUrl) {
                            window.open(data.playUrl, '_blank', 'noopener,noreferrer');
                        } else {
                            // Fallback: Search for the game online
                            const gameTitle = data.title || idea?.title || idea?.name || "";
                            const query = `Play ${gameTitle} online`;
                            window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                        }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 font-bold py-2.5 rounded-lg transition-all shadow-sm text-sm group"
                >
                    <Gamepad2 className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    Play Now
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-1">
                    {data.playUrl ? "Opens game in new tab" : "Search for game online"}
                </p>
            </div>

            {data.estimatedPlaytime && (
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-white/10 mt-2">
                    Est. Playtime: {data.estimatedPlaytime} min
                </div>
            )}

            {idea?.description && idea.description.toLowerCase().trim() !== (data.title || idea.title || "").toLowerCase().trim() && (
                <div className="bg-white/40 dark:bg-black/20 p-3 rounded-lg border border-purple-100/50 dark:border-white/5 mt-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic whitespace-pre-wrap">
                        {idea.description}
                    </p>
                </div>
            )}
        </div>
    );
}
