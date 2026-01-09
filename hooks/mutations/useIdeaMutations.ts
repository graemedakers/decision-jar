"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIdea, updateIdea, deleteIdea } from "@/app/actions/ideas";
import { Idea } from "@/lib/types";
import { showSuccess, showError } from "@/lib/toast";
import { CacheKeys, createCacheInvalidator } from "@/lib/cache-utils";

export function useIdeaMutations() {
    const queryClient = useQueryClient();
    const cache = createCacheInvalidator(queryClient);

    const addIdeaMutation = useMutation({
        mutationFn: createIdea,
        onMutate: async (newItemArgs) => {
            await queryClient.cancelQueries({ queryKey: CacheKeys.ideas() });
            const previousIdeas = queryClient.getQueryData<Idea[]>(CacheKeys.ideas());

            // Optimistic Update
            if (previousIdeas) {
                const optimisticIdea = {
                    ...newItemArgs,
                    id: 'temp-' + Date.now(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdById: 'current-user', // Placeholder
                    jarId: 'current-jar', // Placeholder
                    status: 'APPROVED'
                } as any;

                queryClient.setQueryData<Idea[]>(CacheKeys.ideas(), (old) => [optimisticIdea, ...(old || [])]);
            }

            return { previousIdeas };
        },
        onError: (err, newItem, context) => {
            if (context?.previousIdeas) {
                queryClient.setQueryData(CacheKeys.ideas(), context.previousIdeas);
            }
            showError(err.message || "Failed to add idea");
        },
        onSuccess: (data) => {
            if (!data.success) {
                throw new Error(data.error);
            }
            // Invalidate to get the real ID and data from server
            cache.invalidateIdeas();
        },
    });

    const updateIdeaMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateIdea(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: CacheKeys.ideas() });
            const previousIdeas = queryClient.getQueryData<Idea[]>(CacheKeys.ideas());

            // Optimistic Update
            if (previousIdeas) {
                queryClient.setQueryData<Idea[]>(CacheKeys.ideas(), (old) =>
                    old?.map((idea) => (idea.id === id ? { ...idea, ...data } : idea)) || []
                );
            }

            return { previousIdeas };
        },
        onError: (err, variables, context) => {
            if (context?.previousIdeas) {
                queryClient.setQueryData(CacheKeys.ideas(), context.previousIdeas);
            }
            showError("Failed to update idea");
        },
        onSuccess: (data) => {
            if (!data.success) throw new Error(data.error);
            cache.invalidateIdeas();
        },
    });

    const deleteIdeaMutation = useMutation({
        mutationFn: deleteIdea,
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: CacheKeys.ideas() });
            const previousIdeas = queryClient.getQueryData<Idea[]>(CacheKeys.ideas());

            // Optimistic Update: Return list without the deleted item
            if (previousIdeas) {
                queryClient.setQueryData<Idea[]>(CacheKeys.ideas(), (old) =>
                    old?.filter((idea) => idea.id !== id) || []
                );
            }

            return { previousIdeas };
        },
        onError: (err, id, context) => {
            if (context?.previousIdeas) {
                queryClient.setQueryData(CacheKeys.ideas(), context.previousIdeas);
            }
            showError("Failed to delete idea");
        },
        onSuccess: (data) => {
            if (!data.success) throw new Error(data.error);
            cache.invalidateIdeas();
        },
    });

    return {
        addIdea: addIdeaMutation,
        updateIdea: updateIdeaMutation,
        deleteIdea: deleteIdeaMutation
    };
}
