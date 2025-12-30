import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');
        const topic = searchParams.get('topic');
        const sort = searchParams.get('sort') || 'newest';

        const orderBy = sort === 'members'
            ? { members: { _count: 'desc' as const } }
            : { createdAt: 'desc' as const };

        const jars = await prisma.jar.findMany({
            where: {
                isCommunityJar: true,
                // subscriptionStatus: 'ACTIVE', // Only active paid jars
                topic: topic && topic !== 'All' ? topic : undefined,
                OR: query ? [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ] : undefined
            },
            select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
                memberLimit: true,
                topic: true,
                _count: {
                    select: { members: true }
                }
            },
            take: 50,
            orderBy: orderBy
        });

        // Map to friendlier format
        const formatted = jars.map(j => ({
            id: j.id,
            name: j.name,
            description: j.description,
            imageUrl: j.imageUrl,
            topic: j.topic,
            memberCount: j._count.members,
            memberLimit: j.memberLimit,
            isFull: j.memberLimit ? j._count.members >= j.memberLimit : false
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Failed to fetch community jars", error);
        return NextResponse.json({ error: "Failed to fetch jars" }, { status: 500 });
    }
}
