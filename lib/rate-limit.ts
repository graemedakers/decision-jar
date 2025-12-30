import { prisma } from "./prisma";

// CONFIGURATION
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 Hour
const RATE_LIMIT_MAX_REQUESTS = 20;
const EXEMPT_EMAILS = ["graemedakers@gmail.com"];

export async function checkRateLimit(user: { id: string, email: string }): Promise<{ allowed: boolean; error?: string }> {
    if (!user || !user.email) return { allowed: false, error: "User identity unknown" };

    // 1. Check exemptions
    if (EXEMPT_EMAILS.includes(user.email)) {
        return { allowed: true };
    }

    // 2. Get or Create Rate Limit Record
    const now = new Date();

    // We use a transaction or careful logic. 
    // Since we need to update, let's find first.
    let record = await prisma.rateLimit.findUnique({
        where: { userId: user.id }
    });

    if (!record) {
        // Create
        await prisma.rateLimit.create({
            data: {
                userId: user.id,
                count: 1,
                windowStart: now
            }
        });
        return { allowed: true };
    }

    // 3. Check Window
    const timeSinceStart = now.getTime() - record.windowStart.getTime();

    if (timeSinceStart > RATE_LIMIT_WINDOW_MS) {
        // Reset window
        await prisma.rateLimit.update({
            where: { userId: user.id },
            data: {
                count: 1,
                windowStart: now
            }
        });
        return { allowed: true };
    }

    // 4. Check Count
    if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
        return {
            allowed: false,
            error: `Hourly limit reached (${RATE_LIMIT_MAX_REQUESTS} requests). Please wait a while before trying again.`
        };
    }

    // 5. Increment
    await prisma.rateLimit.update({
        where: { userId: user.id },
        data: {
            count: { increment: 1 }
        }
    });

    return { allowed: true };
}
