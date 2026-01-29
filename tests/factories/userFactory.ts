import { faker } from '@faker-js/faker';
import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';

export interface UserOverrides extends Partial<User> {
    password?: string;
}

/**
 * Generates a user object with random data.
 */
export function generateUser(overrides: UserOverrides = {}) {
    const { password, ...prismaOverrides } = overrides;
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
        id: faker.string.uuid(),
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        name: `${firstName} ${lastName}`,
        passwordHash: bcrypt.hashSync(password || 'Password123!', 10),
        homeTown: faker.location.city(),
        interests: faker.lorem.words(3),
        isLifetimePro: false,
        ...prismaOverrides,
    };
}

/**
 * Creates a user in the database.
 */
export async function createUser(overrides: UserOverrides = {}): Promise<User> {
    const data = generateUser(overrides);
    return await prisma.user.create({
        data,
    });
}
