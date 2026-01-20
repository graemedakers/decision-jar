"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Bell, Trophy, TrendingUp, Users, Sparkles, Gavel } from "lucide-react";
import { getApiUrl } from "@/lib/utils";
import { showSuccess, showError } from "@/lib/toast";
import { trackEvent } from "@/lib/analytics";

interface NotificationPreferences {
    notifyStreakReminder: boolean;
    notifyAchievements: boolean;
    notifyLevelUp: boolean;
    notifyIdeaAdded: boolean;
    notifyJarSpun: boolean;
    notifyVoting: boolean;
}

export function NotificationPreferences({ isSubscribed }: { isSubscribed: boolean }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        notifyStreakReminder: true,
        notifyAchievements: true,
        notifyLevelUp: true,
        notifyIdeaAdded: true,
        notifyJarSpun: true,
        notifyVoting: true,
    });

    useEffect(() => {
        if (isSubscribed && isExpanded) {
            // Fetch current preferences
            fetch(getApiUrl('/api/auth/me'))
                .then(res => res.json())
                .then(data => {
                    if (data?.user) {
                        setPreferences({
                            notifyStreakReminder: data.user.notifyStreakReminder ?? true,
                            notifyAchievements: data.user.notifyAchievements ?? true,
                            notifyLevelUp: data.user.notifyLevelUp ?? true,
                            notifyIdeaAdded: data.user.notifyIdeaAdded ?? true,
                            notifyJarSpun: data.user.notifyJarSpun ?? true,
                            notifyVoting: data.user.notifyVoting ?? true,
                        });
                    }
                })
                .catch(err => console.error("Failed to fetch preferences:", err));
        }
    }, [isSubscribed, isExpanded]);

    const handleToggle = async (key: keyof NotificationPreferences) => {
        const newValue = !preferences[key];
        setPreferences(prev => ({ ...prev, [key]: newValue }));

        setIsLoading(true);
        try {
            const res = await fetch(getApiUrl('/api/user/settings'), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: newValue }),
            });

            if (!res.ok) throw new Error("Failed to update preferences");

            trackEvent('notification_preference_changed', {
                preference: key,
                enabled: newValue
            });
        } catch (error) {
            console.error("Error updating notification preference:", error);
            showError("Failed to update preference");
            // Revert on error
            setPreferences(prev => ({ ...prev, [key]: !newValue }));
        } finally {
            setIsLoading(false);
        }
    };

    if (!isSubscribed) return null;

    return (
        <div className="mt-2">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
                <span className="font-medium">Notification Preferences</span>
                <ChevronDown
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-3 px-3 py-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-2 mb-3">
                                <p className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">
                                    📧 Email notifications require a verified email address. Web push notifications work regardless.
                                </p>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                Choose which notifications you'd like to receive:
                            </p>

                            {/* Streak Reminder */}
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                            Daily Streak Reminder
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            8pm reminder if you haven't been active today
                                        </p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={preferences.notifyStreakReminder}
                                    onChange={() => handleToggle('notifyStreakReminder')}
                                    disabled={isLoading}
                                    className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 checked:bg-primary checked:border-primary disabled:opacity-50"
                                />
                            </label>

                            {/* Achievement Unlocks */}
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                                        <Trophy className="w-4 h-4 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                            Achievement Unlocks
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            When you unlock a new achievement
                                        </p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={preferences.notifyAchievements}
                                    onChange={() => handleToggle('notifyAchievements')}
                                    disabled={isLoading}
                                    className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 checked:bg-primary checked:border-primary disabled:opacity-50"
                                />
                            </label>

                            {/* Level Up */}
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                            Level Up
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            When you reach a new level
                                        </p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={preferences.notifyLevelUp}
                                    onChange={() => handleToggle('notifyLevelUp')}
                                    disabled={isLoading}
                                    className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 checked:bg-primary checked:border-primary disabled:opacity-50"
                                />
                            </label>

                            {/* Idea Added */}
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                        <Bell className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                            New Ideas
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            When someone adds an idea to your jar
                                        </p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={preferences.notifyIdeaAdded}
                                    onChange={() => handleToggle('notifyIdeaAdded')}
                                    disabled={isLoading}
                                    className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 checked:bg-primary checked:border-primary disabled:opacity-50"
                                />
                            </label>

                            {/* Jar Spun */}
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                        <Users className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                            Jar Spun
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            When someone picks an idea from your jar
                                        </p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={preferences.notifyJarSpun}
                                    onChange={() => handleToggle('notifyJarSpun')}
                                    disabled={isLoading}
                                    className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 checked:bg-primary checked:border-primary disabled:opacity-50"
                                />
                            </label>

                            {/* Vote Updates */}
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                        <Gavel className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                            Vote Updates
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            When a voting session starts or ends
                                        </p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={preferences.notifyVoting}
                                    onChange={() => handleToggle('notifyVoting')}
                                    disabled={isLoading}
                                    className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 checked:bg-primary checked:border-primary disabled:opacity-50"
                                />
                            </label>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
