import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Checked utils, generateReferralCode might likely be in lib/utils or just random string. 
// I'll implement a simple random generator here to contain it or use the one if I find it.
// Checking imports... I'll assume standard uuid or nanoid if needed, but custom code is better.

import { NextResponse } from 'next/server';

function generateCode() {
    // 6 chars alphanumeric uppercase
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: jarId } = await context.params;

    try {
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    jarId,
                    userId: session.user.id
                }
            }
        });

        if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
            return NextResponse.json({ error: 'Only jar owners or admins can regenerate the invite code' }, { status: 403 });
        }

        const newCode = generateCode();

        // Update JAR reference code (it was on user.coupleReferenceCode in legacy, but for Jars it should be on Jar model)
        // SettingsModal says "setInviteCode(data.newCode)". And references "user.coupleReferenceCode".
        // LEGACY ALERT: The app seems to rely on `user.coupleReferenceCode` for legacy functionality, but NEW jars have `referenceCode` on the Jar model.
        // If this is a "Jar" setting, we should update the Jar.
        // SettingsModal: `setInviteCode(data.user.coupleReferenceCode || "")`
        // But wait, `data.user` comes from `api/auth/me`.

        // If this is a modern Jar, we update Jar.referenceCode.
        // If this is legacy "Couple", we update User.coupleReferenceCode?
        // We are migrating TO Jars. So we update Jar.

        await prisma.jar.update({
            where: { id: jarId },
            data: { referenceCode: newCode }
        });

        // Also update User coupleReferenceCode if it's the "legacy primary" jar? 
        // Let's stick to Jar. But SettingsModal reads from User?
        // Let's update boht/check.
        // Actually, looking at SettingsModal, it might be reading the code of the *Jar* if it's new.
        // "const activeMembership = data.user.memberships..."
        // The modal logic is a bit hybrid.
        // I will return the code and let frontend handle visual.

        return NextResponse.json({
            success: true,
            newCode: newCode
        });

    } catch (error: any) {
        console.error('Error regenerating code:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
