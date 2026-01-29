import { faker } from '@faker-js/faker';
import { prisma } from '@/lib/prisma';
import { Idea, IdeaStatus } from '@prisma/client';

export interface IdeaOverrides extends Partial<Idea> {
    jarId: string;
    createdById: string;
}

/**
 * Generates an idea object with random data.
 */
export function generateIdea(overrides: IdeaOverrides) {
    return {
        id: faker.string.uuid(),
        description: faker.lorem.sentence({ min: 3, max: 8 }),
        indoor: faker.datatype.boolean(),
        duration: faker.helpers.arrayElement([0.25, 0.5, 1.0, 2.0, 4.0]),
        activityLevel: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH']),
        cost: faker.helpers.arrayElement(['FREE', '$', '$$', '$$$']),
        timeOfDay: faker.helpers.arrayElement(['DAY', 'EVENING', 'ANY']),
        category: faker.helpers.arrayElement(['ACTIVITY', 'MEAL', 'EVENT']),
        weather: 'ANY',
        status: IdeaStatus.APPROVED,
        ...overrides,
    };
}

/**
 * Creates an idea in the database.
 */
export async function createIdea(overrides: IdeaOverrides): Promise<Idea> {
    const data = generateIdea(overrides);
    return await prisma.idea.create({
        data: data as any,
    });
}

/**
 * Creates multiple ideas for a jar.
 */
export async function createManyIdeas(count: number, overrides: IdeaOverrides): Promise<Idea[]> {
    const ideas = Array.from({ length: count }).map(() => generateIdea(overrides));

    // prisma.idea.createMany is more efficient but doesn't return the objects in some providers
    // For the sake of simplicity and flexibility in tests, we'll do individual creates or a transaction
    return await Promise.all(ideas.map(data => prisma.idea.create({ data: data as any })));
}
