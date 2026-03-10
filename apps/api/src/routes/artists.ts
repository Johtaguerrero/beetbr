import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { DiscoverFiltersSchema } from '@beetbr/shared';

export const artistsRouter = Router();

/**
 * GET /api/artists/:id — Public artist profile
 */
artistsRouter.get('/:id', async (req: Request, res: Response) => {
    const artist = await prisma.artistProfile.findUnique({
        where: { id: req.params.id },
        include: {
            metrics: true,
            posts: { orderBy: { createdAt: 'desc' }, take: 6 },
            user: { select: { verified: true } },
        },
    });

    if (!artist) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Artista não encontrado' } });

    // Hide private contact based on visibility setting
    const publicArtist = {
        ...artist,
        user: undefined,
        verified: artist.user.verified,
        // contact fields masked in public endpoint
        email: undefined,
        phone: undefined,
    };

    return res.json({ success: true, data: publicArtist });
});

/**
 * GET /api/artists/:id/private — ABAC: contact visible if industry has active proposal
 */
artistsRouter.get('/:id/private', authenticate, requireRole('INDUSTRY', 'ADMIN'), async (req: AuthRequest, res: Response) => {
    const artistProfile = await prisma.artistProfile.findUnique({ where: { id: req.params.id } });
    if (!artistProfile) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Artista não encontrado' } });

    const industry = await prisma.industryProfile.findUnique({ where: { userId: req.user!.userId } });

    // Check ABAC: has active proposal OR artist set visibility to PUBLIC
    let canViewContact = artistProfile.contactVisibility === 'PUBLIC';

    if (!canViewContact && industry) {
        const activeProposal = await prisma.proposal.findFirst({
            where: {
                artistId: artistProfile.id,
                industryId: industry.id,
                status: { in: ['SENT', 'VIEWED', 'NEGOTIATING', 'ACCEPTED'] },
            },
        });
        canViewContact = !!activeProposal;
    }

    const artistUser = await prisma.user.findUnique({ where: { id: artistProfile.userId }, select: { email: true } });

    return res.json({
        success: true,
        data: {
            ...artistProfile,
            email: canViewContact ? artistUser?.email : null,
            contactUnlocked: canViewContact,
        },
    });
});

/**
 * PATCH /api/artist/me — Update own profile
 */
artistsRouter.patch('/me', authenticate, requireRole('ARTIST'), async (req: AuthRequest, res: Response) => {
    const artist = await prisma.artistProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!artist) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Perfil não encontrado' } });

    const { stageName, genres, city, state, bio, availableForBooking, contactVisibility, instagram, website, avatarUrl, coverUrl } = req.body;

    const updated = await prisma.artistProfile.update({
        where: { id: artist.id },
        data: {
            ...(stageName !== undefined && { stageName }),
            ...(genres !== undefined && { genres }),
            ...(city !== undefined && { city }),
            ...(state !== undefined && { state }),
            ...(bio !== undefined && { bio }),
            ...(availableForBooking !== undefined && { availableForBooking }),
            ...(contactVisibility !== undefined && { contactVisibility }),
            ...(instagram !== undefined && { instagram }),
            ...(website !== undefined && { website }),
            ...(avatarUrl !== undefined && { avatarUrl }),
            ...(coverUrl !== undefined && { coverUrl }),
        },
    });

    return res.json({ success: true, data: updated });
});

