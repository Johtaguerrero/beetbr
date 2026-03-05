import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: 'ARTIST' | 'INDUSTRY' | 'ADMIN';
    };
}

/** Verify JWT access token and attach user to request */
export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token não fornecido' } });
    }

    const token = authHeader.slice(7);
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
            role: 'ARTIST' | 'INDUSTRY' | 'ADMIN';
        };

        // Ensure user still exists and is active
        const user = await prisma.user.findUnique({
            where: { id: payload.userId, status: 'ACTIVE' },
            select: { id: true, role: true },
        });
        if (!user) {
            return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Usuário não encontrado' } });
        }

        req.user = { userId: user.id, role: user.role as 'ARTIST' | 'INDUSTRY' | 'ADMIN' };
        next();
    } catch {
        return res.status(401).json({ success: false, error: { code: 'TOKEN_INVALID', message: 'Token inválido ou expirado' } });
    }
};

/** Require one of the specified roles */
export const requireRole = (...roles: ('ARTIST' | 'INDUSTRY' | 'ADMIN')[]) =>
    (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acesso não autorizado' } });
        }
        next();
    };

/** Check that the authenticated user is a participant in the given proposal */
export const requireProposalParticipant = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const { proposalId } = req.params;
    const userId = req.user!.userId;

    const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: {
            artist: { select: { userId: true } },
            industry: { select: { userId: true } },
        },
    });

    if (!proposal) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Proposta não encontrada' } });
    }

    const isParticipant =
        proposal.artist.userId === userId ||
        proposal.industry.userId === userId ||
        req.user!.role === 'ADMIN';

    if (!isParticipant) {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Você não é participante desta negociação' } });
    }

    (req as any).proposal = proposal;
    next();
};
