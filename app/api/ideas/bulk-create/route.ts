import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyJarMembers } from '@/lib/notifications';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                memberships: {
                    include: {
                        jar: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json();
        const rawIdeas = body.ideas;

        if (!rawIdeas || !Array.isArray(rawIdeas) || rawIdeas.length === 0) {
            return NextResponse.json({ error: 'No ideas provided' }, { status: 400 });
        }

        const jarId = rawIdeas[0].jarId;

        // Basic permission check
        if (jarId) {
            const membership = user.memberships.find(m => m.jarId === jarId);
            if (!membership) {
                return NextResponse.json({ error: 'Unauthorized for this jar' }, { status: 403 });
            }
        } else {
            return NextResponse.json({ error: 'Jar ID missing' }, { status: 400 });
        }

        // Create ideas transactionally
        const createdIdeas = await prisma.$transaction(
            rawIdeas.map((idea: any) =>
                prisma.idea.create({
                    data: {
                        description: idea.title,
                        details: idea.details || idea.description,
                        category: idea.category?.toUpperCase() || 'ACTIVITY',
                        indoor: idea.indoor ?? true,
                        duration: parseFloat(idea.duration || '1'),
                        cost: idea.cost || '$',
                        activityLevel: idea.activityLevel || 'MEDIUM',
                        timeOfDay: idea.timeOfDay || 'ANY',
                        jarId: jarId,
                        createdById: user.id,
                        status: 'APPROVED'
                    }
                })
            )
        );

        // Send push notification to other jar members (non-blocking)
        const notificationCount = createdIdeas.length;
        if (notificationCount > 0) {
            notifyJarMembers(jarId, session.user.id, {
                title: `💡 ${session.user.name || 'Someone'} added new ideas`,
                body: `Added ${notificationCount} new idea${notificationCount > 1 ? 's' : ''} to the jar!`,
                url: '/jar',
                icon: '/icon-192.png'
            }, 'notifyIdeaAdded').catch(err => console.error("Notification error:", err));
        }

        return NextResponse.json({
            success: true,
            count: createdIdeas.length,
            jarId: jarId
        });

    } catch (error) {
        console.error("Bulk create error:", error);
        return NextResponse.json(
            { error: 'Failed to create ideas' },
            { status: 500 }
        );
    }
}
