import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { authLimiter } from '../middleware/rateLimit';
import { LoginSchema, RegisterSchema } from '@beetbr/shared';
import { refreshArtistScore } from '../services/beetAI';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', authLimiter, async (req: Request, res: Response) => {
    const body = RegisterSchema.safeParse(req.body);
    if (!body.success) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: body.error.issues[0].message } });
    }

    const { email, password, role, stageName, companyName } = body.data;

    if (role === 'ARTIST' && !stageName) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Nome artístico é obrigatório' } });
    }
    if (role === 'INDUSTRY' && !companyName) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Nome da empresa é obrigatório' } });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(409).json({ success: false, error: { code: 'EMAIL_IN_USE', message: 'Este email já está em uso' } });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            role: role as 'ARTIST' | 'INDUSTRY',
            artistProfile:
                role === 'ARTIST'
                    ? {
                        create: {
                            stageName: stageName!,
                            genres: [],
                            city: '',
                            state: 'SP',
                            bio: '',
                        },
                    }
                    : undefined,
            industryProfile:
                role === 'INDUSTRY'
                    ? {
                        create: {
                            companyName: companyName!,
                            type: 'OTHER',
                            niches: [],
                            city: '',
                            state: 'SP',
                        },
                    }
                    : undefined,
        },
        include: { artistProfile: true, industryProfile: true },
    });

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id);

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    return res.status(201).json({
        success: true,
        data: {
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email, role: user.role },
            profile: user.artistProfile ?? user.industryProfile,
        },
    });
});

// POST /api/auth/login
authRouter.post('/login', authLimiter, async (req: Request, res: Response) => {
    const body = LoginSchema.safeParse(req.body);
    if (!body.success) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos' } });
    }

    const { email, password } = body.data;

    const user = await prisma.user.findUnique({
        where: { email, status: 'ACTIVE' },
        include: { artistProfile: true, industryProfile: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Email ou senha incorretos' } });
    }

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    return res.json({
        success: true,
        data: {
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email, role: user.role },
            profile: user.artistProfile ?? user.industryProfile,
        },
    });
});

// POST /api/auth/refresh
authRouter.post('/refresh', async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ success: false, error: { code: 'MISSING_TOKEN', message: 'Refresh token obrigatório' } });
    }

    try {
        const { userId } = verifyRefreshToken(refreshToken);
        const user = await prisma.user.findUnique({ where: { id: userId, refreshToken } });
        if (!user) throw new Error('Token inválido');

        const newAccess = signAccessToken(user.id, user.role);
        const newRefresh = signRefreshToken(user.id);
        await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefresh } });

        return res.json({ success: true, data: { accessToken: newAccess, refreshToken: newRefresh } });
    } catch {
        return res.status(401).json({ success: false, error: { code: 'TOKEN_INVALID', message: 'Refresh token inválido' } });
    }
});

// POST /api/auth/logout
authRouter.post('/logout', async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
        try {
            const { userId } = verifyRefreshToken(refreshToken);
            await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
        } catch { /* ignore */ }
    }
    return res.json({ success: true, data: null });
});

