"use client";

import { useState, useEffect } from "react";
import { X, Users, Loader2, Crown, Shield, Trash2, Copy, Check, UserPlus, Sparkles } from "lucide-react";
import { getApiUrl } from "@/lib/utils";
import { showError, showSuccess, showWarning } from "@/lib/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface Member {
    id: string;
    userId: string;
    role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
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
    currentUserRole: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
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
            const res = await fetch(getApiUrl(`/api/jars/${jarId}/members`));
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
        if (member.role === 'OWNER') {
            showWarning("⚠️ Cannot remove the jar owner. Transfer ownership first.");
            return;
        }

        if (['OWNER', 'ADMIN'].includes(member.role)) {
            const adminCount = members.filter(m => ['OWNER', 'ADMIN'].includes(m.role)).length;
            if (adminCount <= 1) {
                showWarning("⚠️ Cannot remove the last administrator. This would orphan the jar.");
                return;
            }
        }

        if (!confirm(`Are you sure you want to remove ${member.user.name} from this Jar?`)) return;

        setProcessingId(member.userId);
        try {
            const res = await fetch(getApiUrl(`/api/jars/${jarId}/members/${member.userId}`), {
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

    const copyInviteCode = async () => {
        if (!inviteCode) return;
        try {
            const url = `${window.location.origin}/join?code=${inviteCode}`;
            await navigator.clipboard.writeText(url);
            setCopied(true);
            showSuccess("Invite link copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
            showError("Failed to copy link");
        }
    };

    const handleToggleRole = async (member: Member) => {
        if (member.role === 'OWNER') {
            showWarning("⚠️ Cannot modify the jar owner's role.");
            return;
        }

        const newRole = member.role === 'ADMIN' ? 'MEMBER' : 'ADMIN';

        if (member.role === 'ADMIN') {
            const adminCount = members.filter(m => ['OWNER', 'ADMIN'].includes(m.role)).length;
            if (adminCount <= 1) {
                showWarning("⚠️ Cannot demote the last administrator. Promote someone else first.");
                return;
            }
        }

        setProcessingId(member.userId);
        try {
            const res = await fetch(getApiUrl(`/api/jars/${jarId}/members/${member.userId}`), {
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogHeader onClose={onClose}>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <Users className="w-6 h-6 text-violet-500" />
                    Jar Members
                </DialogTitle>
                <DialogDescription>
                    {jarName} • {members.length} member{members.length !== 1 ? 's' : ''}
                </DialogDescription>
            </DialogHeader>

            <DialogContent className="max-w-lg">
                <div className="space-y-6">
                    {['OWNER', 'ADMIN'].includes(currentUserRole) && inviteCode && (
                        <div className="bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/30 p-5 rounded-2xl animate-in fade-in zoom-in duration-300">
                            <h4 className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                <UserPlus className="w-3.5 h-3.5" /> Invite Others
                            </h4>
                            <div className="flex items-center gap-3">
                                <div className="bg-white dark:bg-slate-900 px-4 h-11 flex items-center rounded-xl border border-violet-200 dark:border-violet-700/50 font-mono text-xl font-bold tracking-[0.2em] text-violet-600 dark:text-violet-300 flex-1 shadow-inner">
                                    {inviteCode}
                                </div>
                                <Button
                                    onClick={copyInviteCode}
                                    className="bg-violet-600 hover:bg-violet-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-violet-500/20 transition-all active:scale-95"
                                    aria-label="Copy invite code"
                                >
                                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                    {copied ? 'Copied' : 'Copy'}
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading members...</p>
                            </div>
                        ) : members.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No members found.</p>
                            </div>
                        ) : (
                            members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 group hover:border-violet-500/30 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-black text-lg overflow-hidden border border-violet-500/20 shadow-sm">
                                            {member.user.image ? (
                                                <img src={member.user.image} alt={member.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                member.user.name[0]?.toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                                                {member.user.name}
                                                {member.role === 'OWNER' ? (
                                                    <span className="text-[9px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                                        <Crown className="w-2.5 h-2.5" /> Owner
                                                    </span>
                                                ) : member.role === 'ADMIN' ? (
                                                    <span className="text-[9px] bg-violet-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                                        <Shield className="w-2.5 h-2.5" /> Admin
                                                    </span>
                                                ) : null}
                                            </div>
                                            <div className="text-xs font-medium text-slate-400">{member.user.email}</div>
                                        </div>
                                    </div>

                                    {['OWNER', 'ADMIN'].includes(currentUserRole) && member.role !== 'OWNER' && (
                                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleToggleRole(member)}
                                                disabled={processingId === member.userId}
                                                className={`h-9 w-9 rounded-xl transition-all ${member.role === 'ADMIN'
                                                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-500/10 dark:text-amber-400'
                                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-white/10 dark:text-slate-400'
                                                    }`}
                                                aria-label={member.role === 'ADMIN' ? 'Demote to Member' : 'Promote to Admin'}
                                            >
                                                {processingId === member.userId ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Shield className="w-4 h-4" />
                                                )}
                                            </Button>

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleRemoveMember(member)}
                                                disabled={processingId === member.userId}
                                                className="h-9 w-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 transition-colors"
                                                aria-label="Remove from Jar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
