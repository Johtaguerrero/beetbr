import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { CreateListingSchema } from '@beetbr/shared';

export const marketplaceRouter = Router();

// Get all listings with filters
marketplaceRouter.get('/', async (req, res) => {
    const { category, minPrice, maxPrice, search } = req.query;

    const where: any = {
        status: 'ACTIVE',
    };

    if (category) where.category = category;
    if (minPrice) where.price = { gte: parseFloat(minPrice as string) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice as string) };
    if (search) {
        where.OR = [
            { title: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
        ];
    }

    const listings = await prisma.listing.findMany({
        where,
        include: {
            artistSeller: { select: { stageName: true, avatarUrl: true } },
            industrySeller: { select: { companyName: true, logoUrl: true } },
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
    } else {
        const profile = await prisma.industryProfile.findUnique({ where: { userId } });
        if (!profile) return res.status(404).json({ success: false, error: { message: 'Perfil não encontrado' } });
        profileId = profile.id;
    }

    const listing = await prisma.listing.create({
        data: {
            ...validated.data,
            price: validated.data.price,
            sellerId: profileId,
            sellerType: role,
        },
    });

    return res.status(201).json({ success: true, data: listing });
});

// Get listing details
marketplaceRouter.get('/:id', async (req, res) => {
    const listing = await prisma.listing.findUnique({
        where: { id: req.params.id },
        include: {
            artistSeller: { select: { stageName: true, avatarUrl: true, city: true, state: true } },
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
