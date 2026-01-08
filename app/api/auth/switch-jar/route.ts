import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { jarId } = await request.json();

        if (!jarId) {
            return NextResponse.json({ error: "Jar ID is required" }, { status: 400 });
        }

        // Verify membership
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    jarId: jarId,
                    userId: session.user.id
                }
            }
        });

        if (!membership) {
            return NextResponse.json({ error: "You are not a member of this jar." }, { status: 403 });
        }

        // Update active jar
        await prisma.user.update({
            where: { id: session.user.id },
            data: { activeJarId: jarId }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Switch Jar Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
