"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Smartphone } from "lucide-react";
import { Button } from "./ui/Button";

interface PremiumWelcomeTipProps {
    show: boolean;
    onClose: () => void;
}

export function PremiumWelcomeTip({ show, onClose }: PremiumWelcomeTipProps) {
    const handleDismiss = () => {
        // Store that they've seen this tip
        localStorage.setItem('premium_shortcuts_tip_seen', 'true');
        onClose();
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md mx-4"
                >
                    <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/30 shadow-2xl shadow-primary/20">
                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                                <Smartphone className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-primary" />
                                    Premium Feature Unlocked!
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                                    <strong>Long-press the app icon</strong> on your phone to instantly access:
                                </p>
                                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 mb-4">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                        Find Restaurant
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                        Find Bar
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                        Weekend Planner
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                        Movie Scout
                                    </li>
                                </ul>
                                <Button
                                    onClick={handleDismiss}
                                    className="w-full bg-gradient-to-r from-primary to-accent text-white border-none"
                                    size="sm"
                                >
                                    Got it!
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
