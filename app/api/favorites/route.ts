
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const currentJarId = user.activeJarId || user.coupleId;
        if (!currentJarId) return NextResponse.json({ error: 'No active jar' }, { status: 400 });

        const body = await request.json();
        const { name, address, description, websiteUrl, googleRating, type } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const id = crypto.randomUUID();

        // Using raw SQL to bypass valid Prisma Client generation issues
        // Column is 'coupleId' in DB (mapped from jarId in schema)
        await prisma.$executeRaw`
            INSERT INTO "FavoriteVenue" ("id", "coupleId", "userId", "name", "address", "description", "websiteUrl", "googleRating", "type", "createdAt")
            VALUES (${id}, ${currentJarId}, ${session.user.id}, ${name}, ${address}, ${description}, ${websiteUrl}, ${googleRating}, ${type || 'VENUE'}, NOW())
        `;

        return NextResponse.json({ success: true, id });
    } catch (error: any) {
        console.error("Error adding favorite:", error);
        return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const currentJarId = user.activeJarId || user.coupleId;

        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Using raw SQL to bypass valid Prisma Client generation issues
        await prisma.$executeRaw`
            DELETE FROM "FavoriteVenue" WHERE "coupleId" = ${currentJarId} AND "name" = ${name}
        `;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting favorite:", error);
        return NextResponse.json({ error: "Failed to delete favorite" }, { status: 500 });
    }
}


import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { memberships: true }
        });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Collect all jar IDs the user is a member of
        const myJarIds = user.memberships.map(m => m.jarId);
        if (user.coupleId && !myJarIds.includes(user.coupleId)) {
            myJarIds.push(user.coupleId);
        }

        // If no jars, just get personal favorites (though user logic implies they are in a jar usually)
        // But sql requires non-empty list for IN clause, so handle empty case
        let favorites;

        if (myJarIds.length > 0) {
            favorites = await prisma.$queryRaw<any[]>`
                SELECT * FROM "FavoriteVenue" 
                WHERE 
                    "userId" = ${session.user.id} 
                    OR 
                    ("coupleId" IN (${Prisma.join(myJarIds)}) AND "isShared" = true)
                ORDER BY "createdAt" DESC
            `;
        } else {
            favorites = await prisma.$queryRaw<any[]>`
                SELECT * FROM "FavoriteVenue" 
                WHERE "userId" = ${session.user.id} 
                ORDER BY "createdAt" DESC
            `;
        }

        const enhancedFavorites = favorites.map((fav: any) => ({
            ...fav,
            isOwner: fav.userId === session.user.id
        }));

        return NextResponse.json(enhancedFavorites);
    } catch (error: any) {
        console.error("Error fetching favorites:", error);
        return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, isShared } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        // Using raw SQL
        // Only allow updating if the user owns the favorite
        const result = await prisma.$executeRaw`
            UPDATE "FavoriteVenue" 
            SET "isShared" = ${isShared}
            WHERE "id" = ${id} AND "userId" = ${session.user.id}
        `;

        // Return success even if 0 rows affected (maybe it was already shared or illegal access, but no error thrown)
        return NextResponse.json({ success: true, updated: result });

    } catch (error: any) {
        console.error("Error updating favorite:", error);
        return NextResponse.json({ error: "Failed to update favorite" }, { status: 500 });
    }
}

