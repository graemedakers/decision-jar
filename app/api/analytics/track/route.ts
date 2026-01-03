import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
// Import headers to get IP or user agent if needed
import { headers } from 'next/headers';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, name, value, metadata, sessionId, path } = body;

        // Try to identify user
        const session = await getSession();
        const userId = session?.user?.id; // Assuming session has user ID, or we fetch user by email

        // If session doesn't have ID directly, maybe lookup? 
        // For performance, we might just store email in metadata if needed, 
        // but let's try to link to verified User ID if possible.
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
                sessionId: sessionId, // From client-side cookie/storage
                path: path || '/',
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
    }
}
