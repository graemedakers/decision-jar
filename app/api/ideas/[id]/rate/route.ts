import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { awardXp, updateStreak } from '@/lib/gamification';
import { checkAndUnlockAchievements } from '@/lib/achievements';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session || (!session.user.activeJarId && !session.user.coupleId && !session.user.jarId)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const currentJarId = session.user.activeJarId || session.user.coupleId || session.user.jarId;

    const { id } = await params;

    try {
        // Use raw query to bypass missing generated types for Rating
        const ratings: any[] = await prisma.$queryRaw`
            SELECT r.*, u.name as "userName", u.email as "userEmail"
            FROM "Rating" r
            JOIN "User" u ON r."userId" = u.id
            WHERE r."ideaId" = ${id}
            ORDER BY r."createdAt" DESC
        `;

        const mappedRatings = ratings.map(r => ({
            id: r.id,
            ideaId: r.ideaId,
            userId: r.userId,
            value: r.value,
            comment: r.comment,
            createdAt: r.createdAt,
            user: {
                name: r.userName,
                email: r.userEmail
            },
            isMe: r.userId === session.user.id
        }));

        return NextResponse.json(mappedRatings);
    } catch (error: any) {
        console.error('Error fetching ratings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session || (!session.user.activeJarId && !session.user.coupleId && !session.user.jarId)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const currentJarId = session.user.activeJarId || session.user.coupleId || session.user.jarId;

    const { id } = await params;
    const { rating, notes, photoUrls } = await request.json();

    try {
        // Verify ownership
        const idea = await prisma.idea.findUnique({
            where: { id },
        });

        if (!idea || idea.jarId !== currentJarId) {
            return NextResponse.json({ error: 'Idea not found or unauthorized' }, { status: 404 });
        }

        // Upsert Rating using raw SQL
        const now = new Date();
        const userId = session.user.id;
        const ratingId = crypto.randomUUID();

        // Note: Using explicit casting for parameters in Postgres if needed, but try inferred first.
        // We use queryRaw with raw SQL for the Insert/Update (Upsert)
        await prisma.$queryRaw`
            INSERT INTO "Rating" ("id", "ideaId", "userId", "value", "comment", "createdAt", "updatedAt")
            VALUES (${ratingId}, ${id}, ${userId}, ${rating}, ${notes}, ${now}, ${now})
            ON CONFLICT ("ideaId", "userId") 
            DO UPDATE SET "value" = ${rating}, "comment" = ${notes}, "updatedAt" = ${now}
        `;

        // Recalculate average
        const result: any[] = await prisma.$queryRaw`
            SELECT AVG(value)::numeric as avg
            FROM "Rating"
            WHERE "ideaId" = ${id}
        `;

        const avgRating = result[0]?.avg ? Math.round(parseFloat(result[0].avg)) : rating;

        const updatedIdea = await prisma.idea.update({
            where: { id },
            data: {
                rating: avgRating,
                notes: notes,
                photoUrls: photoUrls // Save the array of photos
            }
        });

        // Gamification: Award 100 XP for rating/completing a date!
        await updateStreak(currentJarId);
        await awardXp(currentJarId, 100);
        await checkAndUnlockAchievements(currentJarId);

        return NextResponse.json(updatedIdea);
    } catch (error: any) {
        console.error('Error updating rating:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
