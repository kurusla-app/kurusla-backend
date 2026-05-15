import prisma from '../config/db';

/**
 * Kullanıcının FCM Token bilgisini günceller
 */
export async function updateFcmToken(userId: number, fcmToken: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: { fcmToken }
  });
}

/**
 * Kullanıcı bilgilerini getirir
 */
export async function getUserById(userId: number) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      balance: true,
      fcmToken: true,
      createdAt: true
    }
  });
}
