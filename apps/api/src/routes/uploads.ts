import { Router, Response } from 'express';
import { upload } from '../middleware/upload';
import { authenticate, AuthRequest } from '../middleware/auth';

export const uploadsRouter = Router();

uploadsRouter.post('/', authenticate, upload.single('file'), (req: AuthRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Nenhum arquivo enviado' } });
    }

    const fileUrl = `/api/uploads/${req.file.filename}`;

    return res.json({
        success: true,
        data: {
            url: fileUrl,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
        },
    });
});
