"use client";
import { Sparkles, Settings, Shield } from "lucide-react";

export function PremiumStatusSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Premium & Status</h3>
            <p className="text-slate-600 dark:text-slate-300">
                Decision Jar offers various membership tiers and special access statuses.
            </p>
            <div className="grid gap-3">
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800/30">
                    <h4 className="font-bold text-amber-700 dark:text-amber-400 text-sm mb-1 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Lifetime Access
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">A one-time payment for permanent Pro features across all your jars. No recurring subscription needed!</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800/30">
                    <h4 className="font-bold text-blue-700 dark:text-blue-400 text-sm mb-1 flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Trial Access
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">New accounts and jars enjoy a 14-day grace period with all Pro features enabled automatically.</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800/30">
                    <h4 className="font-bold text-purple-700 dark:text-purple-400 text-sm mb-1 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Super Admin
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Restricted to developers and platform admins. Provides full override permissions for support.</p>
                </div>
            </div>
        </div>
    );
}
