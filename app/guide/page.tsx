
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Users, Zap } from 'lucide-react';

export default function GuideIntroduction() {
    return (
        <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">
                Welcome to Decision Jar
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
                The ultimate platform for ending indecision. Whether you're planning a date, choosing a movie with friends,
                or just trying to decide what's for dinner, we've got you covered.
            </p>

            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 mb-12 shadow-2xl">
                <Image
                    src="/guide/dashboard.png"
                    alt="Decision Jar Dashboard"
                    width={1200}
                    height={800}
                    className="w-full"
                />
            </div>

            <h2 className="text-2xl font-bold mb-6">How it works in 3 steps</h2>

            <div className="grid gap-6 mb-12">
                <div className="flex gap-4 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                        <Users className="text-purple-600 dark:text-purple-400 w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">1. Create or Join a Jar</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            Build your own jar for a specific theme (like "Date Nights", "Friend Hangouts", or "Solo Adventures") and invite others using a unique invite code.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="text-indigo-600 dark:text-indigo-400 w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">2. Fill it with Ideas</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            Add your own suggestions or use our <strong>Magic Fill</strong> AI to find the best local restaurants, venues, and experiences automatically.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        <Zap className="text-emerald-600 dark:text-emerald-400 w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">3. Let the Jar Decide</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            When it's time to choose, <strong>Spin the Jar</strong> for a random pick or start a <strong>Voting Round</strong> for a democratic group decision.
                        </p>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-6">Real People, Real Decisions</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border border-pink-100 dark:border-pink-900/30">
                    <h3 className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4" /> James & Emily
                    </h3>
                    <p className="text-sm italic mb-2">"No more 'I don't know, what do you want to do?'"</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                        They use their "Date Night" jar to store restaurant menus and local activities. Now, instead of arguing for 40 minutes, they just spin the jar and head out the door.
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/30">
                    <h3 className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4" /> Sarah's Book Club
                    </h3>
                    <p className="text-sm italic mb-2">"Fair and democratic voting."</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                        Sarah created a "Next Month's Read" jar. Members add books all month long, and then everyone votes on Friday evening to pick the group's next literary adventure.
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/30 md:col-span-2">
                    <h3 className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4" /> The Miller Family
                    </h3>
                    <p className="text-sm italic mb-2">"Making chores feel like a game."</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                        The Millers use a "Weekend Chores" jar. The kids add ideas for small rewards (like 'Extra 10 mins screen time') and the parents add the chores. Everyone spins to see what they're doing—it's surprisingly fun!
                    </p>
                </div>
            </div>

            <div className="flex justify-end pt-8 border-t border-slate-200 dark:border-white/10">
                <Link
                    href="/guide/setup"
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105"
                >
                    Next: Setup & Jars <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
}
