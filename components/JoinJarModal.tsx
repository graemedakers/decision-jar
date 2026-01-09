"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Users, Loader2 } from "lucide-react";

interface JoinJarModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function JoinJarModal({ isOpen, onClose }: JoinJarModalProps) {
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
                // Success, reload page
                window.location.reload();
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
            <DialogContent className="sm:max-w-[425px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <span>Join a Jar</span>
                        <Users className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                        Enter the invitation code to instantly sync with an existing jar.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleJoin} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Jar Code</Label>
                        <Input
                            id="code"
                            placeholder="Enter 6-character code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            required
                            maxLength={6}
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 font-mono text-center text-lg tracking-widest uppercase"
                            aria-label="Enter Jar Code"
                            aria-invalid={code.length > 0 && code.length < 3}
                            aria-describedby={error ? "join-error" : undefined}
                        />
                        {error && (
                            <p id="join-error" className="text-sm text-red-400 mt-1" role="alert">{error}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading} aria-label="Cancel Joining Jar">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || code.length < 3}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            aria-label={isLoading ? "Joining Jar..." : "Join Jar"}
                        >
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Join Jar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
