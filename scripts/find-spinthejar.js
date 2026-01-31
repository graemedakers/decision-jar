const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: { contains: 'spinthejar', mode: 'insensitive' } },
                { name: { contains: 'spinthejar', mode: 'insensitive' } }
            ]
        }
    })
    console.log('User found:', user)
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
