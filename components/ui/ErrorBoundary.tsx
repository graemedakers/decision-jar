
"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4 rounded-3xl bg-red-50 dark:bg-red-900/10 border-2 border-dashed border-red-200 dark:border-red-500/20 m-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-2">
                        <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-red-900 dark:text-red-100">
                        Oops! The Jar Cracked.
                    </h2>
                    <p className="text-red-600 dark:text-red-300 max-w-md text-sm">
                        Something went wrong while displaying this section.
                        Don't worry, your data is safe.
                    </p>
                    <div className="pt-2">
                        <Button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                            variant="outline"
                            className="border-red-200 hover:bg-red-100 text-red-700 dark:border-red-500/30 dark:hover:bg-red-500/20 dark:text-red-200"
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Reload Jar
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
