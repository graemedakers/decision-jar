import { faker } from '@faker-js/faker';
import { prisma } from '@/lib/prisma';
import { Jar, JarType, SelectionMode, MemberRole } from '@prisma/client';

export interface JarOverrides extends Partial<Jar> {
    ownerId?: string; // Optional user to link as owner
}

/**
 * Generates a jar object with random data.
 */
export function generateJar(overrides: JarOverrides = {}) {
    const { ownerId, ...prismaOverrides } = overrides;

    return {
        id: faker.string.uuid(),
        referenceCode: faker.string.alphanumeric(8).toUpperCase(),
        name: faker.company.catchPhrase() + " Jar",
        type: JarType.SOCIAL,
        selectionMode: SelectionMode.RANDOM,
        topic: faker.helpers.arrayElement(['Movies', 'Food', 'Activities', 'Travel']),
        location: faker.location.city(),
        isPremium: false,
        ...prismaOverrides,
    };
}

/**
 * Creates a jar in the database and optionally links an owner.
 */
export async function createJar(overrides: JarOverrides = {}): Promise<Jar> {
    const data = generateJar(overrides);

    const jar = await prisma.jar.create({
        data: data as any,
    });

    if (overrides.ownerId) {
        await prisma.jarMember.create({
            data: {
                userId: overrides.ownerId,
                jarId: jar.id,
                role: MemberRole.OWNER,
                status: 'ACTIVE',
            },
        });
    }

    return jar;
}
