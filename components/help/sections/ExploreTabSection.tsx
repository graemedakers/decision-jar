"use client";

export function ExploreTabSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">The Explore Tab</h3>
            <p className="text-slate-600 dark:text-slate-300">
                The <strong>Explore</strong> tab is your discovery hub for finding new ideas and activities.
            </p>
            <div className="space-y-4 mt-4">
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">AI Planners</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Generate complete itineraries and activity plans:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300 mt-2">
                        <li><strong>Weekend Planner:</strong> Get a 5-item itinerary for the weekend</li>
                        <li><strong>Night Out Planner:</strong> Plan a complete evening with drinks, dinner, and events</li>
                        <li><strong>Dinner Party Chef:</strong> Design menus for groups and parties</li>
                        <li><strong>Bar Crawl Planner:</strong> Map out a route of top bars in your area</li>
                    </ul>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">Concierge Services</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Our AI scouts help you find specific venues like restaurants, bars, hotels, theaters, and more. Each scout provides ratings, reviews, and can add recommendations directly to your jar.
                    </p>
                </div>
            </div>
        </div>
    );
}
