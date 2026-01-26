"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartInputEducationTipProps {
    onDismiss?: () => void;
    onTryExample?: (text: string) => void;
    className?: string;
}

export function SmartInputEducationTip({ onDismiss, onTryExample, className }: SmartInputEducationTipProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already seen/dismissed this tip
        // We use a specific key so we can reset it if we update the education later
        const hasSeen = localStorage.getItem("smart_input_education_dismissed_v1");
        if (!hasSeen) {
            // Small delay to not overwhelm immediately on load
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsVisible(false);
        localStorage.setItem("smart_input_education_dismissed_v1", "true");
        if (onDismiss) onDismiss();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.4, type: "spring" }}
                    className={cn("absolute -top-[140px] sm:-top-32 left-0 right-0 mx-auto w-[95%] sm:w-full max-w-sm z-50 pointer-events-none", className)}
                >
                    <div className="relative bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-sm text-white p-4 rounded-2xl shadow-xl border border-purple-500/30 pointer-events-auto">

                        {/* Downward pointing arrow */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900/95 dark:bg-slate-800/95 rotate-45 border-r border-b border-purple-500/30"></div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-xl shrink-0 border border-purple-500/20">
                                <Sparkles className="w-5 h-5 text-purple-300" />
                            </div>

                            <div className="flex-1 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-white">Power up your Jar! ⚡</h4>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Did you know? You can ask AI to generate lists for you. Try typing:
                                </p>
                                <button
                                    onClick={(e) => {
                                        if (onTryExample) onTryExample("Suggest 5 fun date nights under $50");
                                        handleDismiss(e);
                                    }}
                                    className="block w-full text-left mt-1.5 p-2 bg-white/5 hover:bg-white/10 transition-colors rounded-lg text-xs text-purple-200 italic border border-white/10"
                                >
                                    "Suggest 5 fun date nights under $50..."
                                </button>
                            </div>

                            <button
                                onClick={handleDismiss}
                                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                                aria-label="Dismiss tip"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
