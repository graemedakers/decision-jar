'use server';

import { ActionResponse } from '@/lib/types';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { FavoriteVenue } from '@prisma/client';

export async function toggleFavorite(data: {
    name: string;
    address?: string;
    description?: string;
    type?: string;
}): Promise<ActionResponse<{ added: boolean; favorite?: FavoriteVenue }>> {
    const session = await getSession();
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized', status: 401 };
    }

    const { name, address, description, type } = data;
    if (!name) return { success: false, error: 'Name is required' };

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { memberships: true }
    });
    if (!user) return { success: false, error: 'User not found' };

    const jarId = user.activeJarId || user.memberships?.[0]?.jarId || user.legacyJarId;
    if (!jarId) return { success: false, error: 'No active jar' };

    try {
        // Check if exists
        const existing = await prisma.favoriteVenue.findFirst({
            where: {
                jarId,
                name: { equals: name, mode: 'insensitive' }
            }
        });

        if (existing) {
            // Delete
            await prisma.favoriteVenue.delete({
                where: { id: existing.id }
            });
            revalidatePath('/dashboard');
            revalidatePath('/memories');
            return { success: true, added: false };
        } else {
            // Create
            const favorite = await prisma.favoriteVenue.create({
                data: {
                    jarId,
                    userId: user.id,
                    name,
                    address: address || null,
                    description: description || null,
                    type: type || 'VENUE'
                }
            });
            revalidatePath('/dashboard');
            revalidatePath('/memories');
            return { success: true, added: true, favorite };
        }
    } catch (error: any) {
        console.error('Error toggling favorite:', error);
        return { success: false, error: error.message || 'Unknown error' };
    }
}

export async function getFavorites(): Promise<ActionResponse<{ favorites: FavoriteVenue[] }>> {
    const session = await getSession();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { memberships: true }
    });
    const jarId = user?.activeJarId || user?.memberships?.[0]?.jarId || user?.legacyJarId;

    if (!jarId) return { success: true, favorites: [] };

    try {
        const favorites = await prisma.favoriteVenue.findMany({
            where: { jarId },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, favorites };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
