"use client";
import { Bell } from "lucide-react";

export function NotificationsSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Push Notifications</h3>
            <p className="text-slate-600 dark:text-slate-300">
                Stay connected with your jar members! Push notifications keep everyone in the loop without cluttering your inbox.
            </p>
            <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-200 dark:border-blue-500/20">
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                        <Bell className="w-4 h-4" /> When You'll Be Notified
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                        <li><strong>💡 New Idea Added:</strong> When someone adds a new idea to your shared jar</li>
                        <li><strong>🎯 Idea Selected:</strong> When someone spins the jar and picks an activity</li>
                        <li><strong>⏰ 24h Reminder:</strong> A gentle nudge to rate your completed activity</li>
                    </ul>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2">How to Enable</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                        <li>Go to <strong>Settings</strong> (gear icon)</li>
                        <li>Navigate to <strong>My Preferences</strong></li>
                        <li>Click <strong>"Enable Notifications"</strong></li>
                        <li>Accept the browser permission prompt</li>
                    </ol>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        💡 Each device needs to enable notifications separately
                    </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-200 dark:border-amber-500/20">
                    <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2">Best Practices</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                        <li><strong>Enable on mobile:</strong> Get instant alerts when your partner or friends add ideas</li>
                        <li><strong>Click to open:</strong> Tapping a notification takes you directly to the relevant jar</li>
                        <li><strong>Non-intrusive:</strong> We only send notifications for meaningful events, never spam</li>
                    </ul>
                </div>
                <div className="bg-slate-100 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        <strong>Note:</strong> Notifications don't work in Incognito/Private browsing mode. Use a regular browser window for the full experience.
                    </p>
                </div>
            </div>
        </div>
    );
}
