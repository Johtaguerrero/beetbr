import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode?: number;
    code?: string;
}

export const errorHandler = (
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_ERROR';

    if (process.env.NODE_ENV !== 'production') {
        console.error('[Error]', err.stack);
    }

    return res.status(statusCode).json({
        success: false,
        error: {
            code,
            message: statusCode === 500 ? 'Erro interno do servidor' : err.message,
        },
    });
};

export const createError = (message: string, statusCode: number, code: string): AppError => {
    const err = new Error(message) as AppError;
    err.statusCode = statusCode;
    err.code = code;
    return err;
};

export const notFound = (_req: Request, res: Response) => {
    return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Recurso não encontrado' },
    });
};
