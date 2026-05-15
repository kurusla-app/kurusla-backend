import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
import authRoutes from './api/auth/auth.routes';
import webhookRoutes from './api/webhooks/webhook.routes';
import groupRoutes from './api/groups/groups.routes';
import userRoutes from './api/user/user.routes';
import aiRoutes from './api/ai/ai.routes';

app.use('/api/auth', authRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', message: 'Kurusla Backend TS is running!' });
});

export default app;
