"use client";

export function StructuredIdeasSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Structured Idea Types</h3>
            <p className="text-slate-600 dark:text-slate-300">
                Go beyond simple text. Structured ideas allow you to store specific data points for common activities, making them easier to manage and enjoy.
            </p>

            <div className="grid gap-4 mt-4">
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                        🎬 Movies
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">Track directors, runtimes, and where to watch. Includes a direct "Watch Trailer" action on reveal.</p>
                    <ul className="text-[10px] text-slate-400 grid grid-cols-2 gap-x-2">
                        <li>• Streaming/Cinema</li>
                        <li>• IMDb Links</li>
                    </ul>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                        📖 Books
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">Store authors, page counts, and formats. Connect directly to Goodreads.</p>
                    <ul className="text-[10px] text-slate-400 grid grid-cols-2 gap-x-2">
                        <li>• Physical/Ebook/Audio</li>
                        <li>• Genre Tracking</li>
                    </ul>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                        🍳 Recipes
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">Full ingredient lists and step-by-step instructions. Turn on "Cook Mode" for a distraction-free view.</p>
                    <ul className="text-[10px] text-slate-400 grid grid-cols-2 gap-x-2">
                        <li>• Timings (Prep/Cook)</li>
                        <li>• Source URLs</li>
                    </ul>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                        🎮 Games
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">Log platforms, player counts, and estimated playtime. Great for board games and video games.</p>
                    <ul className="text-[10px] text-slate-400 grid grid-cols-2 gap-x-2">
                        <li>• Co-op Support</li>
                        <li>• Difficulty levels</li>
                    </ul>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20 mt-4">
                <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-1">🎭 Smart Switching</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    When you spin the jar and a structured idea is picked, Decision Jar automatically switches its display to match. You'll see beautiful tailored cards instead of generic text.
                </p>
            </div>
        </div>
    );
}
