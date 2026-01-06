'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Reusable membership check
async function checkAuth(jarId: string) {
    const session = await getSession();
    if (!session?.user?.id) return { error: "Unauthorized", status: 401 };

    const membership = await prisma.jarMember.findUnique({
        where: { userId_jarId: { userId: session.user.id, jarId } }
    });

    if (!membership) return { error: "Not a member", status: 403 };
    return { session, membership, isAdmin: membership.role === 'ADMIN' };
}

export async function startVote(jarId: string, options: any) {
    const auth = await checkAuth(jarId);
    if ('error' in auth) return auth;
    if (!auth.isAdmin) return { error: "Admin only", status: 403 };

    const { tieBreakerMode, timeLimitMinutes, mandatory } = options;

    const active = await prisma.voteSession.findFirst({
        where: { jarId, status: 'ACTIVE' }
    });

    if (active) return { error: "A vote is already in progress", status: 400 };

    let endTime = null;
    if (timeLimitMinutes) {
        endTime = new Date(Date.now() + timeLimitMinutes * 60000);
    }

    const session = await prisma.voteSession.create({
        data: {
            jarId,
            status: 'ACTIVE',
            tieBreakerMode: tieBreakerMode || 'RANDOM_PICK',
            endTime,
        }
    });

    revalidatePath('/dashboard');
    return { success: true, session };
}

export async function castVote(jarId: string, ideaId: string) {
    const auth = await checkAuth(jarId);
    if ('error' in auth) return auth;
    const userId = auth.session.user.id;

    const session = await prisma.voteSession.findFirst({
        where: { jarId, status: 'ACTIVE' }
    });

    if (!session) return { error: "No active vote", status: 400 };

    if (session.endTime && new Date() > session.endTime) {
        return { error: "Voting time has ended", status: 400 };
    }

    const existingVote = await prisma.vote.findUnique({
        where: { sessionId_userId: { sessionId: session.id, userId } }
    });

    if (existingVote) return { error: "You have already voted", status: 400 };

    if (session.eligibleIdeaIds && session.eligibleIdeaIds.length > 0) {
        if (!session.eligibleIdeaIds.includes(ideaId)) {
            return { error: "Idea not eligible for this vote", status: 400 };
        }
    }

    const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
    if (!idea) return { error: "Idea not found", status: 404 };

    if (idea.createdById === userId) {
        return { error: "You cannot vote for your own idea!", status: 400 };
    }

    await prisma.vote.create({
        data: {
            sessionId: session.id,
            userId,
            ideaId
        }
    });

    revalidatePath('/dashboard');
    return { success: true };
}

export async function cancelVote(jarId: string) {
    const auth = await checkAuth(jarId);
    if ('error' in auth) return auth;
    if (!auth.isAdmin) return { error: "Admin only", status: 403 };

    const session = await prisma.voteSession.findFirst({
        where: { jarId, status: 'ACTIVE' }
    });

    if (!session) return { error: "No active vote", status: 404 };

    await prisma.voteSession.update({
        where: { id: session.id },
        data: { status: 'CANCELLED' }
    });

    revalidatePath('/dashboard');
    return { success: true };
}

export async function extendVote(jarId: string) {
    const auth = await checkAuth(jarId);
    if ('error' in auth) return auth;
    if (!auth.isAdmin) return { error: "Admin only", status: 403 };

    const session = await prisma.voteSession.findFirst({
        where: { jarId, status: 'ACTIVE' }
    });

    if (!session) return { error: "No active vote", status: 404 };
    if (!session.endTime) return { error: "Vote has no time limit to extend", status: 400 };

    await prisma.voteSession.update({
        where: { id: session.id },
        data: { endTime: new Date(session.endTime.getTime() + 60 * 60000) }
    });

    revalidatePath('/dashboard');
    return { success: true };
}

export async function resolveVote(jarId: string) {
    const auth = await checkAuth(jarId);
    if ('error' in auth) return auth;
    // Anyone can trigger resolve if authorized (lazy resolution)? Or logic restricted?
    // Route said: "Usually triggered automatically or by admin if stuck".
    // We allow any member to trigger lazy resolution indirectly via GET, so direct calls are fine if Auth'd.

    const session = await prisma.voteSession.findFirst({
        where: { jarId, status: 'ACTIVE' },
        include: { votes: true }
    });

    if (!session) return { error: "No active vote", status: 404 };

    // ... Logic copied from route ...
    const voteCounts: Record<string, number> = {};
    session.votes.forEach(v => {
        voteCounts[v.ideaId] = (voteCounts[v.ideaId] || 0) + 1;
    });

    let maxVotes = 0;
    Object.values(voteCounts).forEach(c => maxVotes = Math.max(maxVotes, c));

    const winners = Object.keys(voteCounts).filter(id => voteCounts[id] === maxVotes);

    if (winners.length === 0) {
        await prisma.voteSession.update({
            where: { id: session.id },
            data: { status: 'COMPLETED' }
        });
        revalidatePath('/dashboard');
        return { message: "No votes cast", winners: [] };
    }

    if (winners.length === 1) {
        await prisma.voteSession.update({
            where: { id: session.id },
            data: { status: 'COMPLETED', winnerId: winners[0] }
        });
        await prisma.idea.update({
            where: { id: winners[0] },
            data: { selectedAt: new Date() }
        });
        revalidatePath('/dashboard');
        return { success: true, winnerId: winners[0] };
    } else {
        // Tie
        if (session.tieBreakerMode === 'RANDOM_PICK') {
            const randomWinner = winners[Math.floor(Math.random() * winners.length)];
            await prisma.voteSession.update({
                where: { id: session.id },
                data: { status: 'COMPLETED', winnerId: randomWinner }
            });
            await prisma.idea.update({
                where: { id: randomWinner },
                data: { selectedAt: new Date() }
            });
            revalidatePath('/dashboard');
            return { success: true, winnerId: randomWinner, method: 'RANDOM_TIEBREAK' };
        } else {
            // RE_VOTE
            await prisma.voteSession.update({
                where: { id: session.id },
                data: { status: 'COMPLETED' }
            });

            const round2 = await prisma.voteSession.create({
                data: {
                    jarId,
                    status: 'ACTIVE',
                    tieBreakerMode: 'RANDOM_PICK',
                    endTime: session.endTime ? new Date(Date.now() + 1000 * 60 * 60) : undefined,
                    round: session.round + 1,
                    eligibleIdeaIds: winners
                }
            });
            revalidatePath('/dashboard');
            return { success: true, nextRound: round2 };
        }
    }
}
