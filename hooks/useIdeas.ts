"use client";

import { useState, useCallback, useEffect } from "react";
import { getApiUrl } from "@/lib/utils";
import { Idea } from "@/lib/types";

export function useIdeas() {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchIdeas = useCallback(async () => {
        try {
            const res = await fetch(getApiUrl('/api/ideas'), { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setIdeas(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch ideas', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchIdeas();
    }, [fetchIdeas]);

    return { ideas, isLoading, fetchIdeas };
}
