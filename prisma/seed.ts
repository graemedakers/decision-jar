import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Create or update a demo couple
    // Create or update a demo Jar
    const jar = await prisma.jar.upsert({
        where: { referenceCode: 'DEMO123' },
        update: {},
        create: {
            referenceCode: 'DEMO123',
            name: 'Demo Jar',
            type: 'ROMANTIC'
        }
    })

    // Create or update a user
    const passwordHash = await bcrypt.hash('password123', 10)
    const user = await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {
            passwordHash, // Update password if re-running
        },
        create: {
            email: 'demo@example.com',
            name: 'Demo User',
            passwordHash,
            activeJarId: jar.id,
            legacyJarId: jar.id,
            mustChangePassword: false,
        }
    })

    // Create some ideas
    const ideas = [
        { description: 'Cook a new recipe together', indoor: true, duration: 0.5, activityLevel: 'MEDIUM', cost: '$' },
        { description: 'Go for a sunset hike', indoor: false, duration: 0.25, activityLevel: 'HIGH', cost: 'FREE' },
        { description: 'Movie marathon with popcorn', indoor: true, duration: 0.5, activityLevel: 'LOW', cost: '$' },
        { description: 'Visit a local museum', indoor: true, duration: 0.5, activityLevel: 'LOW', cost: '$$' },
        { description: 'Picnic in the park', indoor: false, duration: 0.25, activityLevel: 'LOW', cost: '$' },
    ]

    for (const idea of ideas) {
        await prisma.idea.create({
            data: {
                ...idea,
                jarId: jar.id,
                createdById: user.id,
            }
        })
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
