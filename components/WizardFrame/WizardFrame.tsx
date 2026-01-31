"use client";

import { ReactNode, isValidElement, createElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LucideIcon } from "lucide-react";
import { TrialBadge } from "@/components/TrialBadge";
import { useUser } from "@/hooks/useUser";

interface WizardFrameProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    icon?: LucideIcon | ReactNode;
    iconColor?: string;
    headerGradient?: string;
    children: ReactNode;
    footer?: ReactNode;
    maxWidth?: string;
    mode?: 'modal' | 'inline';
    hideClose?: boolean;
}

export function WizardFrame({
    isOpen,
    onClose,
    title,
    subtitle,
    icon: Icon,
    iconColor = "text-primary",
    headerGradient = "from-primary/5 to-accent/5",
    children,
    footer,
    maxWidth = "max-w-2xl",
    mode = 'modal',
    hideClose = false
}: WizardFrameProps) {
    const { userData } = useUser({ redirectToLogin: false });

    const CardContent = (
        <motion.div
            initial={mode === 'modal' ? { scale: 0.9, opacity: 0 } : { opacity: 0, y: 20 }}
            animate={mode === 'modal' ? { scale: 1, opacity: 1 } : { opacity: 1, y: 0 }}
            exit={mode === 'modal' ? { scale: 0.9, opacity: 0 } : { opacity: 0, y: -20 }}
            className={`glass-card w-full ${maxWidth} relative ${mode === 'modal' ? 'max-h-[90vh]' : 'h-full'} flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl`}
        >
            {/* Header */}
            <div className={`p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-gradient-to-r ${headerGradient} rounded-t-3xl shrink-0`}>
                <div className="flex items-center gap-3 overflow-hidden">
                    {Icon && (
                        <div className={`w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center shadow-inner shrink-0 ${iconColor}`}>
                            {isValidElement(Icon) ? Icon : createElement(Icon as any, { className: "w-6 h-6" })}
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                                {title}
                            </h2>
                            <TrialBadge userData={userData} variant="compact" />
                        </div>
                        {subtitle && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                {!hideClose && (
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-all hover:rotate-90 shrink-0"
                    >
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                {children}
            </div>

            {/* Footer (Optional) */}
            {footer && (
                <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 rounded-b-3xl shrink-0">
                    {footer}
                </div>
            )}
        </motion.div>
    );

    if (mode === 'inline') {
        if (!isOpen) return null;
        return CardContent;
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    {CardContent}
                </div>
            )}
        </AnimatePresence>
    );
}
