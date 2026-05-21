import { Router } from 'express';
import { handleSmsWebhook } from './webhook.controller';
import { requireInternalOrAuth } from '../../middlewares/auth';

const router = Router();

router.post('/sms', requireInternalOrAuth, handleSmsWebhook);

export default router;
