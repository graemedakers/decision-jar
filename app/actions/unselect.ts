"use server";

import { ActionResponse } from '@/lib/types';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Unselect an idea (set selectedAt to null) to return it to the jar.
 * Used when a user clicks "Not Feeling It" to make the idea available for future spins.
 */
export async function unselectIdea(ideaId: string): Promise<ActionResponse<void>> {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized', status: 401 };
        }

        // Verify the idea exists
        const idea = await prisma.idea.findUnique({
            where: { id: ideaId }
        });

        if (!idea) {
            return { success: false, error: 'Idea not found', status: 404 };
        }

        // Check if user is a member of the jar
        const membership = await prisma.jarMember.findFirst({
            where: {
                jarId: idea.jarId,
                userId: session.user.id
            }
        });

        if (!membership) {
            return { success: false, error: 'You do not have permission to modify this idea', status: 403 };
        }

        // Unselect the idea
        await prisma.idea.update({
            where: { id: ideaId },
            data: { selectedAt: null }
        });

        // Revalidate relevant paths
        revalidatePath('/dashboard');
        revalidatePath('/jar');

        return { success: true };
    } catch (error) {
        console.error('Error unselecting idea:', error);
        return {
            success: false,
            error: 'Failed to unselect idea',
            status: 500
        };
    }
}
