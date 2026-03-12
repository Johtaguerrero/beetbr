import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest, requireRole, requireProposalParticipant } from '../middleware/auth';
import { proposalLimiter } from '../middleware/rateLimit';
import { CreateProposalSchema } from '@beetbr/shared';

export const proposalsRouter = Router();

// All routes require authentication
proposalsRouter.use(authenticate);

/**
 * POST /api/proposals
 * Industry: Create a new proposal for an artist
 */
proposalsRouter.post('/', requireRole('INDUSTRY'), proposalLimiter, async (req: AuthRequest, res: Response) => {
    const body = CreateProposalSchema.safeParse(req.body);
    if (!body.success) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: body.error.issues[0].message } });
    }

    const industry = await prisma.industryProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!industry) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Perfil de empresa não encontrado' } });

    const artist = await prisma.artistProfile.findUnique({ where: { id: body.data.artistId } });
    if (!artist) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Artista não encontrado' } });

    const proposal = await prisma.proposal.create({
        data: {
            industryId: industry.id,
            artistId: artist.id,
            type: body.data.type as any,
            amount: body.data.amount,
            date: body.data.date ? new Date(body.data.date) : undefined,
            location: body.data.location,
            online: body.data.online,
            terms: body.data.terms,
            durationHours: body.data.durationHours,
            responseDeadline: body.data.responseDeadline ? new Date(body.data.responseDeadline) : undefined,
            status: 'SENT',
        },
        include: {
            artist: { select: { userId: true, stageName: true, avatarUrl: true } },
            industry: { select: { userId: true, companyName: true, logoUrl: true } },
        },
    });

    // Create Unified Chat Thread
    await prisma.chatThread.create({
        data: {
            type: 'PROPOSAL',
            proposalId: proposal.id,
            participants: {
                connect: [
                    { id: proposal.industry.userId },
                    { id: proposal.artist.userId }
                ]
            },
            lastMessage: '📝 Nova proposta enviada',
            messages: {
                create: {
                    senderId: req.user!.userId,
                    content: `📝 Nova proposta de ${proposal.industry.companyName} enviada para ${proposal.artist.stageName}.`,
                    isSystem: true
                }
            }
        }
    });

    // Auto-create contract record
    await prisma.contract.create({ data: { proposalId: proposal.id } });

    // Audit log
    await prisma.auditLog.create({
        data: {
            actorUserId: req.user!.userId,
            action: 'CREATE_PROPOSAL',
            resourceType: 'Proposal',
            resourceId: proposal.id,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        },
    });

    return res.status(201).json({ success: true, data: proposal });
});

/**
 * GET /api/proposals
 * Returns proposals relevant to the authenticated user's role
 */
proposalsRouter.get('/', async (req: AuthRequest, res: Response) => {
    const { role, userId } = req.user!;
    const page = parseInt(String(req.query.page) || '1');
    const perPage = parseInt(String(req.query.perPage) || '20');

    let whereClause: any = {};

    if (role === 'ARTIST') {
        const artist = await prisma.artistProfile.findUnique({ where: { userId } });
        if (!artist) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Perfil não encontrado' } });
        whereClause = { artistId: artist.id };
    } else if (role === 'INDUSTRY') {
        const industry = await prisma.industryProfile.findUnique({ where: { userId } });
        if (!industry) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Perfil não encontrado' } });
        whereClause = { industryId: industry.id };
    }

    const [proposals, total] = await Promise.all([
        prisma.proposal.findMany({
            where: whereClause,
            include: {
                artist: { select: { stageName: true, avatarUrl: true } },
                industry: { select: { companyName: true, logoUrl: true } },
                _count: { select: { messages: true } },
            },
            orderBy: { updatedAt: 'desc' },
            skip: (page - 1) * perPage,
            take: perPage,
        }),
        prisma.proposal.count({ where: whereClause }),
    ]);

    return res.json({
        success: true,
        data: proposals,
        meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    });
});

/**
 * GET /api/proposals/:proposalId
 */
proposalsRouter.get('/:proposalId', requireProposalParticipant, async (req: AuthRequest, res: Response) => {
    const proposal = await prisma.proposal.findUnique({
        where: { id: req.params.proposalId },
        include: {
            artist: { select: { stageName: true, avatarUrl: true, city: true, genres: true } },
            industry: { select: { companyName: true, logoUrl: true, type: true } },
            messages: {
                orderBy: { createdAt: 'asc' },
                include: { sender: { select: { role: true, artistProfile: { select: { stageName: true } }, industryProfile: { select: { companyName: true } } } } },
            },
            contract: { include: { versions: { orderBy: { version: 'desc' } } } },
            chat: { select: { id: true } }
        },
    });

    // Mark as viewed if artist viewing for first time
    if (req.user!.role === 'ARTIST' && proposal?.status === 'SENT') {
        await prisma.proposal.update({ where: { id: proposal.id }, data: { status: 'VIEWED' } });
    }

    return res.json({ success: true, data: proposal });
});

/**
 * POST /api/proposals/:proposalId/accept
 * Artist accepts the proposal
 */
proposalsRouter.post('/:proposalId/accept', requireRole('ARTIST'), requireProposalParticipant, async (req: AuthRequest, res: Response) => {
    const proposal = (req as any).proposal;

    if (!['SENT', 'VIEWED', 'NEGOTIATING'].includes(proposal.status)) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: `Proposta não pode ser aceita no status ${proposal.status}` } });
    }

    const updated = await prisma.proposal.update({
        where: { id: proposal.id },
        data: { status: 'ACCEPTED' },
    });

    // System message in chat
    const chat = await prisma.chatThread.findUnique({ where: { proposalId: proposal.id } });
    if (chat) {
        await prisma.chatMessage.create({
            data: {
                threadId: chat.id,
                senderId: req.user!.userId,
                isSystem: true,
                content: `✅ Proposta aceita pelo artista.`,
            },
        });
        await prisma.chatThread.update({
            where: { id: chat.id },
            data: { lastMessage: `✅ Proposta aceita` }
        });
    }

    await prisma.auditLog.create({
        data: {
            actorUserId: req.user!.userId, action: 'ACCEPT_PROPOSAL',
            resourceType: 'Proposal', resourceId: proposal.id, ip: req.ip,
        },
    });

    return res.json({ success: true, data: updated });
});

/**
 * POST /api/proposals/:proposalId/reject
 * Artist rejects the proposal
 */
proposalsRouter.post('/:proposalId/reject', requireRole('ARTIST'), requireProposalParticipant, async (req: AuthRequest, res: Response) => {
    const proposal = (req as any).proposal;

    if (!['SENT', 'VIEWED', 'NEGOTIATING'].includes(proposal.status)) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Proposta não pode ser recusada neste status' } });
    }

    const updated = await prisma.proposal.update({ where: { id: proposal.id }, data: { status: 'REJECTED' } });

    const chat = await prisma.chatThread.findUnique({ where: { proposalId: proposal.id } });
    if (chat) {
        await prisma.chatMessage.create({
            data: {
                threadId: chat.id,
                senderId: req.user!.userId,
                isSystem: true,
                content: '❌ Proposta recusada pelo artista.'
            },
        });
        await prisma.chatThread.update({
            where: { id: chat.id },
            data: { lastMessage: '❌ Proposta recusada' }
        });
    }

    return res.json({ success: true, data: updated });
});

/**
 * POST /api/proposals/:proposalId/cancel
 * Industry cancels the proposal
 */
proposalsRouter.post('/:proposalId/cancel', requireRole('INDUSTRY'), requireProposalParticipant, async (req: AuthRequest, res: Response) => {
    const proposal = (req as any).proposal;

    if (!['SENT', 'VIEWED', 'NEGOTIATING'].includes(proposal.status)) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Proposta não pode ser cancelada neste status' } });
    }

    const updated = await prisma.proposal.update({ where: { id: proposal.id }, data: { status: 'CANCELLED' } });

    const chat = await prisma.chatThread.findUnique({ where: { proposalId: proposal.id } });
    if (chat) {
        await prisma.chatMessage.create({
            data: {
                threadId: chat.id,
                senderId: req.user!.userId,
                isSystem: true,
                content: '🚫 Proposta cancelada pela empresa.'
            },
        });
        await prisma.chatThread.update({
            where: { id: chat.id },
            data: { lastMessage: '🚫 Proposta cancelada' }
        });
    }

    return res.json({ success: true, data: updated });
});

