import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { CreateCollabPostSchema, CreateCollabInterestSchema } from '@beetbr/shared';

export const collaborationsRouter = Router();

// Get all collaboration calls
collaborationsRouter.get('/', async (req, res) => {
    const collabs = await prisma.collabPost.findMany({
        where: { status: 'ACTIVE' },
        include: {
            author: { select: { stageName: true, avatarUrl: true, genres: true } },
            targetArtist: { select: { stageName: true, avatarUrl: true } },
            _count: { select: { interests: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: collabs });
});

// Create collab post (Artists only)
collaborationsRouter.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== 'ARTIST') {
        return res.status(403).json({ success: false, error: { message: 'Apenas artistas podem postar colaborações' } });
    }

    const validated = CreateCollabPostSchema.safeParse(req.body);
    if (!validated.success) {
        return res.status(400).json({ success: false, error: { message: validated.error.issues[0].message } });
    }

    const profile = await prisma.artistProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) return res.status(404).json({ success: false, error: { message: 'Perfil não encontrado' } });

    const collab = await prisma.collabPost.create({
        data: {
            ...validated.data,
            authorId: profile.id,
            targetArtistId: validated.data.targetArtistId,
            type: validated.data.type as any,
            compensation: validated.data.compensation as any,
        },
    });

    return res.status(201).json({ success: true, data: collab });
});

// Show interest in collab
collaborationsRouter.post('/:id/interest', authenticate, async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== 'ARTIST') {
        return res.status(403).json({ success: false, error: { message: 'Apenas artistas podem responder colaborações' } });
    }

    const validated = CreateCollabInterestSchema.safeParse({ ...req.body, collabId: req.params.id });
    if (!validated.success) {
        return res.status(400).json({ success: false, error: { message: validated.error.issues[0].message } });
    }

    const profile = await prisma.artistProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) return res.status(404).json({ success: false, error: { message: 'Perfil não encontrado' } });

    const interest = await prisma.collabInterest.create({
        data: {
            collabId: validated.data.collabId,
            userId: profile.id,
            message: validated.data.message,
        },
    });

    return res.status(201).json({ success: true, data: interest });
});
