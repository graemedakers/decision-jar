import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma, SelectionMode } from '@prisma/client';
import { NextResponse } from 'next/server';
import { awardXp } from '@/lib/gamification';

export const dynamic = 'force-dynamic';
import { checkAndUnlockAchievements } from '@/lib/achievements';
import { isValidCategoryForTopic, getCategoriesForTopic, getBestCategoryFit } from '@/lib/categories';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { memberships: true }
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Priority: 1. activeJarId, 2. First membership
    const currentJarId = user.activeJarId ||
        (user.memberships?.[0]?.jarId);

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

    const { getFeatureLimits } = await import('@/lib/premium-utils');
    const limits = getFeatureLimits(user);



    try {
        const body = await request.json();
        const { description, indoor, duration, activityLevel, cost, timeOfDay, details, category, selectedAt, notes, address, website, googleRating, openingHours, rating, photoUrls, selectedDate, isPrivate, weather, requiresTravel } = body;

        if (!description) {
            return NextResponse.json({ error: 'Description is required' }, { status: 400 });
        }

        const requestedCategory = category || 'ACTIVITY';
        const finalCategory = getBestCategoryFit(requestedCategory, jar.topic, (jar as any).customCategories as any[]);

        // Verify Membership and Role
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: { userId: session.user.id, jarId: currentJarId }
            }
        });

        if (!membership) {
            return NextResponse.json({ error: 'You are not a member of this jar' }, { status: 403 });
        }

        const isAdmin = membership.role === 'ADMIN';

        // NEW: Status logic
        // If it's a community jar and the contributor isn't an admin, it's PENDING.
        // Otherwise it's APPROVED (standard behavior for private/romantic jars).
        const ideaStatus = (jar.isCommunityJar && !isAdmin) ? 'PENDING' : 'APPROVED';

        const safeDuration = typeof duration === 'string' ? parseFloat(duration) : Number(duration);

        const createData: Prisma.IdeaUncheckedCreateInput = {
            description,
            details: details || null,
            indoor: Boolean(indoor),
            duration: isNaN(safeDuration) ? 2.0 : safeDuration, // Default to 2.0 if invalid
            activityLevel,
            cost,
            timeOfDay: timeOfDay || 'ANY',
            category: finalCategory,
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
            weather: weather || 'ANY',
            requiresTravel: Boolean(requiresTravel),
            status: ideaStatus as any, // Cast to any to avoid Prisma stale type issues
        };

        const idea = await prisma.idea.create({
            data: createData,
        });

        // Gamification: Award XP for adding an idea
        try {
            await awardXp(currentJarId, 15);
            await checkAndUnlockAchievements(currentJarId);
        } catch (xpError) {
            console.error("Gamification error during idea creation:", xpError);
            // Non-blocking
        }

        return NextResponse.json(idea);
    } catch (error: any) {
        console.error('Error creating idea:', error);
        return NextResponse.json({ error: `Failed to create idea: ${error.message || 'Unknown error'}` }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch fresh user to get up-to-date activeJarId
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { memberships: true }
    });
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentJarId = user.activeJarId ||
        (user.memberships?.[0]?.jarId);

    if (!currentJarId) {
        return NextResponse.json([]); // No jar, no ideas
    }

    try {
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: { userId: session.user.id, jarId: currentJarId }
            }
        });

        if (!membership) {
            return NextResponse.json({ error: 'You are not a member of this jar' }, { status: 403 });
        }

        const isAdmin = membership.role === 'ADMIN';

        // Use standard Prisma findMany with relations
        const ideas = await prisma.idea.findMany({
            where: {
                jarId: currentJarId,
                OR: [
                    { status: 'APPROVED' },
                    { createdById: session.user.id },
                    ...(isAdmin ? [{}] : []) // Admin sees everything
                ]
            },
            include: {
                createdBy: {
                    select: { id: true, name: true }
                },
                jar: {
                    select: {
                        type: true,
                        selectionMode: true,
                        isCommunityJar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const maskedIdeas = ideas.map(idea => {
            const isMyIdea = idea.createdById === session.user.id;
            const isSelected = !!idea.selectedAt;
            const isSurprise = idea.isSurprise;
            const isPrivate = idea.isPrivate;
            const isGroupJar = idea.jar.type === 'SOCIAL';
            const isCommunityJar = idea.jar.isCommunityJar;
            const isVotingJar = idea.jar.selectionMode === SelectionMode.VOTING;

            let processedIdea: any = {
                ...idea,
                // Flatten relation data for frontend compatibility if needed, though frontend likely handles it.
                // Keeping flattened structure to match raw query response shape for safety:
                jarType: idea.jar.type,
                selectionMode: idea.jar.selectionMode,
                isCommunityJar: idea.jar.isCommunityJar,
                createdBy: idea.createdBy // Kept as object
            };

            // Apply Masking Logic (Skip for Community Jars, or Admin in Admin Pick Mode)
            const isAdminPick = idea.jar.selectionMode === 'ADMIN_PICK';
            if (!isSelected && !isMyIdea && !isCommunityJar && !(isAdmin && isAdminPick)) {
                // Voting Jars: Everyone sees everything to vote (unless specifically private or a surprise)
                if (isVotingJar && (isSurprise || isPrivate)) {
                    processedIdea = {
                        ...processedIdea,
                        description: isSurprise ? "Surprise Idea" : "??? (Secret Idea)",
                        details: isSurprise ? "This idea will be revealed when you spin the jar!" : "shhh... it's a secret!",
                        isMasked: true,
                    };
                }
                // In Group Jars, everyone sees everything (unless specifically private or a surprise)
                else if (isGroupJar && (isSurprise || isPrivate)) {
                    processedIdea = {
                        ...processedIdea,
                        description: isSurprise ? "Surprise Idea" : "??? (Secret Idea)",
                        details: isSurprise ? "This idea will be revealed when you spin the jar!" : "shhh... it's a secret!",
                        isMasked: true,
                    };
                }
                // Romantic/Other jars: hide if private or surprise
                else if (!isVotingJar && !isGroupJar && (isPrivate || isSurprise)) {
                    processedIdea = {
                        ...processedIdea,
                        description: isSurprise ? "Surprise Idea" : "??? (Secret Idea)",
                        details: isSurprise ? "This idea will be revealed when you spin the jar!" : "shhh... it's a secret!",
                        isMasked: true,
                    };
                }
            }

            // Allocation Mode:
            // If assigned to someone else, hide it or mark as "Assigned to X".
            const assignedToId = idea.assignedToId;
            if (assignedToId && assignedToId !== session.user.id && !isAdmin) {
                processedIdea = {
                    ...processedIdea,
                    description: "Secret Task",
                    details: "This task is assigned to another member.",
                    isMasked: true,
                };
            }

            // Admin Pick Mode:
            // Members can only see the ideas they added. Admin sees all.
            if (isAdminPick && !isAdmin && !isMyIdea && !isSelected) {
                return null;
            }

            // Append permission flags
            return {
                ...processedIdea,
                canEdit: isMyIdea || isAdmin,
                canDelete: isMyIdea || isAdmin
            };
        }).filter(Boolean);

        return NextResponse.json(maskedIdeas);

    } catch (error) {
        console.error('Error fetching ideas:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
