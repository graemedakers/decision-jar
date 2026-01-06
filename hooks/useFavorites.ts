"use client";

import { useState, useCallback, useEffect } from "react";
import { getApiUrl } from "@/lib/utils";
import { Idea } from "@/lib/types";

export function useFavorites() {
    const [favorites, setFavorites] = useState<Idea[]>([]); // Assuming favorites list returns ideas? Or we just need count?
    // DashboardPage only uses count. Memories page uses list.
    // Let's store list, expose count.

    const [favoritesCount, setFavoritesCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFavorites = useCallback(async () => {
        try {
            const res = await fetch(getApiUrl('/api/favorites'), { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setFavorites(data);
                    setFavoritesCount(data.length);
                }
            }
        } catch (error) {
            console.error('Failed to fetch favorites', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    return { favorites, favoritesCount, isLoading, fetchFavorites };
}
