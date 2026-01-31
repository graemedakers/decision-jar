"use client";

export function SettingsSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Settings & Configuration</h3>
            <p className="text-slate-600 dark:text-slate-300">Customize your Decision Jar experience.</p>

            <div className="space-y-3">
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Profile Settings</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                        <li><strong>Default Location:</strong> The general city or area for your activities (e.g., "New York, NY"). This is the default search area for the Concierge.</li>
                        <li><strong>Your Interests:</strong> A comma-separated list of things you love (e.g., "Sushi, Hiking, Jazz"). We use this to tailor "Surprise Me" suggestions specifically to you.</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Notifications</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                        <li><strong>Enable Notifications:</strong> Turn on push notifications to get alerts when jar members add ideas or spin the jar.</li>
                        <li><strong>Per-Device:</strong> Each device (phone, tablet, computer) needs to enable notifications separately.</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Partner & Group Management</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                        <li><strong>Invite:</strong> Go to Settings and look under the "Manage Partner/Group" section to find your unique invitation link and code. Share this to link accounts.</li>
                        <li><strong>Regenerate Code:</strong> (Creator only) If you need a new invite link or want to invalidate an old one, use this option in Settings.</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Data & Privacy</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                        <li><strong>Deletion History:</strong> View a log of who deleted which ideas and when.</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-red-500 dark:text-red-400 text-sm">Danger Zone (Creator Only)</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                        <li><strong>Empty Jar:</strong> Permanently deletes ALL ideas and past history. This cannot be undone.</li>
                        <li><strong>Delete Members:</strong> Removes partners or group members from the jar and deletes their contributions.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
