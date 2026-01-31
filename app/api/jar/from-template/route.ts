import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTemplateById } from '@/lib/jar-templates';
import { generateUniqueJarCode } from '@/lib/utils';
import { JarType, IdeaStatus, MemberRole, MemberStatus } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { templateId, name, topic, category } = body;

        if (!templateId) {
            return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
        }

        const template = getTemplateById(templateId);
        if (!template) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        // Generate a unique join code
        const referenceCode = await generateUniqueJarCode();

        // Create the jar and add the user as owner
        const result = await prisma.$transaction(async (tx) => {
            const jar = await tx.jar.create({
                data: {
                    name: name || template.name,
                    topic: topic || template.topic,
                    type: template.category === 'dates' ? JarType.ROMANTIC :
                        template.category === 'lifestyle' ? JarType.SOLO :
                            JarType.SOCIAL,
                    selectionMode: 'RANDOM',
                    referenceCode,
                    members: {
                        create: {
                            userId: session.user.id as string,
                            role: MemberRole.OWNER,
                            status: MemberStatus.ACTIVE
                        }
                    }
                }
            });

            // Set as active jar for the user
            await tx.user.update({
                where: { id: session.user.id },
                data: { activeJarId: jar.id }
            });

            // Add ideas from template
            if (template.ideas.length > 0) {
                await tx.idea.createMany({
                    data: template.ideas.map(idea => ({
                        description: idea.description,
                        details: idea.details || '',
                        category: (idea.category || 'ACTIVITY').toUpperCase(),
                        duration: idea.duration || 1,
                        cost: idea.cost || '$',
                        activityLevel: idea.activityLevel || 'MEDIUM',
                        indoor: idea.indoor ?? true,
                        timeOfDay: idea.timeOfDay || 'ANY',
                        jarId: jar.id as string,
                        createdById: session.user.id as string,
                        status: IdeaStatus.APPROVED
                    }))
                });
            }

            return jar;
        });

        return NextResponse.json({ success: true, jarId: result.id });

    } catch (error: any) {
        console.error("Create Jar from Template Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
