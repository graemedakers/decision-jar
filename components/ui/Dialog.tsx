"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    {/* Content Container (for positioning) */}
                    <div className="relative z-50 w-full sm:max-w-lg">
                        {children}
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
    // Detect mobile for animation (simplified, or just use a generic 'up' motion)
    // Using a safe generic motion that works for both modes
    return (
        <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
                "relative w-full overflow-hidden border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl",
                "rounded-t-3xl rounded-b-none sm:rounded-2xl border-b-0 sm:border-b", // Sheet styling on mobile
                "p-6 pb-8 sm:pb-6", // Extra padding at bottom for mobile safe area/home bar
                className
            )}
        >
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-700/50 mb-6 sm:hidden" /> {/* Drag handle for mobile */}
            {children}
        </motion.div>
    );
}

export function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}>
            {children}
        </div>
    );
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <h2 className={cn("text-lg font-semibold leading-none tracking-tight text-white", className)}>
            {children}
        </h2>
    );
}

export function DialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <p className={cn("text-sm text-slate-400", className)}>
            {children}
        </p>
    );
}

export function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>
            {children}
        </div>
    );
}
