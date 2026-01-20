
import { nanoid, customAlphabet } from 'nanoid';
import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma'; // Assumes you have a singleton prisma instance
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
 */
export async function cloneJarForGift(
    sourceJarId: string,
    recipientUserId: string,
    giftTokenId: string
) {
    // 1. Fetch Source Jar & Ideas
    const sourceJar = await prisma.jar.findUnique({
        where: { id: sourceJarId },
        include: {
            ideas: {
                where: {
                    status: 'APPROVED',
                    isSurprise: false // Do not clone surprise ideas? Or do we? Spec implies full CLONE.
                    // Let's clone EVERYTHING that is valid for a user to see.
                    // Actually, private ideas should be converted to public.
                }
            }
        }
    });

    if (!sourceJar) throw new Error("Source jar not found");

    // 2. Clone Jar Metadata
    const referenceCode = await generateUniqueJarCode();

    const clonedJar = await prisma.jar.create({
        data: {
            name: sourceJar.name, // Keep original name
            type: sourceJar.type,
            topic: sourceJar.topic,
            selectionMode: sourceJar.selectionMode,
            defaultIdeaPrivate: false, // Reset to default
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
        }
    });

    // 3. Clone Ideas
    // Convert private -> public
    // Reset status fields
    if (sourceJar.ideas.length > 0) {
        const ideasData = sourceJar.ideas.map(idea => ({
            description: idea.description,
            indoor: idea.indoor,
            duration: idea.duration,
            activityLevel: idea.activityLevel,
            cost: idea.cost,
            timeOfDay: idea.timeOfDay,
            category: idea.category,

            jarId: clonedJar.id,
            createdById: recipientUserId, // Recipient becomes creator of their copy

            // Context fields
            notes: null, // Clear personal notes? Maybe keep descriptions/details but clear notes.
            details: idea.details,
            address: idea.address,
            website: idea.website,
            googleRating: idea.googleRating,
            openingHours: idea.openingHours,
            photoUrls: idea.photoUrls,

            // Logic flags
            isPrivate: false, // FORCE PUBLIC
            isSurprise: idea.isSurprise,
            requiresTravel: idea.requiresTravel,
            weather: idea.weather,
            status: 'APPROVED' as const, // Ensure clean status

            // Reset state
            selectedAt: null,
            selectedDate: null,
            rating: null,
            memoryReminderSent: false
        }));

        await prisma.idea.createMany({
            data: ideasData
        });
    }

    return clonedJar;
}
