import { prisma } from './prisma';
import { sendEmail } from './email';

export async function checkAndPromoteWaitlist(jarId: string) {
    console.log(`Checking waitlist for jar ${jarId}...`);

    try {
        const jar = await prisma.jar.findUnique({
            where: { id: jarId }
        });

        if (!jar || !jar.memberLimit) return;

        // Check current active count
        const activeCount = await prisma.jarMember.count({
            where: { jarId, status: 'ACTIVE' }
        });

        const spotsAvailable = jar.memberLimit - activeCount;

        if (spotsAvailable > 0) {
            // Find oldest WAITLISTED members
            const waitlistedMembers = await prisma.jarMember.findMany({
                where: { jarId, status: 'WAITLISTED' },
                orderBy: { joinedAt: 'asc' },
                take: spotsAvailable,
                include: { user: true }
            });

            for (const member of waitlistedMembers) {
                console.log(`Promoting ${member.user.email} from waitlist...`);

                await prisma.jarMember.update({
                    where: { id: member.id },
                    data: { status: 'ACTIVE' }
                });

                if (member.user.email) {
                    await sendEmail({
                        to: member.user.email,
                        subject: `You're in! Welcome to ${jar.name}`,
                        html: `
                            <h1>Good news! A spot opened up.</h1>
                            <p>You have been moved from the waitlist to active membership in <strong>${jar.name}</strong>.</p>
                            <p>You can now participate in community activities.</p>
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/community/${jarId}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:white;text-decoration:none;border-radius:8px;">View Community</a>
                        `
                    });
                }
            }
        }
    } catch (error) {
        console.error("Failed to promote from waitlist", error);
    }
}
