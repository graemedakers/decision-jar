"use client";

import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, History } from "lucide-react";
import { useState, useEffect } from "react";

interface DeleteLogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DeleteLogModal({ isOpen, onClose }: DeleteLogModalProps) {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            fetch('/api/logs')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setLogs(data);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card w-full max-w-lg relative max-h-[80vh] flex flex-col"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <History className="w-6 h-6 text-slate-400" />
                                Deletion History
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">
                                See who deleted what and when.
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {isLoading ? (
                                <div className="text-center text-slate-400 py-8">Loading...</div>
                            ) : logs.length === 0 ? (
                                <div className="text-center text-slate-400 py-8">
                                    <Trash2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No deletion history found.</p>
                                </div>
                            ) : (
                                logs.map((log) => (
                                    <div key={log.id} className="glass p-4 rounded-xl flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-white font-medium">{log.description}</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Deleted by <span className="text-primary">{log.deletedBy}</span>
                                            </p>
                                        </div>
                                        <div className="text-xs text-slate-500 whitespace-nowrap">
                                            {new Date(log.deletedAt).toLocaleDateString()}
                                            <br />
                                            {new Date(log.deletedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 border-t border-white/10">
                            <Button onClick={onClose} className="w-full" variant="secondary">
                                Close
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
