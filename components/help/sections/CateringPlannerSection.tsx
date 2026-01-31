"use client";

export function CateringPlannerSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Dinner Party Chef</h3>
            <p className="text-slate-600 dark:text-slate-300">
                Expert menu planning for any occasion.
            </p>
            <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">International Support</h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                    Toggle between <strong>Metric (g/kg)</strong> and <strong>Imperial (oz/lb)</strong> units for all recipes and shopping lists.
                </p>
            </div>
            <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Features</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                    <li>Scale ingredients for 10-100+ people.</li>
                    <li>Get timed prep instructions (24h before, 4h before, etc.).</li>
                    <li><strong>AI Recipes:</strong> Generate full Markdown recipes including ingredients and cooking methods.</li>
                </ul>
            </div>
        </div>
    );
}
