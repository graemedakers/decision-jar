import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTemplateById } from '@/lib/jar-templates';
import { IdeaStatus } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { jarId, templateId } = body;

        if (!jarId || !templateId) {
            return NextResponse.json({ error: "Jar ID and Template ID are required" }, { status: 400 });
        }

        // Verify membership
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    userId: session.user.id,
                    jarId: jarId
                }
            }
        });

        if (!membership) {
            return NextResponse.json({ error: "You don't have permission to add ideas to this jar" }, { status: 403 });
        }

        const template = getTemplateById(templateId);
        if (!template) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        // Add ideas from template
        const createdCount = await prisma.idea.createMany({
            data: template.ideas.map(idea => ({
                description: idea.description,
                details: idea.details || '',
                category: (idea.category || 'ACTIVITY').toUpperCase(),
                duration: idea.duration || 1,
                cost: idea.cost || '$',
                activityLevel: idea.activityLevel || 'MEDIUM',
                indoor: idea.indoor ?? true,
                timeOfDay: idea.timeOfDay || 'ANY',
                jarId: jarId as string,
                createdById: session.user.id as string,
                status: IdeaStatus.APPROVED
            }))
        });

        return NextResponse.json({
            success: true,
            count: createdCount.count,
            message: `Successfully added ${createdCount.count} ideas from ${template.name}`
        });

    } catch (error: any) {
        console.error("Add Template Ideas Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
