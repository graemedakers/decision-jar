"use client";

export function WeekendPlannerSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Weekend Planner</h3>
            <p className="text-slate-600 dark:text-slate-300">
                Need a full plan for the upcoming weekend? The Weekend Planner creates a curated list of 5 distinct activity ideas based on your location and the current day of the week.
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Smart Timing:</strong> Plans for the upcoming weekend (Mon-Thu) or current weekend (Fri-Sun)</li>
                <li><strong>Local Context:</strong> Finds relevant events and weather-appropriate activities in your area</li>
                <li><strong>Saves Time:</strong> Get 5 diverse activity ideas in seconds instead of hours of research</li>
            </ul>
        </div>
    );
}
