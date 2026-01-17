import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/notifications';
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

        const currentJarId = user.activeJarId || user.memberships?.[0]?.jarId;
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
                    // Send push notifications to other jar members (not the person who picked)
                    const members = await prisma.jarMember.findMany({
                        where: { 
                            jarId: currentJarId,
                            userId: { not: session.user.id } // Exclude the person who picked
                        },
                        include: { user: true }
                    });

                    // Send push notification to each member
                    const notificationPromises = members.map(member => 
                        sendPushNotification(member.userId, {
                            title: `🎯 New pick: "${selectedIdea.description}"`,
                            body: `${session.user.name || 'Someone'} selected this from your jar!`,
                            url: `/jar?selected=${selectedIdea.id}`,
                            icon: selectedIdea.photoUrls?.[0] || '/icon-192.png'
                        })
                    );

                    await Promise.allSettled(notificationPromises);

                    // Award XP and check achievements
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
