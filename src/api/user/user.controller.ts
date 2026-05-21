import { Request, Response } from 'express';
import * as userService from '../../services/user.service';
import * as notificationService from '../../services/notification.service';
import { checkIradeSahibi, checkGrupLideri, checkKuruscu } from '../../jobs/badgeJob';
import { getAuthenticatedUserId, handleAuthError } from '../../utils/authUser';

/**
 * FCM Token güncelleme kontrolcüsü
 */
export async function updateFcmToken(req: Request, res: Response): Promise<any> {
  try {
    const userId = getAuthenticatedUserId(req);
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ error: 'fcmToken zorunludur.' });
    }

    await userService.updateFcmToken(userId, fcmToken);

    return res.status(200).json({ message: 'FCM Token başarıyla güncellendi.' });
  } catch (error: unknown) {
    if (handleAuthError(res, error)) return;
    const message = error instanceof Error ? error.message : 'Sunucu hatası';
    return res.status(500).json({ error: message });
  }
}

/**
 * Test bildirimi gönderme kontrolcüsü
 */
export async function sendTestNotification(req: Request, res: Response): Promise<any> {
  try {
    const userId = getAuthenticatedUserId(req);
    const { title, body } = req.body;

    await notificationService.sendNotificationToUser(
      userId,
      title || 'Test Bildirimi',
      body || 'Bu bir test bildirimidir 🚀'
    );

    return res.status(200).json({ message: 'Test bildirimi gönderildi.' });
  } catch (error: unknown) {
    if (handleAuthError(res, error)) return;
    const message = error instanceof Error ? error.message : 'Sunucu hatası';
    return res.status(500).json({ error: message });
  }
}

/**
 * Rozet kontrollerini manuel tetikler (Test amaçlı)
 */
export async function triggerBadgeCheck(req: Request, res: Response): Promise<any> {
  try {
    await checkIradeSahibi();
    await checkGrupLideri();
    await checkKuruscu();
    
    return res.status(200).json({ message: 'Rozet kontrolleri başarıyla çalıştırıldı.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
