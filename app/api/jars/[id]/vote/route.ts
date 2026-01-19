import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyJarMembers } from '@/lib/notifications';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: jarId } = await context.params;
    const json = await request.json();
    const { action } = json;

    // Verify membership
    const membership = await prisma.jarMember.findUnique({
        where: { userId_jarId: { userId: session.user.id, jarId } }
    });

    if (!membership) {
        return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    try {
        switch (action) {
            case 'START':
                return handleStartVote(jarId, session.user.id, json, membership.role === 'ADMIN');
            case 'CAST':
                return handleCastVote(jarId, session.user.id, json);
            case 'CANCEL':
                if (membership.role !== 'ADMIN') return NextResponse.json({ error: "Admin only" }, { status: 403 });
                return handleCancelVote(jarId);
            case 'EXTEND':
                if (membership.role !== 'ADMIN') return NextResponse.json({ error: "Admin only" }, { status: 403 });
                return handleExtendVote(jarId);
            case 'RESOLVE':
                // Usually triggered automatically or by admin if stuck
                return handleResolveVote(jarId);
            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error: any) {
        console.error("Vote API Error:", error);
        return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
    }
}

async function handleStartVote(jarId: string, initiatorId: string, data: any, isAdmin: boolean) {
    if (!isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const { tieBreakerMode, timeLimitMinutes, mandatory } = data; // mandatory not fully used in logic yet but stored? Schema doesn't have it.

    // Check if active session exists
    const active = await prisma.voteSession.findFirst({
        where: { jarId, status: 'ACTIVE' }
    });

    if (active) {
        return NextResponse.json({ error: "A vote is already in progress" }, { status: 400 });
    }

    // Default 24 hours if no time limit? Or infinite?
    // User requested "Time limit for users to cast their votes can be set".
    let endTime = null;
    if (timeLimitMinutes) {
        endTime = new Date(Date.now() + timeLimitMinutes * 60000);
    }

    const session = await prisma.voteSession.create({
        data: {
            jarId,
            status: 'ACTIVE', // @ts-ignore
            tieBreakerMode: tieBreakerMode || 'RANDOM_PICK',
            endTime,
            // round: 1
        }
    });

    // Notify members
    await notifyJarMembers(jarId, initiatorId, {
        title: 'New Vote Started!',
        body: 'A new voting session has begun. Cast your vote now!',
        url: `/dashboard?jarId=${jarId}&mode=vote`
    }, 'notifyVoting');

    return NextResponse.json({ success: true, session });
}

async function handleCastVote(jarId: string, userId: string, data: any) {
    const { ideaId } = data;

    const session = await prisma.voteSession.findFirst({
        where: { jarId, status: 'ACTIVE' }
    });

    if (!session) {
        return NextResponse.json({ error: "No active vote" }, { status: 400 });
    }

    if (session.endTime && new Date() > session.endTime) {
        // Auto-resolve? 
        return NextResponse.json({ error: "Voting time has ended" }, { status: 400 });
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
        where: { sessionId_userId: { sessionId: session.id, userId } }
    });

    if (existingVote) {
        return NextResponse.json({ error: "You have already voted" }, { status: 400 });
    }

    // Check if idea is valid (and eligible if restricted)
    if (session.eligibleIdeaIds && session.eligibleIdeaIds.length > 0) {
        if (!session.eligibleIdeaIds.includes(ideaId)) {
            return NextResponse.json({ error: "Idea not eligible for this vote" }, { status: 400 });
        }
    }

    // Prevent Self-Voting: Fetch idea to check author
    const idea = await prisma.idea.findUnique({
        where: { id: ideaId }
    });

    if (!idea) {
        return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    if (idea.createdById === userId) {
        return NextResponse.json({ error: "You cannot vote for your own idea!" }, { status: 400 });
    }

    await prisma.vote.create({
        data: {
            sessionId: session.id,
            userId,
            ideaId
        }
    });

    return NextResponse.json({ success: true });
}

async function handleCancelVote(jarId: string) {
    const session = await prisma.voteSession.findFirst({
        where: { jarId, status: 'ACTIVE' }
    });

    if (!session) return NextResponse.json({ error: "No active vote" }, { status: 404 });

    await prisma.voteSession.update({
        where: { id: session.id }, // @ts-ignore
        data: { status: 'CANCELLED' }
    });

    return NextResponse.json({ success: true });
}

async function handleExtendVote(jarId: string) {
    // "Extend once by a set time period" - keeping it simple: adds 1 hour? Or param?
    // Let's add 1 hour for now.
    const session = await prisma.voteSession.findFirst({
        where: { jarId, status: 'ACTIVE' }
    });

    if (!session) return NextResponse.json({ error: "No active vote" }, { status: 404 });
    if (!session.endTime) return NextResponse.json({ error: "Vote has no time limit to extend" }, { status: 400 });

    await prisma.voteSession.update({
        where: { id: session.id },
        data: { endTime: new Date(session.endTime.getTime() + 60 * 60000) }
    });

    return NextResponse.json({ success: true });
}

async function handleResolveVote(jarId: string) {
    const session = await prisma.voteSession.findFirst({
        where: { jarId, status: 'ACTIVE' },
        include: { votes: true }
    });

    if (!session) return NextResponse.json({ error: "No active vote" }, { status: 404 });

    // Calculate results
    const voteCounts: Record<string, number> = {};
    session.votes.forEach(v => {
        voteCounts[v.ideaId] = (voteCounts[v.ideaId] || 0) + 1;
    });

    // Determine winner
    let maxVotes = 0;
    Object.values(voteCounts).forEach(c => maxVotes = Math.max(maxVotes, c));

    const winners = Object.keys(voteCounts).filter(id => voteCounts[id] === maxVotes);

    if (winners.length === 0) {
        // No votes cast?
        // Random pick from all? Or just end with no winner?
        // Let's just complete.
        await prisma.voteSession.update({
            where: { id: session.id }, // @ts-ignore
            data: { status: 'COMPLETED' }
        });
        return NextResponse.json({ message: "No votes cast", winners: [] });
    }

    if (winners.length === 1) {
        // Single winner
        await prisma.voteSession.update({
            where: { id: session.id }, // @ts-ignore
            data: { status: 'COMPLETED', winnerId: winners[0] }
        });

        // Mark idea as selected?
        // Usually Spin Jar "selects" the idea (removes from pool). 
        // Should Voting Jar remove it? Yes.
        await prisma.idea.update({
            where: { id: winners[0] },
            data: { selectedAt: new Date() }
        });

        // Notify winner
        await notifyJarMembers(jarId, null, { // null = notify everyone including trigger
            title: 'Vote Complete!',
            body: 'We have a winner! Tap to see the result.',
            url: `/dashboard?jarId=${jarId}`
        }, 'notifyVoting');

        return NextResponse.json({ success: true, winnerId: winners[0] });
    } else {
        // Tie
        if (session.tieBreakerMode === 'RANDOM_PICK') {
            const randomWinner = winners[Math.floor(Math.random() * winners.length)];
            await prisma.voteSession.update({
                where: { id: session.id }, // @ts-ignore
                data: { status: 'COMPLETED', winnerId: randomWinner }
            });
            await prisma.idea.update({
                where: { id: randomWinner },
                data: { selectedAt: new Date() }
            });
            // Notify tie result
            await notifyJarMembers(jarId, null, {
                title: 'Vote Tie!',
                body: 'The vote ended in a tie. A random winner was picked.',
                url: `/dashboard?jarId=${jarId}`
            }, 'notifyVoting');
            return NextResponse.json({ success: true, winnerId: randomWinner, method: 'RANDOM_TIEBREAK' });
        } else {
            // RE_VOTE
            // Start new session with ONLY these ideas
            // Mark current session completed
            await prisma.voteSession.update({
                where: { id: session.id }, // @ts-ignore
                data: { status: 'COMPLETED' }
            });

            // Start Round 2
            const round2 = await prisma.voteSession.create({
                data: {
                    jarId,
                    status: 'ACTIVE', // @ts-ignore
                    tieBreakerMode: 'RANDOM_PICK', // Force random pick for 3rd round? Or keep re-voting? Let's default to Random to prevent loops.
                    endTime: session.endTime ? new Date(Date.now() + 1000 * 60 * 60) : undefined, // Give 1 hour for run-off?
                    round: session.round + 1,
                    eligibleIdeaIds: winners
                }
            });
            // Notify re-vote
            await notifyJarMembers(jarId, null, {
                title: 'Vote Tie - Runoff!',
                body: 'The vote was a tie! A runoff round has started.',
                url: `/dashboard?jarId=${jarId}&mode=vote`
            }, 'notifyVoting');
            return NextResponse.json({ success: true, nextRound: round2 });
        }
    }
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id: jarId } = await context.params;
    const sessionUrl = await getSession();
    const userId = sessionUrl?.user?.id;

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const activeSession = await prisma.voteSession.findFirst({
        where: { jarId, status: 'ACTIVE' },
        include: { votes: true }
    });

    // Lazy Auto-Resolve: If session expired, resolve it now
    if (activeSession?.endTime && new Date() > activeSession.endTime) {
        return handleResolveVote(jarId);
    }

    if (!activeSession) {
        // Check for recently completed (to show calculation results?)
        const lastCompleted = await prisma.voteSession.findFirst({
            where: { jarId, status: 'COMPLETED' },
            orderBy: { createdAt: 'desc' },
            include: { winner: true }
        });

        // Get Jar Name and Admin Name for "Waiting" screen
        const adminMember = await prisma.jarMember.findFirst({
            where: { jarId, role: 'ADMIN' },
            include: { user: true }
        });

        return NextResponse.json({
            active: false,
            lastResult: lastCompleted,
            adminName: adminMember?.user.name || 'Admin'
        });
    }

    // Compute who voted (securely)
    const hasVoted = activeSession.votes.some(v => v.userId === userId);

    // Admin info: who hasn't voted
    // Need list of all jar members
    const allMembers = await prisma.jarMember.findMany({
        where: { jarId },
        include: { user: true }
    });

    const votedUserIds = new Set(activeSession.votes.map(v => v.userId));
    const pendingVoters = allMembers
        .filter(m => !votedUserIds.has(m.userId))
        .map(m => ({ id: m.userId, name: m.user.name }));

    return NextResponse.json({
        active: true,
        session: {
            id: activeSession.id,
            startTime: activeSession.startTime,
            endTime: activeSession.endTime,
            round: activeSession.round,
            eligibleIdeaIds: activeSession.eligibleIdeaIds,
        },
        hasVoted,
        votesCast: activeSession.votes.length,
        totalMembers: allMembers.length,
        pendingVoters // Frontend should only show this if isAdmin (handled in UI, or filter here if strict)
    });
}
