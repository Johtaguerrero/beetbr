import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { DiscoverFiltersSchema, RankingsFiltersSchema } from '@beetbr/shared';

// ── FEED ──────────────────────────────────────────────────────
export const feedRouter = Router();

feedRouter.get('/', async (req: Request, res: Response) => {
    const page = parseInt(String(req.query.page) || '1');
    const perPage = 20;

    const posts = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
            artist: { select: { id: true, stageName: true, avatarUrl: true, genres: true, scoreBeet: true } },
            listing: {
                include: {
                    artistSeller: { select: { stageName: true, avatarUrl: true, scoreBeet: true } },
                    industrySeller: { select: { companyName: true, logoUrl: true } },
                }
            }
        },
    });

    return res.json({ success: true, data: posts, meta: { page, perPage } });
});

feedRouter.post('/posts', authenticate, requireRole('ARTIST'), async (req: AuthRequest, res: Response) => {
    const artist = await prisma.artistProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!artist) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Perfil não encontrado' } });

    const { type, text, hashtags, mediaUrl, listingId, collabId } = req.body;

    const post = await prisma.post.create({
        data: {
            artistId: artist.id,
            type: type || 'TRACK',
            text,
            hashtags: hashtags || [],
            mediaUrl,
            listingId,
            collabId,
        },
        include: {
            artist: { select: { id: true, stageName: true, avatarUrl: true, genres: true, scoreBeet: true } },
            listing: {
                include: {
                    artistSeller: { select: { stageName: true, avatarUrl: true, scoreBeet: true } },
                    industrySeller: { select: { companyName: true, logoUrl: true } },
                }
            },
            collab: {
                include: {
                    author: { select: { stageName: true, avatarUrl: true, scoreBeet: true } },
                }
            }
        },
    });

    return res.status(201).json({ success: true, data: post });
});

feedRouter.get('/stories', async (_req: Request, res: Response) => {
    const stories = await prisma.story.findMany({
        where: { expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
        take: 30,
        include: { artist: { select: { id: true, stageName: true, avatarUrl: true } } },
    });
    return res.json({ success: true, data: stories });
});

feedRouter.post('/stories', authenticate, requireRole('ARTIST'), async (req: AuthRequest, res: Response) => {
    const artist = await prisma.artistProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!artist) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Perfil não encontrado' } });

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const story = await prisma.story.create({
        data: {
            artistId: artist.id,
            mediaUrl: req.body.mediaUrl || '',
            mediaType: req.body.mediaType || 'IMAGE',
            expiresAt,
        },
        include: {
            artist: { select: { id: true, stageName: true, avatarUrl: true } },
        },
    });

    return res.status(201).json({ success: true, data: story });
});

// ── DISCOVER ──────────────────────────────────────────────────
export const discoverRouter = Router();

discoverRouter.get('/', authenticate, requireRole('INDUSTRY', 'ADMIN', 'ARTIST'), async (req: Request, res: Response) => {
    const filters = DiscoverFiltersSchema.safeParse(req.query);
    if (!filters.success) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: filters.error.issues[0].message } });
    }

    const { states, genres, minScore, availableForBooking, page, perPage, sortBy } = filters.data;

    const where: any = {
        ...(states?.length && { state: { in: states } }),
        ...(genres?.length && { genres: { hasSome: genres } }),
        ...(minScore !== undefined && { scoreBeet: { gte: minScore } }),
        ...(availableForBooking !== undefined && { availableForBooking }),
    };

    const orderByMapping: Record<string, any> = {
        score: { scoreBeet: 'desc' },
        plays: { metrics: { plays: 'desc' } },
        growth: { metrics: { weeklyGrowth: 'desc' } },
        recent: { createdAt: 'desc' },
    };

    const orderBy = orderByMapping[sortBy || 'score'];

    const [artists, total] = await Promise.all([
        prisma.artistProfile.findMany({
            where,
            orderBy,
            skip: (page - 1) * perPage,
            take: perPage,
            include: { metrics: true },
        }),
        prisma.artistProfile.count({ where }),
    ]);

    return res.json({ success: true, data: artists, meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) } });
});

// ── RANKINGS ──────────────────────────────────────────────────
export const rankingsRouter = Router();

rankingsRouter.get('/', async (req: Request, res: Response) => {
    const filters = RankingsFiltersSchema.safeParse(req.query);
    const { state, genre, period, limit } = filters.success ? filters.data : { state: undefined, genre: undefined, period: 'week', limit: 10 };

    const where: any = {
        availableForBooking: true,
        ...(state && { state }),
        ...(genre && { genres: { has: genre } }),
    };

    const artists = await prisma.artistProfile.findMany({
        where,
        orderBy: { scoreBeet: 'desc' },
        take: limit as number,
        include: {
            metrics: { select: { plays: true, weeklyGrowth: true, engagement: true } },
            user: { select: { verified: true } },
        },
    });

    const ranked = artists.map((a: any, i: number) => ({
        rank: i + 1,
        ...a,
        trend: a.metrics?.weeklyGrowth && a.metrics.weeklyGrowth > 0 ? 'up' : a.metrics?.weeklyGrowth === 0 ? 'stable' : 'down',
    }));

    return res.json({ success: true, data: ranked });
});

