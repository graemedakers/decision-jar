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

        const { templateId } = await request.json();

        if (!templateId) {
            return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
        }

        const template = getTemplateById(templateId);
        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // Create jar from template
        const jar = await prisma.jar.create({
            data: {
                name: template.name.replace(/^[^\w\s]+\s*/, ''), // Remove emoji prefix
                topic: template.topic,
                type: 'SOCIAL',
                referenceCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
                members: {
                    create: {
                        userId: session.user.id,
                        role: 'ADMIN',
                        status: 'ACTIVE'
                    }
                },
                ideas: {
                    create: template.ideas.map(idea => ({
                        description: idea.description,
                        category: idea.category || 'ACTIVITY',
                        duration: idea.duration || 1,
                        cost: idea.cost || '$',
                        activityLevel: idea.activityLevel || 'MEDIUM',
                        indoor: idea.indoor ?? true,
                        timeOfDay: idea.timeOfDay || 'ANY',
                        details: idea.details || null,
                        createdById: session.user.id
                    }))
                }
            },
            include: {
                ideas: true,
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(jar);
    } catch (error) {
        console.error('Error creating jar from template:', error);
        return NextResponse.json(
            { error: 'Failed to create jar from template' },
            { status: 500 }
        );
    }
}
