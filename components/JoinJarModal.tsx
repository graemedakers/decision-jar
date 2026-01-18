"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Users, Loader2, Sparkles } from "lucide-react";

interface JoinJarModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function JoinJarModal({ isOpen, onClose, onSuccess }: JoinJarModalProps) {
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/jars/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });

            const data = await res.json();

            if (res.ok) {
                if (onSuccess) {
                    onSuccess();
                } else {
                    window.location.reload();
                }
            } else {
                setError(data.error || "Failed to join jar");
            }
        } catch (error) {
            console.error("Error joining jar:", error);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogHeader onClose={onClose}>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <span>Join a Jar</span>
                    <Users className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </DialogTitle>
                <DialogDescription>
                    Enter the invitation code to instantly sync with an existing jar.
                </DialogDescription>
            </DialogHeader>

            <DialogContent>
                <form id="join-jar-form" onSubmit={handleJoin} className="space-y-6">
                    <div className="space-y-4">
                        <Label htmlFor="join-code" className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest pl-1">
                            Invitation Code
                        </Label>
                        <Input
                            id="join-code"
                            placeholder="E.G. 2AAZ6J"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            required
                            maxLength={6}
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-300 font-mono text-center text-3xl h-20 tracking-[0.2em] uppercase rounded-2xl shadow-inner focus:ring-4 focus:ring-blue-500/10"
                            aria-label="Enter Jar Code"
                        />
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-[0.05em] flex items-center gap-1.5 justify-center">
                            <Sparkles className="w-3 h-3 text-blue-500 shrink-0" />
                            Codes are 6 characters long and expire after 24 hours.
                        </p>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 rounded-xl animate-in fade-in zoom-in duration-200">
                                <p className="text-sm text-red-500 font-bold text-center" role="alert">{error}</p>
                            </div>
                        )}
                    </div>
                </form>
            </DialogContent>

            <DialogFooter className="bg-slate-50 dark:bg-black/20">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading} className="font-bold">
                    Cancel
                </Button>
                <Button
                    type="submit"
                    form="join-jar-form"
                    disabled={isLoading || code.length < 3}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 min-w-[120px] rounded-xl h-12"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
                    Join Jar
                </Button>
            </DialogFooter>
        </Dialog>
    );
}
