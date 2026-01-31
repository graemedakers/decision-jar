
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

            <h2 className="text-2xl font-bold mb-6">Explore the Premium Toolkit</h2>
            <p className="mb-8 font-medium">
                Sometimes you want more than a random pick. Pro users get access to our full suite of theme-specific tools
                who act as your personal planners:
            </p>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-12">
                <div>
                    <h3 className="font-bold text-lg mb-4 text-purple-600 dark:text-purple-400 border-b border-purple-100 dark:border-purple-900/30 pb-2">Planning Tools</h3>
                    <ul className="space-y-3">
                        <li>
                            <strong className="block text-slate-800 dark:text-white">✨ AI Concierge</strong>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Your personal genius. Ask for any specific idea and get tailored recommendations.</span>
                        </li>
                        <li>
                            <strong className="block text-slate-800 dark:text-white">📅 Weekend Planner</strong>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Finds live events, markets, and festivals happening right now in your city.</span>
                        </li>
                        <li>
                            <strong className="block text-slate-800 dark:text-white">❤️ Date Night Planner</strong>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Combines dinner, drinks, and activities into a seamless evening itinerary.</span>
                        </li>
                        <li>
                            <strong className="block text-slate-800 dark:text-white">✈️ Holiday Planner</strong>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Creates complete travel itineraries with transport, dining, and activities.</span>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-4 text-orange-600 dark:text-orange-400 border-b border-orange-100 dark:border-orange-900/30 pb-2">Food & Drink</h3>
                    <ul className="space-y-3">
                        <li>
                            <strong className="block text-slate-800 dark:text-white">🍽️ Dining Concierge</strong>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Get curated restaurant recommendations based on cuisine, vibe, and diet.</span>
                        </li>
                        <li>
                            <strong className="block text-slate-800 dark:text-white">🍷 Bar Scout</strong>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Find hidden speakeasies, rooftop bars, and cozy pubs nearby.</span>
                        </li>
                        <li>
                            <strong className="block text-slate-800 dark:text-white">🕺 Nightlife Navigator</strong>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Discover top-rated clubs and dance venues to keep the party going.</span>
                        </li>
                        <li>
                            <strong className="block text-slate-800 dark:text-white">👨‍🍳 Dinner Party Chef</strong>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Generate custom menus and recipes for any occasion.</span>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-4 text-blue-600 dark:text-blue-400 border-b border-blue-100 dark:border-blue-900/30 pb-2">Entertainment</h3>
                    <ul className="space-y-3">
                        <li>
                            <strong className="block text-slate-800 dark:text-white">🎬 Movie Picker</strong>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Find perfect movies in theaters or on streaming based on your mood.</span>
                        </li>
                        <li>
                            <strong className="block text-slate-800 dark:text-white">📚 Book Finder</strong>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Discover your next read filtered by genre, era, and emotional vibe.</span>
                        </li>
                        <li>
                            <strong className="block text-slate-800 dark:text-white">🎭 Theatre & Arts</strong>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Discover plays, musicals, and live performances nearby.</span>
                        </li>
                        <li>
                            <strong className="block text-slate-800 dark:text-white">🔑 Escape Room Scout</strong>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Find rated escape rooms by theme (Horror, Mystery, etc.).</span>
                        </li>
                        <li>
                            <strong className="block text-slate-800 dark:text-white">🎲 Game Guru</strong>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Find the perfect video game for any occasion.</span>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-4 text-emerald-600 dark:text-emerald-400 border-b border-emerald-100 dark:border-emerald-900/30 pb-2">Lifestyle & Wellness</h3>
                    <ul className="space-y-3">
                        <li>
                            <strong className="block text-slate-800 dark:text-white">🏨 Staycation Finder</strong>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Discover top-rated hotels and resorts for a local getaway.</span>
                        </li>
                        <li>
                            <strong className="block text-slate-800 dark:text-white">🧘 Wellness & Spa</strong>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Locate spas, yoga studios, and wellness centers.</span>
                        </li>
                        <li>
                            <strong className="block text-slate-800 dark:text-white">💪 Fitness Finder</strong>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Find gyms, hiking trails, rock climbing, and classes nearby.</span>
                        </li>
                        <li>
                            <strong className="block text-slate-800 dark:text-white">🏆 Sports Finder</strong>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Find places to watch the match or courts to play on.</span>
                        </li>
                    </ul>
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

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Crown className="text-amber-500" /> Membership Tiers
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-12">
                <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                    <h3 className="font-bold text-amber-700 dark:text-amber-400 mb-2">Lifetime Access</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        The ultimate choice for power users. Pay once, and enjoy Pro features forever across all your jars. No recurring subscriptions.
                    </p>
                </div>
                <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                    <h3 className="font-bold text-blue-700 dark:text-blue-400 mb-2">14-Day Free Trial</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Every new account and every new jar starts with a 14-day Pro grace period. Explore all premium features risk-free before deciding.
                    </p>
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
