import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding BEETBR database...');

    // ── Admin user ──────────────────────────────────────────────
    await prisma.user.upsert({
        where: { email: 'admin@beetbr.com' },
        update: {},
        create: {
            email: 'admin@beetbr.com',
            passwordHash: await bcrypt.hash('Admin123!', 12),
            role: 'ADMIN',
            verified: true,
        },
    });

    // ── Sample artist ───────────────────────────────────────────
    const mcVibrante = await prisma.user.upsert({
        where: { email: 'mc.vibrante@beetbr.com' },
        update: {},
        create: {
            email: 'mc.vibrante@beetbr.com',
            passwordHash: await bcrypt.hash('Artist123!', 12),
            role: 'ARTIST',
            verified: true,
            artistProfile: {
                create: {
                    stageName: 'MC Vibrante',
                    genres: ['Funk', 'Trap'],
                    city: 'São Paulo',
                    state: 'SP',
                    bio: 'Funk carioca com influências do trap newyorkino. 2M de views no YouTube.',
                    scoreBeet: 94,
                    availableForBooking: true,
                    contactVisibility: 'PROPOSAL_ONLY',
                    metrics: {
                        create: {
                            plays: 2_000_000,
                            views: 2_400_000,
                            engagement: 8.7,
                            weeklyGrowth: 4.2,
                            retention: 72,
                            consistency: 89,
                        },
                    },
                },
            },
        },
        include: { artistProfile: true },
    });

    // ── Additional artist ───────────────────────────────────────
    const anaLima = await prisma.user.upsert({
        where: { email: 'ana.lima@beetbr.com' },
        update: {},
        create: {
            email: 'ana.lima@beetbr.com',
            passwordHash: await bcrypt.hash('Artist123!', 12),
            role: 'ARTIST',
            verified: true,
            artistProfile: {
                create: {
                    stageName: 'Ana Lima',
                    genres: ['R&B', 'Pop'],
                    city: 'Rio de Janeiro',
                    state: 'RJ',
                    bio: 'R&B brasileira com voz inconfundível. Finalista do Tiny Desk Contest Brasil.',
                    scoreBeet: 87,
                    availableForBooking: true,
                },
            },
        },
        include: { artistProfile: true },
    });

    // ── Industry user ───────────────────────────────────────────
    const labelUser = await prisma.user.upsert({
        where: { email: 'casting@labelone.com' },
        update: {},
        create: {
            email: 'casting@labelone.com',
            passwordHash: await bcrypt.hash('Industry123!', 12),
            role: 'INDUSTRY',
            verified: true,
            industryProfile: {
                create: {
                    companyName: 'Label One Music',
                    type: 'LABEL',
                    niches: ['Funk', 'Trap', 'R&B'],
                    city: 'São Paulo',
                    state: 'SP',
                    verified: true,
                },
            },
        },
        include: { industryProfile: true },
    });

    // ── Sample posts ────────────────────────────────────────────
    const artistProfile = mcVibrante.artistProfile!;
    await prisma.post.createMany({
        skipDuplicates: true,
        data: [
            { artistId: artistProfile.id, type: 'TRACK', text: '🔥 Single novo chegando! Aguardem...', hashtags: ['BEETBR', 'FunkBR', 'TrapNacional'], plays: 14_200, likes: 980 },
            { artistId: artistProfile.id, type: 'VIDEO', text: 'Clipe oficial já no ar! Link na bio. 🎬', hashtags: ['Clipe', 'FunkCarioca'], plays: 8_500, likes: 650 },
        ],
    });

    // ── Sample proposal ─────────────────────────────────────────
    const industryProfile = labelUser.industryProfile!;
    const existingProposal = await prisma.proposal.findFirst({
        where: { industryId: industryProfile.id, artistId: artistProfile.id },
    });

    if (!existingProposal) {
        const proposal = await prisma.proposal.create({
            data: {
                industryId: industryProfile.id,
                artistId: artistProfile.id,
                type: 'LIVE_SHOW',
                amount: 15_000,
                date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                location: 'Allianz Parque, São Paulo',
                online: false,
                terms: 'Show de 60 minutos. Inclui passagens aéreas e hospedagem.',
                durationHours: 2,
                responseDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: 'SENT',
            },
        });

        await prisma.contract.create({ data: { proposalId: proposal.id } });

        await prisma.proposalMessage.create({
            data: {
                proposalId: proposal.id,
                senderUserId: labelUser.id,
                message: 'Olá! Gostaríamos de convidá-lo para se apresentar no nosso evento. Aguardamos sua resposta.',
            },
        });
    }

    console.log('✅ Seed concluído!');
    console.log('👤 Admin:   admin@beetbr.com / Admin123!');
    console.log('🎤 Artista: mc.vibrante@beetbr.com / Artist123!');
    console.log('🏢 Empresa: casting@labelone.com / Industry123!');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
