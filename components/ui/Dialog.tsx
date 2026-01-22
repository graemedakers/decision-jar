"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

/**
 * Dialog Component - Mobile-First Bottom Sheet / Desktop Centered
 * 
 * On mobile (< 640px): Slides up from bottom, max 90% height.
 * On desktop (>= 640px): Centered in viewport, max 85% height.
 */
export function Dialog({ open, onOpenChange, children }: DialogProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent body scroll when dialog is open
    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    // Handle Escape key
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onOpenChange(false);
        };
        if (open) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [open, onOpenChange]);

    if (!mounted) return null;

    const content = (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    {/* Modal Content Container */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0.5 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={cn(
                            "relative z-[1001] w-full max-w-lg",
                            "bg-white dark:bg-slate-900 shadow-2xl overflow-hidden",
                            "rounded-t-[24px] sm:rounded-[24px]", // Bottom sheet rounded top on mobile, fully rounded on desktop
                            "max-h-[90vh] sm:max-h-[85vh]", // Taller on mobile to feel like a sheet
                            "flex flex-col",
                            "sm:m-4" // Margin on desktop to prevent edge touching
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drag Handle for Mobile Bottom Sheet */}
                        <div className="flex sm:hidden justify-center py-2 shrink-0">
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        </div>

                        {/* The actual modal content */}
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(content, document.body);
}

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
    /**
     * If true, prevents the default padding and internal scrolling.
     * Use this when you want to handle layout manually (e.g., custom headers/footers).
     */
    raw?: boolean;
}

export function DialogContent({ children, className, raw = false }: DialogContentProps) {
    const contentRef = React.useRef<HTMLDivElement>(null);

    // Scroll to top on mount
    React.useEffect(() => {
        if (contentRef.current) contentRef.current.scrollTop = 0;
    }, []);

    if (raw) {
        return (
            <div className={cn("flex flex-col flex-1 overflow-hidden", className)}>
                {children}
            </div>
        );
    }

    return (
        <div
            ref={contentRef}
            className={cn(
                "flex-1 overflow-y-auto overscroll-contain p-6",
                "custom-scrollbar",
                className
            )}
        >
            {children}
        </div>
    );
}

export function DialogHeader({
    children,
    className,
    showClose = true,
    onClose
}: {
    children: React.ReactNode;
    className?: string;
    showClose?: boolean;
    onClose?: () => void;
}) {
    return (
        <div className={cn(
            "relative px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0",
            className
        )}>
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                {children}
            </div>
            {showClose && (
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <h2 className={cn("text-xl font-bold text-slate-900 dark:text-white", className)}>
            {children}
        </h2>
    );
}

export function DialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <p className={cn("text-sm text-slate-500 dark:text-slate-400", className)}>
            {children}
        </p>
    );
}

export function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn(
            "px-6 py-4 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-slate-800 shrink-0",
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0",
            className
        )}>
            {children}
        </div>
    );
}
