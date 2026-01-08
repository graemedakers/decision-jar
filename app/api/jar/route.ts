import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


function generateCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, type, topic, customCategories, selectionMode } = await request.json();

        if (!name || !type) {
            return NextResponse.json({ error: "Name and Type are required" }, { status: 400 });
        }
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { getLimits } = await import('@/lib/premium');
        const limits = getLimits(user);

        const currentJarCount = await prisma.jarMember.count({
            where: { userId: user.id }
        });

        if (currentJarCount >= limits.maxJars) {
            return NextResponse.json({
                error: `Limit reached: You can only have ${limits.maxJars} jar(s) on the Free plan. Please upgrade to Pro.`
            }, { status: 403 });
        }

        // Romantic jars are now unlimited - users can create themed or context-specific jars

        // Generate unique code
        let code = generateCode();
        let isUnique = false;
        while (!isUnique) {
            const existing = await prisma.jar.findUnique({ where: { referenceCode: code } });
            if (!existing) isUnique = true;
            else code = generateCode();
        }

        // Create Jar and Member in transaction
        const result = await prisma.$transaction(async (tx) => {
            const jar = await tx.jar.create({
                data: {
                    name,
                    type,
                    // @ts-ignore
                    selectionMode: selectionMode || 'RANDOM',
                    // @ts-ignore
                    topic: topic || "General",
                    customCategories: customCategories || undefined,
                    referenceCode: code,
                    isPremium: false // Default to free
                }
            });

            await tx.jarMember.create({
                data: {
                    jarId: jar.id,
                    userId: user.id,
                    role: 'ADMIN'
                }
            });

            await tx.user.update({
                where: { id: user.id },
                data: { activeJarId: jar.id }
            });

            return jar;
        });

        return NextResponse.json({ success: true, jar: result });

    } catch (error: any) {
        console.error("Create Jar Error:", error);
        console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message,
            type: error.name
        }, { status: 500 });
    }
}
