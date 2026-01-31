"use client";
import { Trophy } from "lucide-react";

export function GamificationSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Levels & XP</h3>
            <p className="text-slate-600 dark:text-slate-300">
                Decision Jar rewards you for making decisions and completing activities!
            </p>
            <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-200 dark:border-blue-500/20">
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Earn XP</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                        <li><strong>+15 XP:</strong> Add a new idea to your jar</li>
                        <li><strong>+5 XP:</strong> Spin the jar and make a decision</li>
                        <li><strong>+100 XP:</strong> Complete and rate an activity</li>
                    </ul>
                </div>
                <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-200 dark:border-amber-500/20">
                    <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                        <Trophy className="w-4 h-4" /> Unlock Achievements
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Reach milestones to unlock special trophies! View your trophy case in the dashboard header to see your progress.
                    </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-500/10 p-4 rounded-xl border border-purple-200 dark:border-purple-500/20">
                    <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-2">Level Up</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        As you earn XP, you'll level up and gain new <strong>Decision Ranks</strong>. Higher levels unlock special badges and recognition!
                    </p>
                </div>
            </div>
        </div>
    );
}
