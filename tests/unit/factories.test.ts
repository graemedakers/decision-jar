import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createUser } from '../factories/userFactory';
import { createJar } from '../factories/jarFactory';
import { createIdea, createManyIdeas } from '../factories/ideaFactory';
import { seedFullJar, cleanupDatabase } from '../utils/db-seeder';
import { prisma } from '@/lib/prisma';

describe('Test Data Factories', () => {
    // Use a transaction or cleanup to keep DB clean
    afterAll(async () => {
        // For local dev, we might not want to wipe EVERYTHING if using primary DB
        // but for CI/Test DB it's essential.
        // await cleanupDatabase(); 
    });

    it('should create a user with default data', async () => {
        const user = await createUser();
        expect(user.id).toBeDefined();
        expect(user.email).toContain('@');

        // Cleanup this specific user
        await prisma.user.delete({ where: { id: user.id } });
    });

    it('should create a jar and link an owner', async () => {
        const user = await createUser();
        const jar = await createJar({ ownerId: user.id, name: 'Test Jar' });

        expect(jar.name).toBe('Test Jar');

        const membership = await prisma.jarMember.findFirst({
            where: { userId: user.id, jarId: jar.id }
        });

        expect(membership).toBeDefined();
        expect(membership?.role).toBe('OWNER');

        // Cleanup
        await prisma.jarMember.deleteMany({ where: { jarId: jar.id } });
        await prisma.jar.delete({ where: { id: jar.id } });
        await prisma.user.delete({ where: { id: user.id } });
    });

    it('should seed a full jar using high-level seeder', async () => {
        const { user, jar, ideas } = await seedFullJar(3, { name: 'Seeded User' });

        expect(user.name).toBe('Seeded User');
        expect(jar.id).toBeDefined();
        expect(ideas).toHaveLength(3);
        expect(ideas[0].jarId).toBe(jar.id);

        // Cleanup
        await prisma.idea.deleteMany({ where: { jarId: jar.id } });
        await prisma.jarMember.deleteMany({ where: { jarId: jar.id } });
        await prisma.jar.delete({ where: { id: jar.id } });
        await prisma.user.delete({ where: { id: user.id } });
    });
});
