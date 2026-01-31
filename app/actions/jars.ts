'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateUniqueJarCode } from '@/lib/utils';
import { checkRateLimit } from '@/lib/rate-limit';
import { revalidatePath } from 'next/cache';
import { Jar } from '@prisma/client';
import { validatePremiumToken, recordTokenUsage } from '@/lib/premium-token-validator';

export type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
    status?: number;
    code?: string;
};

export async function removeMember(jarId: string, targetUserId: string): Promise<ActionResponse<void>> {
    try {
        const auth = await checkAuthAndRateLimit();
        if ('error' in auth) return { success: false, error: auth.error, status: auth.status };
        const { userId } = auth;

        // Verify that the person removing is an OWNER or ADMIN
        const currentUserMembership = await prisma.jarMember.findUnique({
            where: { userId_jarId: { userId, jarId } }
        });

        if (!currentUserMembership || (currentUserMembership.role !== 'OWNER' && currentUserMembership.role !== 'ADMIN')) {
            return { success: false, error: "Only jar owners and admins can remove members", status: 403 };
        }

        // Verify targeting another user
        const targetMember = await prisma.jarMember.findUnique({
            where: { userId_jarId: { userId: targetUserId, jarId } }
        });

        if (!targetMember) {
            return { success: false, error: "Member not found in this jar", status: 404 };
        }

        // Prevent removing the last owner (if relevant) or yourself (use leaveJar for that)
        if (targetMember.role === 'OWNER') {
            return { success: false, error: "Cannot remove the jar owner. Transfer ownership first.", status: 400 };
        }

        await prisma.jarMember.delete({
            where: { id: targetMember.id }
        });

        revalidatePath('/dashboard');
        revalidatePath('/jar');

        return { success: true };

    } catch (error: any) {
        console.error("Remove Member Action Error:", error);
        return { success: false, error: "Internal Server Error", status: 500 };
    }
}

export async function updateMemberRole(jarId: string, targetUserId: string, newRole: "ADMIN" | "MEMBER"): Promise<ActionResponse<void>> {
    try {
        const auth = await checkAuthAndRateLimit();
        if ('error' in auth) return { success: false, error: auth.error, status: auth.status };
        const { userId } = auth;

        // Verify that the person updating is an OWNER or ADMIN
        const currentUserMembership = await prisma.jarMember.findUnique({
            where: { userId_jarId: { userId, jarId } }
        });

        if (!currentUserMembership || (currentUserMembership.role !== 'OWNER' && currentUserMembership.role !== 'ADMIN')) {
            return { success: false, error: "Only jar owners and admins can update member roles", status: 403 };
        }

        // Verify targeting another user
        const targetMember = await prisma.jarMember.findUnique({
            where: { userId_jarId: { userId: targetUserId, jarId } }
        });

        if (!targetMember) {
            return { success: false, error: "Member not found in this jar", status: 404 };
        }

        if (targetMember.role === 'OWNER') {
            return { success: false, error: "Cannot modify the jar owner's role", status: 400 };
        }

        await prisma.jarMember.update({
            where: { id: targetMember.id },
            data: { role: newRole }
        });

        revalidatePath('/dashboard');
        revalidatePath('/jar');

        return { success: true };

    } catch (error: any) {
        console.error("Update Member Role Action Error:", error);
        return { success: false, error: "Internal Server Error", status: 500 };
    }
}


export type CreateJarInput = {
    name: string;
    type?: string;
    selectionMode?: string;
    topic?: string;
    customCategories?: any;
    voteCandidatesCount?: number;
    defaultIdeaPrivate?: boolean;
};

export type UpdateJarInput = {
    name?: string;
    topic?: string;
    customCategories?: any;
    selectionMode?: string;
    voteCandidatesCount?: number;
    defaultIdeaPrivate?: boolean;
    isGiftable?: boolean;
};

// Helper: Check Auth & Rate Limit
async function checkAuthAndRateLimit() {
    const session = await getSession();
    if (!session?.user?.id) {
        return { error: "Unauthorized", status: 401 };
    }

    const userForLimit = {
        id: session.user.id,
        email: session.user.email || ""
    };
    const limitRes = await checkRateLimit(userForLimit);
    if (!limitRes.allowed) {
        return { error: "Too Many Requests", status: 429 };
    }

    return { session, userId: session.user.id };
}

export async function createJar(data: CreateJarInput): Promise<ActionResponse<Jar>> {
    try {
        const auth = await checkAuthAndRateLimit();
        if ('error' in auth) return { success: false, error: auth.error, status: auth.status };
        const { userId } = auth;

        if (!data.name) return { success: false, error: "Name is required", status: 400 };

        const dbUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!dbUser) return { success: false, error: "User not found", status: 404 };

        // Plan Checks
        const userJarsCount = await prisma.jarMember.count({
            where: {
                userId: userId,
                role: { in: ['OWNER', 'ADMIN'] as any }
            }
        });

        const { getFeatureLimits } = await import('@/lib/premium-utils');
        const limits = getFeatureLimits(dbUser);
        const maxJars = limits.maxJars;

        if (userJarsCount >= maxJars) {
            return {
                success: false,
                error: `Plan limit reached. You can have up to ${maxJars} jars on your current plan.`,
                code: "LIMIT_REACHED",
                status: 403
            };
        }

        const code = await generateUniqueJarCode();

        const jar = await prisma.jar.create({
            data: {
                name: data.name,
                type: (data.type as any) || 'SOCIAL',
                selectionMode: (data.selectionMode as any) || 'RANDOM',
                topic: data.topic || 'General',
                customCategories: data.customCategories ? data.customCategories : undefined,
                voteCandidatesCount: data.voteCandidatesCount ? Number(data.voteCandidatesCount) : 0,
                defaultIdeaPrivate: !!data.defaultIdeaPrivate,
                referenceCode: code,
                members: {
                    create: {
                        userId: userId,
                        role: 'OWNER' as any,
                        status: 'ACTIVE'
                    }
                }
            }
        });

        // Auto-switch user to this jar
        await prisma.user.update({
            where: { id: userId },
            data: { activeJarId: jar.id }
        });

        revalidatePath('/dashboard');
        return { success: true, data: jar };

    } catch (error: any) {
        console.error("[JAR_CREATE]", error);
        return { success: false, error: "Internal Error", status: 500 };
    }
}

export async function updateJar(jarId: string, data: UpdateJarInput): Promise<ActionResponse<Jar>> {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized", status: 401 };

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                memberships: {
                    where: { jarId: jarId },
                    include: { jar: true }
                }
            }
        });

        if (!user) return { success: false, error: "User not found", status: 404 };

        const membership = user.memberships.find(m => m.jarId === jarId);
        if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
            return { success: false, error: "Only admins can update jar settings", status: 403 };
        }

        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.topic !== undefined) updateData.topic = data.topic;
        if (data.customCategories !== undefined) updateData.customCategories = data.customCategories;
        if (data.voteCandidatesCount !== undefined) updateData.voteCandidatesCount = Number(data.voteCandidatesCount);
        if (data.defaultIdeaPrivate !== undefined) updateData.defaultIdeaPrivate = !!data.defaultIdeaPrivate;
        if (data.isGiftable !== undefined) updateData.isGiftable = !!data.isGiftable;

        if (data.selectionMode !== undefined) {
            if (data.selectionMode === 'VOTE') {
                const jar = membership.jar;
                if (jar.isMysteryMode) {
                    return { success: false, error: "Voting is not allowed for mystery jars", status: 400 };
                }
                const memberCount = await prisma.jarMember.count({
                    where: { jarId: jarId, status: 'ACTIVE' }
                });
                if (memberCount < 3) {
                    return { success: false, error: "Group voting requires at least 3 members", status: 400 };
                }
            } else if (membership.jar.selectionMode === 'VOTE' && data.selectionMode !== 'VOTE') {
                // Changing FROM Vote TO something else -> Cancel active votes
                await prisma.voteSession.updateMany({
                    where: { jarId: jarId, status: 'ACTIVE' },
                    data: { status: 'CANCELLED' }
                });
            }
            updateData.selectionMode = data.selectionMode;
        }

        const updatedJar = await prisma.jar.update({
            where: { id: jarId },
            data: updateData
        });

        revalidatePath(`/dashboard`);
        revalidatePath(`/jar/${jarId}`);
        return { success: true, data: updatedJar };

    } catch (error: any) {
        console.error("[JAR_UPDATE_ERROR]", error);
        return { success: false, error: error.message || "Internal Server Error", status: 500 };
    }
}

export async function deleteJar(jarId: string): Promise<ActionResponse<void>> {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized", status: 401 };

        const membership = await prisma.jarMember.findFirst({
            where: {
                jarId: jarId,
                userId: session.user.id
            }
        });

        if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
            return { success: false, error: "Forbidden: Only admins can delete a jar.", status: 403 };
        }

        await prisma.$transaction(async (tx) => {
            // 1. Clear activeJarId
            await tx.user.updateMany({
                where: { activeJarId: jarId },
                data: { activeJarId: null }
            });

            // 2. Cleanup GiftTokens logic
            const gifts = await tx.giftToken.findMany({
                where: { sourceJarId: jarId },
                select: { id: true }
            });
            const giftIds = gifts.map(g => g.id);

            if (giftIds.length > 0) {
                await tx.jar.updateMany({
                    where: { sourceGiftId: { in: giftIds } },
                    data: { sourceGiftId: null }
                });
                await tx.giftToken.deleteMany({
                    where: { id: { in: giftIds } }
                });
            }

            // 3. Delete Jar (Cascades handle the rest)
            await tx.jar.delete({ where: { id: jarId } });
        }, {
            timeout: 20000
        });

        revalidatePath('/dashboard');
        return { success: true };

    } catch (error: any) {
        console.error("Delete Error:", error);
        return { success: false, error: `Failed to delete jar: ${error.message || "Unknown error"}`, status: 500 };
    }
}

export async function leaveJar(jarId: string): Promise<ActionResponse<void>> {
    try {
        const auth = await checkAuthAndRateLimit();
        if ('error' in auth) return { success: false, error: auth.error, status: auth.status };
        const { userId } = auth;

        // Check membership
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: { userId, jarId }
            }
        });

        if (!membership) {
            return { success: false, error: "Not a member", status: 400 };
        }

        // Prevent last admin/owner from leaving
        if (['ADMIN', 'OWNER'].includes(membership.role)) {
            const adminCount = await prisma.jarMember.count({
                where: { jarId, role: { in: ['ADMIN', 'OWNER'] }, status: 'ACTIVE' }
            });
            if (adminCount <= 1) {
                return { success: false, error: "You are the only admin/owner. Assign another admin before leaving or delete the jar.", status: 400 };
            }
        }

        // Remove member
        await prisma.jarMember.delete({
            where: { userId_jarId: { userId, jarId } }
        });

        // Auto-revert to RANDOM if members < 3
        const jar = await prisma.jar.findUnique({
            where: { id: jarId },
            select: { selectionMode: true }
        });

        if (jar?.selectionMode === 'VOTE') {
            const memberCount = await prisma.jarMember.count({
                where: { jarId, status: 'ACTIVE' }
            });
            if (memberCount < 3) {
                await prisma.jar.update({
                    where: { id: jarId },
                    data: { selectionMode: 'RANDOM' }
                });
            }
        }

        revalidatePath('/dashboard');
        return { success: true };

    } catch (error: any) {
        console.error("[JAR_LEAVE]", error);
        return { success: false, error: "Internal Error", status: 500 };
    }
}

export async function emptyJar(jarId: string): Promise<ActionResponse<{ count: number }>> {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized", status: 401 };

        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    jarId,
                    userId: session.user.id
                }
            }
        });

        if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
            return { success: false, error: "Only the jar owner or admin can empty the jar.", status: 403 };
        }

        // 1. Get contexts for cleanup
        const ideas = await prisma.idea.findMany({
            where: { jarId },
            select: { id: true }
        });
        const ideaIds = ideas.map(i => i.id);

        const sessions = await prisma.voteSession.findMany({
            where: { jarId },
            select: { id: true }
        });
        const sessionIds = sessions.map(s => s.id);

        let deletedCount = 0;

        await prisma.$transaction(async (tx) => {
            if (sessionIds.length > 0) {
                await tx.voteSession.updateMany({
                    where: { id: { in: sessionIds } },
                    data: { winnerId: null }
                });
            }

            if (ideaIds.length > 0) {
                await tx.vote.deleteMany({
                    where: { ideaId: { in: ideaIds } }
                });
            }

            if (sessionIds.length > 0) {
                await tx.vote.deleteMany({
                    where: { sessionId: { in: sessionIds } }
                });
            }

            const result = await tx.idea.deleteMany({
                where: { jarId }
            });

            deletedCount = result.count;
        });

        revalidatePath(`/jar/${jarId}`);
        return { success: true, data: { count: deletedCount } };

    } catch (error: any) {
        console.error("[JAR_EMPTY]", error);
        return { success: false, error: error.message || "Internal Server Error", status: 500 };
    }
}

export async function regenerateJarCode(jarId: string): Promise<ActionResponse<{ newCode: string }>> {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized", status: 401 };

        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    jarId,
                    userId: session.user.id
                }
            }
        });

        if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
            return { success: false, error: 'Only jar owners or admins can regenerate the invite code', status: 403 };
        }

        const newCode = await generateUniqueJarCode();

        await prisma.jar.update({
            where: { id: jarId },
            data: { referenceCode: newCode }
        });

        revalidatePath(`/jar/${jarId}`);
        return { success: true, data: { newCode } };

    } catch (error: any) {
        console.error("[JAR_REGEN_CODE]", error);
        return { success: false, error: error.message || "Internal Server Error", status: 500 };
    }
}

export async function getJars(): Promise<ActionResponse<any[]>> {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized", status: 401 };

        const jars = await prisma.jar.findMany({
            where: {
                members: {
                    some: {
                        userId: session.user.id
                    }
                }
            },
            include: {
                members: {
                    where: { userId: session.user.id }
                },
                _count: {
                    select: { members: true, ideas: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const result = jars.map(j => ({
            id: j.id,
            name: j.name,
            role: j.members[0]?.role || "MEMBER",
            memberCount: j._count.members,
            ideaCount: j._count.ideas,
            createdAt: j.createdAt.toISOString(),
            topic: j.topic,
            referenceCode: ["OWNER", "ADMIN"].includes(j.members[0]?.role || "") ? j.referenceCode : undefined
        }));

        return { success: true, data: result };

    } catch (error: any) {
        console.error("[GET_JARS]", error);
        return { success: false, error: "Internal Error", status: 500 };
    }
}

export async function getJarDetails(jarId: string): Promise<ActionResponse<any>> {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized", status: 401 };

        const jar = await prisma.jar.findUnique({
            where: { id: jarId },
            include: {
                members: {
                    select: {
                        id: true,
                        userId: true,
                        role: true,
                        joinedAt: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true
                            }
                        }
                    }
                },
                _count: {
                    select: { ideas: true }
                }
            }
        });

        if (!jar) {
            return { success: false, error: "Jar not found", status: 404 };
        }

        // Verify membership access
        const isMember = jar.members.some(m => m.userId === session.user?.id);
        if (!isMember) {
            return { success: false, error: "Forbidden", status: 403 };
        }

        return { success: true, data: jar };
    } catch (error: any) {
        console.error("[JAR_GET_ERROR]", error);
        return { success: false, error: "Internal Error", status: 500 };
    }
}

export async function joinJar(code: string, premiumToken?: string): Promise<ActionResponse<{ jarId: string }>> {
    try {
        const auth = await checkAuthAndRateLimit();
        if ('error' in auth) return { success: false, error: auth.error, status: auth.status };
        const { userId } = auth;

        if (!code) return { success: false, error: "Code is required", status: 400 };

        const jar = await prisma.jar.findFirst({
            where: {
                referenceCode: {
                    equals: code,
                    mode: 'insensitive' // Allow case-insensitive
                }
            }
        });

        if (!jar) {
            return { success: false, error: "Invalid invite code", status: 404 };
        }

        // Handle premium token if provided
        let isPremiumGifted = false;
        if (premiumToken) {
            const validation = await validatePremiumToken(premiumToken);
            isPremiumGifted = validation.isValid;
        }

        // Check if already a member
        const existingMember = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    userId,
                    jarId: jar.id
                }
            }
        });

        if (existingMember) {
            // Already a member, just switch to it
            await prisma.user.update({
                where: { id: userId },
                data: {
                    activeJarId: jar.id,
                    ...(isPremiumGifted ? { isLifetimePro: true } : {})
                }
            });

            if (isPremiumGifted && premiumToken) {
                await recordTokenUsage(premiumToken, userId, 'join');
            }

            return { success: true, data: { jarId: jar.id } };
        }

        // Add member
        await prisma.jarMember.create({
            data: {
                userId,
                jarId: jar.id,
                role: 'MEMBER',
                status: 'ACTIVE'
            }
        });

        // Switch active jar and grant premium if applicable
        await prisma.user.update({
            where: { id: userId },
            data: {
                activeJarId: jar.id,
                ...(isPremiumGifted ? { isLifetimePro: true } : {})
            }
        });

        if (isPremiumGifted && premiumToken) {
            await recordTokenUsage(premiumToken, userId, 'join');
        }

        revalidatePath('/dashboard');
        return { success: true, data: { jarId: jar.id } };

    } catch (error: any) {
        console.error("[JAR_JOIN]", error);
        return { success: false, error: "Internal Error", status: 500 };
    }
}

export async function validateInviteCode(code: string): Promise<ActionResponse<{ valid: boolean; error?: string }>> {
    try {
        if (!code) return { success: false, error: "Code is required", status: 400 };

        const jar = await prisma.jar.findFirst({
            where: {
                referenceCode: {
                    equals: code,
                    mode: 'insensitive'
                }
            },
            include: {
                members: true
            }
        });

        if (!jar) {
            return { success: true, data: { valid: false, error: "Invalid invite code" } };
        }

        // Optional: Check if jar is full (e.g. 50 members max)
        if (jar.members.length >= 50) {
            return { success: true, data: { valid: false, error: "This jar is full" } };
        }

        return { success: true, data: { valid: true } };

    } catch (error: any) {
        console.error("[VALIDATE_INVITE]", error);
        return { success: false, error: "Internal Error", status: 500 };
    }
}
