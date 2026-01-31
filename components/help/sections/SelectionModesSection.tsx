"use client";
import { Sparkles, Ghost, Users, Crown, Shield } from "lucide-react";

export function SelectionModesSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Selection Modes</h3>
            <p className="text-slate-600 dark:text-slate-300">
                When creating a jar, you choose how decisions are made. Each mode suits different use cases.
            </p>
            <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800/50">
                    <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" /> Random Selection
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        <strong>Best for:</strong> Date nights, personal jars, small groups
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Click <strong>"Spin the Jar"</strong> to randomly pick an idea. Apply filters (cost, duration, energy) to narrow options. Perfect when you want fate to decide!
                    </p>
                    <div className="mt-4 p-3 bg-slate-900/5 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                        <h5 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5 mb-1">
                            <Ghost className="w-3.5 h-3.5 text-slate-400" /> Mystery Results
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            For <strong>Mystery Jars</strong> or <strong>Surprise Ideas</strong>, details are hidden until revealed. To keep the anticipation alive, only <strong>one mystery reveal</strong> is allowed per day. Gifted mystery jars (curated by others) are exempt from this limit!
                        </p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800/50">
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                        <Users className="w-5 h-5" /> Voting Mode (Squad Mode)
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        <strong>Best for:</strong> Friend groups, teams, democratic decisions (Requires 3+ Members)
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        <strong>Real-time Squad Dynamics:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300 ml-2">
                        <li><strong>Collaborative Sync:</strong> Everyone is notified and their presence is shown live as they join.</li>
                        <li><strong>Casting Votes:</strong> Choose your favorite. For fairness, you cannot vote for ideas you suggested!</li>
                        <li><strong>Sidelines:</strong> If a round only has your ideas, you'll be on the sidelines watching the squad decide.</li>
                        <li><strong>Instant Reveal:</strong> The winner is revealed to the whole squad simultaneously across all devices.</li>
                    </ul>
                    <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-800/20 rounded-lg text-[11px] text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/30">
                        <strong>⚠️ Constraints:</strong> Voting Mode is unavailable for <strong>Mystery Jars</strong> and requires at least <strong>3 active members</strong> in a standard jar. If members leave and your group drops to 2, the jar will automatically revert to Random Spin mode.
                    </div>
                    <p className="text-[11px] text-blue-800 dark:text-blue-300 mt-3 flex items-center gap-1.5 font-medium">
                        <Sparkles className="w-3.5 h-3.5" /> Featuring <strong>Real-time Broadcast</strong> sync!
                    </p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50">
                    <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                        <Crown className="w-5 h-5" /> Administrator Pick
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        <strong>Best for:</strong> Organized events, planned outings, curated experiences
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        The jar admin (organizer) manually selects which idea to do. Members can still suggest ideas, but the final decision is curated by the admin. Perfect for event planners, trip organizers, or when one person is coordinating the group.
                    </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-2">
                        <Shield className="w-5 h-5" /> Task Allocation
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        <strong>Best for:</strong> Chores, responsibilities, fair distribution
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Instead of picking one idea, this mode distributes ALL ideas fairly among members. Each person gets a private list of assigned tasks. Perfect for household chores, project tasks, or any scenario requiring fair division of work.
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        💡 See the "Task Allocation" section for detailed instructions
                    </p>
                </div>
            </div>
            <div className="bg-slate-100 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10 mt-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    <strong>Note:</strong> You can change your jar's selection mode at any time in Settings (admins only).
                </p>
            </div>
        </div>
    );
}
