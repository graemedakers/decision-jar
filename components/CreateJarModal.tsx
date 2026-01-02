"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { TOPIC_CATEGORIES } from "@/lib/categories";

interface CreateJarModalProps {
    isOpen: boolean;
    onClose: () => void;
    hasRomanticJar: boolean;
    isPro: boolean;
    currentJarCount: number;
}

export function CreateJarModal({ isOpen, onClose, hasRomanticJar, isPro, currentJarCount }: CreateJarModalProps) {
    const [name, setName] = useState("");
    const [topic, setTopic] = useState("Activities");
    const [type, setType] = useState<string>("SOCIAL");
    const [selectionMode, setSelectionMode] = useState<string>("RANDOM");

    // Custom Topic State
    const [customTopicName, setCustomTopicName] = useState("");
    const [customCategories, setCustomCategories] = useState<string[]>(["", "", ""]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const maxJars = isPro ? 50 : 1;
    const isLimitReached = currentJarCount >= maxJars;

    const addCategory = () => setCustomCategories([...customCategories, ""]);
    const updateCategory = (index: number, value: string) => {
        const newCats = [...customCategories];
        newCats[index] = value;
        setCustomCategories(newCats);
    };
    const removeCategory = (index: number) => {
        setCustomCategories(customCategories.filter((_, i) => i !== index));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        let finalTopic = topic;
        let finalCustomCategories = undefined;

        if (topic === 'Custom') {
            if (!customTopicName.trim()) {
                setError("Please enter a name for your custom topic.");
                setIsLoading(false);
                return;
            }
            // Filter empty
            const validCats = customCategories.filter(c => c.trim() !== "");
            if (validCats.length === 0) {
                setError("Please add at least one category.");
                setIsLoading(false);
                return;
            }

            finalTopic = customTopicName;
            finalCustomCategories = validCats.map((label, idx) => ({
                id: `CUSTOM_${idx}_${Date.now()}`,
                label: label,
                icon: 'Sparkles' // Default icon
            }));
        }

        try {
            const res = await fetch('/api/jar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type, topic: finalTopic, customCategories: finalCustomCategories, selectionMode }),
            });

            if (res.ok) {
                setSuccess(true);
                // Delay reload to show success message
                setTimeout(() => {
                    onClose();
                    window.location.reload();
                }, 1500);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to create jar");
                setIsLoading(false); // Only stop loading on error
            }
        } catch (error) {
            console.error("Error creating jar:", error);
            setError("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <Dialog open={isOpen} onOpenChange={() => { }}>
                <DialogContent className="sm:max-w-[425px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white min-h-[300px] flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                        <span className="text-3xl">🎉</span>
                    </div>
                    <DialogTitle className="text-2xl font-bold mb-2">Jar Created!</DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400 mb-6">
                        Setting up your new jar...
                    </DialogDescription>
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </DialogContent>
            </Dialog>
        );
    }

    if (isLimitReached) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[425px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <span>Limit Reached</span>
                            <span className="text-2xl">🔒</span>
                        </DialogTitle>
                        <DialogDescription className="text-slate-600 dark:text-slate-400">
                            You have reached the maximum number of Jars for your current plan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 text-center space-y-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Current Usage</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{currentJarCount} / {maxJars} Jars</p>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            To create more jars, please upgrade to Pro or leave an existing jar.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={onClose}>
                            Close
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white border-0"
                            onClick={() => onClose()}
                        >
                            Got it
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto pb-32 md:pb-6">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <span>New Jar</span>
                        <span className="text-2xl">✨</span>
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                        Create a new collection of ideas.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreate} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Jar Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Weekend Adventures"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        />
                        {error && (
                            <p className="text-sm text-red-400 mt-1">{error}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <Label>Relationship</Label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full h-10 pl-2 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="ROMANTIC">Couple</option>
                                <option value="SOCIAL">Social/Friends</option>
                                <option value="GENERIC">Solo</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <Label>Mode</Label>
                            <select
                                value={selectionMode}
                                onChange={(e) => setSelectionMode(e.target.value)}
                                className="w-full h-10 pl-2 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="RANDOM">Spin (Lucky Dip)</option>
                                <option value="ADMIN_PICK">Admin Pick (Curated)</option>
                                <option value="VOTING">Vote (Consensus)</option>
                                <option value="ALLOCATION">Allocation (Tasks)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Jar Topic</Label>
                        <select
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full h-10 pl-4 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary items-center"
                        >
                            {Object.keys(TOPIC_CATEGORIES).filter(k => k !== 'Custom' && k !== 'General').map(k => (
                                <option key={k} value={k}>
                                    {k}
                                </option>
                            ))}
                            <option value="Custom">Other / Custom...</option>
                        </select>
                    </div>

                    {topic === 'Custom' && (
                        <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-100 dark:bg-slate-800/50 animate-in fade-in zoom-in duration-300">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase text-slate-500">Custom Topic Name</Label>
                                <Input
                                    value={customTopicName}
                                    onChange={(e) => setCustomTopicName(e.target.value)}
                                    placeholder="e.g. Board Games, Work Lunches"
                                    className="bg-white dark:bg-slate-800"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs uppercase text-slate-500">Categories</Label>
                                <div className="space-y-2">
                                    {customCategories.map((cat, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <Input
                                                value={cat}
                                                onChange={(e) => updateCategory(idx, e.target.value)}
                                                placeholder={`Category ${idx + 1}`}
                                                className="bg-white dark:bg-slate-800"
                                            />
                                            {customCategories.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeCategory(idx)}
                                                    className="shrink-0 text-slate-400 hover:text-red-400"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addCategory}
                                    className="w-full mt-2 border-dashed"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Category
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-primary hover:bg-primary/90 text-white"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Jar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
