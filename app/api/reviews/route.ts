import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { rating, comment } = await request.json();

        if (!rating || !comment) {
            return NextResponse.json({ error: 'Rating and comment required' }, { status: 400 });
        }

        const review = await prisma.appReview.create({
            data: {
                userId: session.user.id!,
                rating: parseInt(rating),
                comment,
                isPublic: true // Default to true for now
            }
        });

        return NextResponse.json(review);
    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        // Public endpoint to fetch testimonials
        const reviews = await prisma.appReview.findMany({
            where: { isPublic: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                user: {
                    select: { name: true }
                }
            }
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
