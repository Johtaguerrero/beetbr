import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { DiscoverFiltersSchema } from '@beetbr/shared';

export const artistsRouter = Router();

/**
 * GET /api/artists/following — Get list of artist IDs the current user follows
 */
artistsRouter.get('/following', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const follows = await prisma.follow.findMany({
            where: { followerId: req.user!.userId },
            select: { followingId: true }
        });
        
        // Map to artistId if needed? 
        // Actually, the Follow table tracks followingId (which is the USER ID of the followed artist).
        // Let's get the artistProfile.id instead to be consistent with the frontend store which uses artistId.
        
        const artistProfiles = await prisma.artistProfile.findMany({
            where: { userId: { in: follows.map(f => f.followingId) } },
            select: { id: true }
        });

        return res.json({ success: true, data: artistProfiles.map(p => p.id) });
    } catch (error: any) {
        console.error('[Following] Error:', error);
        return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
});


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

    const {
        stageName, genres, city, state, bio, availableForBooking, contactVisibility,
        instagram, website, avatarUrl, coverUrl,
        realName, pronouns, birthDate, bioFull, subGenres, complementaryStyles,
        roles, professionalQuestions, status, mainGoal, availabilityStatus,
        opportunityTypes, socialProofs, portfolioPdfUrl, portfolioPdfName,
        youtubeUrl, spotifyUrl, tiktokUrl, soundcloudUrl, deezerUrl
    } = req.body;

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

            // Novos campos
            ...(realName !== undefined && { realName }),
            ...(pronouns !== undefined && { pronouns }),
            ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
            ...(bioFull !== undefined && { bioFull }),
            ...(subGenres !== undefined && { subGenres }),
            ...(complementaryStyles !== undefined && { complementaryStyles }),
            ...(roles !== undefined && { roles }),
            ...(professionalQuestions !== undefined && { professionalQuestions }),
            ...(status !== undefined && { status }),
            ...(mainGoal !== undefined && { mainGoal }),
            ...(availabilityStatus !== undefined && { availabilityStatus }),
            ...(opportunityTypes !== undefined && { opportunityTypes }),
            ...(socialProofs !== undefined && { socialProofs }),
            ...(portfolioPdfUrl !== undefined && { portfolioPdfUrl }),
            ...(portfolioPdfName !== undefined && { portfolioPdfName }),
            ...(youtubeUrl !== undefined && { youtubeUrl }),
            ...(spotifyUrl !== undefined && { spotifyUrl }),
            ...(tiktokUrl !== undefined && { tiktokUrl }),
            ...(soundcloudUrl !== undefined && { soundcloudUrl }),
            ...(deezerUrl !== undefined && { deezerUrl }),
        },
    });

    // Recalculate score after update
    const { refreshArtistScore } = require('../services/beetAI');
    await refreshArtistScore(updated.id);

    console.log(`[Artists] Profile updated for user ${req.user!.userId}`);
    return res.json({ success: true, data: updated });
});

/**
 * POST /api/artists/:id/follow
 */
artistsRouter.post('/:id/follow', authenticate, async (req: AuthRequest, res: Response) => {
    const artistId = req.params.id;
    const followerUserId = req.user!.userId;
    const followerRole = req.user!.role;

    try {
        const artist = await prisma.artistProfile.findUnique({ where: { id: artistId } });
        if (!artist) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Artista não encontrado' } });

        // Prevents self-follow
        if (artist.userId === followerUserId) {
            return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Você não pode seguir a si mesmo' } });
        }

        // Create follow
        await prisma.follow.upsert({
            where: {
                followerId_followingId: {
                    followerId: followerUserId,
                    followingId: artist.userId
                }
            },
            update: { followerRole },
            create: {
                followerId: followerUserId,
                followingId: artist.userId,
                followerRole
            }
        });

        // Update counters
        const isArtistFollower = followerRole === 'ARTIST';
        await prisma.artistProfile.update({
            where: { id: artistId },
            data: {
                followerCountTotal: { increment: 1 },
                followerCountArtist: isArtistFollower ? { increment: 1 } : undefined,
                followerCountIndustry: !isArtistFollower ? { increment: 1 } : undefined,
            }
        });

        // Notify artist
        const followerName = isArtistFollower 
            ? (await prisma.artistProfile.findUnique({ where: { userId: followerUserId } }))?.stageName 
            : (await prisma.industryProfile.findUnique({ where: { userId: followerUserId } }))?.companyName;

        await prisma.notification.create({
            data: {
                userId: artist.userId,
                type: 'NEW_FOLLOWER',
                title: 'Novo seguidor!',
                message: `${followerName || 'Alguém'} começou a seguir você.`,
                link: `/artist/profile/${artistId}` 
            }
        });

        // Update score
        const { refreshArtistScore } = require('../services/beetAI');
        await refreshArtistScore(artistId);

        return res.json({ success: true, message: 'Seguindo artista' });
    } catch (error: any) {
        console.error('[Follow] Error:', error);
        return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
});

/**
 * POST /api/artists/:id/unfollow
 */
artistsRouter.post('/:id/unfollow', authenticate, async (req: AuthRequest, res: Response) => {
    const artistId = req.params.id;
    const followerUserId = req.user!.userId;

    try {
        const artist = await prisma.artistProfile.findUnique({ where: { id: artistId } });
        if (!artist) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Artista não encontrado' } });

        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: followerUserId,
                    followingId: artist.userId
                }
            }
        });

        if (!follow) return res.json({ success: true, message: 'Não estava seguindo' });

        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: followerUserId,
                    followingId: artist.userId
                }
            }
        });

        // Update counters
        const isArtistFollower = follow.followerRole === 'ARTIST';
        await prisma.artistProfile.update({
            where: { id: artistId },
            data: {
                followerCountTotal: { decrement: 1 },
                followerCountArtist: isArtistFollower ? { decrement: 1 } : undefined,
                followerCountIndustry: !isArtistFollower ? { decrement: 1 } : undefined,
            }
        });

        // Update score
        const { refreshArtistScore } = require('../services/beetAI');
        await refreshArtistScore(artistId);

        return res.json({ success: true, message: 'Deixou de seguir' });
    } catch (error: any) {
        console.error('[Unfollow] Error:', error);
        return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
});
