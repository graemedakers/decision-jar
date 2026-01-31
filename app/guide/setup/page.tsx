
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, UserPlus, ShieldCheck, Settings, Users, MapPin } from 'lucide-react';

export default function GuideSetup() {
    return (
        <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                Setting Up Your <span className="text-primary italic">Squad</span> Jar
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-8">
                The foundation of every group adventure is a well-configured Jar. We call this **Squad Mode**. Think of a Jar as a shared container for a specific topic or group of people.
            </p>

            <h2 className="text-2xl font-bold mb-4">Choosing a Topic</h2>
            <p className="mb-6">
                Every Jar is built around a <strong>Topic</strong>. The topic you choose determines the visual theme and,
                more importantly, the <strong>Categories</strong> available for your ideas.
            </p>

            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="text-red-500" /> GPS & Smart Location
            </h2>
            <p className="mb-6">
                Decision Jar is location-aware. For the best experience, allow the app to access your <strong>GPS</strong>.
                This allows features like <strong>Magic Fill</strong> and <strong>Dining Concierge</strong> to find exact
                venues near you right now. If GPS is unavailable, we fall back to the "Home Town" set in your profile.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                    <h3 className="font-bold text-orange-700 dark:text-orange-400 mb-2">Dining & Drinks</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                        <strong>James & Emily</strong> chose <strong>Restaurants</strong> for their Friday date nights, giving them quick access to categories like Fine Dining and Casual.
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Invite Your Squad</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        A jar is better with friends. Open the Member Management tool to share your unique invite code. When others join, they immediately enter **Squad Mode** for that specific jar.
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20">
                    <h3 className="font-bold text-blue-700 dark:text-blue-400 mb-2">Exploration</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                        Ideal for <strong>Travel</strong> and <strong>Hotel Stays</strong>. Perfect for planning anything from local staycations to international adventures.
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-950/20 border border-fuchsia-100 dark:border-fuchsia-900/30">
                    <h3 className="font-bold text-fuchsia-700 dark:text-fuchsia-400 mb-2">Entertainment</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                        <strong>Sarah's Book Club</strong> use the <strong>Custom</strong> topic to define their own categories for different genres (Fiction, Non-Fiction, Sci-Fi).
                    </p>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Creating your First Jar</h2>
            <p className="mb-4">
                When you create your first jar, you'll select one of these topics. This sets the stage for how you'll
                organize your decisions.
            </p>
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 mb-8">
                <h4 className="font-bold mb-2 flex items-center gap-2">🕵️ Mystery Mode</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Want to keep the contents a secret? Enable <strong>Mystery Mode</strong> during setup to hide all idea names until they are revealed by a shake of the jar.
                </p>
            </div>



            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <UserPlus className="text-purple-600" /> Inviting Members
            </h2>
            <p className="mb-6">
                Decisions are better together. Every jar has a unique <strong>Reference Code</strong>. You can find this in your Jar Settings.
            </p>
            <div className="bg-slate-100 dark:bg-slate-900 border-l-4 border-purple-500 p-6 rounded-r-xl mb-8">
                <p className="font-medium mb-2 italic">Example case:</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    "Sarah creates a 'Friend Hangouts' jar. She copies the code <strong>'SARAH-55'</strong> and sends it to her group chat.
                    Her friends click 'Join Jar', enter the code, and instantly see Sarah's ideas and can add their own."
                </p>
            </div>

            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" /> Roles & Permissions
            </h2>
            <p className="mb-6">
                The person who creates the jar is the <strong>Admin</strong>. Admins can:
            </p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
                <li>Manage jar settings and themes.</li>
                <li>Delete any idea in the jar.</li>
                <li>Start and manage Voting Rounds.</li>
                <li>Edit or remove other members.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Settings className="text-slate-500" /> Switching Jars
            </h2>
            <p className="mb-6">
                You can be a member of multiple jars at once! Use the <strong>Jar Switcher</strong> at the top of your dashboard to jump
                from your "Family Movies" jar to your "Work Lunches" jar in one click.
            </p>

            <div className="flex justify-between pt-12 border-t border-slate-200 dark:border-white/10">
                <Link
                    href="/guide"
                    className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Introduction
                </Link>
                <Link
                    href="/guide/ideas"
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
                >
                    Next: Adding Ideas <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
}
