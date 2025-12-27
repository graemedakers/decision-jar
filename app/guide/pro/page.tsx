
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Crown, Utensils, Calendar, Wine, Moon, Disc, Bed, BarChart3 } from 'lucide-react';

export default function GuidePro() {
    return (
        <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4 flex items-center gap-3">
                <Crown className="text-yellow-500 w-10 h-10" /> Decision Jar Pro
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-12">
                Unlock the full power of smart decision making and premium jar management.
            </p>

            <h2 className="text-2xl font-bold mb-6">Concierge Services</h2>
            <p className="mb-8 font-medium">
                Sometimes you want more than a random pick. Pro users get access to our full suite of theme-specific tools
                who act as your personal planners:
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                        <Utensils className="text-orange-600 w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Dining Concierge</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Find the perfect breakfast, lunch, or dinner spot nearby. Our system checks real ratings to ensure a great meal.
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                        <Calendar className="text-purple-600 w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Weekend Planner</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Hand-picked events and activities for your next big adventure or weekend getaway.
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
                        <Wine className="text-pink-600 w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Bar Scout</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        The ultimate guide to hidden bars, speakeasies, and social venues nearby.
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4">
                        <Moon className="text-rose-600 w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Activity Planner</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Generates step-by-step itineraries for any occasion, from dates to family outings.
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                        <Disc className="text-indigo-600 w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Nightclub Scout</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Discover the hottest clubs and dance venues to keep the energy going all night.
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mb-4">
                        <Bed className="text-cyan-600 w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Hotel Concierge</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Planning a staycation? Let our system find the best boutique hotels and unique stays.
                    </p>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="text-indigo-500" /> Pro Power Features
            </h2>
            <div className="space-y-4 mb-12">
                <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                    <div>
                        <strong>Unlimited Jars:</strong> Join or create as many jars as you want.
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                    <div>
                        <strong>Unlimited Ideas:</strong> Free jars are capped at 25 ideas. Pro jars have no limit.
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                    <div>
                        <strong>Custom Themes:</strong> Style your jars with custom colors and fonts (Coming Soon!).
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                    <div>
                        <strong>Advanced Statistics:</strong> See which categories you pick most and who adds the best ideas!
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-8 rounded-3xl border border-yellow-500/20 text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to upgrade?</h3>
                <p className="mb-6 text-slate-600 dark:text-slate-400">
                    Join thousands of users making better decisions every single day.
                </p>
                <Link
                    href="/premium"
                    className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-xl font-bold transition-all shadow-lg"
                >
                    View Pro Plans
                </Link>
            </div>

            <div className="flex justify-between pt-12 border-t border-slate-200 dark:border-white/10">
                <Link
                    href="/guide/selection"
                    className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Making Choices
                </Link>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
                >
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
