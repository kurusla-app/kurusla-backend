import { Router } from 'express';
import { updateFcmToken, sendTestNotification } from './user.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

// FCM Token Güncelleme
router.post('/fcm-token', updateFcmToken);

// Test Bildirimi Gönder (Geliştirme aşamasında kolaylık olması için)
router.post('/test-notification', sendTestNotification);

export default router;
