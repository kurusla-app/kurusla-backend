import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app = express();

app.use(cors());
// Ekstre PDF (base64) için daha yüksek limit
app.use(express.json({ limit: '15mb' }));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Gateway & Rate Limiting (Kötü niyetli isteklere karşı kapıdaki koruma)
import { apiRateLimiter } from './middlewares/rateLimiter';
app.use('/api', apiRateLimiter);

// Routes
import authRoutes from './api/auth/auth.routes';
import webhookRoutes from './api/webhooks/webhook.routes';
import groupRoutes from './api/groups/groups.routes';
import userRoutes from './api/user/user.routes';
import aiRoutes from './api/ai/ai.routes';
import adminRoutes from './api/admin/admin.routes';
import potRoutes from './api/pots/pots.routes';
import statsRoutes from './api/stats/stats.routes';
import statementsRoutes from './api/statements/statements.routes';
import referralRoutes from './api/referral/referral.routes';
import chatRoutes from './api/chat/chat.routes';

app.use('/api/auth', authRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pots', potRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/statements', statementsRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/chat', chatRoutes);

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', message: 'Kurusla Backend TS is running!' });
});

export default app;
