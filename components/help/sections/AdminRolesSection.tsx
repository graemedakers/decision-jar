"use client";
import { Crown } from "lucide-react";

export function AdminRolesSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Admin & Permissions</h3>
            <p className="text-slate-600 dark:text-slate-300">
                Decision Jar uses a role-based system to ensure your shared lists stay organized and protected.
            </p>
            <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-500" /> Admin Privileges
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                        <li><strong>Rename Jar:</strong> Update the Jar's name at any time.</li>
                        <li><strong>Manage Members:</strong> View the full member list and promote/demote others to Admin status.</li>
                        <li><strong>Delete Jar:</strong> Permanently remove the jar and all its contents.</li>
                        <li><strong>Curate Ideas:</strong> Edit or Delete any idea or memory, regardless of who created it.</li>
                    </ul>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">Member Permissions</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                        <li><strong>Contribute:</strong> Add new ideas to the jar.</li>
                        <li><strong>Edit Own:</strong> Edit or delete ideas that *you* personally added.</li>
                        <li><strong>Spin & Enjoy:</strong> Everyone can spin the jar and access Concierge tools.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
