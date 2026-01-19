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
    return { session, membership, isAdmin: membership.role === 'ADMIN' || membership.role === 'OWNER' };
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

    // Fetch Jar and Ideas to determine eligibility
    const jar = await prisma.jar.findUnique({
        where: { id: jarId },
        include: { ideas: { where: { status: 'APPROVED', selectedAt: null } } }
    });

    if (!jar) return { error: "Jar not found", status: 404 };
    if (jar.ideas.length === 0) return { error: "Jar is empty! Add ideas first.", status: 400 };

    // Determine eligible ideas (Runoff / Shortlist Logic)
    let eligibleIdeaIds: string[] = [];
    const candidatesCount = (jar as any).voteCandidatesCount || 0;

    if (candidatesCount > 0) {
        const shuffled = [...jar.ideas].sort(() => 0.5 - Math.random());
        const count = Math.min(candidatesCount, jar.ideas.length);
        eligibleIdeaIds = shuffled.slice(0, count).map(i => i.id);
    } else {
        eligibleIdeaIds = jar.ideas.map(i => i.id);
    }

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
            eligibleIdeaIds: eligibleIdeaIds.length > 0 ? eligibleIdeaIds : undefined
        }
    });

    // POINTLESS VOTE DETECTION:
    // 1. Only 1 idea eligible? Immediate win.
    // 2. 2 people, 2 ideas, each suggested 1? Guaranteed tie, resolve now.
    const activeMembers = await prisma.jarMember.findMany({
        where: { jarId, status: 'ACTIVE' }
    });

    let autoResolveReason = null;
    let finalWinnerId = null;

    if (eligibleIdeaIds.length === 1) {
        autoResolveReason = "Only one choice available.";
        finalWinnerId = eligibleIdeaIds[0];
    } else if (eligibleIdeaIds.length === 2 && activeMembers.length === 2) {
        // Fetch ideas to check authors
        const ideas = await prisma.idea.findMany({
            where: { id: { in: eligibleIdeaIds } }
        });
        const authors = new Set(ideas.map(i => i.createdById));
        if (authors.size === 2) {
            autoResolveReason = "Guaranteed tie in 2-person jar. Picking at random.";
            finalWinnerId = eligibleIdeaIds[Math.floor(Math.random() * 2)];
        }
    }

    if (finalWinnerId) {
        console.log(`[Vote] Pointless scenario detected: ${autoResolveReason}`);
        await prisma.voteSession.update({
            where: { id: session.id },
            data: { status: 'COMPLETED', winnerId: finalWinnerId }
        });
        await prisma.idea.update({
            where: { id: finalWinnerId },
            data: { selectedAt: new Date() }
        });
        await notifyJarMembers(jarId, null, {
            title: 'Quick Result!',
            body: `${autoResolveReason} Winner: Selected automatically.`,
            url: `/dashboard?jarId=${jarId}`
        }, 'notifyVoting');

        revalidatePath('/dashboard');
        const winnerIdea = await prisma.idea.findUnique({ where: { id: finalWinnerId } });
        return { success: true, winnerId: finalWinnerId, idea: winnerIdea, note: autoResolveReason };
    }

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

    // AUTO-RESOLVE LOGIC:
    // Fetch updated session with all votes to check if everyone is done
    const updatedSession = await prisma.voteSession.findUnique({
        where: { id: session.id },
        include: { votes: true }
    });

    const totalEligibleVoters = await getEligibleVoterCount(jarId, session.eligibleIdeaIds || []);

    if (updatedSession && updatedSession.votes.length >= totalEligibleVoters) {
        console.log(`[Vote] Auto-resolving session ${session.id} as all ${totalEligibleVoters} eligible members voted.`);
        const resolution = await resolveVote(jarId);
        return resolution;
    } else {
        revalidatePath('/dashboard');
    }

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
        data: {
            endTime: new Date(session.endTime.getTime() + 60 * 60000),
            status: 'ACTIVE' // In case it was somehow marked as something else
        }
    });

    revalidatePath('/dashboard');
    return { success: true };
}

import { notifyJarMembers } from '@/lib/notifications';

export async function resolveVote(jarId: string) {
    const auth = await checkAuth(jarId);
    if ('error' in auth) return auth;

    const session = await prisma.voteSession.findFirst({
        where: { jarId, status: 'ACTIVE' },
        include: { votes: true }
    });

    if (!session) return { error: "No active vote", status: 404 };

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

        await notifyJarMembers(jarId, null, {
            title: 'Vote Complete!',
            body: 'We have a winner! Tap to see the result.',
            url: `/dashboard?jarId=${jarId}`
        }, 'notifyVoting');

        const winnerIdea = await prisma.idea.findUnique({ where: { id: winners[0] } });

        revalidatePath('/dashboard');
        return { success: true, winnerId: winners[0], idea: winnerIdea };
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

            await notifyJarMembers(jarId, null, {
                title: 'Vote Tie Result',
                body: 'The vote was a tie! A random winner was selected.',
                url: `/dashboard?jarId=${jarId}`
            }, 'notifyVoting');

            const winnerIdea = await prisma.idea.findUnique({ where: { id: randomWinner } });

            revalidatePath('/dashboard');
            return { success: true, winnerId: randomWinner, method: 'RANDOM_TIEBREAK', idea: winnerIdea };
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

            await notifyJarMembers(jarId, null, {
                title: 'Vote Tie - Runoff Round!',
                body: 'The vote was a tie! A runoff round has started with the top choices.',
                url: `/dashboard?jarId=${jarId}&mode=vote`
            }, 'notifyVoting');

            revalidatePath('/dashboard');
            return { success: true, nextRound: round2 };
        }
    }
}

async function getEligibleVoterCount(jarId: string, eligibleIdeaIds: string[]) {
    // If pool is empty, get all available
    let poolIds = eligibleIdeaIds;
    if (poolIds.length === 0) {
        const ideas = await prisma.idea.findMany({
            where: { jarId, status: 'APPROVED', selectedAt: null },
            select: { id: true }
        });
        poolIds = ideas.map(i => i.id);
    }

    const poolIdeas = await prisma.idea.findMany({
        where: { id: { in: poolIds } },
        select: { createdById: true }
    });

    const members = await prisma.jarMember.findMany({
        where: { jarId, status: 'ACTIVE' },
        select: { userId: true }
    });

    let eligibleCount = 0;
    for (const member of members) {
        if (poolIdeas.some(idea => idea.createdById !== member.userId)) {
            eligibleCount++;
        }
    }
    return eligibleCount || 1; // Always at least 1 person or it shouldn't have started
}
