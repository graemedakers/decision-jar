"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { X, ArrowRight, Loader2, Check } from "lucide-react";
import { useState } from "react";

interface MoveIdeaModalProps {
    isOpen: boolean;
    onClose: () => void;
    idea: any; // The idea to move
    availableJars: any[]; // List of jars the user can move to
    onMoveComplete?: () => void;
}

export function MoveIdeaModal({ isOpen, onClose, idea, availableJars, onMoveComplete }: MoveIdeaModalProps) {
    const [selectedJarId, setSelectedJarId] = useState<string>("");
    const [isMoving, setIsMoving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleMove = async () => {
        if (!selectedJarId) {
            setError("Please select a jar");
            return;
        }

        setIsMoving(true);
        setError(null);

        try {
            const res = await fetch(`/api/ideas/${idea.id}/move`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetJarId: selectedJarId })
            });

            if (res.ok) {
                const data = await res.json();
                if (onMoveComplete) onMoveComplete();
                alert(`✅ ${data.message || "Idea moved successfully!"}`);
                onClose();
            } else {
                const errData = await res.json();
                setError(errData.error || "Failed to move idea");
            }
        } catch (err: any) {
            console.error("Move error:", err);
            setError("An error occurred while moving the idea");
        } finally {
            setIsMoving(false);
        }
    };

    // Filter out the current jar
    const targetJars = availableJars.filter(j => j.id !== idea?.jarId);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-4 w-8 h-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
                    onClick={onClose}
                >
                    <X className="w-4 h-4" />
                </Button>

                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Move Idea</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Current Idea */}
                    <div className="bg-white dark:bg-white/5 p-4 rounded-lg border border-slate-200 dark:border-white/10">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Moving:</p>
                        <p className="font-bold text-slate-900 dark:text-white">{idea?.description}</p>
                    </div>

                    {/* Jar Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Select destination jar:
                        </label>

                        {targetJars.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <p>No other jars available</p>
                                <p className="text-xs mt-2">Create another jar to move ideas between them</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {targetJars.map((jar) => (
                                    <button
                                        key={jar.id}
                                        onClick={() => setSelectedJarId(jar.id)}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedJarId === jar.id
                                                ? "border-primary bg-primary/10 dark:bg-primary/20"
                                                : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-900 dark:text-white">{jar.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    {jar.topic} • {jar._count?.ideas || 0} ideas
                                                </p>
                                            </div>
                                            {selectedJarId === jar.id && (
                                                <Check className="w-5 h-5 text-primary shrink-0" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isMoving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleMove}
                            className="flex-1 bg-primary hover:bg-primary/90"
                            disabled={isMoving || !selectedJarId || targetJars.length === 0}
                        >
                            {isMoving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Moving...
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Move Idea
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
