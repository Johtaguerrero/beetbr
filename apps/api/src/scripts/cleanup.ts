import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- SYSTEM CLEANUP STARTED ---');

    try {
        const posts = await prisma.post.deleteMany();
        console.log(`Deleted ${posts.count} posts.`);

        const stories = await prisma.story.deleteMany();
        console.log(`Deleted ${stories.count} stories.`);

        const interests = await prisma.collabInterest.deleteMany();
        console.log(`Deleted ${interests.count} collab interests.`);

        const collabs = await prisma.collabPost.deleteMany();
        console.log(`Deleted ${collabs.count} collab posts.`);

        const listings = await prisma.listing.deleteMany();
        console.log(`Deleted ${listings.count} listings.`);

        console.log('--- SYSTEM CLEANUP COMPLETED ---');
    } catch (error) {
        console.error('Cleanup failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
