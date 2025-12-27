"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Check, XCircle, Clock, Search, Shield } from "lucide-react";
import { Button } from "./ui/Button";

interface Helper {
    id: string;
    userId: string;
    name: string;
    email: string;
    status: 'ACTIVE' | 'PENDING' | 'WAITLISTED';
    role: 'ADMIN' | 'MEMBER';
    joinedAt: string;
}

interface CommunityAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    jarId: string;
    jarName: string;
}

export function CommunityAdminModal({ isOpen, onClose, jarId, jarName }: CommunityAdminModalProps) {
    const [members, setMembers] = useState<Helper[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'WAITLISTED' | 'ACTIVE'>('PENDING');

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
        }
    }, [isOpen, jarId]);

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/jars/${jarId}/members`);
            if (res.ok) {
                setMembers(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (userId: string, status: 'ACTIVE' | 'REJECTED') => {
        if (!confirm(status === 'ACTIVE' ? "Approve this member?" : "Remove/Reject this member?")) return;

        try {
            const res = await fetch(`/api/jars/${jarId}/members/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                if (status === 'REJECTED') {
                    setMembers(prev => prev.filter(m => m.userId !== userId));
                } else {
                    setMembers(prev => prev.map(m => m.userId === userId ? { ...m, status: 'ACTIVE' } : m));
                }
            } else {
                const data = await res.json();
                alert(data.error || "Action failed");
            }
        } catch (e) {
            console.error(e);
            alert("Error updating member");
        }
    };

    const pendingCount = members.filter(m => m.status === 'PENDING').length;
    const waitlistCount = members.filter(m => m.status === 'WAITLISTED').length;

    const filteredMembers = members.filter(m => {
        if (filter === 'ALL') return true;
        return m.status === filter;
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card w-full max-w-4xl relative max-h-[90vh] flex flex-col bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage members for {jarName}</p>
                                </div>
                            </div>
                            <button onClick={onClose}><X className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-200 dark:border-white/10 px-6 gap-6">
                            <button
                                onClick={() => setFilter('PENDING')}
                                className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${filter === 'PENDING' ? 'border-violet-500 text-violet-600 dark:text-violet-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Requests
                                {pendingCount > 0 && <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full text-xs">{pendingCount}</span>}
                            </button>
                            <button
                                onClick={() => setFilter('WAITLISTED')}
                                className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${filter === 'WAITLISTED' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Waitlist
                                {waitlistCount > 0 && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">{waitlistCount}</span>}
                            </button>
                            <button
                                onClick={() => setFilter('ACTIVE')}
                                className={`py-4 text-sm font-bold border-b-2 transition-colors ${filter === 'ACTIVE' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Active Members
                            </button>
                            <button
                                onClick={() => setFilter('ALL')}
                                className={`py-4 text-sm font-bold border-b-2 transition-colors ${filter === 'ALL' ? 'border-slate-500 text-slate-600 dark:text-slate-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                All
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {isLoading ? (
                                <div className="text-center py-10 opacity-50">Loading members...</div>
                            ) : filteredMembers.length === 0 ? (
                                <div className="text-center py-10 text-slate-500">No members found in this category.</div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredMembers.map(member => (
                                        <div key={member.id} className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                                                    {member.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        {member.name}
                                                        {member.role === 'ADMIN' && <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">ADMIN</span>}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{member.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {member.status === 'PENDING' || member.status === 'WAITLISTED' ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                            onClick={() => handleUpdateStatus(member.userId, 'ACTIVE')}
                                                        >
                                                            <Check className="w-4 h-4 mr-1" /> Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleUpdateStatus(member.userId, 'REJECTED')}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                ) : member.status === 'ACTIVE' && member.role !== 'ADMIN' ? (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={() => handleUpdateStatus(member.userId, 'REJECTED')}
                                                    >
                                                        Remove
                                                    </Button>
                                                ) : null}
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
