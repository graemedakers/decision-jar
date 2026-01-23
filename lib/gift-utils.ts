import { nanoid, customAlphabet } from 'nanoid';
import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { generateUniqueJarCode } from '@/lib/utils';

// Use a readable alphabet for gift tokens (no 0, O, 1, I, l)
const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz';
const TOKEN_LENGTH = 10;
const generateToken = customAlphabet(ALPHABET, TOKEN_LENGTH);

/**
 * Generates a unique gift token.
 * Checks database to ensure collision avoidance.
 */
export async function generateGiftToken(): Promise<string> {
    let token = generateToken();
    let safe = false;
    let attempts = 0;

    while (!safe && attempts < 5) {
        const existing = await prisma.giftToken.findUnique({
            where: { token }
        });
        if (!existing) {
            safe = true;
        } else {
            token = generateToken();
            attempts++;
        }
    }

    if (!safe) throw new Error("Failed to generate unique gift token");
    return token;
}

/**
 * Clones a jar and its ideas for a recipient.
 * Supports passing a prisma client (e.g. from a transaction).
 */
export async function cloneJarForGift(
    sourceJarId: string,
    recipientUserId: string,
    giftTokenId: string,
    db: Prisma.TransactionClient | PrismaClient = prisma
) {
    console.log(`[cloneJarForGift] Starting clone: source=${sourceJarId}, recipient=${recipientUserId}, giftToken=${giftTokenId}`);

    // 0. Fetch Gift Token Settings
    const giftToken = await db.giftToken.findUnique({
        where: { id: giftTokenId }
    }) as any;

    // 1. Fetch Source Jar & Ideas
    const sourceJar = await db.jar.findUnique({
        where: { id: sourceJarId },
        include: {
            ideas: {
                where: {
                    status: 'APPROVED',
                    isSurprise: false
                }
            }
        }
    }) as any;

    if (!sourceJar) {
        console.error(`[cloneJarForGift] Source jar not found: ${sourceJarId}`);
        throw new Error("Source jar not found");
    }

    // 2. Clone Jar Metadata
    const referenceCode = await generateUniqueJarCode();

    const clonedJar = await db.jar.create({
        data: {
            name: sourceJar.name, // Keep original name
            type: sourceJar.type,
            topic: sourceJar.topic,
            selectionMode: sourceJar.selectionMode,
            defaultIdeaPrivate: false,
            isMysteryMode: giftToken?.isMysteryMode || false,
            revealPace: giftToken?.revealPace || "INSTANT",
            sourceGiftId: giftTokenId,
            referenceCode,
            voteCandidatesCount: sourceJar.voteCandidatesCount,
            members: {
                create: {
                    userId: recipientUserId,
                    role: 'OWNER',
                    status: 'ACTIVE'
                }
            }
        } as any
    });

    console.log(`[cloneJarForGift] Cloned jar created: ${clonedJar.id} (${clonedJar.referenceCode})`);

    if (sourceJar.ideas.length > 0) {
        const ideasData = (sourceJar.ideas as any[]).map((idea: any) => ({
            description: idea.description,
            indoor: idea.indoor,
            duration: idea.duration,
            activityLevel: idea.activityLevel,
            cost: idea.cost,
            timeOfDay: idea.timeOfDay,
            category: idea.category,

            jarId: clonedJar.id,
            createdById: recipientUserId,

            notes: null,
            details: idea.details,
            address: idea.address,
            website: idea.website,
            googleRating: idea.googleRating,
            openingHours: idea.openingHours,
            photoUrls: idea.photoUrls,

            isPrivate: false,
            isSurprise: idea.isSurprise,
            requiresTravel: idea.requiresTravel,
            weather: idea.weather,
            status: 'APPROVED' as const,

            selectedAt: null,
            selectedDate: null,
            rating: null,
            memoryReminderSent: false
        }));

        await db.idea.createMany({
            data: ideasData
        });
        console.log(`[cloneJarForGift] Cloned ${ideasData.length} ideas`);
    }

    return clonedJar;
}
