
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, RefreshCw, Vote, Filter } from 'lucide-react';

export default function GuideSelection() {
    return (
        <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">Making Choices</h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
                The moment of truth. How you decide depends on your mood and the group dynamic.
            </p>

            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <RefreshCw className="text-emerald-500" /> Method 1: Spin the Jar
            </h2>
            <p className="mb-6">
                Perfect for quick decisions or romantic dates. Click <strong>"Shake the Jar"</strong> to let our algorithm pick a winner.
            </p>

            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 mb-8 shadow-xl">
                <Image
                    src="/guide/spin-result.png"
                    alt="Spinning the Jar Result"
                    width={800}
                    height={600}
                    className="w-full"
                />
            </div>

            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Filter className="text-blue-500" /> Smart Filters
            </h2>
            <p className="mb-6">
                Don't just leave it to pure luck. You can apply filters before you spin:
            </p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
                <li><strong>Budget:</strong> Only show "Free" or "$" ideas if you're saving up.</li>
                <li><strong>Vibe:</strong> Filter by "Indoor" or "Outdoor" based on the weather.</li>
                <li><strong>Time:</strong> Choose ideas that fit your schedule (e.g., only "1 hour" activities).</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Vote className="text-orange-500" /> Method 2: Voting Rounds
            </h2>
            <p className="mb-4">
                In larger groups, a random spin might cause arguments. That's why we built <strong>Voting Mode</strong>.
            </p>
            <p className="mb-6">
                The Admin can start a voting round. Members are presented with a selection of ideas and can cast their vote.
                The system handles ties automatically with a random tiebreaker or a second run-off round.
            </p>

            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 mb-8 shadow-xl">
                <Image
                    src="/guide/voting.png"
                    alt="Voting Mode Feature"
                    width={800}
                    height={600}
                    className="w-full"
                />
            </div>

            <div className="bg-blue-100 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 mb-8">
                <h3 className="font-bold mb-2">📅 Committing to a Date</h3>
                <p className="text-sm mb-4">
                    Once a winner is chosen, you can select the <strong>Date and Time</strong>. This moves the idea from your "Jar pool" into your
                    <strong>Memories</strong> list, so you don't pick the same thing twice next week!
                </p>
                <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg border border-primary/20">
                    <h4 className="font-bold text-sm mb-1">👨‍🍳 AI Recipes (New)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                        Planning a meal? Pro users can now generate full AI recipes for any food-related idea, complete with ingredients and cooking methods.
                    </p>
                </div>
            </div>

            <div className="flex justify-between pt-12 border-t border-slate-200 dark:border-white/10">
                <Link
                    href="/guide/ideas"
                    className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Adding Ideas
                </Link>
                <Link
                    href="/guide/pro"
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
                >
                    Next: Premium Features <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
}
