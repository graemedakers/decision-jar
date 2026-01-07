"use client";

import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, MapPin, Plus, Sparkles, History, Settings, HelpCircle, Calendar, Utensils, Wine, Compass, RefreshCcw, Pencil, ExternalLink, Trophy, Dices, Users, Disc, Bed, Clapperboard, Leaf, Dumbbell, Ticket, Brain, Gamepad2, Crown, Shield, Layers, Key } from "lucide-react";
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
        { id: "organize-life", title: "Organizing Your Life", icon: Layers },
        { id: "task-allocation", title: "Task Allocation", icon: Shield },
        { id: "explore", title: "The Explore Tab", icon: Compass },
        { id: "dashboard", title: "The Dashboard", icon: History },
        { id: "gamification", title: "Levels & XP", icon: Trophy },
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
        { id: "adding-ideas", title: "Adding Ideas", icon: Plus },
        { id: "weekend-planner", title: "Weekend Planner", icon: Calendar },
        { id: "catering-planner", title: "Catering Planner", icon: Utensils },
        { id: "spinning", title: "Spinning the Jar", icon: Sparkles },
        { id: "quick-tools", title: "Quick Tools", icon: Dices },
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
                                    Keep the spark alive. Use this for <strong>Date Nights</strong>, <strong>Movies</strong>, or intimate weekend getaways. Share it only with your partner.
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
                            Looking for new ideas? The <strong>Explore</strong> page is your destination for discovery.
                        </p>
                        <div className="space-y-4 mt-4">
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-2">Planners & Tools</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    All your favorite planners live here now to keep your dashboard clean:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300 mt-2">
                                    <li><strong>Weekend Planner:</strong> Get a 5-item itinerary for the weekend.</li>
                                    <li><strong>Night Out Planner:</strong> Plan a coherent Dinner-Drinks-Event evening.</li>
                                    <li><strong>Catering Planner:</strong> Plan food for 20+ people.</li>
                                    <li><strong>Bar Crawl Planner:</strong> Map out a route of top bars.</li>
                                </ul>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-2">Concierge Services</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Access the full suite of "Scouts" (Dining, Movies, Hotels, etc.) to find venues near you.
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
                            Your home base is now cleaner and focused entirely on <strong>The Jar</strong> and your **Favorites**.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                            <li><strong>The Jar:</strong> The 3D jar shows how many ideas you have available.</li>
                            <li><strong>Favorites:</strong> improved visibility! Quickly access your saved "Go-To" ideas from the heart icon in the header.</li>
                            <li><strong>In The Jar:</strong> Your list of ideas is right there. Add, Edit, or Delete efficiently.</li>
                            <li><strong>Spin:</strong> The main action—Spin to win!</li>
                        </ul>
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
                            <li><strong>Smart Timing:</strong> If it's Monday-Thursday, it plans for the upcoming weekend. If it's Friday-Sunday, it plans for the current weekend.</li>
                            <li><strong>Local Context:</strong> Uses your location to find relevant events and weather-appropriate activities.</li>
                            <li><strong>Location Auto-Save:</strong> Once you set your location here, all our Concierge tools will remember it for next time!</li>
                        </ul>
                    </div>
                );
            case "catering-planner":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Catering Planner</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Professional menu planning for groups.
                        </p>
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">International Support</h4>
                            <p className="text-slate-600 dark:text-slate-300 text-sm">
                                You can now toggle between <strong>Metric (g/kg)</strong> and <strong>Imperial (oz/lb)</strong> units for all recipes and shopping lists.
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
            case "quick-tools":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Quick Tools</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Sometimes you just need a simple answer right now. Click the dice icon <Dices className="inline w-4 h-4" /> in the top right to access:
                        </p>
                        <div className="space-y-4 mt-4">
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-lg border border-slate-200 dark:border-white/10">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-1">Coin Flip</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Heads or Tails? Settle a debate instantly with a 3D coin flip.
                                </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-lg border border-slate-200 dark:border-white/10">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-1">Dice Roll</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Roll a standard 6-sided die. Perfect for board games or picking who goes first.
                                </p>
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
