"use client";
import { Shield } from "lucide-react";

export function TaskAllocationSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Task Allocation Mode</h3>
            <p className="text-slate-600 dark:text-slate-300">
                Allocation Mode is designed for distributing chores, responsibilities, or specific tasks fairly among jar members.
            </p>
            <div className="space-y-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Admin Controls
                    </h4>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-2">
                        Administrators can trigger the <strong>"Distribute Tasks"</strong> engine from the dashboard.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-700 dark:text-emerald-300">
                        <li>Assign a set amount of tasks per person.</li>
                        <li>Tasks are picked randomly and uniquely.</li>
                        <li>Members only see the tasks assigned to *them*.</li>
                    </ul>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">Member Experience</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                        <li><strong>Privacy:</strong> Tasks assigned to others remain masked as "Secret Tasks".</li>
                        <li><strong>Completion:</strong> View your task list and mark them as complete to move them to the Vault.</li>
                        <li><strong>Sync:</strong> Tasks are updated in real-time as members finish their assignments.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
