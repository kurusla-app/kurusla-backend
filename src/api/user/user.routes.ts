import { Router } from 'express';
import { updateFcmToken, sendTestNotification, triggerBadgeCheck } from './user.controller';
import { requireAuth, requireAdmin } from '../../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.post('/fcm-token', updateFcmToken);
router.post('/test-notification', sendTestNotification);
router.post('/trigger-badges', requireAdmin, triggerBadgeCheck);

export default router;
