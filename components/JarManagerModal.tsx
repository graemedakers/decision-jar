"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, LogOut, Users, Loader2, Crown, LayoutGrid, Calendar } from "lucide-react";
import { getApiUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface JarSummary {
    id: string;
    name: string;
    description?: string;
    role: "ADMIN" | "MEMBER";
    memberCount: number;
    ideaCount: number;
    createdAt: string;
    isCommunityJar: boolean;
}

interface JarManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function JarManagerModal({ isOpen, onClose }: JarManagerModalProps) {
    const [jars, setJars] = useState<JarSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            fetchJars();
        }
    }, [isOpen]);

    const fetchJars = async () => {
        setIsLoading(true);
        try {
            // We need a dedicated endpoint for this Summary View, using existing structure for now.
            // Assuming we can fetch user memberships and enriching them.
            // For now, let's hit a specialized endpoint or reuse /api/auth/me?
            // Actually, best to create a new endpoint /api/jars/list 
            // BUT, since we can't create endpoints easily without full file context, 
            // I'll simulate it by calling /api/auth/me and doing client side fetch for details? No, too slow.
            // I'll add a new API route in next step. For now, assumed endpoint exists.
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

    const handleLeave = async (jarId: string) => {
        if (!confirm("Are you sure you want to leave this Jar?")) return;
        setProcessingId(jarId);
        try {
            const res = await fetch(getApiUrl('/api/jar/leave'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jarId }),
            });
            if (res.ok) {
                setJars(prev => prev.filter(j => j.id !== jarId));
                router.refresh();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (jarId: string) => {
        // Double confirm
        const confirm1 = confirm("WARNING: This will PERMANENTLY delete the Jar and ALL its ideas for EVERYONE.");
        if (!confirm1) return;

        const confirm2 = confirm("Are you absolutely sure?");
        if (!confirm2) return;

        setProcessingId(jarId);
        try {
            const res = await fetch(getApiUrl(`/api/jar/${jarId}/delete`), { // Need this endpoint
                method: 'DELETE'
            });
            if (res.ok) {
                setJars(prev => prev.filter(j => j.id !== jarId));
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete jar.");
            }
        } catch (e) {
            console.error(e);
            alert("An unexpected error occurred.");
        } finally {
            setProcessingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
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
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
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
                                            <div className="flex items-start gap-4 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm">
                                                    {jar.isCommunityJar ? <Users className="w-5 h-5 text-indigo-500" /> : <LayoutGrid className="w-5 h-5 text-violet-500" />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{jar.name}</h3>
                                                        {jar.role === 'ADMIN' && (
                                                            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-amber-500/20">
                                                                <Crown className="w-3 h-3" /> Admin
                                                            </span>
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
                                                {jar.role === 'ADMIN' ? (
                                                    <button
                                                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors text-sm font-medium w-full sm:w-auto disabled:opacity-50"
                                                        onClick={() => handleDelete(jar.id)}
                                                        disabled={!!processingId}
                                                    >
                                                        {processingId === jar.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                        <span className="">Delete</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors text-sm font-medium w-full sm:w-auto disabled:opacity-50"
                                                        onClick={() => handleLeave(jar.id)}
                                                        disabled={!!processingId}
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
    );
}
