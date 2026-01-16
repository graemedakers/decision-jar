"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        retry: (failureCount, error: any) => {
                            // Don't retry on 401 (Unauthorized) - session expired
                            if (error?.status === 401 || error?.response?.status === 401) {
                                return false;
                            }
                            // Don't retry on 403 (Forbidden) - no permission
                            if (error?.status === 403 || error?.response?.status === 403) {
                                return false;
                            }
                            // Retry other errors once
                            return failureCount < 1;
                        },
                        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
                        refetchOnWindowFocus: false, // Prevents aggressive refetching
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
