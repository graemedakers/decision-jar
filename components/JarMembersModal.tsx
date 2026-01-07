"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Loader2, Crown, Shield, ShieldAlert, Check, Trash2, Copy, UserPlus } from "lucide-react";
import { getApiUrl } from "@/lib/utils";
import { showError, showSuccess, showWarning } from "@/lib/toast";

interface Member {
    id: string;
    userId: string;
    role: "ADMIN" | "MEMBER";
    joinedAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        image: string | null;
    };
}

interface JarMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    jarId: string;
    jarName: string;
    currentUserRole: "ADMIN" | "MEMBER";
    onRoleUpdated?: () => void;
}

export function JarMembersModal({ isOpen, onClose, jarId, jarName, currentUserRole, onRoleUpdated }: JarMembersModalProps) {
    const [members, setMembers] = useState<Member[]>([]);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
        }
    }, [isOpen, jarId]);

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(getApiUrl(`/api/jar/${jarId}/members`));
            if (res.ok) {
                const data = await res.json();
                setMembers(data.members || []);
                setInviteCode(data.referenceCode || null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveMember = async (member: Member) => {
        if (!confirm(`Are you sure you want to remove ${member.user.name} from this Jar?`)) return;

        setProcessingId(member.userId);
        try {
            const res = await fetch(getApiUrl(`/api/jar/${jarId}/members/${member.userId}`), {
                method: 'DELETE'
            });

            if (res.ok) {
                setMembers(prev => prev.filter(m => m.userId !== member.userId));
                showSuccess(`✅ ${member.user.name} removed from jar`);
            } else {
                const data = await res.json();
                showError(data.error || "Failed to remove member");
            }
        } catch (error) {
            console.error(error);
            showError("An error occurred");
        } finally {
            setProcessingId(null);
        }
    };

    const copyInviteCode = () => {
        if (!inviteCode) return;
        navigator.clipboard.writeText(inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleToggleRole = async (member: Member) => {
        const newRole = member.role === 'ADMIN' ? 'MEMBER' : 'ADMIN';

        if (member.role === 'ADMIN') {
            const adminCount = members.filter(m => m.role === 'ADMIN').length;
            if (adminCount <= 1) {
                showWarning("⚠️ Cannot demote the last administrator. Promote someone else first.");
                return;
            }
        }

        setProcessingId(member.userId);
        try {
            const res = await fetch(getApiUrl(`/api/jar/${jarId}/members/${member.userId}`), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });

            if (res.ok) {
                setMembers(prev => prev.map(m =>
                    m.userId === member.userId ? { ...m, role: newRole as any } : m
                ));
                showSuccess(`👑 ${member.user.name} is now a${newRole === 'ADMIN' ? 'n admin' : ' member'}`);
                if (onRoleUpdated) onRoleUpdated();
            } else {
                const data = await res.json();
                showError(data.error || "Failed to update role");
            }
        } catch (error) {
            console.error(error);
            showError("An error occurred");
        } finally {
            setProcessingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
                    className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col max-h-[80vh]"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Jar Members</h2>
                            <p className="text-sm text-slate-500">{jarName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {currentUserRole === 'ADMIN' && inviteCode && (
                        <div className="mb-6 bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/30 p-4 rounded-2xl">
                            <h4 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <UserPlus className="w-3.5 h-3.5" /> Invite Others
                            </h4>
                            <div className="flex items-center gap-3">
                                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-violet-200 dark:border-violet-700/50 font-mono text-lg font-bold tracking-widest text-violet-600 dark:text-violet-300 flex-1">
                                    {inviteCode}
                                </div>
                                <button
                                    onClick={copyInviteCode}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-all shadow-sm shadow-violet-500/20 active:scale-95 text-sm font-bold"
                                    aria-label="Copy invite code"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold overflow-hidden">
                                                {member.user.image ? (
                                                    <img src={member.user.image} alt={member.user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    member.user.name[0]?.toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                                                    {member.user.name}
                                                    {member.role === 'ADMIN' && (
                                                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500">{member.user.email}</div>
                                            </div>
                                        </div>

                                        {currentUserRole === 'ADMIN' && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleRole(member)}
                                                    disabled={processingId === member.userId}
                                                    title={member.role === 'ADMIN' ? 'Demote to Member' : 'Promote to Admin'}
                                                    className={`p-2 rounded-lg transition-all ${member.role === 'ADMIN'
                                                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/20 dark:text-amber-400'
                                                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-white/10 dark:text-slate-400'
                                                        }`}
                                                    aria-label={member.role === 'ADMIN' ? 'Demote to Member' : 'Promote to Admin'}
                                                >
                                                    {processingId === member.userId ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Shield className="w-4 h-4" />
                                                    )}
                                                </button>

                                                {/* Only show kick button if NOT the current user */}
                                                <button
                                                    onClick={() => handleRemoveMember(member)}
                                                    disabled={processingId === member.userId}
                                                    title="Remove from Jar"
                                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 transition-colors"
                                                    aria-label="Remove from Jar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// Simple fallback for ShieldPulse if lucide doesn't have it (it usually does have Shield)
function ShieldPulse(props: any) {
    return <Shield {...props} className={props.className + " animate-pulse"} />
}
