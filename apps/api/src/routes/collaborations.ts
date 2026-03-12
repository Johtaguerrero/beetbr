import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { CreateCollabPostSchema, CreateCollabInterestSchema } from '@beetbr/shared';

export const collaborationsRouter = Router();

// Get all collaboration calls
collaborationsRouter.get('/', async (req, res) => {
    const { type, mode, compensation, city, state, query, authorId } = req.query;
    
    const where: any = {};
    if (!authorId) where.status = 'ACTIVE';
    if (authorId) where.authorId = authorId;
    if (type) where.type = type;
    if (mode) where.mode = mode;
    if (compensation) where.compensation = compensation;
    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (state) where.state = state;
    if (query) {
        where.OR = [
            { title: { contains: query as string, mode: 'insensitive' } },
            { description: { contains: query as string, mode: 'insensitive' } }
        ];
    }

    const collabs = await prisma.collabPost.findMany({
        where,
        include: {
            author: { select: { id: true, stageName: true, avatarUrl: true, genres: true } },
            targetArtist: { select: { id: true, stageName: true, avatarUrl: true } },
            _count: { select: { interests: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: collabs });
});

// Get interests received on my collabs
collaborationsRouter.get('/interests', authenticate, async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== 'ARTIST') {
        return res.status(403).json({ success: false, error: { message: 'Apenas artistas podem gerenciar interesses' } });
    }

    const profile = await prisma.artistProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) return res.status(404).json({ success: false, error: { message: 'Perfil não encontrado' } });

    const interests = await prisma.collabInterest.findMany({
        where: {
            collab: {
                authorId: profile.id
            }
        },
        include: {
            user: { select: { id: true, stageName: true, avatarUrl: true, genres: true } },
            collab: { select: { id: true, title: true, type: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: interests });
});

// Update interest status
collaborationsRouter.patch('/interests/:id', authenticate, async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ success: false, error: { message: 'Status inválido' } });
    }

    const interest = await prisma.collabInterest.update({
        where: { id: req.params.id },
        data: { status: status as any }
    });

    return res.json({ success: true, data: interest });
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
            type: validated.data.type as any,
            compensation: validated.data.compensation as any,
            mode: validated.data.mode as any,
            compensationValue: validated.data.compensationValue,
        },
    });

    // Create Feed Post
    if (validated.data.publishedInFeed) {
        await prisma.post.create({
            data: {
                artistId: profile.id,
                type: 'COLLAB',
                text: validated.data.description,
                collabId: collab.id,
                mediaUrl: validated.data.coverUrl,
            },
        });
    }

    // Create Story
    if (validated.data.publishedInStory) {
        await prisma.story.create({
            data: {
                artistId: profile.id,
                mediaUrl: validated.data.coverUrl || profile.avatarUrl || '',
                mediaType: 'IMAGE',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });
    }

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

    const collab = await prisma.collabPost.findUnique({ 
        where: { id: req.params.id },
        include: { author: true }
    });
    if (!collab) return res.status(404).json({ success: false, error: { message: 'Colaboração não encontrada' } });

    const interest = await prisma.collabInterest.create({
        data: {
            collabId: validated.data.collabId,
            userId: profile.id,
            message: validated.data.message,
        },
    });

    // Create Notification for the author
    await prisma.notification.create({
        data: {
            userId: collab.author.userId,
            type: 'COLLAB_INTEREST',
            title: 'Novo interesse em sua Collab!',
            message: `${profile.stageName} tem interesse em: ${collab.title}`,
            link: `/artist/collabs/interests`,
        }
    });

    return res.status(201).json({ success: true, data: interest });
});
