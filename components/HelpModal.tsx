"use client";

import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, MapPin, Plus, Sparkles, History, Settings, HelpCircle, Calendar, Utensils, Wine, Compass, RefreshCcw, Pencil, ExternalLink, Trophy, Dices, Users, Disc, Bed, Clapperboard, Leaf, Dumbbell, Ticket, Brain, Gamepad2 } from "lucide-react";
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
        { id: "community", title: "Communities", icon: Users },
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
        { id: "wellness-concierge", title: "Wellness & Spa", icon: Leaf },
        { id: "fitness-concierge", title: "Fitness Finder", icon: Dumbbell },
        { id: "adding-ideas", title: "Adding Ideas", icon: Plus },
        { id: "weekend-planner", title: "Weekend Planner", icon: Calendar },
        { id: "spinning", title: "Spinning the Jar", icon: Sparkles },
        { id: "quick-tools", title: "Quick Tools", icon: Dices },
        { id: "history", title: "Archive & History", icon: History },
        { id: "settings", title: "Settings", icon: Settings },
    ];

    const renderContent = () => {
        switch (activeSection) {
            // ...
            case "community":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Communities</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Join public jars to share ideas with people who share your interests, or create your own community!
                        </p>
                        <div className="space-y-4 mt-4">
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-lg border border-slate-200 dark:border-white/10">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-1">Joining a Community</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                    <li><strong>Discover:</strong> Browse the Community Index to find jars by topic (e.g., Hiking, Food).</li>
                                    <li><strong>Waitlists:</strong> If a jar is full, join the waitlist. You'll be automatically promoted and notified when a spot opens!</li>
                                    <li><strong>Leave:</strong> You can leave a community at any time from its detail page.</li>
                                </ul>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-lg border border-slate-200 dark:border-white/10">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-1">Creating & Managing</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                    <li><strong>Create:</strong> Premium users can create public jars with custom member limits.</li>
                                    <li><strong>Admin Dashboard:</strong> Creators have access to a dashboard to approve new members and manage the waitlist.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            case "date-night-planner":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Night Out Planner <span className="text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-0.5 rounded-full ml-2">NEW</span></h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Want a complete evening plan without the hassle? The Night Out Planner curates a cohesive itinerary for you.
                        </p>
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm border-b border-slate-200 dark:border-white/10 pb-1">How it Works</h4>
                            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                                <li>Click <strong>Night Out Planner</strong> regarding your group's location.</li>
                                <li>The planner generates a timeline including Drinks, Dinner, and an Event/Activity.</li>
                                <li>All venues are chosen to be within walking distance of each other for a smooth evening.</li>
                            </ol>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm border-b border-slate-200 dark:border-white/10 pb-1">Customizing the Plan</h4>
                            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                                <li>
                                    <strong><RefreshCcw className="inline w-3 h-3 text-slate-400" /> Regenerate:</strong>
                                    Don't like a specific venue (e.g., the bar is too loud)? Click the refresh icon on that item card. The planner will find a better alternative nearby without changing the rest of your plan.
                                </li>
                                <li>
                                    <strong><Pencil className="inline w-3 h-3 text-slate-400" /> Edit Details:</strong>
                                    Need to fix a booking link or update an address? Click the pencil icon to manually edit any part of the itinerary item.
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm border-b border-slate-200 dark:border-white/10 pb-1">Taking Action</h4>
                            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                                <li><strong>View Map:</strong> See your entire walking route on Google Maps.</li>
                                <li><strong>Add to Jar:</strong> Save this perfect plan for a future lucky spin.</li>
                                <li><strong>Go Tonight:</strong> Lock it in instantly!</li>
                            </ul>
                        </div>
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
                            <li><strong>Recommendations:</strong> The planner will find 5 top-rated local restaurants matching your criteria, complete with <strong>Google Ratings</strong> and links to reviews.</li>
                            <li><strong>Go Tonight:</strong> Found a winner? Click <span className="text-yellow-400">Go Tonight</span> to instantly select it as your date. We'll even fetch opening hours and provide a direct link to their website!</li>
                            <li><strong>Add to Jar:</strong> Want to save it for later? Click "Add" to drop it in your jar for a future spin.</li>
                        </ul>
                    </div>
                );
            case "bar-concierge":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Bar Scout <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full ml-2">PREMIUM</span></h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Looking for a place to grab a drink? The Bar Scout helps you discover great local spots.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                            <li><strong>Drink Types:</strong> Select what you're in the mood for (e.g., "Cocktails", "Craft Beer", "Wine").</li>
                            <li><strong>Vibe:</strong> Choose the atmosphere (e.g., "Speakeasy", "Rooftop", "Dive Bar").</li>
                            <li><strong>Top Picks:</strong> Get curated recommendations with ratings and reviews.</li>
                            <li><strong>Go Tonight:</strong> Instantly pick a spot for your evening out.</li>
                        </ul>
                    </div>
                );
            case "nightclub-concierge":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Nightclub Scout <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full ml-2">PREMIUM</span></h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Ready to dance? Find the hottest clubs and venues near you.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                            <li><strong>Music:</strong> Filter by genre (e.g., "House", "Hip Hop", "Latin").</li>
                            <li><strong>Vibe:</strong> Choose the energy (e.g., "High Energy", "Exclusive", "Chill Lounge").</li>
                            <li><strong>Guest Lists:</strong> Find spots perfect for your group size.</li>
                        </ul>
                    </div>
                );
            case "theatre-concierge":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Theatre Scout <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full ml-2">PREMIUM</span></h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Experience the magic of live performance. Find plays, musicals, comedy, and more.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                            <li><strong>Genre:</strong> Filter by Musicals, Plays, Comedy, Opera, and more.</li>
                            <li><strong>Mood:</strong> Choose a show that fits your mood (e.g., "Spectacular", "Funny", "Thought-Provoking").</li>
                            <li><strong>Tickets:</strong> Get direct links to book tickets for upcoming performances.</li>
                        </ul>
                    </div>
                );
            case "movie-concierge":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Movie Scout <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full ml-2">PREMIUM</span></h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Find the perfect movie for tonight, whether in theaters or streaming.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                            <li><strong>Genre & Vibe:</strong> Filter by specific genres or the mood you're in.</li>
                            <li><strong>Showtimes:</strong> See what's playing in cinemas near you.</li>
                            <li><strong>Trailers & Ratings:</strong> Make an informed choice with ratings and descriptions.</li>
                        </ul>
                    </div>
                );
            case "hotel-concierge":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Hotel Finder <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full ml-2">PREMIUM</span></h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Planning a staycation or getaway? Find the perfect place to stay.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                            <li><strong>Style:</strong> Filter by Boutique, Luxury, Resort, or Budget.</li>
                            <li><strong>Amenities:</strong> Look for specific features like "Pool", "Spa", "Rooftop Bar".</li>
                            <li><strong>Booking:</strong> Get direct links to book your stay.</li>
                        </ul>
                    </div>
                );
            case "game-concierge":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Game Scout <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full ml-2">PREMIUM</span></h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Planning a game night? Find the perfect board game or video game for your group.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                            <li><strong>Preferences:</strong> Filter by Genre (e.g., Strategy, Party), Player Count, Budget, and Duration.</li>
                            <li><strong>Recommendations:</strong> Get curated picks with descriptions, difficulty levels, and price estimates.</li>
                            <li><strong>Add to Jar:</strong> Save games to your jar to play later!</li>
                        </ul>
                    </div>
                );
            case "wellness-concierge":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Wellness & Spa <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full ml-2">PREMIUM</span></h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Relax and recharge. Find the best wellness spots near you.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                            <li><strong>Type:</strong> Find Spas, Yoga Studios, Meditation Centers, and more.</li>
                            <li><strong>Service:</strong> Look for specific treatments like Massage, Sauna, or Classes.</li>
                        </ul>
                    </div>
                );
            case "fitness-concierge":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Fitness Finder <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full ml-2">PREMIUM</span></h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Get moving! Find gyms, trails, and fitness classes wherever you are.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                            <li><strong>Activity:</strong> Filter by Gym, Hiking, Crossfit, Pilates, etc.</li>
                            <li><strong>Intensity:</strong> Choose from light active recovery to high-intensity workouts.</li>
                        </ul>
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
                        </ul>
                    </div>
                );
            case "adding-ideas":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Adding Ideas</h3>
                        <div className="space-y-2">
                            <h4 className="font-bold text-primary">Manual Entry</h4>
                            <p className="text-slate-600 dark:text-slate-300">Click the <Plus className="inline w-4 h-4" /> button. Fill in details like Description, Setting (Indoor/Outdoor), Cost, and Time.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-secondary">Surprise Me</h4>
                            <p className="text-slate-600 dark:text-slate-300">Stuck on what to do? The assistant can generate custom jar ideas tailored to your location and interests.</p>
                            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm mt-2">
                                <li>Click the <strong><Sparkles className="inline w-3 h-3 text-yellow-400" /> Surprise Me</strong> button on the dashboard.</li>
                                <li>Select your preferences (Category, Cost, Energy, Time).</li>
                                <li>The planner will use your <strong>Interests</strong> (from Settings) to generate a unique plan.</li>
                                <li>The idea will be added to your jar as a <strong>Hidden Surprise</strong>. Its details are secret from everyone until you spin it!</li>
                            </ol>
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
                            <li><strong>Smart Timing:</strong> If it's Monday-Thursday, it plans for the upcoming weekend. If it's Friday-Sunday, it plans for the current weekend.</li>
                            <li><strong>Local Context:</strong> Uses your location to find relevant events and weather-appropriate activities.</li>
                            <li><strong>Offline Mode:</strong> Even if the assistant is busy, you'll get a set of great fallback suggestions so you're never left without a plan.</li>
                        </ul>
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
                        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 py-4 md:p-4 shrink-0 flex flex-col md:block">
                            <div className="flex items-center gap-2 mb-4 md:mb-6 px-6 md:px-2 pr-14 md:pr-2">
                                <HelpCircle className="w-6 h-6 text-primary" />
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white whitespace-nowrap">Help Center</h2>
                            </div>
                            <nav className="flex flex-row md:flex-col gap-2 md:gap-0 md:space-y-1 overflow-x-auto md:overflow-visible px-6 md:px-0 pb-2 md:pb-0 min-h-0 no-scrollbar snap-x">
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
