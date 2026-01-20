
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Gift, ExternalLink, RefreshCw, Trash2, CheckCircle, Clock } from "lucide-react";
import { useModalSystem } from "./ModalProvider";
import { toast } from "sonner";
import { format } from "date-fns";

export function GiftManagerModal() {
    const { closeModal } = useModalSystem();
    const [activeTab, setActiveTab] = useState("sent");
    const [gifts, setGifts] = useState<{ sent: any[], received: any[] }>({ sent: [], received: [] });
    const [isLoading, setIsLoading] = useState(true);

    const fetchGifts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/user/gifts');
            if (res.ok) {
                const data = await res.json();
                setGifts(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGifts();
    }, []);

    const handleDeactivate = async (token: string) => {
        if (!confirm("Are you sure you want to delete this gift link?")) return;
        try {
            const res = await fetch(`/api/gift/${token}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Gift link deactivated");
                fetchGifts();
            }
        } catch (err) {
            toast.error("Failed to deactivate gift");
        }
    };

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied!");
    };

    return (
        <Dialog open={true} onOpenChange={() => closeModal()}>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-primary" /> My Gifts
                    </DialogTitle>
                    <DialogDescription>
                        Manage jars you've sent and received.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                    <div className="px-6 border-b border-slate-100 dark:border-white/5">
                        <TabsList className="bg-transparent p-0 gap-4">
                            <TabsTrigger
                                value="sent"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-2"
                            >
                                Gifts Sent ({gifts.sent.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="received"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-2"
                            >
                                Gifts Received ({gifts.received.length})
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-slate-50/50 dark:bg-slate-900/50">
                        {isLoading ? (
                            <div className="flex justify-center p-8"><RefreshCw className="animate-spin text-muted-foreground" /></div>
                        ) : (
                            <>
                                <TabsContent value="sent" className="mt-0 space-y-4">
                                    {gifts.sent.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <Gift className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>You haven't sent any gifts yet.</p>
                                        </div>
                                    ) : (
                                        gifts.sent.map((gift) => (
                                            <div key={gift.token} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-sm">{gift.jarName}</h3>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${gift.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {gift.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground space-y-1">
                                                        <p>Created: {format(new Date(gift.createdAt), 'MMM d, yyyy')}</p>
                                                        <p className="flex items-center gap-1.5">
                                                            {gift.acceptCount > 0 ? (
                                                                <><CheckCircle className="w-3 h-3 text-green-500" /> Accepted by {activeTab === 'sent' && gift.lastAcceptedBy ? gift.lastAcceptedBy : `${gift.acceptCount} people`}</>
                                                            ) : (
                                                                <><Clock className="w-3 h-3" /> Waiting for recipient</>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 w-full md:w-auto">
                                                    {gift.status === 'active' && (
                                                        <Button size="sm" variant="outline" onClick={() => handleCopy(gift.url)}>
                                                            Copy Link
                                                        </Button>
                                                    )}
                                                    <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDeactivate(gift.token)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </TabsContent>

                                <TabsContent value="received" className="mt-0 space-y-4">
                                    {gifts.received.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <Gift className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>No gifts received yet.</p>
                                        </div>
                                    ) : (
                                        gifts.received.map((jar: any) => (
                                            <div key={jar.jarId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex gap-4 items-start shadow-sm">
                                                <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-primary">
                                                    <Gift className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm text-primary">{jar.jarName}</h3>
                                                    <p className="text-xs text-muted-foreground mb-2">
                                                        Gifted by <span className="text-foreground font-medium">{jar.from}</span> • {format(new Date(jar.receivedAt), 'MMM d, yyyy')}
                                                    </p>
                                                    {jar.message && (
                                                        <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded text-xs italic text-slate-600 dark:text-slate-300 border-l-2 border-primary/30">
                                                            "{jar.message}"
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </TabsContent>
                            </>
                        )}
                    </div>
                </Tabs>
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-end">
                    <Button variant="ghost" onClick={() => closeModal()}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
