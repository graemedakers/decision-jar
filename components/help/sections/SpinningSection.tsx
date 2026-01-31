"use client";

export function SpinningSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Spinning the Jar</h3>
            <p className="text-slate-600 dark:text-slate-300">Ready for a date? Click <strong>Spin Jar</strong> to let fate decide.</p>

            <div className="space-y-3">
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Filters</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">Narrow down the random selection to fit your current mood:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                        <li><strong>Category:</strong> Filter by Activity, Meal, or Event.</li>
                        <li><strong>Duration:</strong> Set a maximum time limit (e.g., "Under 2 hours").</li>
                        <li><strong>Cost:</strong> Set a budget cap (e.g., "Free" or "$$").</li>
                        <li><strong>Energy:</strong> Choose how active you want to be (Low, Medium, High).</li>
                        <li><strong>Time:</strong> Filter for Day or Evening activities.</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">The Reveal & Locations</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                        <li><strong>Accept Selection:</strong> Marks the idea as "Selected" and moves it to your Vault.</li>
                        <li><strong>Schedule:</strong> Click <strong>"Set Date for Record"</strong> to schedule the session/item in your calendar/vault.</li>
                        <li><strong>Smart Location:</strong> The app uses your **GPS (with permission)** to find the most relevant venues nearby. If GPS is unavailable, it falls back to your profile city.</li>
                        <li><strong>Find Places:</strong> For generic ideas (e.g., "Go Bowling"), click <strong>"Find Specific Places"</strong> to find top-rated venues near you.</li>
                        <li><strong>Find Food:</strong> Planning an activity? Use the <strong>"Find food nearby"</strong> button to instantly search for restaurants near that location using the Dining Concierge.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
