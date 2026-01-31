'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
    status?: number;
};

export async function getDeletionLogs(): Promise<ActionResponse<any[]>> {
    const session = await getSession();
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized', status: 401 };
    }

    if (!session.user.activeJarId) {
        return { success: false, error: 'No active jar selected', status: 400 };
    }

    try {
        const logs = await prisma.deletedLog.findMany({
            where: {
                jarId: session.user.activeJarId,
            },
            orderBy: {
                deletedAt: 'desc',
            },
        });

        // Map dates to strings for client component consumption if needed (Server Actions serialize dates, but sometimes explicit string conversion is safer for pure JSON)
        // However, Next.js Server Actions handle Date objects fine usually. 
        // But let's return them as is, and if client needs strings, we'll see.
        // Actually, prisma returns Date objects. Next.js serialization works for simple objects.

        return { success: true, data: logs };
    } catch (error: any) {
        console.error('Error fetching logs:', error);
        return { success: false, error: 'Internal Server Error', status: 500 };
    }
}
