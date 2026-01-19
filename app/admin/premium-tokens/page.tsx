"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Copy, Plus, X, Trash2, Power, PowerOff, ShieldCheck, Check, Loader2 } from "lucide-react";

interface PremiumToken {
    id: string;
    token: string;
    isActive: boolean;
    maxUses: number;
    currentUses: number;
    expiresAt: string;
    createdAt: string;
    notes?: string;
    createdBy: { name: string | null; email: string | null };
    usedBy: { name: string | null; email: string | null };
}

export default function PremiumTokensPage() {
    const [tokens, setTokens] = useState<PremiumToken[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newNotes, setNewNotes] = useState("");
    const [newMaxUses, setNewMaxUses] = useState("10");
    const [newDaysValid, setNewDaysValid] = useState("30");
    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    // Fetch Tokens
    useEffect(() => {
        fetchTokens();
    }, []);

    const fetchTokens = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/premium-tokens');
            if (res.ok) {
                const data = await res.json();
                setTokens(data);
            } else if (res.status === 403 || res.status === 401) {
                // Handle unauthorized (redirect or show error)
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    // Create Token
    const handleCreate = async () => {
        try {
            const res = await fetch('/api/admin/premium-tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    maxUses: parseInt(newMaxUses),
                    daysValid: parseInt(newDaysValid),
                    notes: newNotes
                })
            });
            if (res.ok) {
                setShowCreateModal(false);
                fetchTokens();
                setNewNotes("");
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Toggle Active
    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/premium-tokens/${id}`, {
                method: 'PATCH', // or DELETE for deactivate
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) {
                fetchTokens(); // Refresh list
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleCopy = (token: string) => {
        const url = `${window.location.origin}/join?premium=${token}`;
        navigator.clipboard.writeText(url);
        setCopiedToken(token);
        setTimeout(() => setCopiedToken(null), 2000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 md:px-8 pb-4 md:pb-8 pt-24 md:pt-32">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                            <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">Premium Tokens</h1>
                        </div>
                        <p className="text-slate-500 max-w-lg">
                            Create and manage access codes for gifting premium status to users.
                            Share the link to automatically grant premium upon signup or join.
                        </p>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)} className="gap-2 shrink-0">
                        <Plus className="w-4 h-4" /> Create New Token
                    </Button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[800px]">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-100 dark:border-white/5">
                            <tr>
                                <th className="p-4">Status</th>
                                <th className="p-4">Notes</th>
                                <th className="p-4">Usage</th>
                                <th className="p-4">Expires</th>
                                <th className="p-4">Created By</th>
                                <th className="p-4">Token Link</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                            {tokens.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-400">
                                        No tokens found. Create one to get started.
                                    </td>
                                </tr>
                            ) : tokens.map(token => (
                                <tr key={token.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        {token.isActive ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 font-medium">{token.notes || '-'}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1">
                                            <span className={token.currentUses >= token.maxUses ? "text-red-500 font-bold" : ""}>
                                                {token.currentUses}
                                            </span>
                                            <span className="text-slate-400">/</span>
                                            <span>{token.maxUses}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-500">
                                        {new Date(token.expiresAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-slate-500">
                                        {token.createdBy?.name || 'Unknown'}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleCopy(token.token)}
                                            className="flex items-center gap-2 text-primary hover:underline font-mono text-xs bg-primary/5 px-2 py-1 rounded border border-primary/10"
                                        >
                                            {copiedToken === token.token ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {token.token.substring(0, 8)}...
                                        </button>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleToggleActive(token.id, token.isActive)}
                                            className={token.isActive ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-green-500 hover:text-green-600 hover:bg-green-50"}
                                            title={token.isActive ? "Deactivate" : "Activate"}
                                        >
                                            {token.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-white/10 scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Create Token</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Max Uses</label>
                                <Input
                                    type="number"
                                    value={newMaxUses}
                                    onChange={(e) => setNewMaxUses(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Expiration (Days)</label>
                                <Input
                                    type="number"
                                    value={newDaysValid}
                                    onChange={(e) => setNewDaysValid(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Notes</label>
                                <Input
                                    value={newNotes}
                                    onChange={(e) => setNewNotes(e.target.value)}
                                    placeholder="e.g. For friends"
                                />
                            </div>

                            <div className="pt-2">
                                <Button className="w-full h-11" onClick={handleCreate}>
                                    Generate Token
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
