"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIdea, updateIdea, deleteIdea } from "@/app/actions/ideas";
import { Idea } from "@/lib/types";
import { showSuccess, showError } from "@/lib/toast";
import { CacheKeys, createCacheInvalidator } from "@/lib/cache-utils";
import { isDemoMode, addDemoIdea, updateDemoIdea, deleteDemoIdea } from "@/lib/demo-storage"; // ✅ Import demo functions

export function useIdeaMutations() {
    const queryClient = useQueryClient();
    const cache = createCacheInvalidator(queryClient);
    const isDemo = isDemoMode(); // ✅ Check if in demo mode

    const dispatchBroadcast = (jarId: string | undefined) => {
        if (!jarId) return;
        // Dispatch window event for useSquadMode to pick up and broadcast via Supabase
        // Use generic Event if CustomEvent TS issues arise, but CustomEvent is standard in DOM lib
        if (typeof window !== 'undefined') {
            console.log(`[useIdeaMutations] Dispatching local broadcast request for jar ${jarId}`);
            window.dispatchEvent(new CustomEvent('decision-jar:broadcast', {
                detail: { jarId, event: 'content-update' }
            }));
        }
    };

    const addIdeaMutation = useMutation({
        mutationFn: async (newItemArgs: any) => {
            // ✅ If demo mode, use localStorage instead of API
            if (isDemo) {
                const demoIdea = addDemoIdea(newItemArgs);
                return { success: true, idea: demoIdea };
            }

            // Regular mode: Call server action
            return createIdea(newItemArgs);
        },
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
                const errorMessage = 'error' in data ? data.error : 'Unknown error';
                throw new Error(errorMessage);
            }

            // ✅ For demo mode, skip reload - let the demo page's onClose handler refresh data
            if (!isDemo) {
                // Regular mode: Invalidate to get the real ID and data from server
                cache.invalidateIdeas();
                if (data.idea?.jarId) dispatchBroadcast(data.idea.jarId);
            }
            // Demo mode: Do nothing - demo page calls loadDemoData() in handleCloseAddModal
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
            if (data.idea?.jarId) dispatchBroadcast(data.idea.jarId);
        },
    });

    const deleteIdeaMutation = useMutation({
        mutationFn: deleteIdea,
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: CacheKeys.ideas() });
            const previousIdeas = queryClient.getQueryData<Idea[]>(CacheKeys.ideas());

            // Capture jarId for broadcast
            const ideaToDelete = previousIdeas?.find(i => i.id === id);
            const jarId = ideaToDelete?.jarId;

            // Optimistic Update: Return list without the deleted item
            if (previousIdeas) {
                queryClient.setQueryData<Idea[]>(CacheKeys.ideas(), (old) =>
                    old?.filter((idea) => idea.id !== id) || []
                );
            }

            return { previousIdeas, jarId };
        },
        onError: (err, id, context) => {
            if (context?.previousIdeas) {
                queryClient.setQueryData(CacheKeys.ideas(), context.previousIdeas);
            }
            showError("Failed to delete idea");
        },
        onSuccess: (data, id, context) => {
            if (!data.success) throw new Error(data.error);
            cache.invalidateIdeas();
            if (context?.jarId) dispatchBroadcast(context.jarId);
        },
    });

    return {
        addIdea: addIdeaMutation,
        updateIdea: updateIdeaMutation,
        deleteIdea: deleteIdeaMutation
    };
}
