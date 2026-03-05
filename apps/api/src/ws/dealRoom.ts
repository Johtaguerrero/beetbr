import http from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { WsMessage, WsChatPayload, WsTypingPayload } from '@beetbr/shared';

interface AuthenticatedWebSocket extends WebSocket {
    userId?: string;
    role?: string;
    proposalId?: string;
    isAlive?: boolean;
}

const rooms = new Map<string, Set<AuthenticatedWebSocket>>();

export function initWebSocket(server: http.Server) {
    const wss = new WebSocketServer({ server, path: '/ws/deals' });

    // ── Connection ──────────────────────────────────────────────
    wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
        // Extract token and proposalId from URL: /ws/deals/:proposalId?token=xxx
        const url = new URL(req.url!, `http://localhost`);
        const proposalId = url.pathname.split('/').filter(Boolean).pop();
        const token = url.searchParams.get('token');

        if (!token || !proposalId) {
            ws.close(4001, 'Missing token or proposalId');
            return;
        }

        // Verify JWT
        let userId: string;
        let role: string;
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
            userId = payload.userId;
            role = payload.role;
        } catch {
            ws.close(4001, 'Invalid token');
            return;
        }

        // Verify user is a participant in this proposal
        const proposal = await prisma.proposal.findUnique({
            where: { id: proposalId },
            include: {
                artist: { select: { userId: true } },
                industry: { select: { userId: true } },
            },
        });

        if (!proposal) { ws.close(4004, 'Proposal not found'); return; }

        const isParticipant =
            proposal.artist.userId === userId ||
            proposal.industry.userId === userId ||
            role === 'ADMIN';

        if (!isParticipant) { ws.close(4003, 'Forbidden'); return; }

        // Join room
        ws.userId = userId;
        ws.role = role;
        ws.proposalId = proposalId;
        ws.isAlive = true;

        if (!rooms.has(proposalId)) rooms.set(proposalId, new Set());
        rooms.get(proposalId)!.add(ws);

        // Notify room of join
        broadcast(proposalId, {
            type: 'USER_JOINED',
            payload: { userId, role },
            timestamp: new Date().toISOString(),
        }, ws);

        // ── Messages ──────────────────────────────────────────────
        ws.on('message', async (rawData) => {
            let parsed: WsMessage;
            try {
                parsed = JSON.parse(rawData.toString());
            } catch {
                ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Invalid JSON' }, timestamp: new Date().toISOString() }));
                return;
            }

            switch (parsed.type) {
                case 'CHAT_MESSAGE': {
                    const { message, attachmentUrl, attachmentName } = parsed.payload as WsChatPayload;
                    if (!message && !attachmentUrl) break;

                    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });

                    const saved = await prisma.proposalMessage.create({
                        data: {
                            proposalId,
                            senderUserId: userId,
                            message,
                            attachmentUrl,
                            attachmentName,
                            systemMessage: false,
                        },
                    });

                    // Auto-set status to NEGOTIATING on first message from either side
                    if (proposal.status === 'VIEWED' || proposal.status === 'SENT') {
                        await prisma.proposal.update({ where: { id: proposalId }, data: { status: 'NEGOTIATING' } });
                    }

                    broadcast(proposalId, {
                        type: 'CHAT_MESSAGE',
                        payload: { ...saved, senderRole: user?.role },
                        timestamp: new Date().toISOString(),
                    });
                    break;
                }

                case 'USER_TYPING': {
                    const { isTyping } = parsed.payload as WsTypingPayload;
                    broadcast(proposalId, {
                        type: 'USER_TYPING',
                        payload: { userId, isTyping },
                        timestamp: new Date().toISOString(),
                    }, ws); // don't echo back
                    break;
                }

                default:
                    break;
            }
        });

        ws.on('pong', () => { ws.isAlive = true; });

        ws.on('close', () => {
            rooms.get(proposalId)?.delete(ws);
            if (rooms.get(proposalId)?.size === 0) rooms.delete(proposalId);
            broadcast(proposalId, {
                type: 'USER_LEFT',
                payload: { userId },
                timestamp: new Date().toISOString(),
            });
        });
    });

    // ── Heartbeat ─────────────────────────────────────────────
    const interval = setInterval(() => {
        wss.clients.forEach((rawWs) => {
            const ws = rawWs as AuthenticatedWebSocket;
            if (!ws.isAlive) { ws.terminate(); return; }
            ws.isAlive = false;
            ws.ping();
        });
    }, 30_000);

    wss.on('close', () => clearInterval(interval));

    console.log('🎙️  Deal Room WebSocket ready at /ws/deals');
}

function broadcast(proposalId: string, message: WsMessage, exclude?: WebSocket) {
    const room = rooms.get(proposalId);
    if (!room) return;
    const data = JSON.stringify(message);
    room.forEach((client) => {
        if (client !== exclude && client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

