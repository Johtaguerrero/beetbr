import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// List all threads for current user
router.get('/', authenticate, async (req: AuthRequest, res) => {
    const userId = req.user!.userId;

    const threads = await prisma.chatThread.findMany({
        where: {
            participants: {
                some: { id: userId }
            }
        },
        include: {
            participants: {
                select: {
                    id: true,
                    role: true,
                    artistProfile: { select: { stageName: true, avatarUrl: true } },
                    industryProfile: { select: { companyName: true, logoUrl: true } }
                }
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            },
            proposal: { select: { type: true, status: true } },
            collab: { select: { title: true } },
            listing: { select: { title: true } }
        },
        orderBy: { updatedAt: 'desc' }
    });

    res.json({ success: true, data: threads });
});

// Get single thread with messages
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.userId;

    const thread = await prisma.chatThread.findUnique({
        where: { id },
        include: {
            participants: {
                select: {
                    id: true,
                    role: true,
                    artistProfile: { select: { stageName: true, avatarUrl: true } },
                    industryProfile: { select: { companyName: true, logoUrl: true } }
                }
            },
            messages: {
                orderBy: { createdAt: 'asc' },
                include: {
                    sender: {
                        select: {
                            id: true,
                            role: true,
                            artistProfile: { select: { stageName: true, avatarUrl: true } },
                            industryProfile: { select: { companyName: true, logoUrl: true } }
                        }
                    }
                }
            }
        }
    });

    if (!thread) return res.status(404).json({ success: false, error: { message: 'Chat não encontrado' } });
    
    // Check participation
    if (!thread.participants.some(p => p.id === userId)) {
        return res.status(403).json({ success: false, error: { message: 'Acesso negado' } });
    }

    res.json({ success: true, data: thread });
});

// Send message
router.post('/:id/messages', authenticate, async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { content, attachmentUrl, attachmentName } = req.body;
    const userId = req.user!.userId;

    const thread = await prisma.chatThread.findUnique({
        where: { id },
        include: { participants: true }
    });

    if (!thread) return res.status(404).json({ success: false, error: { message: 'Chat não encontrado' } });
    if (!thread.participants.some(p => p.id === userId)) {
        return res.status(403).json({ success: false, error: { message: 'Acesso negado' } });
    }

    const message = await prisma.chatMessage.create({
        data: {
            threadId: id,
            senderId: userId,
            content,
            attachmentUrl,
            attachmentName
        },
        include: {
            sender: {
                select: {
                    id: true,
                    role: true,
                    artistProfile: { select: { stageName: true, avatarUrl: true } },
                    industryProfile: { select: { companyName: true, logoUrl: true } }
                }
            }
        }
    });

    // Update thread timestamp and last message
    await prisma.chatThread.update({
        where: { id },
        data: { 
            updatedAt: new Date(),
            lastMessage: content
        }
    });

    res.json({ success: true, data: message });
});

export { router as chatsRouter };
