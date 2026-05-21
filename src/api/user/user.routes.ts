import { Router } from 'express';
import {
  getMe,
  updateFcmToken,
  sendTestNotification,
  triggerBadgeCheck,
} from './user.controller';
import { requireAuth, requireAdmin } from '../../middlewares/auth';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Dashboard — bakiye, birikim, yuvarlama kuralı
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', getMe);

router.post('/fcm-token', updateFcmToken);
router.post('/test-notification', sendTestNotification);
router.post('/trigger-badges', requireAdmin, triggerBadgeCheck);

export default router;
