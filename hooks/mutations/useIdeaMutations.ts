"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIdea, updateIdea, deleteIdea } from "@/app/actions/ideas";
import { Idea } from "@/lib/types";
import { showSuccess, showError } from "@/lib/toast";

export function useIdeaMutations() {
    const queryClient = useQueryClient();

    const addIdeaMutation = useMutation({
        mutationFn: createIdea,
        onMutate: async (newItemArgs) => {
            await queryClient.cancelQueries({ queryKey: ['ideas'] });
            const previousIdeas = queryClient.getQueryData<Idea[]>(['ideas']);

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
                } as any; // Cast as any because some fields might be missing

                queryClient.setQueryData<Idea[]>(['ideas'], (old) => [optimisticIdea, ...(old || [])]);
            }

            return { previousIdeas };
        },
        onError: (err, newItem, context) => {
            if (context?.previousIdeas) {
                queryClient.setQueryData(['ideas'], context.previousIdeas);
            }
            showError(err.message || "Failed to add idea");
        },
        onSuccess: (data) => {
            if (!data.success) {
                throw new Error(data.error);
            }
            // Invalidate to get the real ID and data from server
            queryClient.invalidateQueries({ queryKey: ['ideas'] });
        },
    });

    const updateIdeaMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateIdea(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ['ideas'] });
            const previousIdeas = queryClient.getQueryData<Idea[]>(['ideas']);

            // Optimistic Update
            if (previousIdeas) {
                queryClient.setQueryData<Idea[]>(['ideas'], (old) =>
                    old?.map((idea) => (idea.id === id ? { ...idea, ...data } : idea)) || []
                );
            }

            return { previousIdeas };
        },
        onError: (err, variables, context) => {
            if (context?.previousIdeas) {
                queryClient.setQueryData(['ideas'], context.previousIdeas);
            }
            showError("Failed to update idea");
        },
        onSuccess: (data) => {
            if (!data.success) throw new Error(data.error);
            queryClient.invalidateQueries({ queryKey: ['ideas'] });
        },
    });

    const deleteIdeaMutation = useMutation({
        mutationFn: deleteIdea,
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['ideas'] });
            const previousIdeas = queryClient.getQueryData<Idea[]>(['ideas']);

            // Optimistic Update: Return list without the deleted item
            if (previousIdeas) {
                queryClient.setQueryData<Idea[]>(['ideas'], (old) =>
                    old?.filter((idea) => idea.id !== id) || []
                );
            }

            return { previousIdeas };
        },
        onError: (err, id, context) => {
            if (context?.previousIdeas) {
                queryClient.setQueryData(['ideas'], context.previousIdeas);
            }
            showError("Failed to delete idea");
        },
        onSuccess: (data) => {
            if (!data.success) throw new Error(data.error);
            queryClient.invalidateQueries({ queryKey: ['ideas'] });
        },
    });

    return {
        addIdea: addIdeaMutation,
        updateIdea: updateIdeaMutation,
        deleteIdea: deleteIdeaMutation
    };
}
