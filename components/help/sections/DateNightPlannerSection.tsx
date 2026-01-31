"use client";
import { RefreshCcw, Pencil } from "lucide-react";

export function DateNightPlannerSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Night Out Planner <span className="text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-0.5 rounded-full ml-2">PREMIUM</span></h3>
            <p className="text-slate-600 dark:text-slate-300">
                Want a complete evening plan without the hassle? The Night Out Planner curates a cohesive itinerary for you.
            </p>
            <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm border-b border-slate-200 dark:border-white/10 pb-1">How it Works</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                    <li>Access from the <strong>Explore</strong> tab</li>
                    <li>The planner generates a timeline including Drinks, Dinner, and an Event/Activity</li>
                    <li>All venues are chosen to be within walking distance for a smooth evening</li>
                </ol>
            </div>
            <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm border-b border-slate-200 dark:border-white/10 pb-1">Customizing the Plan</h4>
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                    <li>
                        <strong><RefreshCcw className="inline w-3 h-3 text-slate-400" /> Regenerate:</strong>
                        Don't like a specific venue? Click the refresh icon to find a better alternative nearby.
                    </li>
                    <li>
                        <strong><Pencil className="inline w-3 h-3 text-slate-400" /> Edit Details:</strong>
                        Manually edit any part of the itinerary item.
                    </li>
                </ul>
            </div>
        </div>
    );
}
