import { Request, Response } from 'express';
import * as userService from '../../services/user.service';
import * as notificationService from '../../services/notification.service';
import { checkIradeSahibi, checkGrupLideri, checkKuruscu } from '../../jobs/badgeJob';

/**
 * FCM Token güncelleme kontrolcüsü
 */
export async function updateFcmToken(req: Request, res: Response): Promise<any> {
  try {
    const { userId, fcmToken } = req.body;

    if (!userId || !fcmToken) {
      return res.status(400).json({ error: 'userId ve fcmToken zorunludur.' });
    }

    await userService.updateFcmToken(Number(userId), fcmToken);

    return res.status(200).json({ message: 'FCM Token başarıyla güncellendi.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Test bildirimi gönderme kontrolcüsü
 */
export async function sendTestNotification(req: Request, res: Response): Promise<any> {
  try {
    const { userId, title, body } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId zorunludur.' });
    }

    await notificationService.sendNotificationToUser(
      Number(userId),
      title || 'Test Bildirimi',
      body || 'Bu bir test bildirimidir 🚀'
    );

    return res.status(200).json({ message: 'Test bildirimi gönderildi.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
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
