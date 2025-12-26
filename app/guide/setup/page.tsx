
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, UserPlus, ShieldCheck, Settings } from 'lucide-react';

export default function GuideSetup() {
    return (
        <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">Setup & Jars</h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
                Every decision starts with a Jar. Think of a Jar as a shared container for a specific topic or group of people.
            </p>

            <h2 className="text-2xl font-bold mb-4">Creating a Jar</h2>
            <p className="mb-6">
                When you first sign up, you'll be prompted to create your first jar. You can choose from three main types:
            </p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
                <li><strong>Romantic / Date Night:</strong> Optimized for couples with categories like "Dining", "Movies", and "Cozy".</li>
                <li><strong>Social / Group:</strong> Perfect for friends or families. Includes "Social", "Active", and "Competition" categories.</li>
                <li><strong>Personal / Custom:</strong> A blank slate. You can even define your own custom categories for very specific jars (like "Gym Workouts" or "Book List").</li>
            </ul>

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
