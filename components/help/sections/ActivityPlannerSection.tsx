"use client";

export function ActivityPlannerSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Activity Planner <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full ml-2">PREMIUM</span></h3>
            <p className="text-slate-600 dark:text-slate-300">
                Need a custom plan for the day? The Activity Planner creates a broader itinerary than the Night Out Planner.
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Occasion:</strong> Plan for "Family Day", "Romantic Date", "Solo Adventure", etc.</li>
                <li><strong>Custom AI:</strong> The planner uses advanced AI to build a unique schedule based on your specific request.</li>
                <li><strong>Flexible:</strong> Perfect for multi-activity days or special occasions.</li>
            </ul>
        </div>
    );
}
