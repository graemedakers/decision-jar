
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateUniqueJarCode } from '@/lib/utils';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;

        // Rate Limit Check
        // We cast session.user to any to avoid strict type checks here as we check fields manually
        // checkRateLimit expects { id, email }
        const userForLimit = {
            id: session.user.id,
            email: session.user.email || ""
        };
        const limitRes = await checkRateLimit(userForLimit);
        if (!limitRes.allowed) {
            return new NextResponse("Too Many Requests", { status: 429 });
        }

        const body = await req.json();
        const { name, type, selectionMode, topic, customCategories, voteCandidatesCount, defaultIdeaPrivate } = body;

        if (!name) return new NextResponse("Name is required", { status: 400 });

        // Fetch the user from the database to get up-to-date premium status
        const dbUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!dbUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Plan Checks
        // Check how many jars user owns/admins
        const userJarsCount = await prisma.jarMember.count({
            where: {
                userId: userId,
                role: { in: ['OWNER', 'ADMIN'] as any }
            }
        });

        // Use the unified premium utility
        const { getFeatureLimits } = await import('@/lib/premium-utils');
        const limits = getFeatureLimits(dbUser);
        const maxJars = limits.maxJars;

        if (userJarsCount >= maxJars) {
            return NextResponse.json({
                error: `Plan limit reached. You can have up to ${maxJars} jars on your current plan.`,
                code: "LIMIT_REACHED"
            }, { status: 403 });
        }

        // Create Jar with database-verified unique code
        const code = await generateUniqueJarCode();

        // Map types safely? 
        // We assume frontend sends valid enum values or strings that match
        // But Prisma is strict.

        const jar = await prisma.jar.create({
            data: {
                name,
                type: type || 'SOCIAL', // Default
                selectionMode: selectionMode || 'RANDOM',
                topic: topic || 'General',
                customCategories: customCategories ? customCategories : undefined,
                voteCandidatesCount: voteCandidatesCount ? Number(voteCandidatesCount) : 0,
                defaultIdeaPrivate: !!defaultIdeaPrivate,
                referenceCode: code,
                members: {
                    create: {
                        userId: userId,
                        role: 'OWNER' as any, // Cast to any to bypass strict enum TS check (it is valid in DB)
                        status: 'ACTIVE'
                    }
                }
            }
        });

        // Auto-switch user to this jar?
        await prisma.user.update({
            where: { id: userId },
            data: { activeJarId: jar.id }
        });

        return NextResponse.json({ jar });

    } catch (error) {
        console.error("[JAR_CREATE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
