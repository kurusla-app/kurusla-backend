import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import prisma from '../config/db';

const serviceAccountPath = path.join(process.cwd(), '.firebase-admin-key.json');

// Firebase'i initialize et
if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin SDK başarıyla başlatıldı.');
  }
} else {
  console.warn('⚠️ Firebase anahtar dosyası bulunamadı (.firebase-admin-key.json). Bildirimler gönderilemeyecek.');
}

/**
 * Belirli bir kullanıcıya push bildirimi gönderir
 */
export async function sendNotificationToUser(userId: number, title: string, body: string, data?: any) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true }
    });

    if (!user || !user.fcmToken) {
      console.log(`Bildirim gönderilemedi: Kullanıcı (${userId}) fcmToken bilgisi yok.`);
      return;
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      token: user.fcmToken,
    };

    const response = await admin.messaging().send(message);
    console.log('Bildirim başarıyla gönderildi:', response);
    return response;
  } catch (error) {
    console.error('Bildirim gönderilirken hata oluştu:', error);
    throw error;
  }
}

/**
 * Birden fazla kullanıcıya (örneğin bir gruba) bildirim gönderir
 */
export async function sendNotificationToGroup(userIds: number[], title: string, body: string, data?: any) {
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { fcmToken: true }
  });

  const tokens = users.map(u => u.fcmToken).filter(t => t !== null) as string[];

  if (tokens.length === 0) return;

  const message = {
    notification: { title, body },
    data: data || {},
    tokens: tokens,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`${response.successCount} bildirim başarıyla gönderildi.`);
    return response;
  } catch (error) {
    console.error('Grup bildirimi gönderilirken hata oluştu:', error);
  }
}
