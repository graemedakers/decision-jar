import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: jarId } = await context.params;

    try {
        const count = await prisma.jarMember.count({
            where: { jarId }
        });

        return NextResponse.json({ memberCount: count });
    } catch (error) {
        console.error("Error checking membership:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
