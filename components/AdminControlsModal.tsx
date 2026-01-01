"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { Users, Shuffle, CheckCircle, AlertTriangle } from "lucide-react";
import { getApiUrl } from "@/lib/utils";

interface AdminControlsModalProps {
    isOpen: boolean;
    onClose: () => void;
    jarId: string;
    onAllocated: () => void;
}

export function AdminControlsModal({ isOpen, onClose, jarId, onAllocated }: AdminControlsModalProps) {
    const [amount, setAmount] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleAllocate = async () => {
        setIsLoading(true);
        setResult(null);

        try {
            const res = await fetch(getApiUrl(`/api/jars/${jarId}/allocate`), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amountPerUser: Number(amount) }),
            });

            const data = await res.json();

            if (res.ok) {
                setResult({ success: true, message: `Successfully distributed ${data.allocated} tasks!` });
                setTimeout(() => {
                    onAllocated();
                    onClose();
                    setResult(null);
                }, 2000);
            } else {
                setResult({ success: false, message: data.error || "Allocation failed." });
            }
        } catch (error) {
            setResult({ success: false, message: "Network error occurred." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-full bg-slate-900 border border-slate-800 text-white p-0 overflow-hidden">
                <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 p-6 border-b border-white/10">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                            <Users className="w-5 h-5 text-indigo-400" />
                            Admin Controls
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <Shuffle className="w-4 h-4 text-emerald-400" />
                            Task Allocation
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Randomly distribute tasks from the jar to all active members.
                            Each member will receive the specified number of unique tasks.
                        </p>

                        <div className="flex items-end gap-3">
                            <div className="flex-1 space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Tasks per Member</label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={amount}
                                    onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
                                    className="bg-slate-900 border-slate-700 text-white"
                                />
                            </div>
                            <Button
                                onClick={handleAllocate}
                                disabled={isLoading}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 px-6"
                            >
                                {isLoading ? "Distributing..." : "Distribute"}
                            </Button>
                        </div>

                        {result && (
                            <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${result.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                                {result.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                {result.message}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
