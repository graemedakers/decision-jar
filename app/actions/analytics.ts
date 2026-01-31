'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export type TrackEventInput = {
    type?: string;
    name?: string;
    value?: number | null;
    metadata?: any;
    sessionId?: string | null;
    path?: string;
};

export async function trackEvent(data: TrackEventInput) {
    try {
        const { type, name, value, metadata, sessionId, path } = data;

        // Try to identify user
        const session = await getSession();
        const userId = session?.user?.id;

        // If session doesn't have ID directly, maybe lookup? 
        let verifiedUserId = userId;

        if (!verifiedUserId && session?.user?.email) {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true }
            });
            verifiedUserId = user?.id;
        }

        await prisma.analyticsEvent.create({
            data: {
                type: type || 'UNKNOWN',
                name: name || 'unknown',
                value: typeof value === 'number' ? value : null,
                metadata: metadata || {},
                userId: verifiedUserId,
                sessionId: sessionId || null,
                path: path || '/',
            }
        });

        return { success: true };
    } catch (error) {
        // Silently fail for analytics to not disrupt user flow, but log on server
        console.error('Analytics error:', error);
        return { success: false, error: 'Failed to track' };
    }
}
