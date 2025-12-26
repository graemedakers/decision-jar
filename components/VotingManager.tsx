
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button";
import { Loader2, Play, Users, Clock, AlertTriangle, Check, Trophy, RefreshCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";

interface Idea {
    id: string;
    description: string;
    category: string;
    createdAt: string;
}

interface VotingManagerProps {
    jarId: string;
    isAdmin: boolean;
    userId: string;
    onVoteComplete: (winnerId: string) => void;
    onAddIdea?: () => void;
}

export function VotingManager({ jarId, isAdmin, userId, onVoteComplete, onAddIdea }: VotingManagerProps) {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [voteIdeas, setVoteIdeas] = useState<Idea[]>([]);

    // Start Vote Modal State
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [timeLimit, setTimeLimit] = useState("1440"); // 24 hours default
    const [tieBreaker, setTieBreaker] = useState("RANDOM_PICK");

    // Voting State
    const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`/api/jar/${jarId}/vote`);
            if (res.ok) {
                const data = await res.json();
                setStatus(data);
            }
        } catch (e) {
            console.error("Failed to fetch vote status", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchIdeas = async () => {
        try {
            const res = await fetch(`/api/ideas?jarId=${jarId}`);
            if (res.ok) {
                const data = await res.json();
                setVoteIdeas(data.ideas);
            }
        } catch (e) {
            console.error("Failed to fetch ideas", e);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [jarId]);

    useEffect(() => {
        if (status?.active && !status?.hasVoted) {
            fetchIdeas();
        }
    }, [status?.active, status?.hasVoted]);


    const handleStartVote = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/jar/${jarId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'START',
                    timeLimitMinutes: parseInt(timeLimit),
                    tieBreakerMode: tieBreaker
                })
            });
            if (res.ok) {
                setIsStartModalOpen(false);
                fetchStatus();
            } else {
                alert("Failed to start vote");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCastVote = async () => {
        if (!selectedIdeaId) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/jar/${jarId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'CAST',
                    ideaId: selectedIdeaId
                })
            });
            if (res.ok) {
                fetchStatus();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to cast vote");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleResolve = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/jar/${jarId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'RESOLVE' })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.winnerId) {
                    onVoteComplete(data.winnerId);
                    window.location.reload(); // Refresh to see selected idea
                } else if (data.nextRound) {
                    alert("Tie! Round 2 started.");
                    fetchStatus();
                } else {
                    alert(data.message || "Resolved.");
                    fetchStatus();
                }
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /> Loading Voting System...</div>;

    // SCENARIO 1: No Active Vote
    if (!status?.active) {
        if (isAdmin) {
            return (
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Start a Group Vote</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Let everyone choose their favorite idea.</p>
                    </div>
                    <Button onClick={() => setIsStartModalOpen(true)} className="w-full max-w-xs">
                        Start Voting Session
                    </Button>

                    <Dialog open={isStartModalOpen} onOpenChange={setIsStartModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Start Vote</DialogTitle>
                                <DialogDescription>Configure the voting session.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Time Limit (Minutes)</Label>
                                    <select
                                        value={timeLimit}
                                        onChange={(e) => setTimeLimit(e.target.value)}
                                        className="w-full p-2 border rounded-md dark:bg-slate-800"
                                    >
                                        <option value="60">1 Hour</option>
                                        <option value="180">3 Hours</option>
                                        <option value="1440">24 Hours</option>
                                        <option value="2880">48 Hours</option>
                                        <option value="0">No Limit</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tie Breaker</Label>
                                    <select
                                        value={tieBreaker}
                                        onChange={(e) => setTieBreaker(e.target.value)}
                                        className="w-full p-2 border rounded-md dark:bg-slate-800"
                                    >
                                        <option value="RANDOM_PICK">Random Pick (System decides)</option>
                                        <option value="RE_VOTE">Run-off Vote (Vote again)</option>
                                    </select>
                                </div>
                            </div>
                            <Button onClick={handleStartVote} disabled={submitting} className="w-full">
                                {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Start Vote"}
                            </Button>
                        </DialogContent>
                    </Dialog>
                </div>
            );
        } else {
            return (
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 space-y-4">
                    <Clock className="w-10 h-10 mx-auto opacity-50" />
                    <div className="space-y-1">
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                            Waiting for <span className="font-bold text-slate-900 dark:text-white">{status?.adminName || 'the admin'}</span> to start a vote...
                        </p>
                        <p className="text-sm">
                            Meanwhile, you can <button onClick={() => onAddIdea?.() || document.getElementById('add-idea-trigger')?.click()} className="text-purple-600 hover:text-purple-700 underline font-medium">add your ideas</button> to the jar using the tools below.
                        </p>
                    </div>
                </div>
            );
        }
    }

    // SCENARIO 2: Active Vote exist
    const session = status.session;

    // User hasn't voted yet
    if (!status.hasVoted) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-500" />
                        Cast Your Vote
                    </h3>
                    <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        Round {session.round}
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
                    {voteIdeas.filter(i => !session.eligibleIdeaIds || session.eligibleIdeaIds.length === 0 || session.eligibleIdeaIds.includes(i.id)).map(idea => (
                        <div
                            key={idea.id}
                            onClick={() => setSelectedIdeaId(idea.id)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedIdeaId === idea.id
                                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 ring-1 ring-purple-500'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                                }`}
                        >
                            <div className="font-medium">{idea.description}</div>
                            <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{idea.category}</div>
                        </div>
                    ))}
                    {voteIdeas.length === 0 && <div className="text-center py-8 text-slate-500">Loading options...</div>}
                </div>

                <Button
                    className="w-full h-12 text-lg"
                    disabled={!selectedIdeaId || submitting}
                    onClick={handleCastVote}
                >
                    {submitting ? <Loader2 className="animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                    Submit Vote
                </Button>
            </div>
        );
    }

    // User HAS voted (Waiting screen)
    return (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <div>
                <h3 className="text-xl font-bold">Vote Submitted!</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Waiting for others to finish...</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 max-w-sm mx-auto">
                <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span className="font-mono">{status.votesCast} / {status.totalMembers} Voted</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${(status.votesCast / status.totalMembers) * 100}%` }}
                    />
                </div>
            </div>

            {isAdmin && status.pendingVoters && status.pendingVoters.length > 0 && (
                <div className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md text-yellow-800 dark:text-yellow-200">
                    <strong>Pending:</strong> {status.pendingVoters.map((p: any) => p.name).join(', ')}
                </div>
            )}

            {isAdmin && (
                <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Admin Controls</p>
                    <div className="flex gap-2 justify-center flex-wrap">
                        <Button variant="destructive" size="sm" onClick={async () => {
                            await fetch(`/api/jar/${jarId}/vote`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'CANCEL' })
                            });
                            fetchStatus();
                        }}>Cancel</Button>
                        <Button variant="outline" size="sm" onClick={async () => {
                            await fetch(`/api/jar/${jarId}/vote`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'EXTEND' })
                            });
                            fetchStatus();
                        }}>
                            <Clock className="w-4 h-4 mr-2" />
                            +1h
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleResolve}>
                            <Trophy className="w-4 h-4 mr-2" />
                            Resolve
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
