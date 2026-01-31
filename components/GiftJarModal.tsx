
"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox"; // Import Checkbox
import { Gift, Copy, Share, Check, Loader2, AlertCircle } from "lucide-react";
import { useModalSystem } from "./ModalProvider";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface GiftJarModalProps {
    jarId: string;
    jarName: string;
    ideaCount: number;
}

export function GiftJarModal({ jarId, jarName, ideaCount }: GiftJarModalProps) {
    const { closeModal } = useModalSystem();
    const [step, setStep] = useState<'CREATE' | 'SHARE'>('CREATE');
    const [message, setMessage] = useState("");
    const [isMysteryMode, setIsMysteryMode] = useState(false); // State for mystery mode
    const [revealPace, setRevealPace] = useState("INSTANT"); // State for reveal pace
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [giftData, setGiftData] = useState<{ token: string; url: string; expiresAt: string } | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    // Initial validation
    if (ideaCount < 5) {
        return (
            <Dialog open={true} onOpenChange={() => closeModal()}>
                <DialogContent>
                    <DialogHeader onClose={closeModal}>
                        <DialogTitle className="flex items-center gap-2 text-amber-500">
                            <AlertCircle className="w-5 h-5" /> Cannot Gift Jar Yet
                        </DialogTitle>
                        <DialogDescription>
                            Your jar <strong>{jarName}</strong> only has {ideaCount} ideas.
                            A gift jar needs at least 5 approved ideas to be shared.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg flex justify-center">
                        <span className="text-4xl">🫙</span>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => closeModal()}>Got it</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/jar/${jarId}/gift`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personalMessage: message,
                    isMysteryMode: isMysteryMode, // Pass the state
                    revealPace: isMysteryMode ? revealPace : "INSTANT"
                })
            });

            if (!res.ok) {
                const msg = await res.text();
                // Handle rate limit specifically
                if (res.status === 429) {
                    throw new Error("Monthly gift limit reached. Upgrade to Pro for unlimited gifting!");
                }
                throw new Error(msg || "Failed to create gift");
            }

            const data = await res.json();
            if (data.success && data.gift) {
                setGiftData(data.gift);
                setStep('SHARE');
            } else {
                throw new Error("Invalid response from server");
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!giftData?.url) return;
        navigator.clipboard.writeText(giftData.url);
        setIsCopied(true);
        toast.success("Gift link copied!");
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleShare = async () => {
        if (!giftData) return;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `A gift for you: ${jarName}`,
                    text: message || `I created a "${jarName}" decision jar for you!`,
                    url: giftData.url
                });
            } catch (err) {
                // Ignore abort errors
            }
        } else {
            handleCopy();
        }
    };

    return (
        <Dialog open={true} onOpenChange={() => closeModal()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader onClose={closeModal}>
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-primary">
                        <Gift className="w-6 h-6" />
                    </div>
                    <DialogTitle className="text-center text-xl">
                        {step === 'CREATE' ? "Gift This Jar" : "Gift Ready!"}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {step === 'CREATE'
                            ? `Create a shareable copy of "${jarName}" for a friend.`
                            : `Your unique link for "${jarName}" has been created.`}
                    </DialogDescription>
                </DialogHeader>

                <AnimatePresence mode="wait">
                    {step === 'CREATE' ? (
                        <motion.div
                            key="create"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4 py-2"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="message">Personal Message (Optional)</Label>
                                <Textarea
                                    id="message"
                                    placeholder="I thought you'd love these ideas! Can't wait to hear which ones you try."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    maxLength={200}
                                    className="resize-none h-24"
                                />
                                <div className="text-xs text-right text-muted-foreground">
                                    {message.length}/200
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-500/30">
                                <Checkbox
                                    id="mystery-mode"
                                    checked={isMysteryMode}
                                    onCheckedChange={(c: boolean | 'indeterminate') => setIsMysteryMode(!!c)}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label
                                        htmlFor="mystery-mode"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Mystery Jar Mode
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Recipient won't see any ideas in the list. They must spin to reveal them one by one!
                                    </p>
                                </div>
                            </div>

                            {isMysteryMode && (
                                <div className="pl-8 space-y-3 animate-in slide-in-from-top-2 fade-in">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unlock Pace</Label>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="pace-instant"
                                                name="revealPace"
                                                value="INSTANT"
                                                checked={revealPace === "INSTANT"}
                                                onChange={() => setRevealPace("INSTANT")}
                                                className="text-primary focus:ring-primary"
                                            />
                                            <label htmlFor="pace-instant" className="text-sm">Instant (No Limit)</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="pace-daily"
                                                name="revealPace"
                                                value="DAILY"
                                                checked={revealPace === "DAILY"}
                                                onChange={() => setRevealPace("DAILY")}
                                                className="text-primary focus:ring-primary"
                                            />
                                            <label htmlFor="pace-daily" className="text-sm">One Idea Per Day</label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <DialogFooter className="pt-2">
                                <Button variant="ghost" onClick={() => closeModal()} disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button onClick={handleGenerate} disabled={isLoading} className="gap-2">
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                                    Generate Gift Link
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="share"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6 py-2"
                        >
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Gift Link</span>
                                <code className="text-primary font-mono font-bold text-lg break-all">
                                    {giftData?.url.replace('https://', '')}
                                </code>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button size="lg" variant="outline" onClick={handleCopy} className="h-14 flex flex-col gap-1 items-center justify-center">
                                    {isCopied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                    <span className="text-xs">{isCopied ? "Copied!" : "Copy Link"}</span>
                                </Button>
                                <Button size="lg" onClick={handleShare} className="h-14 flex flex-col gap-1 items-center justify-center">
                                    <Share className="w-5 h-5" />
                                    <span className="text-xs">Share...</span>
                                </Button>
                            </div>

                            <div className="text-center">
                                <a
                                    href={giftData?.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Preview Gift Page →
                                </a>
                            </div>

                            <DialogFooter>
                                <Button variant="ghost" onClick={() => closeModal()} className="w-full">
                                    Done
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
