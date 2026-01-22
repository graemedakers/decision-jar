import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check Pro status
        // Use centralized premium logic
        const { isUserPro } = await import('@/lib/premium');
        const isPro = isUserPro(user);

        if (isPro) {
            return NextResponse.json({
                isPro: true,
                dailyLimit: null,
                usedToday: 0,
                remaining: null,
                resetsAt: null
            });
        }

        // Calculate usage for free users
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Use raw query to avoid stale client issues
        const result: any[] = await prisma.$queryRaw`
            SELECT COUNT(*)::int as count 
            FROM "GenerationHistory" 
            WHERE "userId" = ${user.id} 
            AND "apiCalled" = 'bulk-generate' 
            AND "createdAt" >= ${startOfDay}
        `;

        const usedToday = result[0]?.count || 0;
        const dailyLimit = 3;
        const remaining = Math.max(0, dailyLimit - usedToday);
        const resetsAt = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000).toISOString();

        return NextResponse.json({
            isPro: false,
            dailyLimit,
            usedToday,
            remaining,
            resetsAt
        });

    } catch (error) {
        console.error('Failed to fetch AI usage:', error);
        return NextResponse.json(
            { error: 'Failed to fetch usage stats' },
            { status: 500 }
        );
    }
}
