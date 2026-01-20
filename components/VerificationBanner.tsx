"use client";

import { useState } from "react";
import { X, Mail, CheckCircle } from "lucide-react";
import { showSuccess, showError } from "@/lib/toast";

interface VerificationBannerProps {
    email: string;
    isVerified: boolean;
}

export function VerificationBanner({ email, isVerified }: VerificationBannerProps) {
    const [isDismissed, setIsDismissed] = useState(false);
    const [isResending, setIsResending] = useState(false);

    // Don't show if verified or dismissed
    if (isVerified || isDismissed) return null;

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
        <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500 p-4 mb-6 rounded-lg shadow-sm">
            <button
                onClick={() => setIsDismissed(true)}
                className="absolute top-3 right-3 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                aria-label="Dismiss"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 pr-8">
                <div className="p-2 bg-blue-100 dark:bg-blue-800/40 rounded-full shrink-0">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Verify your email to unlock full features
                    </h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                        We sent a verification link to <strong>{email}</strong>.
                        Verify your email to upgrade to Pro and customize notification preferences.
                    </p>

                    <button
                        onClick={handleResendVerification}
                        disabled={isResending}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                        {isResending ? (
                            <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Mail className="w-3 h-3" />
                                Resend Verification Email
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
