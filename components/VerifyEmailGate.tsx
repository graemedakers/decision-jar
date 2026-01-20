"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Mail, Lock, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { showSuccess, showError } from "@/lib/toast";

interface VerifyEmailGateProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    featureName: string; // e.g., "Pro Upgrade" or "Email Notifications"
    description?: string;
}

export function VerifyEmailGate({
    isOpen,
    onClose,
    email,
    featureName,
    description
}: VerifyEmailGateProps) {
    const [isResending, setIsResending] = useState(false);

    const handleResendVerification = async () => {
        setIsResending(true);
        try {
            const res = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                showSuccess('Verification email sent! Check your inbox.');
            } else {
                const data = await res.json();
                showError(data.error || 'Failed to send verification email');
            }
        } catch (error) {
            showError('Failed to send verification email');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <div className="text-center py-6">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Verify Your Email
                    </h2>

                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                        {description || `To unlock ${featureName}, please verify your email address first.`}
                    </p>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2 text-sm text-blue-900 dark:text-blue-100 mb-2">
                            <Mail className="w-4 h-4" />
                            <span className="font-medium">Verification email sent to:</span>
                        </div>
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 break-all">
                            {email}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={handleResendVerification}
                            disabled={isResending}
                            className="w-full"
                            variant="primary"
                        >
                            {isResending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Resend Verification Email
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={onClose}
                            className="w-full"
                            variant="outline"
                        >
                            Close
                        </Button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Check your spam folder if you don't see the email.
                            Once verified, you'll have access to all features!
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
