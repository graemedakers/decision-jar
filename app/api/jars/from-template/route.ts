import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { JAR_TEMPLATES } from '@/lib/jar-templates';
import { generateUniqueJarCode } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { templateId } = await req.json();
        const template = JAR_TEMPLATES.find(t => t.id === templateId);

        if (!template) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        const userId = session.user.id;

        // Check Jar Limits
        const userJarsCount = await prisma.jarMember.count({
            where: {
                userId: userId,
                role: { in: ['OWNER', 'ADMIN'] as any }
            }
        });

        const user = session.user as any;
        const isPro = !!user.isLifetimePro || !!user.stripeSubscriptionId;
        const maxJars = isPro ? 50 : 1;

        if (userJarsCount >= maxJars) {
            return NextResponse.json({
                error: "Plan limit reached. Upgrade to Pro to create more jars.",
                code: "LIMIT_REACHED"
            }, { status: 403 });
        }

        // Generate database-verified unique code
        const code = await generateUniqueJarCode();

        // Create Jar and Ideas in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const jar = await tx.jar.create({
                data: {
                    name: template.name.replace(/^[^\w\s]+\s*/, ''), // Strip emoji if present for name
                    topic: template.topic,
                    type: template.category.toUpperCase() === 'DATES' ? 'ROMANTIC' : 'SOCIAL' as any,
                    referenceCode: code,
                    members: {
                        create: {
                            userId: userId,
                            role: 'OWNER' as any,
                            status: 'ACTIVE'
                        }
                    }
                }
            });

            if (template.ideas.length > 0) {
                await tx.idea.createMany({
                    data: template.ideas.map(idea => ({
                        description: idea.description,
                        category: idea.category || 'ACTIVITY',
                        duration: idea.duration || 1,
                        cost: idea.cost || '$$',
                        activityLevel: idea.activityLevel || 'MEDIUM',
                        indoor: idea.indoor ?? true,
                        timeOfDay: idea.timeOfDay || 'ANY',
                        details: idea.details,
                        jarId: jar.id,
                        createdById: userId,
                        status: 'APPROVED'
                    }))
                });
            }

            // Set as active jar
            await tx.user.update({
                where: { id: userId },
                data: { activeJarId: jar.id }
            });

            return jar;
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("[JAR_FROM_TEMPLATE_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
