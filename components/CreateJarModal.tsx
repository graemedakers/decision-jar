"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Users, Heart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
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
    // Default to SOCIAL if user already has a romantic jar, otherwise ROMANTIC
    const [topic, setTopic] = useState("General");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const maxJars = isPro ? 50 : 1;
    const isLimitReached = currentJarCount >= maxJars;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/jar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type: "SOCIAL", topic }),
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
                            onClick={() => {
                                // Close this modal, and let the user find the upgrade button in dashboard 
                                // (or we could trigger a callback to open premium modal)
                                onClose();
                            }}
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
            <DialogContent className="sm:max-w-[425px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <span>New Jar</span>
                        <span className="text-2xl">✨</span>
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                        Create a new collection of date ideas.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreate} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Jar Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Weekend Adventures, Summer 2024"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
                        />
                        {error && (
                            <p className="text-sm text-red-400 mt-1">{error}</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Label>Jar Topic</Label>
                        <select
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full h-10 pl-4 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary items-center"
                        >
                            {Object.keys(TOPIC_CATEGORIES).filter(k => k !== 'Custom').map(k => (
                                <option key={k} value={k}>
                                    {k === "General" ? "General (Anything)" : k}
                                </option>
                            ))}
                        </select>
                    </div>

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
