
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProfiles() {
    try {
        const artists = await prisma.artistProfile.findMany({
            select: {
                id: true,
                stageName: true,
                avatarUrl: true,
                coverUrl: true
            },
            take: 10
        });
        console.log('Profiles:', JSON.stringify(artists, null, 2));
    } catch (err) {
        console.error('Database query failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkProfiles();
