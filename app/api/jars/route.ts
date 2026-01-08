
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateUniqueCode } from '@/lib/utils';
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
        const { name, type, selectionMode, topic, customCategories } = body;

        if (!name) return new NextResponse("Name is required", { status: 400 });

        // Plan Checks
        // Check how many jars user owns/admins
        const userJarsCount = await prisma.jarMember.count({
            where: {
                userId: userId,
                role: { in: ['OWNER', 'ADMIN'] as any }
            }
        });

        // Use 'any' cast for custom user properties if TS complains
        const user = session.user as any;
        const isPro = !!user.isLifetimePro || !!user.stripeSubscriptionId; // Simplified check
        const maxJars = isPro ? 50 : 1;

        if (userJarsCount >= maxJars) {
            return NextResponse.json({
                error: "Plan limit reached.",
                code: "LIMIT_REACHED"
            }, { status: 403 });
        }

        // Create Jar
        const code = await generateUniqueCode();

        // Map types safely? 
        // We assume frontend sends valid enum values or strings that match
        // But Prisma is strict.

        const jar = await prisma.jar.create({
            data: {
                name,
                type: type || 'SOCIAL', // Default
                selectionMode: selectionMode === 'VOTING' ? 'VOTE' : (selectionMode || 'RANDOM'), // Map VOTING to VOTE
                topic: topic || 'General',
                customCategories: customCategories ? customCategories : undefined,
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
