"use client";
import { Gift } from "lucide-react";

export function JarGiftingSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Jar Gifting <span className="text-xs bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 py-0.5 rounded-full ml-2">NEW</span></h3>
            <p className="text-slate-600 dark:text-slate-300">
                Want to share your carefully curated list of ideas with someone else? Jar Gifting allows you to give an independent copy of your jar to a friend or partner.
            </p>
            <div className="space-y-4">
                <div className="bg-pink-50 dark:bg-pink-900/10 p-4 rounded-xl border border-pink-200 dark:border-pink-800/30">
                    <h4 className="font-bold text-pink-700 dark:text-pink-300 mb-1 flex items-center gap-2">
                        <Gift className="w-4 h-4" /> How to Gift
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                        <li>Open your Jar settings.</li>
                        <li>Click the <strong>Gift Jar</strong> icon (🎁).</li>
                        <li>Copy the generated link and send it to a friend.</li>
                        <li>When they open the link, a fresh copy of your ideas will be added to their account!</li>
                    </ol>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    💡 Gifting creates a *cloned* copy. Future changes to your jar will not affect their gifted copy, and vice versa.
                </p>
            </div>
        </div>
    );
}
