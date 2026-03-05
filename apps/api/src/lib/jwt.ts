import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const signAccessToken = (userId: string, role: string) =>
    jwt.sign({ userId, role }, ACCESS_SECRET, { expiresIn: '15m' });

export const signRefreshToken = (userId: string) =>
    jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });

export const verifyRefreshToken = (token: string): { userId: string } =>
    jwt.verify(token, REFRESH_SECRET) as { userId: string };
