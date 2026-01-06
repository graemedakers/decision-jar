"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Check, XCircle, Clock, Search, Shield, Settings, Image, Hash, List } from "lucide-react";
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
    const [activeTab, setActiveTab] = useState<'MEMBERS' | 'SETTINGS'>('MEMBERS');

    // Settings state
    const [jarSettings, setJarSettings] = useState({
        name: '',
        description: '',
        imageUrl: '',
        topic: '',
        memberLimit: null as number | null,
        selectionMode: 'RANDOM' as 'RANDOM' | 'VOTING' | 'ADMIN_PICK'
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
            fetchJarSettings();
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

    const handleUpdateRole = async (userId: string, role: 'ADMIN') => {
        if (!confirm("Promote this member to Admin? They will have full control over the jar.")) return;

        try {
            const res = await fetch(`/api/jars/${jarId}/members/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role })
            });

            if (res.ok) {
                setMembers(prev => prev.map(m => m.userId === userId ? { ...m, role: 'ADMIN' } : m));
            } else {
                const data = await res.json();
                alert(data.error || "Action failed");
            }
        } catch (e) {
            console.error(e);
            alert("Error updating role");
        }
    };

    const fetchJarSettings = async () => {
        try {
            const res = await fetch(`/api/jars/${jarId}/public-details`);
            if (res.ok) {
                const jar = await res.json();
                setJarSettings({
                    name: jar.name || '',
                    description: jar.description || '',
                    imageUrl: jar.imageUrl || '',
                    topic: jar.topic || 'General',
                    memberLimit: jar.memberLimit,
                    selectionMode: jar.selectionMode || 'RANDOM'
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/jars/${jarId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jarSettings)
            });

            if (res.ok) {
                alert('✅ Settings saved successfully!');
                onClose();
                window.location.reload(); // Refresh to show new settings
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to save settings');
            }
        } catch (e) {
            console.error(e);
            alert('Error saving settings');
        } finally {
            setIsSaving(false);
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

                        {/* Main Tabs */}
                        <div className="flex border-b border-slate-200 dark:border-white/10 px-6 gap-6">
                            <button
                                onClick={() => setActiveTab('MEMBERS')}
                                className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'MEMBERS' ? 'border-violet-500 text-violet-600 dark:text-violet-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                <Users className="w-4 h-4" />
                                Members
                            </button>
                            <button
                                onClick={() => setActiveTab('SETTINGS')}
                                className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'SETTINGS' ? 'border-violet-500 text-violet-600 dark:text-violet-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </button>
                        </div>

                        {/* Sub-tabs for Members */}
                        {activeTab === 'MEMBERS' && (
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
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'SETTINGS' ? (
                                <div className="max-w-2xl mx-auto space-y-6">
                                    {/* Jar Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <Hash className="w-4 h-4" />
                                            Jar Name
                                        </label>
                                        <input
                                            type="text"
                                            value={jarSettings.name}
                                            onChange={(e) => setJarSettings(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                                            placeholder="My Awesome Community"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <List className="w-4 h-4" />
                                            Description
                                        </label>
                                        <textarea
                                            value={jarSettings.description}
                                            onChange={(e) => setJarSettings(prev => ({ ...prev, description: e.target.value }))}
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                                            placeholder="Tell people what this community is all about..."
                                        />
                                    </div>

                                    {/* Cover Image */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <Image className="w-4 h-4" />
                                            Cover Image URL
                                        </label>
                                        <input
                                            type="url"
                                            value={jarSettings.imageUrl}
                                            onChange={(e) => setJarSettings(prev => ({ ...prev, imageUrl: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        {jarSettings.imageUrl && (
                                            <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                                                <img
                                                    src={jarSettings.imageUrl}
                                                    alt="Preview"
                                                    className="w-full h-48 object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Topic */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Topic</label>
                                        <select
                                            value={jarSettings.topic}
                                            onChange={(e) => setJarSettings(prev => ({ ...prev, topic: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none cursor-pointer"
                                        >
                                            <option value="General">General</option>
                                            <option value="Activities">Activities</option>
                                            <option value="Romantic">Romantic</option>
                                            <option value="Restaurants">Restaurants</option>
                                            <option value="Bars">Bars</option>
                                            <option value="Nightclubs">Nightclubs</option>
                                            <option value="Movies">Movies</option>
                                            <option value="Wellness">Wellness</option>
                                            <option value="Fitness">Fitness</option>
                                            <option value="Travel">Travel</option>
                                            <option value="Hotel Stays">Hotel Stays</option>
                                            <option value="Cooking & Recipes">Cooking & Recipes</option>
                                            <option value="Books">Books</option>
                                            <option value="System Development">System Development</option>
                                            <option value="Custom">Custom</option>
                                        </select>
                                    </div>

                                    {/* Selection Mode */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Selection Mode</label>
                                        <select
                                            value={jarSettings.selectionMode}
                                            onChange={(e) => setJarSettings(prev => ({ ...prev, selectionMode: e.target.value as any }))}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none cursor-pointer"
                                        >
                                            <option value="RANDOM">Random Pick</option>
                                            <option value="VOTING">Community Voting</option>
                                            <option value="ADMIN_PICK">Admin Decides</option>
                                        </select>
                                        <p className="text-xs text-slate-500">
                                            {jarSettings.selectionMode === 'RANDOM' && 'Ideas are randomly selected when spinning the jar'}
                                            {jarSettings.selectionMode === 'VOTING' && 'Members vote on ideas, highest votes win'}
                                            {jarSettings.selectionMode === 'ADMIN_PICK' && 'Only admins can select which idea to use'}
                                        </p>
                                    </div>

                                    {/* Member Limit */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Member Limit</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                value={jarSettings.memberLimit || ''}
                                                onChange={(e) => setJarSettings(prev => ({
                                                    ...prev,
                                                    memberLimit: e.target.value ? parseInt(e.target.value) : null
                                                }))}
                                                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                                                placeholder="Unlimited"
                                                min="1"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setJarSettings(prev => ({ ...prev, memberLimit: null }))}
                                            >
                                                Clear
                                            </Button>
                                        </div>
                                        <p className="text-xs text-slate-500">Leave empty for unlimited members</p>
                                    </div>

                                    {/* Save Button */}
                                    <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                                        <Button
                                            onClick={handleSaveSettings}
                                            disabled={isSaving}
                                            className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                isLoading ? (
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
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 mr-1"
                                                                onClick={() => handleUpdateRole(member.userId, 'ADMIN')}
                                                                title="Promote to Admin"
                                                            >
                                                                <Shield className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-red-500 hover:text-red-700"
                                                                onClick={() => handleUpdateStatus(member.userId, 'REJECTED')}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </>
                                                    ) : null}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    </motion.div>
                </div >
            )
            }
        </AnimatePresence >
    );

}
