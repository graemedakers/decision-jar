"use client";

export function ConciergeListSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Concierge Services <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full ml-2">PREMIUM</span></h3>
            <p className="text-slate-600 dark:text-slate-300">
                Our AI-powered scouts help you discover the best venues and activities near you.
            </p>
            <div className="grid gap-3 mt-4">
                <div className="bg-purple-50 dark:bg-purple-500/10 p-3 rounded-lg border border-purple-200 dark:border-purple-500/20">
                    <h4 className="font-bold text-purple-800 dark:text-purple-300 text-sm mb-1">🍷 Bar Scout</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Find cocktail bars, speakeasies, rooftops, and craft beer spots.</p>
                </div>
                <div className="bg-pink-50 dark:bg-pink-500/10 p-3 rounded-lg border border-pink-200 dark:border-pink-500/20">
                    <h4 className="font-bold text-pink-800 dark:text-pink-300 text-sm mb-1">🎵 Nightclub Scout</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Discover clubs by music genre and energy level.</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-500/10 p-3 rounded-lg border border-amber-200 dark:border-amber-500/20">
                    <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm mb-1">🎭 Theatre Scout</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Find plays, musicals, and live performances. Only shows currently running or upcoming are returned.</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-lg border border-blue-200 dark:border-blue-500/20">
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-1">🎬 Movie Scout</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Get cinema showtimes and streaming recommendations.</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-1">🏨 Hotel Finder</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Plan staycations with boutique and luxury options.</p>
                </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                <strong>Pro Tip:</strong> All scouts provide direct booking links, ratings, and can add recommendations to your jar for future spins.
            </p>
        </div>
    );
}
