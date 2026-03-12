import rateLimit from 'express-rate-limit';

const createLimiter = (windowMs: number, max: number, message: string) =>
    rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, error: { code: 'RATE_LIMITED', message } },
    });

/** General API limiter: 100 req/15min per IP */
export const apiLimiter = createLimiter(
    15 * 60 * 1000,
    100,
    'Muitas requisições. Tente novamente em 15 minutos.'
);

/** Auth endpoints: 30 attempts/15min */
export const authLimiter = createLimiter(
    15 * 60 * 1000,
    30,
    'Muitas tentativas de login. Tente novamente em 15 minutos.'
);

/** Proposal creation: 20/hour per user */
export const proposalLimiter = createLimiter(
    60 * 60 * 1000,
    20,
    'Limite de propostas atingido. Tente novamente em 1 hora.'
);

/** Chat messages: 60/min per user */
export const messageLimiter = createLimiter(
    60 * 1000,
    60,
    'Muitas mensagens enviadas. Aguarde um momento.'
);
