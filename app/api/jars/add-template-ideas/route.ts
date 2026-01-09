import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { JAR_TEMPLATES } from '@/lib/jar-templates';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { templateId, jarId } = await req.json();

        if (!templateId || !jarId) {
            return NextResponse.json({ error: "Template ID and Jar ID are required" }, { status: 400 });
        }

        const template = JAR_TEMPLATES.find(t => t.id === templateId);
        if (!template) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        const userId = session.user.id;

        // Check if user is an admin of the target jar
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    userId,
                    jarId
                }
            }
        });

        if (!membership || !['OWNER', 'ADMIN', 'MEMBER'].includes(membership.role)) {
            return NextResponse.json({ error: "You don't have permission to add ideas to this jar" }, { status: 403 });
        }

        // Add ideas
        if (template.ideas.length > 0) {
            await prisma.idea.createMany({
                data: template.ideas.map(idea => ({
                    description: idea.description,
                    category: idea.category || 'ACTIVITY',
                    duration: idea.duration || 1,
                    cost: idea.cost || '$$',
                    activityLevel: idea.activityLevel || 'MEDIUM',
                    indoor: idea.indoor ?? true,
                    timeOfDay: idea.timeOfDay || 'ANY',
                    details: idea.details,
                    jarId: jarId,
                    createdById: userId,
                    status: 'APPROVED'
                }))
            });
        }

        return NextResponse.json({
            success: true,
            count: template.ideas.length,
            message: `Successfully added ${template.ideas.length} ideas to your jar!`
        });

    } catch (error) {
        console.error("[ADD_TEMPLATE_IDEAS_ERROR]", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
