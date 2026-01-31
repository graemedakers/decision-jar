"use client";
import { MousePointer2, HelpCircle, Sparkles } from "lucide-react";

export function PremiumShortcutsSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Concierge Shortcuts <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full ml-2">PREMIUM</span></h3>
            <p className="text-slate-600 dark:text-slate-300">
                Get one-tap access to your favorite AI Concierges by adding shortcuts directly to your phone's home screen or your computer's desktop.
            </p>

            <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                        <MousePointer2 className="w-4 h-4 text-blue-500" /> Windows Desktop
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        Click <strong>"Add Shortcut"</strong> in any concierge header. A <code>.url</code> file will download automatically. Drag this file to your desktop for instant access with a custom icon!
                    </p>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-primary" /> Android (Chrome)
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        1. Tap <strong>"Add Shortcut"</strong> to copy the deep link.<br />
                        2. Open Chrome and paste the link in the address bar.<br />
                        3. Tap the <strong>⋮ menu</strong> (top right) and select <strong>"Add to Home screen"</strong>.
                    </p>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-secondary" /> iOS (Safari)
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        1. Tap <strong>"Add Shortcut"</strong> to copy the deep link.<br />
                        2. Open Safari and paste the link in the address bar.<br />
                        3. Tap the <strong>Share icon (□↑)</strong> and select <strong>"Add to Home Screen"</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
}
