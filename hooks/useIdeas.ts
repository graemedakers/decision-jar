"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/utils";
import { Idea } from "@/lib/types";

// Fetcher Function
const fetchIdeasApi = async (): Promise<Idea[]> => {
    const res = await fetch(getApiUrl('/api/ideas'), { credentials: 'include' });
    if (!res.ok) throw new Error("Failed to fetch ideas");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
};

export function useIdeas() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['ideas'],
        queryFn: fetchIdeasApi,
        staleTime: 1000 * 60, // 1 minute fresh
    });

    // Wrapper to match previous interface
    const fetchIdeas = () => queryClient.invalidateQueries({ queryKey: ['ideas'] });

    return {
        ideas: query.data || [],
        isLoading: query.isLoading,
        fetchIdeas,
        error: query.error
    };
}
