
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Wand2, Plus, Ghost, Mic, Layers } from 'lucide-react';

export default function GuideIdeas() {
    return (
        <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">Filling the Jar</h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
                A jar is only as good as the ideas inside it. We've made it incredibly easy to fill yours with exciting things to do.
            </p>

            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Plus className="text-blue-500" /> Manual Entry
            </h2>
            <p className="mb-6">
                Click the "Add Idea" button to manually enter a suggestion. You can specify:
            </p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
                <li><strong>Categories:</strong> Tag ideas as Meals, Activities, or Events.</li>
                <li><strong>Attributes:</strong> Set the estimated cost ($, $$, $$$), activity level (Low, Medium, High), and duration.</li>
                <li><strong>Details:</strong> Add addresses, links, or specific notes.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Layers className="text-emerald-500" /> Structured Idea Types
            </h2>
            <p className="mb-6">
                Go beyond simple text. Decision Jar now understands <strong>Structured Types</strong> for common activities. This unlocks specialized forms and data-rich details:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold flex items-center gap-2 mb-2">🎬 Movies</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Track directors, runtimes, and watch modes. Includes one-tap access to trailers.</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold flex items-center gap-2 mb-2">📖 Books</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Save authors, formats, and Goodreads links for your reading wishlist.</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold flex items-center gap-2 mb-2">🍳 Recipes</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Store ingredients and cooking instructions. Use "Cook Mode" for a focused kitchen view.</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold flex items-center gap-2 mb-2">🎮 Games</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Log platforms, estimated playtime, and co-op status for your next game night.</p>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Wand2 className="text-purple-500" /> Magic Fill (Smart Suggestions)
            </h2>
            <p className="mb-4">
                Feeling uninspired? Use the <strong>Magic Fill</strong> feature. Look for the magic wand icon in the "Add Idea" modal.
            </p>
            <p className="mb-6">
                When you click it, our system looks at your jar's topic and your current location to suggest a <strong>real, high-quality</strong>
                venue or activity. It automatically fills in the name, description, website link, and even the estimated cost and duration for you.
            </p>

            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 mb-8 shadow-xl">
                <Image
                    src="/guide/magic-fill.png"
                    alt="Magic Fill Feature"
                    width={800}
                    height={600}
                    className="w-full"
                />
            </div>

            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Mic className="text-pink-500" /> Voice Input (AI-Powered)
            </h2>
            <p className="mb-6">
                Don't want to type? Use your voice. Tap the <strong>microphone</strong> icon in the input bar and speak naturally.
                Our AI will transcribe your words and automatically categorize the idea—setting the location, price, and duration for you!
            </p>

            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Ghost className="text-slate-400" /> Ghost Ideas (Surprises)
            </h2>
            <p className="mb-6">
                Sometimes the best dates are surprises. You can add a <strong>Surprise Idea</strong> that hides its name and details from
                your partner or group. The idea will only be revealed once the jar "spins" and selects it!
            </p>
            <div className="bg-purple-100 dark:bg-purple-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800 mb-8">
                <h3 className="font-bold mb-2">💡 Pro Tip</h3>
                <p className="text-sm">
                    In a group jar, everyone can add ideas. Encourage your friends to add things so the jar becomes a community wishlist!
                </p>
            </div>

            <div className="flex justify-between pt-12 border-t border-slate-200 dark:border-white/10">
                <Link
                    href="/guide/setup"
                    className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Setup & Jars
                </Link>
                <Link
                    href="/guide/selection"
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
                >
                    Next: Making Choices <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
}
