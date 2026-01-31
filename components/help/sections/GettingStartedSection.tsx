"use client";
import { Plus } from "lucide-react";

export function GettingStartedSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Getting Started</h3>
            <p className="text-slate-600 dark:text-slate-300">
                Welcome to Decision Jar! Let's get you set up in just a few steps.
            </p>
            <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">1. Create Your First Jar</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        Choose a <strong>Name</strong> and <strong>Topic</strong> (e.g., "Date Nights", "Family Activities"). Select a <strong>Type</strong> (Romantic or Social) and <strong>Selection Mode</strong>:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300 ml-4">
                        <li><strong>Random:</strong> Spin to pick randomly</li>
                        <li><strong>Voting:</strong> Group votes democratically</li>
                        <li><strong>Admin Pick:</strong> Organizer curates selections</li>
                        <li><strong>Task Allocation:</strong> Distribute tasks fairly</li>
                    </ul>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        💡 See "Selection Modes" section for detailed explanations
                    </p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">2. Set Your Location</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Go to <strong>Settings</strong> and enter your city (e.g., "Sydney, Australia"). This helps our AI Concierges find venues and activities near you.
                    </p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">3. Add Some Ideas</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Click <strong>+ Add Idea</strong> to manually enter activities, or use the <strong>Explore</strong> tab to discover ideas with our AI planners and concierge services.
                    </p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">4. Spin the Jar!</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        When you're ready, click <strong>Spin the Jar</strong> to randomly select an activity. Apply filters to narrow down your options by cost, duration, or energy level.
                    </p>
                </div>
            </div>
        </div>
    );
}
