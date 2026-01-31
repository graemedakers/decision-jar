"use client";

export function DiningConciergeSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Dining Concierge <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full ml-2">PREMIUM</span></h3>
            <p className="text-slate-600 dark:text-slate-300">
                Can't decide where to eat? Let our Concierge find the perfect spot for you.
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Preferences:</strong> Enter your craving (e.g., "Sushi", "Italian") and desired vibe (e.g., "Romantic", "Lively").</li>
                <li><strong>Recommendations:</strong> Get 5 top-rated local restaurants with <strong>Google Ratings</strong> and review links.</li>
                <li><strong>Go Tonight:</strong> Instantly select a restaurant. We'll fetch opening hours and provide a direct website link!</li>
                <li><strong>Add to Jar:</strong> Save recommendations for later spins.</li>
            </ul>
        </div>
    );
}
