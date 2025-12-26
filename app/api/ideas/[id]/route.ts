import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { isValidCategoryForTopic, getCategoriesForTopic } from '@/lib/categories';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session || (!session.user.activeJarId && !session.user.coupleId)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const currentJarId = session.user.activeJarId || session.user.coupleId;

    const { id } = await params;

    try {
        // Verify ownership
        const idea = await prisma.idea.findUnique({
            where: { id },
        });

        if (!idea) {
            return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
        }

        if (idea.jarId !== currentJarId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Restrict Deletion: Author OR Admin
        if (idea.createdById !== session.user.id) {
            const membership = await prisma.jarMember.findUnique({
                where: {
                    userId_jarId: { userId: session.user.id, jarId: currentJarId }
                }
            });

            if (membership?.role !== 'ADMIN') {
                return NextResponse.json({ error: 'Only the author or an admin can delete this idea' }, { status: 403 });
            }
        }

        // Create deletion log
        await prisma.deletedLog.create({
            data: {
                jarId: currentJarId,
                description: idea.description,
                deletedBy: session.user.name || session.user.email,
            },
        });

        await prisma.idea.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting idea:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session || (!session.user.activeJarId && !session.user.coupleId)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const currentJarId = session.user.activeJarId || session.user.coupleId;

    const { id } = await params;

    try {
        const body = await request.json();
        const { description, indoor, duration, activityLevel, cost, timeOfDay, details, category } = body;

        // Verify ownership
        const idea = await prisma.idea.findUnique({
            where: { id },
            include: { jar: true }
        });

        if (!idea) {
            return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
        }

        if (idea.jarId !== currentJarId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Restrict Modification: Author Only
        if (idea.createdById !== session.user.id) {
            return NextResponse.json({ error: 'Only the author can modify this idea' }, { status: 403 });
        }

        // Validate Category
        if (category && !isValidCategoryForTopic(category, idea.jar.topic, (idea.jar as any).customCategories)) {
            const allowed = getCategoriesForTopic(idea.jar.topic, (idea.jar as any).customCategories).map(c => c.label).join(', ');
            return NextResponse.json({
                error: `Category "${category}" is not relevant to this "${idea.jar.topic}" jar. Allowed: ${allowed}`
            }, { status: 400 });
        }

        const updatedIdea = await prisma.idea.update({
            where: { id },
            data: {
                description,
                details: details || null,
                indoor: Boolean(indoor),
                duration: typeof duration === 'string' ? parseFloat(duration) : duration,
                activityLevel,
                cost,
                timeOfDay,
                category,
            },
        });

        return NextResponse.json(updatedIdea);
    } catch (error) {
        console.error('Error updating idea:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session || (!session.user.activeJarId && !session.user.coupleId)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const currentJarId = session.user.activeJarId || session.user.coupleId;

    const { id } = await params;

    try {
        const body = await request.json();

        // Verify ownership
        const idea = await prisma.idea.findUnique({
            where: { id },
            include: { jar: true }
        });

        if (!idea) {
            return NextResponse.json({ error: 'Idea find (PATCH) not found' }, { status: 404 });
        }

        if (idea.jarId !== currentJarId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Restrict Modification: Author Only
        if (idea.createdById !== session.user.id) {
            return NextResponse.json({ error: 'Only the author can modify this idea' }, { status: 403 });
        }

        // Validate Category if present
        if (body.category && !isValidCategoryForTopic(body.category, idea.jar.topic, (idea.jar as any).customCategories)) {
            const allowed = getCategoriesForTopic(idea.jar.topic, (idea.jar as any).customCategories).map(c => c.label).join(', ');
            return NextResponse.json({
                error: `Category "${body.category}" is not relevant to this "${idea.jar.topic}" jar. Allowed: ${allowed}`
            }, { status: 400 });
        }

        const updatedIdea = await prisma.idea.update({
            where: { id },
            data: body,
        });

        return NextResponse.json(updatedIdea);
    } catch (error) {
        console.error('Error updating idea (PATCH):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
