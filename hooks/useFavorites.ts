"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/utils";
import { Idea } from "@/lib/types";
import { CacheKeys, createCacheInvalidator, STALE_TIME } from "@/lib/cache-utils";

// Fetcher Function
const fetchFavoritesApi = async (): Promise<Idea[]> => {
    const res = await fetch(getApiUrl('/api/favorites'), { credentials: 'include' });
    if (!res.ok) throw new Error("Failed to fetch favorites");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
};

export function useFavorites() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: CacheKeys.favorites(),
        queryFn: fetchFavoritesApi,
        staleTime: STALE_TIME.FAVORITES,
    });

    // Use centralized cache invalidator
    const cache = createCacheInvalidator(queryClient);
    const fetchFavorites = () => cache.invalidateFavorites();

    return {
        favorites: query.data || [],
        favoritesCount: query.data?.length || 0,
        isLoading: query.isLoading,
        fetchFavorites,
        error: query.error
    };
}
