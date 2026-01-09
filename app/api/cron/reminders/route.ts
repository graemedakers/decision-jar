
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyJarMembers } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    // Basic security check (Cron Secret)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Find ideas selected > 24 hours ago that haven't been reminded
        // and have no ratings (assuming rating means memory captured)
        const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

        const ideasToRemind = await prisma.idea.findMany({
            where: {
                selectedAt: {
                    lt: cutoffDate,
                    // Optional: limit how far back? e.g. gt: new Date(Date.now() - 48 * 60 * 60 * 1000)
                },
                memoryReminderSent: false,
                rating: null,
                notes: null,
                // Ensure it's not archived or rejected?
                status: 'APPROVED'
            },
            include: {
                jar: true
            },
            take: 50 // Process in batches
        });

        if (ideasToRemind.length === 0) {
            return NextResponse.json({ message: 'No reminders needed' });
        }

        const results = await Promise.allSettled(ideasToRemind.map(async (idea) => {
            // Send Notification
            await notifyJarMembers(idea.jarId, null, {
                title: 'How was it?',
                body: `You spun "${idea.description}" yesterday. Tap to save the memory!`,
                url: `/dashboard?action=capture&ideaId=${idea.id}`,
                // @ts-ignore
                icon: '/icons/icon-192x192.png'
            });

            // Mark as sent
            await prisma.idea.update({
                where: { id: idea.id },
                data: { memoryReminderSent: true }
            });

            return idea.id;
        }));

        const successCount = results.filter(r => r.status === 'fulfilled').length;

        return NextResponse.json({
            success: true,
            processed: ideasToRemind.length,
            sent: successCount
        });

    } catch (error: any) {
        console.error("Cron Reminder Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
