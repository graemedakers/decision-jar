import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ jarId: string }> }
) {
    const { jarId } = await params;
    const session = await getSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!redis) {
        // Fallback or no-op if Redis is not configured
        return NextResponse.json({ success: true, warning: 'Redis not configured' });
    }

    try {
        const body = await req.json();
        const { activity, status } = body;

        const presenceKey = `presence:${jarId}:${session.user.id}`;
        const userData = {
            userId: session.user.id,
            name: session.user.name || 'Anonymous',
            image: (session.user as any).image || (session.user as any).picture || null, // Handle different user object shapes
            activity, // { type: 'viewing' | 'typing' | 'voting', details?: string }
            status,   // 'online' | 'idle'
            lastSeen: Date.now(),
        };

        // Store with 30s TTL (Expiration)
        await redis.setex(presenceKey, 30, JSON.stringify(userData));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Presence Heartbeat Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ jarId: string }> }
) {
    const { jarId } = await params;

    if (!redis) {
        return NextResponse.json({ users: [] });
    }

    try {
        const pattern = `presence:${jarId}:*`;
        const keys = await redis.keys(pattern);

        if (keys.length === 0) {
            return NextResponse.json({ users: [] });
        }

        // Fetch all active sessions
        // Redis 'keys' returns full keys, mget takes array
        // Note: mget might fail if keys is empty, but we checked length
        const rawUsers = await redis.mget(keys);

        const users = rawUsers
            .filter(Boolean)
            .map((u: any) => {
                try {
                    return typeof u === 'string' ? JSON.parse(u) : u;
                } catch {
                    return null;
                }
            })
            .filter(Boolean)
            // Sort by lastSeen descending
            .sort((a, b) => b.lastSeen - a.lastSeen);

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Presence Fetch Error:', error);
        return NextResponse.json({ users: [] }); // Fail gracefully
    }
}
