"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Upload, Users, ShieldCheck, CreditCard, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CreateCommunityPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        memberLimit: "", // Empty string for unlimited initially (or manageable input)
        imageUrl: "", // For now, maybe just a text input or we handle upload separately
        topic: "General",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/jars/community/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    memberLimit: formData.memberLimit ? parseInt(formData.memberLimit) : null,
                    imageUrl: formData.imageUrl,
                    topic: formData.topic
                }),
            });

            if (res.ok) {
                const data = await res.json();
                // Redirect to Stripe
                window.location.href = data.url;
            } else {
                alert("Failed to initialize payment.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/dashboard" className="inline-flex items-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-16 bg-gradient-to-br from-violet-500/10 to-blue-500/10 rounded-bl-full -mr-10 -mt-10" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create a Community Jar</h1>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg">
                            Build a public space for shared decisions. Perfect for clubs, local groups, or fan communities.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Community Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="glass-input w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                                    placeholder="e.g. Melbourne Foodies, Saturday Hikers..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Short Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="glass-input w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all resize-none"
                                    placeholder="What is this jar for? Who should join?"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Member Limit (Optional)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.memberLimit}
                                        onChange={(e) => setFormData({ ...formData, memberLimit: e.target.value })}
                                        className="glass-input w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                                        placeholder="No limit"
                                    />
                                    <p className="text-xs text-slate-500">Leave blank for unlimited members.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Cover Image URL</label>
                                    <input
                                        type="url"
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        className="glass-input w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Category / Topic</label>
                                <select
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                    className="glass-input w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all appearance-none"
                                >
                                    <option value="General">General Interest</option>
                                    <option value="Social">Social & Fun</option>
                                    <option value="Food">Food & Dining</option>
                                    <option value="Fitness">Fitness & Sports</option>
                                    <option value="Wellness">Wellness & Health</option>
                                    <option value="Arts">Arts & Culture</option>
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Education">Education & Learning</option>
                                    <option value="Travel">Travel & Adventure</option>
                                    <option value="System Development">System Development</option>
                                </select>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 space-y-4">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-green-500 mt-1" />
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">Admin Privileges</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">You will have full control to approve/reject members and moderate content.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Users className="w-5 h-5 text-blue-500 mt-1" />
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">Public Listing</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Your jar will be visible on the Community Index for anyone to find and request to join.</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-slate-400" />
                                        <span className="font-bold text-slate-900 dark:text-white">Annual Fee</span>
                                    </div>
                                    <span className="text-xl font-bold text-slate-900 dark:text-white">$49.99 <span className="text-sm text-slate-500 font-normal">/ year</span></span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-xl shadow-violet-500/20"
                            >
                                {isLoading ? "Processing..." : (
                                    <span className="flex items-center gap-2">
                                        Proceed to Payment <Sparkles className="w-5 h-5" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
