import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { CreateListingSchema } from '@beetbr/shared';

export const marketplaceRouter = Router();

// Get all listings with filters
marketplaceRouter.get('/', async (req, res) => {
    const { category, minPrice, maxPrice, search, visibility } = req.query;

    const where: any = {
        status: 'ACTIVE',
    };

    if (category) where.category = category as any;
    if (minPrice) where.price = { gte: parseFloat(minPrice as string) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice as string) };
    
    // Visibility filter (default to PUBLIC if not specified)
    if (visibility) {
        where.visibility = visibility as any;
    } else {
        where.visibility = 'PUBLIC';
    }

    if (search) {
        where.OR = [
            { title: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
        ];
    }

    const listings = await prisma.listing.findMany({
        where,
        include: {
            artistSeller: { select: { stageName: true, avatarUrl: true, scoreBeet: true, city: true, state: true } },
            industrySeller: { select: { companyName: true, logoUrl: true, city: true, state: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: listings });
});

// Create listing
marketplaceRouter.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    const validated = CreateListingSchema.safeParse(req.body);
    if (!validated.success) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: validated.error.issues[0].message } });
    }

    const { role, userId } = req.user!;
    let profileId = '';

    if (role === 'ARTIST') {
        const profile = await prisma.artistProfile.findUnique({ where: { userId } });
        if (!profile) return res.status(404).json({ success: false, error: { message: 'Perfil não encontrado' } });
        profileId = profile.id;
        
        // Bonus for creating listing
        await prisma.artistProfile.update({
            where: { id: profileId },
            data: { scoreBeet: { increment: 5 } }
        });
    } else {
        const profile = await prisma.industryProfile.findUnique({ where: { userId } });
        if (!profile) return res.status(404).json({ success: false, error: { message: 'Perfil não encontrado' } });
        profileId = profile.id;
    }

    const listing = await prisma.listing.create({
        data: {
            ...validated.data,
            sellerId: profileId,
            sellerType: role,
            artistSellerId: role === 'ARTIST' ? profileId : undefined,
            industrySellerId: role === 'INDUSTRY' ? profileId : undefined,
        },
    });

    return res.status(201).json({ success: true, data: listing });
});

// Get listing details
marketplaceRouter.get('/:id', async (req, res) => {
    const listing = await prisma.listing.findUnique({
        where: { id: req.params.id },
        include: {
            artistSeller: { select: { stageName: true, avatarUrl: true, scoreBeet: true, city: true, state: true, bio: true } },
            industrySeller: { select: { companyName: true, logoUrl: true, city: true, state: true } },
        },
    });

    if (!listing) return res.status(404).json({ success: false, error: { message: 'Anúncio não encontrado' } });

    // Increment views
    await prisma.listing.update({
        where: { id: listing.id },
        data: { views: { increment: 1 } },
    });

    return res.json({ success: true, data: listing });
});

/**
 * POST /api/marketplace/:id/inquiry
 * Start a chat about a listing
 */
marketplaceRouter.post('/:id/inquiry', authenticate, async (req: AuthRequest, res: Response) => {
    const { message } = req.body;
    const userId = req.user!.userId;

    const listing = await prisma.listing.findUnique({
        where: { id: req.params.id },
        include: {
            artistSeller: { select: { userId: true } },
            industrySeller: { select: { userId: true } },
        }
    });

    if (!listing) return res.status(404).json({ success: false, error: { message: 'Anúncio não encontrado' } });

    const sellerUserId = listing.artistSeller?.userId || listing.industrySeller?.userId;
    if (!sellerUserId) return res.status(500).json({ success: false, error: { message: 'Erro ao identificar vendedor' } });

    if (sellerUserId === userId) {
        return res.status(400).json({ success: false, error: { message: 'Você não pode iniciar um chat com seu próprio anúncio' } });
    }

    // Find or create thread
    let thread = await prisma.chatThread.findFirst({
        where: {
            type: 'MARKETPLACE',
            listingId: listing.id,
            participants: {
                every: {
                    id: { in: [userId, sellerUserId] }
                }
            }
        },
        include: { participants: true }
    });

    if (!thread) {
        thread = await prisma.chatThread.create({
            data: {
                type: 'MARKETPLACE',
                listingId: listing.id,
                participants: {
                    connect: [{ id: userId }, { id: sellerUserId }]
                },
                lastMessage: message || 'Interesse no anúncio',
                messages: {
                    create: {
                        senderId: userId,
                        content: message || `Olá, tenho interesse no seu anúncio: ${listing.title}`,
                    }
                }
            },
            include: { participants: true }
        });
    } else {
        // Add message to existing thread
        await prisma.chatMessage.create({
            data: {
                threadId: thread.id,
                senderId: userId,
                content: message || `Olá, tenho interesse no seu anúncio: ${listing.title}`,
            }
        });
        await prisma.chatThread.update({
            where: { id: thread.id },
            data: { lastMessage: message || 'Interesse no anúncio' }
        });
    }

    // Get sender info for notification
    const senderProfile = await prisma.artistProfile.findUnique({ where: { userId } }) 
        || await prisma.industryProfile.findUnique({ where: { userId } });
    const senderName = (senderProfile as any)?.stageName || (senderProfile as any)?.companyName || 'Um usuário';

    // Create notification for seller
    await prisma.notification.create({
        data: {
            userId: sellerUserId,
            type: 'MARKETPLACE_INTERACT',
            title: 'Novo contato no Marketplace!',
            message: `${senderName} tem interesse em: ${listing.title}`,
            link: `/${listing.sellerType === 'ARTIST' ? 'artist' : 'industry'}/messages?id=${thread.id}`
        }
    });

    return res.json({ success: true, data: thread });
});
