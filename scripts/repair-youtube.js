const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function repair() {
    const repairs = [
        { pattern: 'Thomas DeLauer', videoId: 'sI9f_V5g358', title: 'Thomas DeLauer: IF Science' },
        { pattern: 'Dr. Eric Berg', videoId: '1rfzjRoalWM', title: "Dr. Eric Berg's IF Guide" },
        { pattern: 'What to Eat', videoId: 'F0p_3e6R10Y', title: 'Intermittent Fasting: What to Eat' }
    ];

    for (const item of repairs) {
        const ideas = await prisma.idea.findMany({
            where: {
                description: { contains: item.pattern, mode: 'insensitive' }
            }
        });

        for (const idea of ideas) {
            console.log(`Repairing idea ${idea.id}: ${idea.description}`);
            await prisma.idea.update({
                where: { id: idea.id },
                data: {
                    ideaType: 'youtube',
                    typeData: {
                        videoId: item.videoId,
                        watchUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
                        title: item.title
                    }
                }
            });
        }
    }
}

repair()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
