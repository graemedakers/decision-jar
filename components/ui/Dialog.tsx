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

/**
 * Dialog Component - Mobile-First Bottom Sheet Design
 * 
 * On mobile (< sm breakpoint):
 * - Appears as a bottom sheet that slides up from the bottom
 * - Constrained to max 85vh to ensure it never goes off the top of the screen
 * - Content scrolls within the sheet, header stays visible
 * 
 * On desktop (>= sm breakpoint):
 * - Appears as a centered modal with standard scaling animation
 */
export function Dialog({ open, onOpenChange, children }: DialogProps) {
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

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    {/* Content Container */}
                    <div className="relative z-50 w-full sm:max-w-lg sm:p-4">
                        {children}
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogContent({ children, className }: DialogContentProps) {
    const contentRef = React.useRef<HTMLDivElement>(null);

    // Scroll content to top when component mounts
    React.useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className={cn(
                // Base styles
                "relative w-full border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl",
                // Mobile: Bottom sheet with max height constraint
                "rounded-t-3xl rounded-b-none max-h-[85vh]",
                // Desktop: Centered modal with rounded corners
                "sm:rounded-2xl sm:max-h-[90vh]",
                // Flex column layout for proper scrolling
                "flex flex-col",
                className
            )}
        >
            {/* Drag handle for mobile */}
            <div className="flex-shrink-0 pt-3 pb-2 sm:hidden">
                <div className="mx-auto w-12 h-1.5 rounded-full bg-slate-700/50" />
            </div>

            {/* Scrollable content area */}
            <div
                ref={contentRef}
                className="flex-1 overflow-y-auto overscroll-contain p-6 pt-2 pb-8 sm:pt-6 sm:pb-6"
            >
                {children}
            </div>
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
