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
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    {/* Content Container - flex wrapper for centering */}
                    <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
                        <div className="relative z-50 w-full sm:max-w-lg">
                            {children}
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
    /** 
     * "default" - Standard modal with internal padding and scroll wrapper
     * "raw" - No internal wrapper, modal handles its own layout/scroll (for complex modals)
     */
    variant?: 'default' | 'raw';
}

export function DialogContent({ children, className, variant = 'default' }: DialogContentProps) {
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = React.useState(false);

    // Detect mobile vs desktop for animation
    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Scroll content to top when component mounts
    React.useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, []);

    // Different animations for mobile (slide up) vs desktop (fade + scale)
    const mobileAnimation = {
        initial: { opacity: 0, y: "100%" },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: "100%" },
    };

    const desktopAnimation = {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
    };

    const animation = isMobile ? mobileAnimation : desktopAnimation;

    // For "raw" variant, render children directly without wrapper
    if (variant === 'raw') {
        return (
            <motion.div
                {...animation}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                className={cn(
                    // Base styles
                    "relative w-full border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl",
                    // Mobile: Bottom sheet with max height constraint
                    "rounded-t-3xl rounded-b-none max-h-[85vh]",
                    // Desktop: Centered modal with rounded corners and proper max height
                    "sm:rounded-2xl sm:max-h-[calc(100vh-4rem)]",
                    // Flex column layout for complex modals
                    "flex flex-col",
                    className
                )}
            >
                {/* Drag handle for mobile (raw variant) */}
                <div className="flex-shrink-0 pt-3 pb-2 sm:hidden">
                    <div className="mx-auto w-12 h-1.5 rounded-full bg-slate-700/50" />
                </div>
                {children}
            </motion.div>
        );
    }

    // Default variant with internal scroll wrapper
    return (
        <motion.div
            {...animation}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className={cn(
                // Base styles
                "relative w-full border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl",
                // Mobile: Bottom sheet with max height constraint
                "rounded-t-3xl rounded-b-none max-h-[85vh]",
                // Desktop: Centered modal with rounded corners and proper max height
                "sm:rounded-2xl sm:max-h-[calc(100vh-4rem)]",
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
