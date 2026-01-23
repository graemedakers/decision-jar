"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/utils";
import { Idea } from "@/lib/types";
import { CacheKeys, createCacheInvalidator, STALE_TIME } from "@/lib/cache-utils";
import { useUser } from "./useUser";

// Fetcher Function
const fetchFavoritesApi = async (): Promise<Idea[]> => {
    const res = await fetch(getApiUrl('/api/favorites'), { credentials: 'include' });
    if (!res.ok) {
        const error: any = new Error("Failed to fetch favorites");
        error.status = res.status;
        throw error;
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
};

export function useFavorites() {
    const queryClient = useQueryClient();
    const { userData } = useUser({ redirectToLogin: false });

    const query = useQuery({
        queryKey: CacheKeys.favorites(),
        queryFn: fetchFavoritesApi,
        staleTime: STALE_TIME.FAVORITES,
        enabled: !!userData, // ✅ Only fetch if we have user data
    });

    // Use centralized cache invalidator
    const cache = createCacheInvalidator(queryClient);
    const fetchFavorites = () => cache.invalidateFavorites();

    const toggleFavorite = useMutation({
        mutationFn: async (idea: any) => {
            const isFav = query.data?.some(f => f.name === (idea.description || idea.name));

            if (isFav) {
                const res = await fetch(getApiUrl(`/api/favorites?name=${encodeURIComponent(idea.description || idea.name)}`), {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (!res.ok) throw new Error("Failed to remove favorite");
                return { action: 'removed', name: idea.description || idea.name };
            } else {
                const res = await fetch(getApiUrl('/api/favorites'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: idea.description || idea.name,
                        address: idea.address,
                        description: idea.details || idea.description,
                        googleRating: idea.googleRating || idea.google_rating,
                        websiteUrl: idea.website,
                        type: idea.category === 'MEAL' ? 'RESTAURANT' : 'VENUE'
                    }),
                    credentials: 'include'
                });
                if (!res.ok) throw new Error("Failed to add favorite");
                return { action: 'added', name: idea.description || idea.name };
            }
        },
        onSuccess: () => {
            fetchFavorites();
        }
    });

    return {
        favorites: query.data || [],
        favoritesCount: query.data?.length || 0,
        isLoading: query.isLoading,
        fetchFavorites,
        toggleFavorite: toggleFavorite.mutateAsync,
        isToggling: toggleFavorite.isPending,
        error: query.error
    };
}
