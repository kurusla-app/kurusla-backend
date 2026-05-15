import { Router } from 'express';
import { updateFcmToken, sendTestNotification, triggerBadgeCheck } from './user.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

// FCM Token Güncelleme
router.post('/fcm-token', updateFcmToken);

// Test Bildirimi Gönder
router.post('/test-notification', sendTestNotification);

// Rozet Kontrollerini Manuel Tetikle
router.post('/trigger-badges', triggerBadgeCheck);

export default router;
