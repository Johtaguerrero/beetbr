import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest, requireRole, requireProposalParticipant } from '../middleware/auth';

// ── SHORTLIST ─────────────────────────────────────────────────
export const shortlistRouter = Router();
shortlistRouter.use(authenticate, requireRole('INDUSTRY', 'ADMIN'));

shortlistRouter.get('/', async (req: AuthRequest, res: Response) => {
    const industry = await prisma.industryProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!industry) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Perfil não encontrado' } });

    const saved = await prisma.savedArtist.findMany({
        where: { industryId: industry.id },
        include: { artist: { include: { metrics: true } } },
        orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: saved.map((s: any) => s.artist) });
});

shortlistRouter.post('/:artistId', async (req: AuthRequest, res: Response) => {
    const industry = await prisma.industryProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!industry) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Perfil não encontrado' } });

    const artist = await prisma.artistProfile.findUnique({ where: { id: req.params.artistId } });
    if (!artist) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Artista não encontrado' } });

    await prisma.savedArtist.upsert({
        where: { industryId_artistId: { industryId: industry.id, artistId: artist.id } },
        update: {},
        create: { industryId: industry.id, artistId: artist.id },
    });

    return res.status(201).json({ success: true, data: { saved: true } });
});

shortlistRouter.delete('/:artistId', async (req: AuthRequest, res: Response) => {
    const industry = await prisma.industryProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!industry) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Perfil não encontrado' } });

    await prisma.savedArtist.deleteMany({
        where: { industryId: industry.id, artistId: req.params.artistId },
    });
    return res.json({ success: true, data: { removed: true } });
});

// ── CONTRACTS ─────────────────────────────────────────────────
export const contractsRouter = Router();
contractsRouter.use(authenticate);

contractsRouter.get('/:proposalId', requireProposalParticipant, async (req: AuthRequest, res: Response) => {
    const contract = await prisma.contract.findUnique({
        where: { proposalId: req.params.proposalId },
        include: { versions: { orderBy: { version: 'desc' } } },
    });
    if (!contract) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Contrato não encontrado' } });
    return res.json({ success: true, data: contract });
});

contractsRouter.post('/:proposalId/upload', requireProposalParticipant, async (req: AuthRequest, res: Response) => {
    // In production, fileUrl comes from Multer/S3 upload middleware
    const { fileUrl, fileName } = req.body;
    if (!fileUrl || !fileName) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'fileUrl e fileName obrigatórios' } });
    }

    const contract = await prisma.contract.findUnique({ where: { proposalId: req.params.proposalId }, include: { versions: true } });
    if (!contract) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Contrato não encontrado' } });

    const nextVersion = (contract.versions.length > 0 ? Math.max(...contract.versions.map((v: any) => v.version)) : 0) + 1;

    const version = await prisma.contractFileVersion.create({
        data: {
            contractId: contract.id,
            version: nextVersion,
            fileUrl,
            fileName,
            uploadedBy: req.user!.userId,
            uploaderRole: req.user!.role,
        },
    });

    await prisma.auditLog.create({
        data: {
            actorUserId: req.user!.userId, action: 'UPLOAD_CONTRACT_VERSION',
            resourceType: 'Contract', resourceId: contract.id,
            ip: req.ip, metadata: { version: nextVersion },
        },
    });

    // System message in chat
    const chat = await prisma.chatThread.findUnique({ where: { proposalId: req.params.proposalId } });
    if (chat) {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            include: { artistProfile: { select: { stageName: true } }, industryProfile: { select: { companyName: true } } },
        });
        const name = user?.artistProfile?.stageName || user?.industryProfile?.companyName || 'Usuário';
        
        await prisma.chatMessage.create({
            data: {
                threadId: chat.id,
                senderId: req.user!.userId,
                isSystem: true,
                content: `📄 ${name} fez upload da Versão ${nextVersion} do contrato.`,
            },
        });

        await prisma.chatThread.update({
            where: { id: chat.id },
            data: { lastMessage: `📄 Contrato V${nextVersion}` }
        });
    }

    return res.status(201).json({ success: true, data: version });
});

// ── SETTINGS ──────────────────────────────────────────────────
export const settingsRouter = Router();
settingsRouter.use(authenticate);

settingsRouter.get('/', async (req: AuthRequest, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { id: true, email: true, role: true, verified: true, status: true, createdAt: true },
    });
    return res.json({ success: true, data: user });
});

settingsRouter.patch('/account', async (req: AuthRequest, res: Response) => {
    const { email } = req.body;
    if (email) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing && existing.id !== req.user!.userId) {
            return res.status(409).json({ success: false, error: { code: 'EMAIL_IN_USE', message: 'Email já em uso' } });
        }
        await prisma.user.update({ where: { id: req.user!.userId }, data: { email } });
    }
    return res.json({ success: true, data: { updated: true } });
});

settingsRouter.delete('/account', async (req: AuthRequest, res: Response) => {
    await prisma.user.update({ where: { id: req.user!.userId }, data: { status: 'DELETED', refreshToken: null } });
    return res.json({ success: true, data: { deleted: true } });
});
