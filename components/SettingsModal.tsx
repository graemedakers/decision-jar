"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getApiUrl, isCapacitor, getCurrentLocation } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DeleteLogModal } from "@/components/DeleteLogModal";
import { X, MapPin, Trash2, History, RefreshCw, UserMinus, CreditCard, Sparkles, Users, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BASE_DOMAIN } from "@/lib/config";
import { LocationInput } from "./LocationInput";
import { showSuccess, showError, showInfo } from "@/lib/toast";
import { getJarLabels } from "@/lib/labels";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLocation?: string;
    onRestartTour?: () => void;
    onSettingsChanged?: () => void;
}


export function SettingsModal({ isOpen, onClose, currentLocation, onRestartTour, onSettingsChanged }: SettingsModalProps) {
    const router = useRouter();
    const [location, setLocation] = useState(currentLocation || "");
    const [interests, setInterests] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [hasPartner, setHasPartner] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [isPremium, setIsPremium] = useState(false);
    const [hasPaid, setHasPaid] = useState(false);
    const [isNative, setIsNative] = useState(false);
    const [jarType, setJarType] = useState<"ROMANTIC" | "SOCIAL">("ROMANTIC");
    const [jarName, setJarName] = useState("");
    const [jarTopic, setJarTopic] = useState("");
    const [jarSelectionMode, setJarSelectionMode] = useState<"RANDOM" | "VOTING" | "ALLOCATION" | "ADMIN_PICK">("RANDOM");

    // Premium Invite Logic
    const [currentUserEmail, setCurrentUserEmail] = useState("");
    const [premiumInviteToken, setPremiumInviteToken] = useState("");
    const [includePremiumToken, setIncludePremiumToken] = useState(true);

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
                        setLocation(data.user.homeTown || data.user.location || "");
                        setInterests(data.user.interests || "");
                        setIsCreator(!!data.user.isCreator);

                        // Role-based Check
                        const activeMembership = data.user.memberships?.find((m: any) => m.jarId === data.user.activeJarId);
                        setIsAdmin(activeMembership?.role === 'ADMIN' || !!data.user.isCreator);

                        setHasPartner(!!data.user.hasPartner);
                        setInviteCode(data.user.coupleReferenceCode || "");
                        setIsPremium(!!data.user.isPremium);
                        setHasPaid(!!data.user.hasPaid);
                        if (data.user.jarType) setJarType(data.user.jarType);
                        setJarName(data.user.jarName || "");
                        setJarTopic(data.user.jarTopic || "");
                        if (data.user.jarSelectionMode) setJarSelectionMode(data.user.jarSelectionMode);
                        setCurrentUserEmail(data.user.email || "");
                        setPremiumInviteToken(data.user.premiumInviteToken || "");
                    }
                });
        }
    }, [isOpen, currentLocation, jarTopic]);

    const labels = getJarLabels(jarTopic);

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

            // Update Jar settings if admin
            if (isAdmin) {
                await fetch(getApiUrl('/api/jar/settings'), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: jarName,
                        topic: jarTopic,
                        selectionMode: jarSelectionMode,
                    }),
                    credentials: 'include',
                });
            }

            if (userRes.ok) {
                showSuccess("Settings updated successfully!");
                onSettingsChanged?.();
                onClose();
                router.refresh();
            } else {
                showError("Failed to update settings");
            }
        } catch (error) {
            console.error(error);
            showError("Error updating settings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmptyJar = async () => {
        if (!confirm(`Are you sure you want to ${labels.emptyJarAction.toLowerCase()}? This will delete ALL ideas, including your history of past sessions. This action cannot be undone.`)) return;

        setIsLoading(true);
        try {
            const res = await fetch(getApiUrl('/api/couple/reset-jar'), {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                showSuccess(data.message || "Jar emptied successfully!");
                onClose();
                router.refresh();
                window.location.reload();
            } else {
                const data = await res.json();
                showError(`Failed to empty jar: ${data.details || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            showError("Error emptying jar");
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
                showSuccess(`Success! Your new invite code is: ${data.newCode}`);
                setInviteCode(data.newCode); // Update local state
                router.refresh();
            } else {
                const data = await res.json();
                showError(`Failed to regenerate code: ${data.details || data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            showError("Error regenerating code");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegeneratePremiumToken = async () => {
        if (!confirm("Are you sure? This will invalidate previous premium invite links.")) return;
        setIsLoading(true);
        try {
            const res = await fetch(getApiUrl('/api/user/premium-token'), {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                showSuccess("Success! Premium token valid.");
                setPremiumInviteToken(data.token);
                router.refresh();
            } else {
                const data = await res.json();
                showError(`Failed: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            showError("Error regenerating token");
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
                showError("Failed to create portal session");
            }
        } catch (error) {
            console.error(error);
            showError("Error managing subscription");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePartner = async () => {
        if (!confirm(`Are you sure you want to remove this ${labels.memberLabel.toLowerCase()}? This will remove them from the group, delete ALL ideas they created, and delete ALL related history. This action cannot be undone.`)) return;

        setIsLoading(true);
        try {
            const res = await fetch(getApiUrl('/api/couple/delete-partner'), {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                showSuccess(data.message || `${labels.memberLabel} deleted successfully`);
                onClose();
                router.refresh();
                window.location.reload();
            } else {
                const data = await res.json();
                showError(`Failed to delete ${labels.memberLabel.toLowerCase()}: ${data.details || data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            showError(`Error deleting ${labels.memberLabel.toLowerCase()}`);
        } finally {
            setIsLoading(false);
        }
    };



    const [activeTab, setActiveTab] = useState<'PERSONAL' | 'JAR'>('PERSONAL');

    // ... (Keep existing handlers: handleSubmit, handleEmptyJar, handleRegenerateCode, handleRegeneratePremiumToken, handleManageSubscription, handleDeletePartner)

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card w-full max-w-md relative max-h-[90vh] flex flex-col bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10"
                        >
                            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <MapPin className="w-6 h-6 text-primary" />
                                    Settings
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
                                    aria-label="Close Settings"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex border-b border-slate-200 dark:border-white/10 shrink-0">
                                <button
                                    onClick={() => setActiveTab('PERSONAL')}
                                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'PERSONAL' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'}`}
                                >
                                    My Preferences
                                </button>
                                {isAdmin && (
                                    <button
                                        onClick={() => setActiveTab('JAR')}
                                        className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'JAR' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'}`}
                                    >
                                        Jar Settings
                                    </button>
                                )}
                            </div>

                            <div className="overflow-y-auto p-6 space-y-8 pb-32">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {activeTab === 'PERSONAL' && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="space-y-6"
                                        >
                                            {/* PERSONAL SETTINGS */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center ml-1">
                                                    <label className="text-sm font-bold text-slate-800 dark:text-gray-200">Default Location</label>
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            try {
                                                                const currentLoc = await getCurrentLocation();
                                                                setLocation(currentLoc);
                                                                showSuccess("Location detected!");
                                                            } catch (err) {
                                                                showError("Could not get location. Check permissions.");
                                                            }
                                                        }}
                                                        className="text-[10px] uppercase tracking-wider font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                                                    >
                                                        <MapPin className="w-3 h-3" /> Locate Me
                                                    </button>
                                                </div>
                                                <LocationInput
                                                    value={location}
                                                    onChange={setLocation}
                                                    placeholder="e.g. New York, NY"
                                                />
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Your base for smart suggestions.
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                <label htmlFor="interests-input" className="block text-sm font-bold text-slate-800 dark:text-gray-200 ml-1">Your Interests</label>
                                                <Input
                                                    id="interests-input"
                                                    value={interests}
                                                    onChange={(e) => setInterests(e.target.value)}
                                                    placeholder="Hiking, Sushi, Jazz..."
                                                    className="text-slate-900 dark:text-white"
                                                />
                                            </div>

                                            {/* Subscription & Utility Section (Moved to Personal Tab) */}
                                            <div className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-3">
                                                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-2">Account & App</h3>

                                                {onRestartTour && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="w-full justify-start text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
                                                        onClick={() => { onRestartTour(); onClose(); }}
                                                    >
                                                        <Sparkles className="w-4 h-4 mr-2" /> Restart Tour
                                                    </Button>
                                                )}

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="w-full justify-start text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
                                                    onClick={() => setIsLogModalOpen(true)}
                                                >
                                                    <History className="w-4 h-4 mr-2" /> View History
                                                </Button>

                                                {hasPaid ? (
                                                    isNative ? (
                                                        <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-lg text-xs text-slate-500">
                                                            Manage Subscription: Visit <strong>{BASE_DOMAIN}</strong>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            className="w-full justify-start text-slate-600 dark:text-slate-300"
                                                            onClick={handleManageSubscription}
                                                            disabled={isLoading}
                                                        >
                                                            <CreditCard className="w-4 h-4 mr-2" /> Manage Subscription
                                                        </Button>
                                                    )
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        className="w-full justify-start bg-gradient-to-r from-primary to-accent text-white border-0"
                                                        onClick={() => router.push('/premium')}
                                                    >
                                                        <Sparkles className="w-4 h-4 mr-2" /> Upgrade to Pro
                                                    </Button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'JAR' && isAdmin && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="space-y-8"
                                        >
                                            {/* JAR CONFIGURATION */}
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label htmlFor="jar-name" className="text-sm font-bold text-slate-800 dark:text-gray-200">Jar Name</label>
                                                    <Input
                                                        id="jar-name"
                                                        value={jarName}
                                                        onChange={(e) => setJarName(e.target.value)}
                                                        placeholder="Our Jar"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-slate-800 dark:text-gray-200">Topic</label>
                                                        <div className="relative">
                                                            <select
                                                                value={jarTopic}
                                                                onChange={(e) => setJarTopic(e.target.value)}
                                                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm appearance-none focus:outline-none focus:border-primary"
                                                            >
                                                                {['General', 'Romantic', 'Restaurants', 'Bars', 'Nightclubs', 'Movies', 'Wellness', 'Fitness', 'Travel', 'System Development'].map(t => (
                                                                    <option key={t} value={t} className="bg-white dark:bg-slate-900">{t}</option>
                                                                ))}
                                                            </select>
                                                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-slate-800 dark:text-gray-200">Mode</label>
                                                        <div className="relative">
                                                            <select
                                                                value={jarSelectionMode}
                                                                onChange={(e) => setJarSelectionMode(e.target.value as any)}
                                                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm appearance-none focus:outline-none focus:border-primary"
                                                            >
                                                                <option value="RANDOM">Random Spin</option>
                                                                <option value="ADMIN_PICK">Admin Pick</option>
                                                                <option value="VOTING">Group Voting</option>
                                                            </select>
                                                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* MEMBERS / INVITES */}
                                            <div className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-4">
                                                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Access & Members</h3>

                                                {hasPartner ? (
                                                    <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-center">
                                                        <p className="text-sm text-slate-600 dark:text-slate-300">Linked with a {labels.memberLabel.toLowerCase()}.</p>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={handleDeletePartner}
                                                        >
                                                            Remove Partner
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-lg flex justify-between items-center border border-slate-200 dark:border-white/10">
                                                            <span className="font-mono font-bold text-lg text-primary">{inviteCode || "Loading..."}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(`${window.location.origin}/signup?code=${inviteCode || ""}`);
                                                                    showSuccess("Copied!");
                                                                }}
                                                                className="text-xs bg-white dark:bg-white/10 px-2.5 py-1.5 rounded font-bold shadow-sm"
                                                            >
                                                                Copy Link
                                                            </button>
                                                        </div>
                                                        <Button type="button" variant="ghost" size="sm" onClick={handleRegenerateCode} className="w-full text-slate-500">
                                                            <RefreshCw className="w-3 h-3 mr-2" /> Regenerate Code
                                                        </Button>
                                                    </div>
                                                )}

                                                {/* ADMIN OVERRIDE (Hidden unless specific user) */}
                                                {currentUserEmail === 'graemedakers@gmail.com' && (
                                                    <div className="pt-4 mt-2 border-t border-dashed border-slate-200 dark:border-white/10">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-[10px] uppercase font-bold text-purple-500">Admin Override</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={includePremiumToken}
                                                                onChange={(e) => setIncludePremiumToken(e.target.checked)}
                                                                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                                                            />
                                                            <span className="text-xs text-slate-500">Gift Premium?</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const params = new URLSearchParams();
                                                                if (inviteCode) params.set('code', inviteCode);
                                                                if (includePremiumToken && premiumInviteToken) params.set('pt', premiumInviteToken);
                                                                navigator.clipboard.writeText(`${window.location.origin}/signup?${params.toString()}`);
                                                                showSuccess("Admin Link Copied");
                                                            }}
                                                            className="mt-2 w-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 py-2 rounded font-mono"
                                                        >
                                                            Copy Admin Link
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* DANGER ZONE */}
                                            <div className="pt-6 border-t border-slate-200 dark:border-white/10">
                                                <h3 className="text-xs font-bold uppercase text-red-500 tracking-widest mb-3">Danger Zone</h3>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400"
                                                    onClick={handleEmptyJar}
                                                >
                                                    {labels.emptyJarAction}
                                                </Button>
                                                <p className="text-[10px] text-slate-400 mt-2 text-center">Irreversible. Deletes all ideas.</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="pt-4 sticky bottom-0 bg-white/0 backdrop-blur-md pb-4 -mx-6 px-6 border-t border-transparent">
                                        <Button type="submit" className="w-full shadow-lg" isLoading={isLoading}>
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <DeleteLogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} />
        </>
    );
}
