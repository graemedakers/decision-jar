"use client";
import { Sparkles, Disc, Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AddingIdeasSectionProps {
    onNavigate: (section: string) => void;
}

export function AddingIdeasSection({ onNavigate }: AddingIdeasSectionProps) {
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
                        <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-primary/20">
                            <h5 className="font-semibold text-slate-800 dark:text-white text-sm mb-1 flex items-center gap-2">
                                <Disc className="w-4 h-4 text-primary animate-pulse" /> Voice Input (AI)
                            </h5>
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                Tap the 🎤 icon and speak naturally. The AI will transcribe and intelligently categorize your idea automatically!
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Manual Entry (Detailed)
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">
                        Click the <Plus className="inline w-4 h-4" /> button to open the full form. Now supports <strong>Structured Idea Types</strong> for Movies, Books, Recipes, and Games!
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300 ml-2">
                        <li><strong>Idea Type:</strong> Select a type to unlock specialized fields</li>
                        <li><strong>Attributes:</strong> Setting, Duration, Cost, Energy</li>
                        <li><strong>Detailed Info:</strong> Ingredients, Directors, Authors, etc.</li>
                    </ul>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto mt-2 text-primary hover:bg-transparent hover:text-primary underline"
                        onClick={() => onNavigate('structured-ideas')}
                    >
                        Learn more about Idea Types →
                    </Button>
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
}
