import { Router } from 'express';
import { handleSmsWebhook } from './webhook.controller';

const router = Router();

// POST /api/webhooks/sms
router.post('/sms', handleSmsWebhook);

export default router;
