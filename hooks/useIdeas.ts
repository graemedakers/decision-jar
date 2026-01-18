"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/utils";
import { Idea } from "@/lib/types";
import { useUser } from "./useUser";
import { CacheKeys, createCacheInvalidator, STALE_TIME } from "@/lib/cache-utils";

// Fetcher Function
const fetchIdeasApi = async (): Promise<Idea[]> => {
    const res = await fetch(getApiUrl('/api/ideas'), { credentials: 'include' });
    if (!res.ok) {
        const error: any = new Error("Failed to fetch ideas");
        error.status = res.status;
        throw error;
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
};

export function useIdeas() {
    const { userData } = useUser({ redirectToLogin: false });
    const jarId = userData?.activeJarId;
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: CacheKeys.ideas(jarId),
        queryFn: fetchIdeasApi,
        staleTime: 5000, // Reduced to 5s to keep UI fresh
        refetchInterval: 4000, // Poll every 4 seconds to ensure multi-window sync even if realtime fails
        refetchOnWindowFocus: true, // Force refresh when coming back to tab
        enabled: !!userData, // Only fetch if we have user data (to know which jar)
    });

    // Use centralized cache invalidator
    const cache = createCacheInvalidator(queryClient);
    const fetchIdeas = () => cache.invalidateIdeas(jarId);

    return {
        ideas: query.data || [],
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        fetchIdeas,
        error: query.error
    };
}
