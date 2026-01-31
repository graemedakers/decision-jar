
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/Button";
import { Loader2, Play, Users, Clock, AlertTriangle, Check, Trophy, RefreshCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { showSuccess, showError, showInfo } from "@/lib/toast";

import { startVote, castVote, cancelVote, extendVote, resolveVote, getVoteStatus } from "@/app/actions/vote";
import { vetoIdea } from "@/app/actions/veto";

import { Idea } from "@/lib/types";
import { useModalSystem } from "@/components/ModalProvider";

interface VotingManagerProps {
    jarId: string;
    isAdmin: boolean;
    userId: string;
    onVoteComplete: (winnerId: string) => void;
    onAddIdea?: () => void;
    voteCandidatesCount?: number;
}

export function VotingManager({ jarId, isAdmin, userId, onVoteComplete, onAddIdea, voteCandidatesCount = 0 }: VotingManagerProps) {
    const { openModal } = useModalSystem();
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [voteIdeas, setVoteIdeas] = useState<Idea[]>([]);

    // Start Vote Modal State
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [timeLimit, setTimeLimit] = useState("60"); // 1 hour default
    // Default to RE_VOTE if a runoff/shortlist is configured (voteCandidatesCount > 0)
    const [tieBreaker, setTieBreaker] = useState(voteCandidatesCount > 0 ? "RE_VOTE" : "RANDOM_PICK");

    // Voting State
    const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const activeRef = useRef(false);

    const fetchStatus = async () => {
        try {
            const data = await getVoteStatus(jarId);

            // If we transition from an active vote to a completed one via polling/sync
            if (activeRef.current && !data.active && data.lastResult?.winner) {
                openModal('DATE_REVEAL', { idea: data.lastResult.winner, isViewOnly: true });
            }

            activeRef.current = !!data.active;
            setStatus(data);

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
                setVoteIdeas(Array.isArray(data) ? data : data.ideas || []);
            }
        } catch (e) {
            console.error("Failed to fetch ideas", e);
        }
    };

    useEffect(() => {
        fetchStatus();

        // Polling fallback
        const interval = setInterval(fetchStatus, 15000);

        // Real-time synchronization reflex
        const handleSync = () => {
            console.log("VotingManager: Syncing on global refresh-all event");
            fetchStatus();
        };
        window.addEventListener('decision-jar:refresh-all', handleSync);

        return () => {
            clearInterval(interval);
            window.removeEventListener('decision-jar:refresh-all', handleSync);
        };
    }, [jarId]);

    useEffect(() => {
        if (status?.active && !status?.hasVoted) {
            fetchIdeas();
        }
    }, [status?.active, status?.hasVoted]);


    const handleStartVote = async () => {
        setSubmitting(true);
        try {
            const res = await startVote(jarId, {
                tieBreakerMode: tieBreaker,
                timeLimitMinutes: parseInt(timeLimit)
            });

            if ('success' in res && res.success) {
                setIsStartModalOpen(false);
                if ('idea' in res && res.idea) {
                    showSuccess((res as any).note || "Vote resolved immediately!");
                    // Trigger reveal locally
                    openModal('DATE_REVEAL', { idea: res.idea });
                    // Broadcast winner to group
                    window.dispatchEvent(new CustomEvent('decision-jar:broadcast', {
                        detail: { jarId, event: 'spin-result', payload: { idea: res.idea } }
                    }));
                } else {
                    // Normal start
                    window.dispatchEvent(new CustomEvent('decision-jar:broadcast', {
                        detail: { jarId, event: 'content-update' }
                    }));
                }
                // Small delay to ensure database consistency and server-side cache revalidation
                setTimeout(() => {
                    fetchStatus();
                }, 500);
            } else {
                showError((res as any).error || "Failed to start vote");
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
            const res = await castVote(jarId, selectedIdeaId);

            if ('success' in res && res.success) {
                if ('idea' in res && res.idea) {
                    // Auto-resolve happened!
                    openModal('DATE_REVEAL', { idea: res.idea });
                    window.dispatchEvent(new CustomEvent('decision-jar:broadcast', {
                        detail: { jarId, event: 'spin-result', payload: { idea: res.idea } }
                    }));
                } else {
                    // Just a normal vote
                    window.dispatchEvent(new CustomEvent('decision-jar:broadcast', {
                        detail: { jarId, event: 'content-update' }
                    }));
                }
                fetchStatus();
            } else {
                showError((res as any).error || "Failed to cast vote");
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
            const data = await resolveVote(jarId);

            if ('success' in data && data.success && 'idea' in data) {
                const winnerIdea = (data as any).idea;
                onVoteComplete(winnerIdea.id);
                // Broadcast finale using spin-result so others get the reveal modal
                window.dispatchEvent(new CustomEvent('decision-jar:broadcast', {
                    detail: { jarId, event: 'spin-result', payload: { idea: winnerIdea } }
                }));
                openModal('DATE_REVEAL', { idea: winnerIdea });
                fetchStatus();
            } else if ('nextRound' in data) {
                showInfo("🔄 Tie! Round 2 started.");
                window.dispatchEvent(new CustomEvent('decision-jar:broadcast', {
                    detail: { jarId, event: 'content-update' }
                }));
                fetchStatus();
            } else {
                showInfo((data as any).message || ((data as any).error || "Resolved."));
                fetchStatus();
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelVote = async () => {
        if (!confirm("Are you sure you want to cancel the voting session?")) return;
        setSubmitting(true);
        try {
            await cancelVote(jarId);
            window.dispatchEvent(new CustomEvent('decision-jar:broadcast', {
                detail: { jarId, event: 'content-update' }
            }));
            fetchStatus();
            showInfo("Voting session cancelled");
        } finally {
            setSubmitting(false);
        }
    };

    const handleExtendVote = async () => {
        setSubmitting(true);
        try {
            await extendVote(jarId);
            window.dispatchEvent(new CustomEvent('decision-jar:broadcast', {
                detail: { jarId, event: 'content-update' }
            }));
            fetchStatus();
            showSuccess("Voting time extended by 1 hour");
        } finally {
            setSubmitting(false);
        }
    };

    const handleVeto = async (ideaId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Use a Veto Card to reject this idea? This cannot be undone.")) return;
        setSubmitting(true);
        try {
            const res = await vetoIdea(ideaId, jarId);
            if (res.success) {
                showSuccess("Veto card used! Idea rejected.");

                // Trigger presence toast
                try {
                    await fetch(`/api/jar/${jarId}/presence`, {
                        method: 'POST',
                        body: JSON.stringify({ activity: { type: 'vetoing' }, status: 'online' })
                    });
                } catch { }

                window.dispatchEvent(new CustomEvent('decision-jar:broadcast', {
                    detail: { jarId, event: 'content-update' }
                }));
                fetchStatus();
                fetchIdeas();
            } else {
                showError(res.error || "Failed to veto");
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
                            <DialogHeader onClose={() => setIsStartModalOpen(false)}>
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
                                        <option value="1">1 Minute (Flash Vote)</option>
                                        <option value="5">5 Minutes (Quick Vote)</option>
                                        <option value="15">15 Minutes</option>
                                        <option value="60">1 Hour</option>
                                        <option value="180">3 Hours</option>
                                        <option value="1440">24 Hours</option>
                                        <option value="2880">48 Hours</option>
                                        <option value="4320">3 Days</option>
                                        <option value="10080">1 Week</option>
                                        <option value="0">No Limit (Manual Resolve)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tie Breaker</Label>
                                    <select
                                        value={tieBreaker}
                                        onChange={(e) => setTieBreaker(e.target.value)}
                                        className="w-full p-2 border rounded-md dark:bg-slate-800"
                                    >
                                        <option value="RANDOM_PICK">System Resolve (Computer picks winner)</option>
                                        <option value="RE_VOTE">Group Resolve (Run-off voting round)</option>
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
    const session = status?.session;

    // User hasn't voted yet
    if (!status.hasVoted) {
        if (status.isEligible === false) {
            return (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-4 shadow-lg animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">You're on the Sidelines!</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                            Every idea in this round was suggested by you! You'll have to wait for the other members to make the final choice.
                        </p>
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-center gap-2 text-slate-400 group">
                            <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                            <span className="text-xs font-bold uppercase tracking-widest">Waiting for others...</span>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 max-w-sm mx-auto w-full">
                            <div className="flex justify-between text-[10px] mb-2 font-black text-slate-400 uppercase tracking-widest">
                                <span>Progress</span>
                                <span>{status.votesCast} / {status.totalMembers} Voted</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500 transition-all duration-1000"
                                    style={{ width: `${(status.votesCast / (status.totalMembers || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-500" />
                        Cast Your Vote
                    </h3>
                    <div className="flex flex-col items-end gap-1">
                        <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            Round {session?.round || 1}
                        </div>
                        {session?.endTime && (
                            <div className="text-[10px] items-center flex gap-1 text-slate-500 font-medium">
                                <Clock className="w-3 h-3" />
                                Ends {new Date(session.endTime).toLocaleDateString()} {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Veto Status Header */}
                <div className="flex items-center justify-between px-2 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span>Veto Cards: {status.vetoCardsRemaining ?? 0}</span>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
                    {voteIdeas?.filter(i => !session?.eligibleIdeaIds || session.eligibleIdeaIds.length === 0 || session.eligibleIdeaIds.includes(i.id)).map(idea => {
                        const isOwnIdea = idea.createdById === userId;
                        const isSelected = selectedIdeaId === idea.id;

                        return (
                            <div
                                key={idea.id}
                                onClick={() => !isOwnIdea && setSelectedIdeaId(idea.id)}
                                className={`p-4 rounded-lg border transition-all relative ${isOwnIdea
                                    ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-900 border-slate-200'
                                    : isSelected
                                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 ring-1 ring-purple-500 cursor-pointer'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300 cursor-pointer'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 pr-2">
                                        <div className={`font-medium ${isOwnIdea ? 'text-slate-500' : ''}`}>{idea.description}</div>
                                        <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">{idea.category}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {isOwnIdea && (
                                            <span className="text-[10px] bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground/80 px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-primary/20">
                                                Your Idea
                                            </span>
                                        )}
                                        {/* Veto Button */}
                                        {!isOwnIdea && status.vetoCardsRemaining > 0 && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 px-2 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                onClick={(e) => handleVeto(idea.id, e)}
                                                disabled={submitting}
                                                title="Veto this idea"
                                            >
                                                Veto
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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
                {session?.endTime && (
                    <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" />
                        Resolution scheduled for {new Date(session.endTime).toLocaleString()}
                    </p>
                )}
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
                        <Button variant="destructive" size="sm" onClick={handleCancelVote} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExtendVote} disabled={submitting}>
                            <Clock className="w-4 h-4 mr-2" />
                            +1h
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleResolve} disabled={submitting}>
                            <Trophy className="w-4 h-4 mr-2" />
                            Resolve
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
