import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';

export const industryRouter = Router();

/**
 * PATCH /api/industry/me — Update own industry profile
 */
industryRouter.patch('/me', authenticate, requireRole('INDUSTRY'), async (req: AuthRequest, res: Response) => {
    const industry = await prisma.industryProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!industry) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Perfil não encontrado' } });

    const { 
        companyName, 
        type, 
        niches, 
        city, 
        state, 
        logoUrl, 
        coverUrl, 
        website, 
        instagram, 
        cnpj 
    } = req.body;

    const updated = await prisma.industryProfile.update({
        where: { id: industry.id },
        data: {
            ...(companyName !== undefined && { companyName }),
            ...(type !== undefined && { type }),
            ...(niches !== undefined && { niches }),
            ...(city !== undefined && { city }),
            ...(state !== undefined && { state }),
            ...(logoUrl !== undefined && { logoUrl }),
            ...(coverUrl !== undefined && { coverUrl }),
            ...(website !== undefined && { website }),
            ...(instagram !== undefined && { instagram }),
            ...(cnpj !== undefined && { cnpj }),
        },
    });

    return res.json({ success: true, data: updated });
});
