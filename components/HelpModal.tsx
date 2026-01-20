"use client";

import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, MapPin, Plus, Sparkles, History, Settings, HelpCircle, Calendar, Utensils, Wine, Compass, RefreshCcw, Pencil, ExternalLink, Trophy, Users, Disc, Bed, Clapperboard, Leaf, Dumbbell, Ticket, Brain, Gamepad2, Crown, Shield, Layers, Key, Share2, MousePointer2, Bell } from "lucide-react";
import { useState, useEffect } from "react";

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialSection?: string;
}

export function HelpModal({ isOpen, onClose, initialSection }: HelpModalProps) {
    const [activeSection, setActiveSection] = useState(initialSection || "intro");

    useEffect(() => {
        if (isOpen && initialSection) {
            setActiveSection(initialSection);
        }
    }, [isOpen, initialSection]);

    const sections = [
        { id: "intro", title: "Introduction", icon: BookOpen },
        { id: "getting-started", title: "Getting Started", icon: MapPin },
        { id: "admin-roles", title: "Admin & Roles", icon: Crown },
        { id: "community", title: "Manage Jars", icon: Users },
        { id: "selection-modes", title: "Selection Modes", icon: RefreshCcw },
        { id: "organize-life", title: "Organizing Your Life", icon: Layers },
        { id: "task-allocation", title: "Task Allocation", icon: Shield },
        { id: "explore", title: "The Explore Tab", icon: Compass },
        { id: "dashboard", title: "The Dashboard", icon: History },
        { id: "gamification", title: "Levels & XP", icon: Trophy },
        { id: "notifications", title: "Notifications", icon: Bell },
        { id: "date-night-planner", title: "Night Out Planner", icon: Compass },
        { id: "activity-planner", title: "Activity Planner", icon: Brain },
        { id: "dining-concierge", title: "Dining Concierge", icon: Utensils },
        { id: "bar-concierge", title: "Bar Scout", icon: Wine },
        { id: "nightclub-concierge", title: "Nightclub Scout", icon: Disc },
        { id: "theatre-concierge", title: "Theatre Scout", icon: Ticket },
        { id: "movie-concierge", title: "Movie Scout", icon: Clapperboard },
        { id: "hotel-concierge", title: "Hotel Finder", icon: Bed },
        { id: "game-concierge", title: "Game Scout", icon: Gamepad2 },
        { id: "escape-room-concierge", title: "Escape Room Scout", icon: Key },
        { id: "sports-concierge", title: "Sports Scout", icon: Trophy },
        { id: "wellness-concierge", title: "Wellness & Spa", icon: Leaf },
        { id: "fitness-concierge", title: "Fitness Finder", icon: Dumbbell },
        { id: "premium-shortcuts", title: "Premium Shortcuts", icon: Share2 },
        { id: "adding-ideas", title: "Adding Ideas", icon: Plus },
        { id: "weekend-planner", title: "Weekend Planner", icon: Calendar },
        { id: "catering-planner", title: "Dinner Party Chef", icon: Utensils },
        { id: "spinning", title: "Spinning the Jar", icon: Sparkles },

        { id: "history", title: "Archive & History", icon: History },
        { id: "settings", title: "Settings", icon: Settings },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case "intro":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Welcome to Decision Jar!</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Decision Jar is your ultimate tool for ending indecision. Whether you're planning a date night, a group hangout, or just trying to decide what's for dinner, we've got you covered.
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                            Fill your Jar with ideas, use our AI-powered Concierges to find new adventures, and "Spin the Jar" to let fate decide your next activity.
                        </p>
                    </div>
                );
            case "admin-roles":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Admin & Permissions</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Decision Jar uses a role-based system to ensure your shared lists stay organized and protected.
                        </p>
                        <div className="space-y-4">
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-amber-500" /> Admin Privileges
                                </h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                    <li><strong>Rename Jar:</strong> Update the Jar's name at any time.</li>
                                    <li><strong>Manage Members:</strong> View the full member list and promote/demote others to Admin status.</li>
                                    <li><strong>Delete Jar:</strong> Permanently remove the jar and all its contents.</li>
                                    <li><strong>Curate Ideas:</strong> Edit or Delete any idea or memory, regardless of who created it.</li>
                                </ul>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-2">Member Permissions</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                    <li><strong>Contribute:</strong> Add new ideas to the jar.</li>
                                    <li><strong>Edit Own:</strong> Edit or delete ideas that *you* personally added.</li>
                                    <li><strong>Spin & Enjoy:</strong> Everyone can spin the jar and access Concierge tools.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            case "community":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Managing Your Jars</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            You can belong to multiple Jars at once! Click the Jar Name in the dashboard header to switch views or open the management tool.
                        </p>
                        <div className="space-y-4 mt-4">
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-1">Jar Management Modal</h4>
                                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                                    <li><strong>Switching:</strong> Instantly jump between your Jars.</li>
                                    <li><strong>Manage Members:</strong> (Admins only) Manage who has access and who can moderate.</li>
                                    <li><strong>Renaming:</strong> (Admins only) Give your jar a fresh identity with the pencil icon.</li>
                                    <li><strong>Leaving:</strong> Non-owners can leave a jar to declutter their dashboard.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            case "organize-life":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Organizing Your Life with Jars</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Decision Jar is versatile. You can create multiple jars to organize different areas of your life, keeping your ideas separate and relevant.
                        </p>
                        <div className="grid gap-4 mt-4">
                            <div className="bg-pink-50 dark:bg-pink-500/10 p-4 rounded-xl border border-pink-100 dark:border-pink-500/20">
                                <h4 className="font-bold text-pink-700 dark:text-pink-300 mb-2">❤️ Romantic Jar</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Keep the spark alive. Use this for <strong>Date Nights</strong>, <strong>Movies</strong>, or intimate weekend getaways. Share it with your romantic partner(s).
                                </p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-500/10 p-4 rounded-xl border border-purple-100 dark:border-purple-500/20">
                                <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-2">👯 Social & Friends</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    The ultimate "What are we doing?" solver. Great for <strong>Group Dinners</strong>, <strong>Bar Crawls</strong>, or <strong>Game Nights</strong>.
                                </p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20">
                                <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-2">🧘 Solo & Self-Care</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    A jar just for you. Fill it with <strong>Books to Read</strong>, <strong>Walks to Take</strong>, or <strong>Hobbies</strong> you want to practice.
                                </p>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                                <h4 className="font-bold text-emerald-700 dark:text-emerald-300 mb-2">🏠 Family & Chores</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Make weekends fun with <strong>Family Activities</strong>, or use <strong>Allocation Mode</strong> to fairly distribute household chores among kids or housemates.
                                </p>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-100 dark:border-amber-500/20">
                                <h4 className="font-bold text-amber-700 dark:text-amber-300 mb-2">🏢 Work & Team</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Settle the "Where for lunch?" debate or pick <strong>Team Building</strong> activities.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case "selection-modes":
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
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800/50">
                                <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                                    <Users className="w-5 h-5" /> Voting Mode
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                    <strong>Best for:</strong> Friend groups, teams, democratic decisions
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                    <strong>How it works:</strong>
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300 ml-2">
                                    <li><strong>Shortlist:</strong> Admin starts a vote session with up to 5 random ideas (configurable in Jar Settings).</li>
                                    <li><strong>Cast Vote:</strong> Everyone votes on their favorite. For fairness, you cannot vote for ideas you suggested!</li>
                                    <li><strong>Sidelines:</strong> If a round only has your ideas, you'll be placed on the sidelines to watch the live progress.</li>
                                    <li><strong>Instant Reveal:</strong> Once the final vote is cast, the winner's card pops up for everyone simultaneously.</li>
                                    <li><strong>Settling Ties:</strong> If votes are split, the system will trigger a Random Tie-break or a new Runoff Round.</li>
                                </ul>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">
                                    🎉 Featuring <strong>Real-time Broadcast</strong> sync! No page reloads required.
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
            case "task-allocation":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Task Allocation Mode</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Allocation Mode is designed for distributing chores, responsibilities, or specific tasks fairly among jar members.
                        </p>
                        <div className="space-y-4">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                                <h4 className="font-bold text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Admin Controls
                                </h4>
                                <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-2">
                                    Administrators can trigger the <strong>"Distribute Tasks"</strong> engine from the dashboard.
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-emerald-700 dark:text-emerald-300">
                                    <li>Assign a set amount of tasks per person.</li>
                                    <li>Tasks are picked randomly and uniquely.</li>
                                    <li>Members only see the tasks assigned to *them*.</li>
                                </ul>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-2">Member Experience</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                    <li><strong>Privacy:</strong> Tasks assigned to others remain masked as "Secret Tasks".</li>
                                    <li><strong>Completion:</strong> View your task list and mark them as complete to move them to the Vault.</li>
                                    <li><strong>Sync:</strong> Tasks are updated in real-time as members finish their assignments.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            case "explore":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">The Explore Tab</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            The <strong>Explore</strong> tab is your discovery hub for finding new ideas and activities.
                        </p>
                        <div className="space-y-4 mt-4">
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-2">AI Planners</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Generate complete itineraries and activity plans:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300 mt-2">
                                    <li><strong>Weekend Planner:</strong> Get a 5-item itinerary for the weekend</li>
                                    <li><strong>Night Out Planner:</strong> Plan a complete evening with drinks, dinner, and events</li>
                                    <li><strong>Dinner Party Chef:</strong> Design menus for groups and parties</li>
                                    <li><strong>Bar Crawl Planner:</strong> Map out a route of top bars in your area</li>
                                </ul>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-2">Concierge Services</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Our AI scouts help you find specific venues like restaurants, bars, hotels, theaters, and more. Each scout provides ratings, reviews, and can add recommendations directly to your jar.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case "dashboard":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">The Dashboard</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Your home base for managing your jar and making decisions.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                            <li><strong>The Jar:</strong> The 3D jar visualization. Click it to view the full list of ideas inside!</li>
                            <li><strong>Favorites:</strong> Access your saved "Go-To" ideas from the heart icon in the header</li>
                            <li><strong>In The Jar:</strong> Browse your complete list of ideas, add new ones, or edit existing entries</li>
                            <li><strong>Spin Button:</strong> The main action — click to randomly select an idea based on your filters</li>
                            <li><strong>Explore Tab:</strong> Navigate here to discover new activities using AI planners and scouts</li>
                        </ul>
                    </div>
                );
            case "getting-started":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Getting Started</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Welcome to Decision Jar! Let's get you set up in just a few steps.
                        </p>
                        <div className="space-y-4">
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-2">1. Create Your First Jar</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                    Choose a <strong>Name</strong> and <strong>Topic</strong> (e.g., "Date Nights", "Family Activities"). Select a <strong>Type</strong> (Romantic or Social) and <strong>Selection Mode</strong>:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300 ml-4">
                                    <li><strong>Random:</strong> Spin to pick randomly</li>
                                    <li><strong>Voting:</strong> Group votes democratically</li>
                                    <li><strong>Admin Pick:</strong> Organizer curates selections</li>
                                    <li><strong>Task Allocation:</strong> Distribute tasks fairly</li>
                                </ul>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                    💡 See "Selection Modes" section for detailed explanations
                                </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-2">2. Set Your Location</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Go to <strong>Settings</strong> and enter your city (e.g., "Sydney, Australia"). This helps our AI Concierges find venues and activities near you.
                                </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-2">3. Add Some Ideas</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Click <strong>+ Add Idea</strong> to manually enter activities, or use the <strong>Explore</strong> tab to discover ideas with our AI planners and concierge services.
                                </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-2">4. Spin the Jar!</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    When you're ready, click <strong>Spin the Jar</strong> to randomly select an activity. Apply filters to narrow down your options by cost, duration, or energy level.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case "gamification":
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
            case "notifications":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Push Notifications</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Stay connected with your jar members! Push notifications keep everyone in the loop without cluttering your inbox.
                        </p>
                        <div className="space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-200 dark:border-blue-500/20">
                                <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                                    <Bell className="w-4 h-4" /> When You'll Be Notified
                                </h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                    <li><strong>💡 New Idea Added:</strong> When someone adds a new idea to your shared jar</li>
                                    <li><strong>🎯 Idea Selected:</strong> When someone spins the jar and picks an activity</li>
                                    <li><strong>⏰ 24h Reminder:</strong> A gentle nudge to rate your completed activity</li>
                                </ul>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2">How to Enable</h4>
                                <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                    <li>Go to <strong>Settings</strong> (gear icon)</li>
                                    <li>Navigate to <strong>My Preferences</strong></li>
                                    <li>Click <strong>"Enable Notifications"</strong></li>
                                    <li>Accept the browser permission prompt</li>
                                </ol>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                    💡 Each device needs to enable notifications separately
                                </p>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-200 dark:border-amber-500/20">
                                <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2">Best Practices</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                    <li><strong>Enable on mobile:</strong> Get instant alerts when your partner or friends add ideas</li>
                                    <li><strong>Click to open:</strong> Tapping a notification takes you directly to the relevant jar</li>
                                    <li><strong>Non-intrusive:</strong> We only send notifications for meaningful events, never spam</li>
                                </ul>
                            </div>
                            <div className="bg-slate-100 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10">
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    <strong>Note:</strong> Notifications don't work in Incognito/Private browsing mode. Use a regular browser window for the full experience.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case "date-night-planner":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Night Out Planner <span className="text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-0.5 rounded-full ml-2">PREMIUM</span></h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Want a complete evening plan without the hassle? The Night Out Planner curates a cohesive itinerary for you.
                        </p>
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm border-b border-slate-200 dark:border-white/10 pb-1">How it Works</h4>
                            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                                <li>Access from the <strong>Explore</strong> tab</li>
                                <li>The planner generates a timeline including Drinks, Dinner, and an Event/Activity</li>
                                <li>All venues are chosen to be within walking distance for a smooth evening</li>
                            </ol>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm border-b border-slate-200 dark:border-white/10 pb-1">Customizing the Plan</h4>
                            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                                <li>
                                    <strong><RefreshCcw className="inline w-3 h-3 text-slate-400" /> Regenerate:</strong>
                                    Don't like a specific venue? Click the refresh icon to find a better alternative nearby.
                                </li>
                                <li>
                                    <strong><Pencil className="inline w-3 h-3 text-slate-400" /> Edit Details:</strong>
                                    Manually edit any part of the itinerary item.
                                </li>
                            </ul>
                        </div>
                    </div>
                );
            case "adding-ideas":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Adding Ideas</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            There are multiple ways to add ideas to your jar. Choose the method that works best for you!
                        </p>
                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-4 rounded-xl border-2 border-pink-200 dark:border-pink-800/50">
                                <h4 className="font-bold text-pink-800 dark:text-pink-300 mb-2 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" /> Smart Input Bar (Recommended)
                                </h4>
                                <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                                    The Smart Input Bar is your fastest way to add ideas. It automatically detects what you're adding and handles it intelligently.
                                </p>
                                <div className="space-y-3">
                                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                        <h5 className="font-semibold text-slate-800 dark:text-white text-sm mb-1">📝 Type Text</h5>
                                        <p className="text-xs text-slate-600 dark:text-slate-300">
                                            Simply type your idea and press Enter. Example: "Visit the local art museum"
                                        </p>
                                    </div>
                                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                        <h5 className="font-semibold text-slate-800 dark:text-white text-sm mb-1">🔗 Paste a Link</h5>
                                        <p className="text-xs text-slate-600 dark:text-slate-300">
                                            Paste any URL and it's automatically detected. Great for sharing restaurant websites, event pages, or articles.
                                        </p>
                                    </div>
                                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                        <h5 className="font-semibold text-slate-800 dark:text-white text-sm mb-1">📸 Upload an Image</h5>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                                            Click the image icon to upload a photo. Perfect for saving screenshots of events, menus, or inspiration.
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-xs text-slate-500 dark:text-slate-400 ml-2">
                                            <li>Supports JPG, PNG, GIF, WebP</li>
                                            <li>Images are automatically compressed for fast loading</li>
                                            <li>Preview appears before saving</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Manual Entry (Detailed)
                                </h4>
                                <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">
                                    For more control, click the <Plus className="inline w-4 h-4" /> button to open the full form. This lets you set:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300 ml-2">
                                    <li><strong>Description:</strong> The main idea name</li>
                                    <li><strong>Details:</strong> Additional notes or instructions</li>
                                    <li><strong>Setting:</strong> Indoor or Outdoor</li>
                                    <li><strong>Duration:</strong> How long it takes (15min to 8+ hours)</li>
                                    <li><strong>Cost:</strong> Free, $, $$, or $$$</li>
                                    <li><strong>Energy Level:</strong> Low, Medium, or High</li>
                                    <li><strong>Time of Day:</strong> Day, Evening, or Any</li>
                                    <li><strong>Category:</strong> Activity, Meal, Event, etc.</li>
                                    <li><strong>Photo URL:</strong> Link to an image</li>
                                </ul>
                            </div>

                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                <h4 className="font-bold text-secondary mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> AI Concierge
                                </h4>
                                <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">
                                    Click the sparkles icon in the Smart Input Bar or visit the <strong>Explore</strong> tab to:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300 ml-2">
                                    <li>Ask AI to generate custom ideas based on your interests</li>
                                    <li>Get personalized suggestions for your location</li>
                                    <li>Ideas are added as <strong>Hidden Surprises</strong> — details stay secret until you spin!</li>
                                </ul>
                            </div>

                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                <h4 className="font-bold text-accent mb-2 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" /> Templates & Planners
                                </h4>
                                <p className="text-slate-600 dark:text-slate-300 text-sm">
                                    Click the book icon in the Smart Input Bar or visit the <strong>Explore</strong> tab to browse pre-made templates and AI planners that can add complete itineraries or venue recommendations to your jar.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case "activity-planner":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Activity Planner <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full ml-2">PREMIUM</span></h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Need a custom plan for the day? The Activity Planner creates a broader itinerary than the Night Out Planner.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                            <li><strong>Occasion:</strong> Plan for "Family Day", "Romantic Date", "Solo Adventure", etc.</li>
                            <li><strong>Custom AI:</strong> The planner uses advanced AI to build a unique schedule based on your specific request.</li>
                            <li><strong>Flexible:</strong> Perfect for multi-activity days or special occasions.</li>
                        </ul>
                    </div>
                );
            case "dining-concierge":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Dining Concierge <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full ml-2">PREMIUM</span></h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Can't decide where to eat? Let our Concierge find the perfect spot for you.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                            <li><strong>Preferences:</strong> Enter your craving (e.g., "Sushi", "Italian") and desired vibe (e.g., "Romantic", "Lively").</li>
                            <li><strong>Recommendations:</strong> Get 5 top-rated local restaurants with <strong>Google Ratings</strong> and review links.</li>
                            <li><strong>Go Tonight:</strong> Instantly select a restaurant. We'll fetch opening hours and provide a direct website link!</li>
                            <li><strong>Add to Jar:</strong> Save recommendations for later spins.</li>
                        </ul>
                    </div>
                );
            case "bar-concierge":
            case "nightclub-concierge":
            case "theatre-concierge":
            case "movie-concierge":
            case "hotel-concierge":
            case "game-concierge":
            case "escape-room-concierge":
            case "sports-concierge":
            case "wellness-concierge":
            case "fitness-concierge":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Concierge Services <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full ml-2">PREMIUM</span></h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Our AI-powered scouts help you discover the best venues and activities near you.
                        </p>
                        <div className="grid gap-3 mt-4">
                            <div className="bg-purple-50 dark:bg-purple-500/10 p-3 rounded-lg border border-purple-200 dark:border-purple-500/20">
                                <h4 className="font-bold text-purple-800 dark:text-purple-300 text-sm mb-1">🍷 Bar Scout</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300">Find cocktail bars, speakeasies, rooftops, and craft beer spots.</p>
                            </div>
                            <div className="bg-pink-50 dark:bg-pink-500/10 p-3 rounded-lg border border-pink-200 dark:border-pink-500/20">
                                <h4 className="font-bold text-pink-800 dark:text-pink-300 text-sm mb-1">🎵 Nightclub Scout</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300">Discover clubs by music genre and energy level.</p>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-500/10 p-3 rounded-lg border border-amber-200 dark:border-amber-500/20">
                                <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm mb-1">🎭 Theatre Scout</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300">Find plays, musicals, and live performances. Only shows currently running or upcoming are returned.</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-lg border border-blue-200 dark:border-blue-500/20">
                                <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-1">🎬 Movie Scout</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300">Get cinema showtimes and streaming recommendations.</p>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-1">🏨 Hotel Finder</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300">Plan staycations with boutique and luxury options.</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                            <strong>Pro Tip:</strong> All scouts provide direct booking links, ratings, and can add recommendations to your jar for future spins.
                        </p>
                    </div>
                );
            case "premium-shortcuts":
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
            case "weekend-planner":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Weekend Planner</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Need a full plan for the upcoming weekend? The Weekend Planner creates a curated list of 5 distinct activity ideas based on your location and the current day of the week.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                            <li><strong>Smart Timing:</strong> Plans for the upcoming weekend (Mon-Thu) or current weekend (Fri-Sun)</li>
                            <li><strong>Local Context:</strong> Finds relevant events and weather-appropriate activities in your area</li>
                            <li><strong>Saves Time:</strong> Get 5 diverse activity ideas in seconds instead of hours of research</li>
                        </ul>
                    </div>
                );
            case "catering-planner":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Dinner Party Chef</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Expert menu planning for any occasion.
                        </p>
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">International Support</h4>
                            <p className="text-slate-600 dark:text-slate-300 text-sm">
                                Toggle between <strong>Metric (g/kg)</strong> and <strong>Imperial (oz/lb)</strong> units for all recipes and shopping lists.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Features</h4>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                                <li>Scale ingredients for 10-100+ people.</li>
                                <li>Get timed prep instructions (24h before, 4h before, etc.).</li>
                            </ul>
                        </div>
                    </div>
                );
            case "spinning":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Spinning the Jar</h3>
                        <p className="text-slate-600 dark:text-slate-300">Ready for a date? Click <strong>Spin Jar</strong> to let fate decide.</p>

                        <div className="space-y-3">
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Filters</h4>
                                <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">Narrow down the random selection to fit your current mood:</p>
                                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                                    <li><strong>Category:</strong> Filter by Activity, Meal, or Event.</li>
                                    <li><strong>Duration:</strong> Set a maximum time limit (e.g., "Under 2 hours").</li>
                                    <li><strong>Cost:</strong> Set a budget cap (e.g., "Free" or "$$").</li>
                                    <li><strong>Energy:</strong> Choose how active you want to be (Low, Medium, High).</li>
                                    <li><strong>Time:</strong> Filter for Day or Evening activities.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">The Reveal & Locations</h4>
                                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                                    <li><strong>Accept Selection:</strong> Marks the idea as "Selected" and moves it to your Vault.</li>
                                    <li><strong>Schedule:</strong> Click <strong>"Set Date for Record"</strong> to schedule the session/item in your calendar/vault.</li>
                                    <li><strong>Find Places:</strong> For generic ideas (e.g., "Go Bowling"), click <strong>"Find Specific Places"</strong> to find top-rated venues near you.</li>
                                    <li><strong>Find Food:</strong> Planning an activity? Use the <strong>"Find food nearby"</strong> button to instantly search for restaurants near that location using the Dining Concierge.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            case "history":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Managing the Vault</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                            <li><strong>Rate & Snap:</strong> Give your completed items a star rating and upload up to 3 photos to capture the moment.</li>
                            <li><strong>Add Past Items:</strong> Have a record from before you got the app? Click "Add Manual Entry" to log past items with photos and details.</li>
                            <li><strong>Repeat:</strong> Click the Copy icon to put an idea back in the jar.</li>
                            <li><strong>Delete:</strong> Click the Trash icon to remove it.</li>
                            <li><strong>Deletion Log:</strong> Check Settings &gt; View Deletion History to see an audit log of removed items.</li>
                        </ul>
                    </div>
                );
            case "settings":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Settings & Configuration</h3>
                        <p className="text-slate-600 dark:text-slate-300">Customize your Decision Jar experience.</p>

                        <div className="space-y-3">
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Profile Settings</h4>
                                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                                    <li><strong>Default Location:</strong> The general city or area for your activities (e.g., "New York, NY"). This is the default search area for the Concierge.</li>
                                    <li><strong>Your Interests:</strong> A comma-separated list of things you love (e.g., "Sushi, Hiking, Jazz"). We use this to tailor "Surprise Me" suggestions specifically to you.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Notifications</h4>
                                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                                    <li><strong>Enable Notifications:</strong> Turn on push notifications to get alerts when jar members add ideas or spin the jar.</li>
                                    <li><strong>Per-Device:</strong> Each device (phone, tablet, computer) needs to enable notifications separately.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Partner & Group Management</h4>
                                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                                    <li><strong>Invite:</strong> Go to Settings and look under the "Manage Partner/Group" section to find your unique invitation link and code. Share this to link accounts.</li>
                                    <li><strong>Regenerate Code:</strong> (Creator only) If you need a new invite link or want to invalidate an old one, use this option in Settings.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Data & Privacy</h4>
                                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                                    <li><strong>Deletion History:</strong> View a log of who deleted which ideas and when.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-red-500 dark:text-red-400 text-sm">Danger Zone (Creator Only)</h4>
                                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                                    <li><strong>Empty Jar:</strong> Permanently deletes ALL ideas and past history. This cannot be undone.</li>
                                    <li><strong>Delete Members:</strong> Removes partners or group members from the jar and deletes their contributions.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card w-full max-w-4xl h-[90vh] md:h-[80vh] flex flex-col md:flex-row overflow-hidden relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors z-20"
                            aria-label="Close Help"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Sidebar */}
                        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 py-4 md:p-4 shrink-0 flex flex-col md:overflow-y-auto custom-scrollbar">
                            <div className="flex items-center gap-2 mb-4 md:mb-6 px-6 md:px-2 pr-14 md:pr-2 shrink-0">
                                <HelpCircle className="w-6 h-6 text-primary" />
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white whitespace-nowrap">Help Center</h2>
                            </div>
                            <nav className="flex flex-row md:flex-col gap-2 md:gap-0 md:space-y-1 overflow-x-auto md:overflow-y-visible px-6 md:px-0 pb-2 md:pb-0 min-h-0 no-scrollbar snap-x">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-full md:rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0 snap-start border ${activeSection === section.id
                                            ? "bg-primary text-white border-primary shadow-md"
                                            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 border-transparent"
                                            }`}
                                        aria-label={`View ${section.title} section`}
                                        aria-current={activeSection === section.id ? 'true' : undefined}
                                    >
                                        <section.icon className="w-4 h-4" />
                                        {section.title}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-white/80 to-transparent dark:from-white/5 dark:to-transparent">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderContent()}
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
