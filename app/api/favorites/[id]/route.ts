
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session?.user?.id || (!session.user.activeJarId && !session.user.coupleId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const currentJarId = session.user.activeJarId || session.user.coupleId;

        const { id } = await params;

        // Using raw SQL to bypass valid Prisma Client generation issues
        // We verify ownership by including coupleId in the DELETE condition
        // Using raw SQL to bypass valid Prisma Client generation issues
        // We verify ownership by including coupleId in the DELETE condition
        // SECURITY FIX: Enforce ownership by checking userId
        const count = await prisma.$executeRaw`
            DELETE FROM "FavoriteVenue" 
            WHERE "id" = ${id} 
            AND "jarId" = ${currentJarId}
            AND "userId" = ${session.user.id}
        `;

        // count is explicitly typed as number in newer prisma versions, or BigInt in some. 
        // raw query results can be tricky. But executeRaw usually returns number of affected rows.

        return NextResponse.json({ success: true, count });
    } catch (error: any) {
        console.error("Error deleting favorite:", error);
        return NextResponse.json({ error: "Failed to delete favorite" }, { status: 500 });
    }
}
