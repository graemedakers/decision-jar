"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loader2, Plus, X, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { TOPIC_CATEGORIES } from "@/lib/categories";
import { useModalSystem } from "@/components/ModalProvider";

interface CreateJarModalProps {
    isOpen: boolean;
    onClose: () => void;
    hasRomanticJar: boolean;
    isPro: boolean;
    currentJarCount: number;
    onSuccess?: (jarId: string) => void;
}

function inferTypeFromTopic(topic: string): string {
    const romanticTopics = ['Dates', 'Romantic', 'date', 'romantic'];
    if (romanticTopics.some(t => topic.toLowerCase().includes(t.toLowerCase()))) {
        return 'ROMANTIC';
    }
    return 'SOCIAL';
}

export function CreateJarModal({ isOpen, onClose, isPro, currentJarCount, onSuccess }: CreateJarModalProps) {
    const [name, setName] = useState("");
    const [topic, setTopic] = useState("Activities");
    const [selectionMode, setSelectionMode] = useState<string>("RANDOM");
    const [voteCandidates, setVoteCandidates] = useState(0);

    const [customTopicName, setCustomTopicName] = useState("");
    const [customCategories, setCustomCategories] = useState(["", "", ""]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSuccess(false);
            setIsLoading(false);
            setError(null);
            setName("");
            setCustomTopicName("");
            setCustomTopicName("");
            setCustomCategories(["", "", ""]);
            setVoteCandidates(0);
        }
    }, [isOpen]);

    const maxJars = isPro ? 50 : 3;
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
                icon: 'Sparkles'
            }));
        }

        const inferredType = inferTypeFromTopic(finalTopic);

        try {
            const res = await fetch('/api/jars', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type: inferredType, topic: finalTopic, customCategories: finalCustomCategories, selectionMode, voteCandidatesCount: voteCandidates }),
            });

            if (res.ok) {
                const data = await res.json();
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    if (onSuccess) onSuccess(data.jar.id);
                }, 800);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to create jar");
                setIsLoading(false);
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
                <DialogContent className="bg-slate-50 dark:bg-slate-900 min-h-[300px] flex flex-col items-center justify-center text-center">
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
                <DialogHeader onClose={onClose}>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <span>Limit Reached</span>
                        <span className="text-2xl">🔒</span>
                    </DialogTitle>
                    <DialogDescription>
                        You have reached the maximum number of Jars for your current plan.
                    </DialogDescription>
                </DialogHeader>
                <DialogContent>
                    <div className="py-6 text-center space-y-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 font-medium">Current Usage</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-wider">{currentJarCount} / {maxJars} Jars</p>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            To create more jars, please upgrade to Pro or leave an existing jar.
                        </p>
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                    <Button
                        className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white border-0 font-bold"
                        onClick={() => onClose()}
                    >
                        Got it
                    </Button>
                </DialogFooter>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogHeader onClose={onClose}>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <span>Create New Jar</span>
                    <Sparkles className="w-6 h-6 text-amber-500" />
                </DialogTitle>
                <DialogDescription>
                    A jar is a collection of ideas. Let's set up a new one!
                </DialogDescription>
            </DialogHeader>

            <DialogContent>
                <form id="create-jar-form" onSubmit={handleCreate} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="create-jar-name" className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                            Jar Name
                        </Label>
                        <Input
                            id="create-jar-name"
                            placeholder="e.g. Date Night Ideas, Weekend Fun..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-12 text-base shadow-sm focus:ring-2 focus:ring-primary/20"
                            aria-label="Jar Name"
                        />
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-[0.05em] flex items-center gap-1.5 pl-1">
                            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                            Give your jar a descriptive name.
                        </p>
                        {error && (
                            <p className="text-sm text-red-500 font-bold mt-1 pl-1">{error}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="create-jar-mode" className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                            Selection Mode
                        </Label>
                        <div className="relative">
                            <select
                                id="create-jar-mode"
                                value={selectionMode}
                                onChange={(e) => setSelectionMode(e.target.value)}
                                className="w-full h-12 pl-4 pr-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none shadow-sm font-medium"
                                aria-label="Select Mode"
                            >
                                <option value="RANDOM">🎲 Spin (Lucky Dip) - Random surprise</option>
                                <option value="ADMIN_PICK">👤 Admin Pick (Curated) - You choose what's next</option>
                                <option value="VOTE">🗳️ Vote (Consensus) - Group decides together</option>
                                <option value="ALLOCATION">📋 Allocation (Tasks) - Assign to team members</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Plus className="w-4 h-4 rotate-45" />
                            </div>
                        </div>
                    </div>

                    {selectionMode === 'VOTE' && (
                        <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Runoff Candidates (Optional)</Label>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        min="0"
                                        max="20"
                                        value={voteCandidates}
                                        onChange={(e) => setVoteCandidates(parseInt(e.target.value) || 0)}
                                        className="w-20 bg-white dark:bg-black/20 h-9"
                                    />
                                    <div className="text-xs text-slate-500">
                                        {voteCandidates === 0 ? (
                                            <span>Include <strong>ALL ideas</strong> in vote</span>
                                        ) : (
                                            <span>Pick <strong>{voteCandidates} random</strong> ideas for runoff</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="create-jar-topic" className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                            Jar Topic
                        </Label>
                        <div className="relative">
                            <select
                                id="create-jar-topic"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full h-12 pl-4 pr-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none shadow-sm font-medium"
                                aria-label="Select Jar Topic"
                            >
                                {Object.keys(TOPIC_CATEGORIES).filter(k => k !== 'Custom' && k !== 'General').map(k => (
                                    <option key={k} value={k}>{k}</option>
                                ))}
                                <option value="Custom">Other / Custom...</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Plus className="w-4 h-4 rotate-45" />
                            </div>
                        </div>
                    </div>

                    {topic === 'Custom' && (
                        <div className="space-y-4 p-5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-black/20 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Custom Topic Name</Label>
                                <Input
                                    value={customTopicName}
                                    onChange={(e) => setCustomTopicName(e.target.value)}
                                    placeholder="e.g. Board Games, Work Lunches"
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11"
                                    autoFocus
                                    aria-label="Custom Topic Name"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Categories</Label>
                                <div className="space-y-2">
                                    {customCategories.map((cat, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <Input
                                                value={cat}
                                                onChange={(e) => updateCategory(idx, e.target.value)}
                                                placeholder={`Category ${idx + 1}`}
                                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11"
                                                aria-label={`Category ${idx + 1}`}
                                            />
                                            {customCategories.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeCategory(idx)}
                                                    className="shrink-0 text-slate-400 hover:text-red-500 h-11 w-11 rounded-xl"
                                                    aria-label={`Remove Category ${idx + 1}`}
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
                                    className="w-full mt-2 border-dashed rounded-xl h-11 font-bold text-slate-500 hover:text-primary transition-all"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Category
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </DialogContent >

            <DialogFooter className="bg-slate-50 dark:bg-black/20">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading} className="font-bold">
                    Cancel
                </Button>
                <Button
                    type="submit"
                    form="create-jar-form"
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 min-w-[120px] rounded-xl h-12"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2 stroke-[3px]" />}
                    Create Jar
                </Button>
            </DialogFooter>
        </Dialog >
    );
}
