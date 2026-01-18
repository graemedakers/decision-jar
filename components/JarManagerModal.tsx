"use client";

import { useState, useEffect } from "react";
import { Trash2, LogOut, Users, Loader2, Crown, LayoutGrid, Calendar, Pencil, Check, UserPlus, Sparkles } from "lucide-react";
import { getApiUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { JarMembersModal } from "./JarMembersModal";
import { showError, showSuccess } from "@/lib/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

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
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogHeader onClose={onClose}>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <LayoutGrid className="w-6 h-6 text-violet-500" />
                        Manage Your Jars
                    </DialogTitle>
                    <DialogDescription>
                        View and manage all the Jars you belong to.
                    </DialogDescription>
                </DialogHeader>

                <DialogContent className="max-w-2xl">
                    <div className="space-y-4">
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed px-1">
                            Leave communities you're no longer interested in, or manage the settings of Jars you've created.
                        </p>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
                                <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Loading jars...</p>
                            </div>
                        ) : jars.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                <p className="font-medium">You are not a member of any Jars yet.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {jars.map((jar) => (
                                    <div
                                        key={jar.id}
                                        className="group relative flex flex-col p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl gap-4 hover:border-violet-500/50 transition-all shadow-sm hover:shadow-md"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                                                {jar.isCommunityJar ? <Users className="w-6 h-6 text-indigo-500" /> : <LayoutGrid className="w-6 h-6 text-violet-500" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap min-h-[32px]">
                                                    {editingId === jar.id ? (
                                                        <div className="flex items-center gap-2 w-full">
                                                            <input
                                                                type="text"
                                                                value={editName}
                                                                onChange={(e) => setEditName(e.target.value)}
                                                                autoFocus
                                                                className="flex-1 bg-white dark:bg-slate-900 border-2 border-violet-500 rounded-lg px-3 py-1 text-sm font-bold text-slate-900 dark:text-white outline-none shadow-inner"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleRename(jar.id);
                                                                    if (e.key === 'Escape') setEditingId(null);
                                                                }}
                                                            />
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => handleRename(jar.id)}
                                                                disabled={processingId === jar.id || !editName.trim()}
                                                                className="text-violet-500 hover:bg-violet-50 h-9 w-9"
                                                            >
                                                                {processingId === jar.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" />}
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => setEditingId(null)}
                                                                className="text-slate-400 h-9 w-9"
                                                            >
                                                                <X className="w-5 h-5" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate pr-8">{jar.name}</h3>
                                                            {jar.topic && (
                                                                <span className="bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/5">
                                                                    {jar.topic}
                                                                </span>
                                                            )}
                                                            {jar.role === 'ADMIN' && (
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingId(jar.id);
                                                                            setEditName(jar.name);
                                                                        }}
                                                                        className="p-1 px-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-violet-500 transition-all flex items-center gap-1.5"
                                                                    >
                                                                        <Pencil className="w-3.5 h-3.5" />
                                                                        <span className="text-[10px] font-bold uppercase">Rename</span>
                                                                    </button>
                                                                    <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                                                                        <Crown className="w-3 h-3" /> Admin
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mt-2 flex-wrap">
                                                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-500" /> {jar.memberCount} Members</span>
                                                    <span className="opacity-30">•</span>
                                                    <span className="flex items-center gap-1.5"><LayoutGrid className="w-3.5 h-3.5 text-violet-500" /> {jar.ideaCount} Ideas</span>
                                                    <span className="opacity-30 hidden sm:inline">•</span>
                                                    <span className="hidden sm:inline-flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-emerald-500" /> {new Date(jar.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 w-full mt-2 pt-4 border-t border-slate-100 dark:border-white/5">
                                            {jar.role === 'ADMIN' && jar.referenceCode && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleCopyInvite(jar.referenceCode!)}
                                                    className="flex-1 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-500/5 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 h-10 rounded-xl"
                                                >
                                                    <UserPlus className="w-4 h-4 mr-2" /> Invite
                                                </Button>
                                            )}

                                            {jar.role === 'ADMIN' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setViewingMembersJar({ id: jar.id, name: jar.name, role: jar.role })}
                                                    className="flex-1 bg-violet-50/50 hover:bg-violet-50 dark:bg-violet-500/5 dark:hover:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-500/20 h-10 rounded-xl"
                                                >
                                                    <Users className="w-4 h-4 mr-2" /> Members
                                                </Button>
                                            )}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => jar.role === 'ADMIN' ? handleDelete(jar.id) : handleLeave(jar.id)}
                                                disabled={!!processingId}
                                                className={jar.role === 'ADMIN'
                                                    ? "flex-1 bg-red-50/50 hover:bg-red-50 dark:bg-red-500/5 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20 h-10 rounded-xl"
                                                    : "flex-1 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 h-10 rounded-xl"
                                                }
                                            >
                                                {processingId === jar.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :
                                                    (jar.role === 'ADMIN' ? <Trash2 className="w-4 h-4 mr-2" /> : <LogOut className="w-4 h-4 mr-2" />)}
                                                {jar.role === 'ADMIN' ? "Delete" : "Leave"}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

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
