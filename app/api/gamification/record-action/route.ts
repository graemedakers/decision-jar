import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { unlockAchievement } from '@/lib/gamification';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user || !user.activeJarId) {
            return NextResponse.json({ error: 'No active jar' }, { status: 400 });
        }

        const { action, meta } = await request.json();

        const results = [];

        // Logic for Quick Tools
        if (action === "QUICK_TOOL_USED") {
            const res = await unlockAchievement(user.activeJarId, "QUICK_DECIDER");
            if (res) results.push(res);
        }

        if (action === "DICE_ROLL" && meta?.result === 6) {
            const res = await unlockAchievement(user.activeJarId, "HIGH_ROLLER");
            if (res) results.push(res);
        }

        return NextResponse.json({ success: true, achievements: results });

    } catch (error) {
        console.error("Gamification error", error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
