import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

function generateCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: sourceJarId } = await params;
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch Source Jar and its Ideas
        const sourceJar = await prisma.jar.findUnique({
            where: { id: sourceJarId },
            include: {
                ideas: {
                    where: { selectedAt: null } // Only copy available ideas
                }
            }
        });

        if (!sourceJar) {
            return NextResponse.json({ error: "Source jar not found" }, { status: 404 });
        }

        // Optional: Only allow forking of community jars
        if (!sourceJar.isCommunityJar) {
            // For now, we allow it if they have the ID, but in future might gate to isPublic
        }

        const userId = session.user.id;

        // 2. Check Member Limits
        const { getLimits } = await import('@/lib/premium');
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const limits = getLimits(user);
        const currentJarCount = await prisma.jarMember.count({
            where: { userId: user.id }
        });

        if (currentJarCount >= limits.maxJars) {
            return NextResponse.json({
                error: `Limit reached: You can only have ${limits.maxJars} jar(s). Please upgrade to Pro to clone more.`
            }, { status: 403 });
        }

        // 3. Create unique reference code
        let code = generateCode();
        let isUnique = false;
        while (!isUnique) {
            const existing = await prisma.jar.findUnique({ where: { referenceCode: code } });
            if (!existing) isUnique = true;
            else code = generateCode();
        }

        // 4. Perform Transaction to Clone Jar and Ideas
        const newJar = await prisma.$transaction(async (tx) => {
            // Create New Jar
            const jar = await tx.jar.create({
                data: {
                    name: `${sourceJar.name} (Clone)`,
                    type: sourceJar.type,
                    topic: sourceJar.topic,
                    selectionMode: sourceJar.selectionMode,
                    customCategories: sourceJar.customCategories || undefined,
                    referenceCode: code,
                    isPremium: false, // Cloned jar is free by default
                }
            });

            // Add Current User as Admin
            await tx.jarMember.create({
                data: {
                    jarId: jar.id,
                    userId: userId,
                    role: 'ADMIN',
                    status: 'ACTIVE'
                }
            });

            // Clone Ideas
            if (sourceJar.ideas.length > 0) {
                const ideasToCreate = sourceJar.ideas.map(idea => ({
                    description: idea.description,
                    indoor: idea.indoor,
                    duration: idea.duration,
                    activityLevel: idea.activityLevel,
                    cost: idea.cost,
                    timeOfDay: idea.timeOfDay,
                    category: idea.category,
                    details: idea.details,
                    address: idea.address,
                    website: idea.website,
                    googleRating: idea.googleRating,
                    openingHours: idea.openingHours,
                    photoUrls: idea.photoUrls,
                    weather: idea.weather,
                    requiresTravel: idea.requiresTravel,
                    jarId: jar.id,
                    createdById: userId, // New owner is the person who forked it
                }));

                await tx.idea.createMany({
                    data: ideasToCreate
                });
            }

            // Set as active jar
            await tx.user.update({
                where: { id: userId },
                data: { activeJarId: jar.id }
            });

            return jar;
        });

        return NextResponse.json({
            success: true,
            jarId: newJar.id,
            message: "Jar successfully cloned to your collection!"
        });

    } catch (error) {
        console.error("Fork Jar Error", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
