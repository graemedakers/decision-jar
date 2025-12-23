"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getApiUrl, isCapacitor } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DeleteLogModal } from "@/components/DeleteLogModal";
import { X, MapPin, Trash2, History, RefreshCw, UserMinus, CreditCard, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLocation?: string;
}


export function SettingsModal({ isOpen, onClose, currentLocation }: SettingsModalProps) {
    const router = useRouter();
    const [location, setLocation] = useState(currentLocation || "");
    const [interests, setInterests] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [hasPartner, setHasPartner] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [isPremium, setIsPremium] = useState(false);
    const [hasPaid, setHasPaid] = useState(false);
    const [isNative, setIsNative] = useState(false);
    const [jarType, setJarType] = useState<"ROMANTIC" | "SOCIAL">("ROMANTIC");

    useEffect(() => {
        setIsNative(isCapacitor());
    }, []);

    useEffect(() => {
        if (isOpen) {
            setLocation(currentLocation || "");
            // Fetch user settings
            fetch(getApiUrl('/api/auth/me'))
                .then(res => res.json())
                .then(data => {
                    if (data?.user) {
                        setInterests(data.user.interests || "");
                        setIsCreator(!!data.user.isCreator);
                        setHasPartner(!!data.user.hasPartner);
                        setInviteCode(data.user.coupleReferenceCode || "");
                        setIsPremium(!!data.user.isPremium);
                        setHasPaid(!!data.user.hasPaid);
                        if (data.user.jarType) setJarType(data.user.jarType);
                    }
                });
        }
    }, [isOpen, currentLocation]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Update user settings (location + interests)
            const userRes = await fetch(getApiUrl('/api/user/settings'), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location,  // Save to user.homeTown
                    interests
                }),
                credentials: 'include',
            });

            if (userRes.ok) {
                onClose();
                router.refresh();
            } else {
                alert("Failed to update settings");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating settings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmptyJar = async () => {
        if (!confirm("Are you sure you want to empty the jar? This will delete ALL ideas, including your history of past dates. This action cannot be undone.")) return;

        setIsLoading(true);
        try {
            const res = await fetch(getApiUrl('/api/couple/reset-jar'), {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                onClose();
                router.refresh();
                window.location.reload();
            } else {
                const data = await res.json();
                alert(`Failed to empty jar: ${data.details || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error emptying jar");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerateCode = async () => {
        if (!confirm("Are you sure you want to regenerate your invite code? The old code will stop working.")) return;

        setIsLoading(true);
        try {
            const res = await fetch(getApiUrl('/api/couple/regenerate-code'), {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                alert(`Success! Your new invite code is: ${data.newCode}`);
                // Refresh to update the code in the dashboard
                router.refresh();
            } else {
                const data = await res.json();
                alert(`Failed to regenerate code: ${data.details || data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error regenerating code");
        } finally {
            setIsLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(getApiUrl('/api/stripe/portal'), {
                method: 'POST',
                credentials: 'include',
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Failed to create portal session");
            }
        } catch (error) {
            console.error(error);
            alert("Error managing subscription");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePartner = async () => {
        if (!confirm("Are you sure you want to delete your partner? This will remove them from the couple, delete ALL ideas they created, and delete ALL history of past dates. This action cannot be undone.")) return;

        setIsLoading(true);
        try {
            const res = await fetch(getApiUrl('/api/couple/delete-partner'), {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                onClose();
                router.refresh();
                window.location.reload();
            } else {
                const data = await res.json();
                alert(`Failed to delete partner: ${data.details || data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error deleting partner");
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card w-full max-w-md relative max-h-[90vh] overflow-y-auto bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10"
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-primary" />
                                Settings
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-1">Favourite Dating Location</label>
                                    <Input
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g. New York, NY"
                                        required
                                        className="text-slate-900 dark:text-white"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                                        Used as the default location for date spots.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-1">Your Interests</label>
                                    <Input
                                        value={interests}
                                        onChange={(e) => setInterests(e.target.value)}
                                        placeholder="e.g. Hiking, Sushi, Jazz, Art"
                                        className="text-slate-900 dark:text-white"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                                        Comma separated. Used to personalize smart suggestions.
                                    </p>
                                </div>

                                <Button type="submit" className="w-full" isLoading={isLoading}>
                                    Save Changes
                                </Button>
                            </form>

                            {isCreator && (
                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10 space-y-4">
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2">
                                        Manage {jarType === 'ROMANTIC' ? 'Partner' : 'Group'}
                                    </h3>

                                    {jarType === 'ROMANTIC' && hasPartner ? (
                                        <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                                            <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
                                                You are currently linked with a partner.
                                            </p>
                                            <p className="text-xs text-slate-500 text-center mt-2">
                                                To invite a new partner, you must first remove your current partner in the Danger Zone below.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600 dark:text-slate-300">Invite Code:</span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(`${window.location.origin}/signup?code=${inviteCode || ""}`);
                                                                alert("Invite link copied to clipboard!");
                                                            }}
                                                            className="font-mono font-bold text-lg text-primary hover:text-primary/80 dark:hover:text-white transition-colors flex items-center gap-2"
                                                        >
                                                            {inviteCode || "Loading..."}
                                                            <span className="text-xs bg-slate-200 dark:bg-white/10 px-2 py-1 rounded text-slate-500 dark:text-slate-400">Copy</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Share this code or link with your {jarType === 'ROMANTIC' ? 'partner' : 'friends'} to sync your jars.
                                                </p>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="w-full justify-start text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white bg-transparent border-none shadow-none"
                                                onClick={handleRegenerateCode}
                                                disabled={isLoading}
                                            >
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                Regenerate Invite Code
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10 space-y-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full justify-start text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
                                    onClick={() => setIsLogModalOpen(true)}
                                >
                                    <History className="w-4 h-4 mr-2" />
                                    View Deletion History
                                </Button>

                                {hasPaid ? (
                                    <>
                                        {isNative ? (
                                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Manage Subscription: Please visit <strong>date-jar.com</strong>
                                                </p>
                                            </div>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="w-full justify-start text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                                                onClick={handleManageSubscription}
                                                disabled={isLoading}
                                            >
                                                <CreditCard className="w-4 h-4 mr-2" />
                                                Manage Subscription
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <Button
                                        type="button"
                                        className="w-full justify-start bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 border-0"
                                        onClick={() => router.push('/premium')}
                                    >
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Upgrade to Pro
                                    </Button>
                                )}
                            </div>

                            {isCreator && (
                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                                    <h3 className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2">
                                        <Trash2 className="w-4 h-4" />
                                        Danger Zone
                                    </h3>
                                    <div className="space-y-4">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="w-full border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300"
                                            onClick={handleEmptyJar}
                                            disabled={isLoading}
                                        >
                                            Empty Jar (Delete All Ideas)
                                        </Button>

                                        {hasPartner && (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="w-full border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300"
                                                onClick={handleDeletePartner}
                                                disabled={isLoading}
                                            >
                                                <UserMinus className="w-4 h-4 mr-2" />
                                                {jarType === 'ROMANTIC' ? 'Delete Partner' : 'Remove Members'}
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 text-center">
                                        These actions are irreversible.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <DeleteLogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} />
        </>
    );
}
