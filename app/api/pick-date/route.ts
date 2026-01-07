import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { sendDateNotificationEmail } from '@/lib/mailer';
import { awardXp } from '@/lib/gamification';
import { checkAndUnlockAchievements } from '@/lib/achievements';
import { COST_VALUES, ACTIVITY_VALUES } from '@/lib/constants';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        const { maxDuration, maxCost, maxActivityLevel, timeOfDay, category, weather, localOnly } = await request.json().catch(() => ({}));

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch User and Active Jar
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { memberships: true }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const currentJarId = user.activeJarId || user.memberships?.[0]?.jarId || user.coupleId;
        if (!currentJarId) return NextResponse.json({ error: 'No active jar found' }, { status: 400 });

        // 2. Build Prisma-level Filters (Performance Optimization)
        const whereClause: any = {
            jarId: currentJarId,
            selectedAt: null,
            category: { not: 'PLANNED_DATE' }
        };

        if (category && category !== 'ANY') whereClause.category = category;
        if (timeOfDay && timeOfDay !== 'ANY') {
            // Include ANY ideas or exact match
            whereClause.timeOfDay = { in: ['ANY', timeOfDay] };
        }

        // Fetch ideas with base filters applied
        const candidateIdeas = await prisma.idea.findMany({ where: whereClause });

        // 3. Apply Multi-dimensional Filters in Memory (Complex logic)
        const filteredIdeas = candidateIdeas.filter(idea => {
            // Duration
            if (maxDuration !== undefined && idea.duration > maxDuration) return false;

            // Cost
            if (maxCost !== undefined) {
                const ideaCostVal = COST_VALUES[idea.cost] ?? 0;
                const maxCostVal = COST_VALUES[maxCost] ?? 3;
                if (ideaCostVal > maxCostVal) return false;
            }

            // Activity
            if (maxActivityLevel !== undefined) {
                const ideaActivityVal = ACTIVITY_VALUES[idea.activityLevel] ?? 0;
                const maxActivityVal = ACTIVITY_VALUES[maxActivityLevel] ?? 2;
                if (ideaActivityVal > maxActivityVal) return false;
            }

            // Weather (Real-life Context)
            if (weather && weather !== 'ANY') {
                const ideaWeather = (idea as any).weather || 'ANY';
                if (ideaWeather !== 'ANY' && ideaWeather !== weather) return false;
            }

            // Travel (Real-life Context)
            if (localOnly && (idea as any).requiresTravel) return false;

            return true;
        });

        if (filteredIdeas.length === 0) {
            return NextResponse.json({ error: 'No matching ideas found' }, { status: 404 });
        }

        // 4. Random Selection
        const selectedIdea = filteredIdeas[Math.floor(Math.random() * filteredIdeas.length)];

        // 5. Update Selection State
        if (session && currentJarId) {
            await prisma.idea.update({
                where: { id: selectedIdea.id },
                data: {
                    selectedAt: new Date(),
                    selectedDate: new Date(),
                },
            });

            // Parallel background tasks
            (async () => {
                try {
                    const members = await prisma.jarMember.findMany({
                        where: { jarId: currentJarId },
                        include: { user: true }
                    });
                    const recipients = Array.from(new Set(members.map(m => m.user.email).filter(Boolean))) as string[];
                    if (recipients.length > 0) await sendDateNotificationEmail(recipients, selectedIdea);

                    await awardXp(currentJarId, 5);
                    await checkAndUnlockAchievements(currentJarId);
                } catch (err) {
                    console.error("Post-spin tasks failed:", err);
                }
            })();
        }

        // 6. Return with Permissions
        const isMyIdea = selectedIdea.createdById === session.user.id;
        const membership = await prisma.jarMember.findUnique({
            where: { userId_jarId: { userId: session.user.id, jarId: currentJarId } }
        });
        const isAdmin = membership?.role === 'ADMIN';

        return NextResponse.json({
            ...selectedIdea,
            canEdit: isMyIdea || isAdmin,
            canDelete: isMyIdea || isAdmin
        });

    } catch (error) {
        console.error('Pick date error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
