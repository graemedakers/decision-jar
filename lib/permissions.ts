import { prisma } from '@/lib/prisma';
import { MemberRole, JarMember } from '@prisma/client';

export type PermissionCheckResult = {
    allowed: boolean;
    error?: string;
    membership?: JarMember & { jar?: any };
    jar?: any;
};

// Role Hierarchy: OWNER > ADMIN > MEMBER > VIEWER
const ROLE_VALUE: Record<MemberRole, number> = {
    OWNER: 3,
    ADMIN: 2,
    MEMBER: 1,
    VIEWER: 0
};

/**
 * Checks if a user has the required role (or higher) in a jar.
 * Returns the membership and jar if successful.
 */
export async function checkJarPermission(
    userId: string,
    jarId: string,
    minRole: MemberRole = 'MEMBER'
): Promise<PermissionCheckResult> {
    const membership = await prisma.jarMember.findUnique({
        where: { userId_jarId: { userId, jarId } },
        include: { jar: true }
    });

    if (!membership) return { allowed: false, error: 'Not a member of this jar' };

    if (membership.status !== 'ACTIVE') return { allowed: false, error: 'Membership is not active' };

    if (ROLE_VALUE[membership.role] < ROLE_VALUE[minRole]) {
        return { allowed: false, error: `Requires ${minRole} access` };
    }

    return { allowed: true, membership, jar: membership.jar };
}

/**
 * Helper to check role level on an already fetched membership object.
 */
export function hasRole(membership: Pick<JarMember, 'role'>, minRole: MemberRole): boolean {
    return ROLE_VALUE[membership.role] >= ROLE_VALUE[minRole];
}

/**
 * Resolves the "Active Jar ID" for a user.
 * 1. Checks `activeJarId` field.
 * 2. Fallbacks to the first membership found.
 */
export async function getEffectiveJarId(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            activeJarId: true,
            memberships: {
                where: { status: 'ACTIVE' },
                select: { jarId: true },
                take: 1
            }
        }
    });

    if (user?.activeJarId) return user.activeJarId;
    if (user?.memberships && user.memberships.length > 0) return user.memberships[0].jarId;

    return null;
}
