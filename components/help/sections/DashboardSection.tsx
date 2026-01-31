"use client";
import { History } from "lucide-react";

export function DashboardSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">The Dashboard</h3>
            <p className="text-slate-600 dark:text-slate-300">
                Your home base for managing your jar and making decisions.
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>The Jar:</strong> The 3D jar visualization. Click it to view the full list of ideas inside!</li>
                <li><strong>Favorites:</strong> Access your saved "Go-To" ideas from the heart icon in the header</li>
                <li><strong>In The Jar:</strong> Browse your complete list of ideas, add new ones, or edit existing entries</li>
                <li><strong>Spin Button:</strong> The main action — click to randomly select an idea based on your filters</li>
                <li><strong>Jar Insights:</strong> View stats about your jar in the sidebar, including the <strong>total number of ideas</strong>, the active <strong>selection mode</strong>, and the <strong>total member count</strong>.</li>
                <li><strong>Explore Tab:</strong> Navigate here to discover new activities using AI planners and scouts</li>
            </ul>
        </div>
    );
}
