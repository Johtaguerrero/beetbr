import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';

import { authRouter } from './routes/auth';
import { artistsRouter } from './routes/artists';
import { feedRouter, discoverRouter, rankingsRouter } from './routes/feedDiscoverRankings';
import { shortlistRouter, contractsRouter, settingsRouter } from './routes/shortlistContractsSettings';
import { proposalsRouter } from './routes/proposals';
import { uploadsRouter } from './routes/uploads';
import { marketplaceRouter } from './routes/marketplace';
import { collaborationsRouter } from './routes/collaborations';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';
import { initWebSocket } from './ws/dealRoom';

const app = express();
const server = http.createServer(app);

// ── Security & Parsing ────────────────────────────────────────
app.use(helmet());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Static files (Uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── Global Rate Limiting ──────────────────────────────────────
app.use('/api/', apiLimiter);

// ── Health Check ──────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/artists', artistsRouter);
app.use('/api/feed', feedRouter);
app.use('/api/discover', discoverRouter);
app.use('/api/rankings', rankingsRouter);
app.use('/api/shortlist', shortlistRouter);
app.use('/api/proposals', proposalsRouter);
app.use('/api/contracts', contractsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/collaborations', collaborationsRouter);

// ── Error Handler (must be last) ──────────────────────────────
app.use(errorHandler);

// ── WebSocket (Deal Room) ─────────────────────────────────────
initWebSocket(server);

// ── Start Server ──────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '4000', 10);
server.listen(PORT, () => {
    console.log(`🎵 BeatBR API running on port ${PORT}`);
});

export { app, server };

