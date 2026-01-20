"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Gift, Copy, ExternalLink, Loader2, ArrowRight, Heart } from "lucide-react";
import { format } from "date-fns";
import { useModalSystem } from "./ModalProvider";

interface GiftData {
    sent: Array<{
        token: string;
        jarName: string;
        createdAt: string;
        acceptCount: number;
        status: string;
        lastAcceptedBy?: string;
        url: string;
    }>;
    received: Array<{
        jarId: string;
        jarName: string;
        receivedAt: string;
        from: string;
        message?: string;
        senderImage?: string;
    }>;
    stats: {
        sentCount: number;
        receivedCount: number;
        monthlySent: number;
        monthlyLimit: number;
        canSendMore: boolean;
    };
}

export function MyGiftsModal() {
    const { activeModal, closeModal, openModal } = useModalSystem();
    const isOpen = activeModal === 'MY_GIFTS';
    const [data, setData] = useState<GiftData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchGifts();
        }
    }, [isOpen]);

    const fetchGifts = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/user/gifts');
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const copyLink = (url: string) => {
        navigator.clipboard.writeText(url);
        // Could show toast here
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={closeModal}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
                <div className="p-6 pb-2 shrink-0">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl font-black">
                            <Gift className="w-6 h-6 text-indigo-500" />
                            My Gifts
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <Tabs defaultValue="sent" className="flex-1 flex flex-col">
                        <div className="px-6 border-b border-slate-100 dark:border-white/5 shrink-0">
                            <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-6">
                                <TabsTrigger
                                    value="sent"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent px-0 py-3 font-semibold"
                                >
                                    Sent Gifts {data?.stats ? `(${data.stats.sentCount})` : ''}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="received"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent px-0 py-3 font-semibold"
                                >
                                    Received {data?.stats ? `(${data.stats.receivedCount})` : ''}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-black/20">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-40">
                                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                </div>
                            ) : (
                                <>
                                    <TabsContent value="sent" className="mt-0 space-y-4">
                                        {/* Stats Card */}
                                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg mb-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold flex items-center gap-2">
                                                    <Gift className="w-4 h-4" />
                                                    Monthly Limit
                                                </h4>
                                                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                                                    Resets on 1st
                                                </span>
                                            </div>
                                            <div className="flex items-end gap-2 mb-1">
                                                <span className="text-3xl font-black">{data?.stats?.monthlySent ?? 0}</span>
                                                <span className="text-lg opacity-80 mb-1">/ {(data?.stats?.monthlyLimit ?? 0) >= 9999 ? '∞' : (data?.stats?.monthlyLimit ?? 2)} sent</span>
                                            </div>
                                            {(data?.stats?.monthlyLimit ?? 0) < 9999 && (
                                                <div className="w-full bg-black/20 rounded-full h-1.5 mt-2">
                                                    <div
                                                        className="bg-white rounded-full h-1.5 transition-all"
                                                        style={{ width: `${Math.min(100, ((data?.stats?.monthlySent || 0) / (data?.stats?.monthlyLimit || 2)) * 100)}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {(!data?.sent || data.sent.length === 0) ? (
                                            <div className="text-center py-10 text-slate-500">
                                                <p>You haven't sent any gifts yet.</p>
                                                <Button
                                                    onClick={() => openModal('GIFT_JAR')}
                                                    className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full"
                                                >
                                                    Gift your first jar
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {data.sent.map((gift) => (
                                                    <div key={gift.token} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-4 shadow-sm">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div>
                                                                <h4 className="font-bold text-slate-900 dark:text-white">{gift.jarName}</h4>
                                                                <p className="text-xs text-slate-500">Created {format(new Date(gift.createdAt), 'MMM d, yyyy')}</p>
                                                            </div>
                                                            <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${gift.acceptCount > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                }`}>
                                                                {gift.acceptCount > 0 ? 'Accepted' : 'Pending'}
                                                            </div>
                                                        </div>

                                                        {gift.lastAcceptedBy && (
                                                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                                                                <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                                                                Accepted by <strong>{gift.lastAcceptedBy}</strong>
                                                            </p>
                                                        )}

                                                        <div className="flex gap-2">
                                                            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => copyLink(gift.url)}>
                                                                <Copy className="w-3 h-3 mr-2" />
                                                                Copy Link
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => window.open(gift.url, '_blank')}>
                                                                <ExternalLink className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="received" className="mt-0 space-y-4">
                                        {(!data?.received || data.received.length === 0) ? (
                                            <div className="text-center py-10 text-slate-500">
                                                <Gift className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                <p>No received gifts yet.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {data.received.map((gift) => (
                                                    <div key={gift.jarId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 font-bold text-indigo-600 dark:text-indigo-400 text-lg">
                                                                {gift.from.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{gift.jarName}</h4>
                                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                                                    From <strong>{gift.from}</strong>
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {gift.message && (
                                                            <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-300 italic">
                                                                "{gift.message}"
                                                            </div>
                                                        )}

                                                        <Button
                                                            className="w-full mt-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                                                            onClick={() => {
                                                                // Switch to this jar
                                                                // Implementation depends on how we handle switching
                                                                // For now just close modal, user can find it in switcher
                                                                closeModal();
                                                                window.location.href = `/jar?id=${gift.jarId}`;
                                                            }}
                                                        >
                                                            Open Jar
                                                            <ArrowRight className="w-4 h-4 ml-2" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>
                                </>
                            )}
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
} 
