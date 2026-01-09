"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, LogOut, Users, Loader2, Crown, LayoutGrid, Calendar, Pencil, Check, UserPlus } from "lucide-react";
import { getApiUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { JarMembersModal } from "./JarMembersModal";
import { showError, showSuccess } from "@/lib/toast";

interface JarSummary {
    id: string;
    name: string;
    description?: string;
    role: "ADMIN" | "MEMBER";
    memberCount: number;
    ideaCount: number;
    createdAt: string;
    isCommunityJar: boolean;
    topic?: string;
    referenceCode?: string;
}

interface JarManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRefresh?: () => void;
}

export function JarManagerModal({ isOpen, onClose, onRefresh }: JarManagerModalProps) {
    const [jars, setJars] = useState<JarSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [viewingMembersJar, setViewingMembersJar] = useState<{ id: string, name: string, role: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            fetchJars();
        }
    }, [isOpen]);

    const fetchJars = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(getApiUrl('/api/jars/list'));
            if (res.ok) {
                const data = await res.json();
                setJars(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyInvite = async (code: string) => {
        try {
            const url = `${window.location.origin}/join?code=${code}`;
            await navigator.clipboard.writeText(url);
            showSuccess("Invite link copied to clipboard");
        } catch (err) {
            console.error('Failed to copy', err);
            showError("Failed to copy link");
        }
    };

    const handleLeave = async (jarId: string) => {
        if (!confirm("Are you sure you want to leave this Jar?")) return;
        setProcessingId(jarId);
        try {
            const res = await fetch(getApiUrl(`/api/jars/${jarId}/leave`), {
                method: 'POST'
            });
            if (res.ok) {
                setJars(prev => prev.filter(j => j.id !== jarId));
                if (onRefresh) onRefresh();
                router.refresh();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (jarId: string) => {
        const confirm1 = confirm("WARNING: This will PERMANENTLY delete the Jar and ALL its ideas for EVERYONE.");
        if (!confirm1) return;

        const confirm2 = confirm("Are you absolutely sure?");
        if (!confirm2) return;

        setProcessingId(jarId);
        try {
            const res = await fetch(getApiUrl(`/api/jars/${jarId}`), {
                method: 'DELETE'
            });
            if (res.ok) {
                setJars(prev => prev.filter(j => j.id !== jarId));
                showSuccess("✅ Jar deleted successfully");
                if (onRefresh) onRefresh();
                router.refresh();
            } else {
                const data = await res.json();
                showError(data.error || "Failed to delete jar.");
            }
        } catch (e) {
            console.error(e);
            showError("An unexpected error occurred.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleRename = async (jarId: string) => {
        if (!editName.trim()) return;
        setProcessingId(jarId);
        try {
            const res = await fetch(getApiUrl(`/api/jars/${jarId}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName.trim() }),
            });
            if (res.ok) {
                setJars(prev => prev.map(j => j.id === jarId ? { ...j, name: editName.trim() } : j));
                setEditingId(null);
                setEditName("");
                showSuccess("✏️ Jar renamed successfully");
                router.refresh();
            } else {
                const data = await res.json();
                showError(data.error || "Failed to rename jar.");
            }
        } catch (e) {
            console.error(e);
            showError("An unexpected error occurred.");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
                        <motion.div
                            key="manager-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={onClose}
                        />

                        <motion.div
                            key="manager-modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[85vh] flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-6 shrink-0">
                                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <LayoutGrid className="w-6 h-6 text-violet-500" />
                                    Manage Your Jars
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 pb-32 md:pb-0">
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                    View and manage all the Jars you belong to. Leave communities you're no longer interested in, or delete inactive Jars you manage.
                                </p>

                                {isLoading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                                    </div>
                                ) : jars.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                        <p>You are not a member of any Jars.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 pb-4">
                                        {jars.map((jar) => (
                                            <div
                                                key={jar.id}
                                                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl gap-4 hover:border-violet-500/30 transition-all hover:shadow-sm"
                                            >
                                                <div className="flex items-start gap-4 min-w-0 flex-1">
                                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm">
                                                        {jar.isCommunityJar ? <Users className="w-5 h-5 text-indigo-500" /> : <LayoutGrid className="w-5 h-5 text-violet-500" />}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap min-h-[28px]">
                                                            {editingId === jar.id ? (
                                                                <div className="flex items-center gap-2 w-full max-w-sm">
                                                                    <input
                                                                        type="text"
                                                                        value={editName}
                                                                        onChange={(e) => setEditName(e.target.value)}
                                                                        autoFocus
                                                                        className="flex-1 bg-white dark:bg-slate-800 border-2 border-violet-500 rounded px-2 py-0.5 text-sm font-bold text-slate-900 dark:text-white outline-none"
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') handleRename(jar.id);
                                                                            if (e.key === 'Escape') setEditingId(null);
                                                                        }}
                                                                        aria-label="Rename jar"
                                                                    />
                                                                    <button
                                                                        onClick={() => handleRename(jar.id)}
                                                                        disabled={processingId === jar.id || !editName.trim()}
                                                                        className="p-1 hover:bg-violet-500/10 rounded text-violet-500 transition-colors"
                                                                        aria-label="Confirm rename"
                                                                    >
                                                                        {processingId === jar.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingId(null)}
                                                                        className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-500 transition-colors"
                                                                        aria-label="Cancel rename"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{jar.name}</h3>
                                                                    {jar.topic && (
                                                                        <span className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/5">
                                                                            {jar.topic}
                                                                        </span>
                                                                    )}
                                                                    {jar.role === 'ADMIN' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEditingId(jar.id);
                                                                                    setEditName(jar.name);
                                                                                }}
                                                                                className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-400 hover:text-violet-500 transition-colors opacity-0 group-hover:opacity-100"
                                                                                title="Rename Jar"
                                                                                aria-label="Rename Jar"
                                                                            >
                                                                                <Pencil className="w-3.5 h-3.5" />
                                                                            </button>
                                                                            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-amber-500/20">
                                                                                <Crown className="w-3 h-3" /> Admin
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {jar.memberCount}</span>
                                                            <span className="opacity-30">•</span>
                                                            <span className="flex items-center gap-1"><LayoutGrid className="w-3 h-3" /> {jar.ideaCount}</span>
                                                            <span className="opacity-30 hidden sm:inline">•</span>
                                                            <span title="Created At" className="hidden sm:inline-flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" /> {new Date(jar.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200 dark:border-slate-800">
                                                    {jar.role === 'ADMIN' && jar.referenceCode && (
                                                        <button
                                                            onClick={() => handleCopyInvite(jar.referenceCode!)}
                                                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 transition-colors text-sm font-medium w-full sm:w-auto"
                                                            aria-label="Invite Members"
                                                        >
                                                            <UserPlus className="w-4 h-4" />
                                                            <span>Invite</span>
                                                        </button>
                                                    )}

                                                    {jar.role === 'ADMIN' && (
                                                        <button
                                                            onClick={() => setViewingMembersJar({ id: jar.id, name: jar.name, role: jar.role })}
                                                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/10 dark:hover:bg-violet-900/20 text-violet-600 dark:text-violet-400 transition-colors text-sm font-medium w-full sm:w-auto"
                                                            aria-label="Manage members"
                                                        >
                                                            <Users className="w-4 h-4" />
                                                            <span>Members</span>
                                                        </button>
                                                    )}

                                                    {jar.role === 'ADMIN' ? (
                                                        <button
                                                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors text-sm font-medium w-full sm:w-auto disabled:opacity-50"
                                                            onClick={() => handleDelete(jar.id)}
                                                            disabled={!!processingId}
                                                            aria-label="Delete Jar"
                                                        >
                                                            {processingId === jar.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                            <span className="">Delete</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors text-sm font-medium w-full sm:w-auto disabled:opacity-50"
                                                            onClick={() => handleLeave(jar.id)}
                                                            disabled={!!processingId}
                                                            aria-label="Leave Jar"
                                                        >
                                                            {processingId === jar.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                                                            <span className="">Leave</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {viewingMembersJar && (
                <JarMembersModal
                    isOpen={!!viewingMembersJar}
                    onClose={() => setViewingMembersJar(null)}
                    jarId={viewingMembersJar.id}
                    jarName={viewingMembersJar.name}
                    currentUserRole={viewingMembersJar.role as any}
                    onRoleUpdated={() => fetchJars()}
                />
            )}
        </>
    );
}
