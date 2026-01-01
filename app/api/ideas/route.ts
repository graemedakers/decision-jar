import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { awardXp } from '@/lib/gamification';
import { checkAndUnlockAchievements } from '@/lib/achievements';
import { isValidCategoryForTopic, getCategoriesForTopic } from '@/lib/categories';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentJarId = user.activeJarId || user.coupleId;

    if (!currentJarId) {
        return NextResponse.json({ error: 'No active jar' }, { status: 400 });
    }

    const jar = await prisma.jar.findUnique({ where: { id: currentJarId } });
    if (!jar) {
        return NextResponse.json({ error: 'Jar not found' }, { status: 404 });
    }

    // Check if Voting is Active - if so, block adding new ideas
    const activeVote = await (prisma as any).voteSession.findFirst({
        where: { jarId: currentJarId, status: 'ACTIVE' }
    });

    if (activeVote) {
        return NextResponse.json({ error: "Cannot add new ideas while a vote is in progress. Please wait for the voting round to finish." }, { status: 403 });
    }

    const { getLimits } = await import('@/lib/premium');
    const limits = getLimits(user);

    if (!limits.unlimitedIdeas) {
        const count = await prisma.idea.count({ where: { jarId: currentJarId } });
        if (count >= 25) {
            return NextResponse.json({
                error: "Limit reached: Free jars are limited to 25 ideas. Upgrade to Pro for unlimited ideas!"
            }, { status: 403 });
        }
    }

    try {
        const body = await request.json();
        const { description, indoor, duration, activityLevel, cost, timeOfDay, details, category, selectedAt, notes, address, website, googleRating, openingHours, rating, photoUrls, selectedDate, isPrivate } = body;

        if (!description) {
            return NextResponse.json({ error: 'Description is required' }, { status: 400 });
        }

        const finalCategory = category || (getCategoriesForTopic(jar.topic, (jar as any).customCategories as any[])[0]?.id || 'ACTIVITY');

        if (!isValidCategoryForTopic(finalCategory, jar.topic, (jar as any).customCategories as any[])) {
            const allowed = getCategoriesForTopic(jar.topic, (jar as any).customCategories as any[]).map(c => c.label).join(', ');
            return NextResponse.json({
                error: `The category "${finalCategory}" is not allowed in this "${jar.topic || 'General'}" jar. Please choose one of: ${allowed}`
            }, { status: 400 });
        }

        const createData: Prisma.IdeaUncheckedCreateInput = {
            description,
            details: details || null,
            indoor: Boolean(indoor),
            duration: typeof duration === 'string' ? parseFloat(duration) : Number(duration),
            activityLevel,
            cost,
            timeOfDay: timeOfDay || 'ANY',
            category: category || 'ACTIVITY',
            selectedAt: selectedAt ? new Date(selectedAt) : null,
            selectedDate: selectedDate ? new Date(selectedDate) : (selectedAt ? new Date(selectedAt) : null), // Use selectedDate if provided, else selectedAt
            jarId: currentJarId,
            createdById: session.user.id,
            notes: notes || null,
            address: address || null,
            website: website || null,
            googleRating: googleRating ? parseFloat(String(googleRating)) : null,
            openingHours: openingHours || null,
            rating: rating ? parseInt(String(rating)) : null,
            photoUrls: photoUrls || [],
            isPrivate: Boolean(isPrivate),
        };

        const idea = await prisma.idea.create({
            data: createData,
        });

        // Gamification: Award XP for adding an idea
        await awardXp(currentJarId, 15);
        await checkAndUnlockAchievements(currentJarId);

        return NextResponse.json(idea);
    } catch (error) {
        console.error('Error creating idea:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const session = await getSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch fresh user to get up-to-date activeJarId
    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentJarId = user.activeJarId || user.coupleId;

    if (!currentJarId) {
        return NextResponse.json([]); // No jar, no ideas
    }

    try {
        // Fetch all ideas for the couple (jar)
        // Note: The physical column in the DB is "coupleId" (mapped to "jarId" in Prisma schema)
        // so we must use "coupleId" in the raw query.

        // Wait, actually we WANT to include partner's unselected ideas so we can count them,
        // but we want to hide their details (description).

        // Let's re-fetch to get ALL unselected ideas for the couple, but we'll mask the ones not created by me.
        // Use raw query to ensure we get 'isSurprise' even if Prisma Client is stale
        // Fetch all ideas for the couple (jar) and include jar type
        const allIdeas: any[] = await prisma.$queryRaw`
            SELECT i.*, 
                   i."isPrivate",
                   json_build_object('id', u.id, 'name', u.name) as "createdBy",
                   c.type as "jarType",
                   c."selectionMode" as "selectionMode"
            FROM "Idea" i
            LEFT JOIN "User" u ON i."createdById" = u.id
            LEFT JOIN "Couple" c ON i."coupleId" = c.id
            WHERE i."coupleId" = ${currentJarId} 
            ORDER BY i."createdAt" DESC
        `;

        const maskedIdeas = allIdeas.map(idea => {
            const isMyIdea = idea.createdById === session.user.id;
            const isSelected = !!idea.selectedAt;
            const isSurprise = (idea as any).isSurprise;
            const isPrivate = (idea as any).isPrivate;
            const isGroupJar = (idea as any).jarType === 'SOCIAL';
            const isVotingJar = (idea as any).selectionMode === 'VOTING';

            // If it has been selected, show everything.
            if (isSelected) {
                return idea;
            }

            // Voting Jars: Everyone sees everything to vote (unless specifically private or a surprise)
            if (isVotingJar && !isSurprise && !isPrivate) {
                return idea;
            }

            // In Group Jars, everyone sees everything (unless specifically private or a surprise)
            if (isGroupJar && !isSurprise && !isPrivate) {
                return idea;
            }

            // If it's my idea, show it.
            if (isMyIdea) {
                return idea;
            }

            // If it is marked as private OR a Surprise Idea, hide from others until selected.
            if (isPrivate || isSurprise) {
                return {
                    ...idea,
                    description: isSurprise ? "Surprise Idea" : "??? (Secret Idea)",
                    details: isSurprise ? "This idea will be revealed when you spin the jar!" : "shhh... it's a secret!",
                    isMasked: true,
                };
            }

            // Otherwise, if not private and not owned by me, show it (as requested: "If they chose not to keep it a secret, it should be visible")
            return idea;
        });

        return NextResponse.json(maskedIdeas);
    } catch (error) {
        console.error('Error fetching ideas:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
