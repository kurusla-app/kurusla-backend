import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
import groupRoutes from './api/groups';
import authRoutes from './api/auth/auth.routes';
import webhookRoutes from './api/webhooks/webhook.routes';

app.use('/api/auth', authRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/groups', groupRoutes);

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', message: 'Kurusla Backend TS is running!' });
});

export default app;
