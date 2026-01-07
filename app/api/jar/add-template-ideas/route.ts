import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getTemplateById } from '@/lib/jar-templates';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { templateId, jarId } = await request.json();

        if (!templateId || !jarId) {
            return NextResponse.json({ error: 'Template ID and Jar ID required' }, { status: 400 });
        }

        const template = getTemplateById(templateId);
        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // Verify user has access to this jar
        const membership = await prisma.jarMember.findFirst({
            where: {
                jarId,
                userId: session.user.id,
                status: 'ACTIVE'
            }
        });

        if (!membership) {
            return NextResponse.json({ error: 'Access denied to this jar' }, { status: 403 });
        }

        // Add all template ideas to the existing jar
        const creations = template.ideas.map(idea =>
            prisma.idea.create({
                data: {
                    description: idea.description,
                    category: idea.category || 'ACTIVITY',
                    duration: idea.duration || 1,
                    cost: idea.cost || '$',
                    activityLevel: idea.activityLevel || 'MEDIUM',
                    indoor: idea.indoor ?? true,
                    timeOfDay: idea.timeOfDay || 'ANY',
                    details: idea.details || null,
                    createdById: session.user.id,
                    jarId: jarId,
                    status: 'APPROVED' as any
                }
            })
        );

        const results = await prisma.$transaction(creations);

        return NextResponse.json({
            success: true,
            count: results.length,
            jarId
        });
    } catch (error) {
        console.error('Error adding template ideas to jar:', error);
        return NextResponse.json(
            { error: 'Failed to add ideas to jar' },
            { status: 500 }
        );
    }
}
