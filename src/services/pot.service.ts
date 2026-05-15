import prisma from '../config/db';
import { StatsService } from './stats.service';
import { sendNotificationToUser } from './notification.service';

/**
 * Ortak Birikim (Pot) Yönetimi Servisi
 */
export class PotService {
  
  /**
   * Yeni bir pot oluşturur
   */
  static async createPot(groupId: number, name: string, targetAmount: number) {
    return await (prisma as any).pot.create({
      data: {
        groupId,
        name,
        targetAmount,
        currentAmount: 0
      }
    });
  }

  /**
   * Pota para ekler (Harcama birikimi üzerinden)
   */
  static async contributeToPot(potId: number, userId: number, amount: number) {
    // 1. Pota ekle
    const pot = await (prisma as any).pot.update({
      where: { id: potId },
      data: {
        currentAmount: { increment: amount }
      },
      include: { group: { include: { users: true } } }
    });

    // 2. İşlemi kaydet (Onay gerektirmeyen küçük birikimler için APPROVED)
    await (prisma as any).potRequest.create({
      data: {
        potId,
        userId,
        amount,
        type: 'CONTRIBUTION',
        status: 'APPROVED'
      }
    });

    // 3. Bildirim Gönder (Aile üyelerine)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const notificationBody = `${(user as any)?.firstName || 'Biri'}, ${pot.name} potuna ${amount.toFixed(2)} TL ekledi! 💰`;
    
    // Gruptaki her kullanıcıya bildir
    if (pot.group && pot.group.users) {
      for (const groupUser of pot.group.users) {
        if (groupUser.fcmToken) {
          await sendNotificationToUser(groupUser.id, 'Ortak Birikim Güncellendi!', notificationBody);
        }
      }
    }

    return pot;
  }

  /**
   * Para çekme talebi oluşturur (Onay gerektirir)
   */
  static async requestWithdrawal(potId: number, userId: number, amount: number) {
    return await (prisma as any).potRequest.create({
      data: {
        potId,
        userId,
        amount,
        type: 'WITHDRAWAL',
        status: 'PENDING'
      }
    });
  }

  /**
   * Talebi onayla
   */
  static async approveRequest(requestId: number) {
    const request = await (prisma as any).potRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new Error('Talep bulunamadı.');

    if (request.type === 'WITHDRAWAL') {
      await (prisma as any).pot.update({
        where: { id: request.potId },
        data: { currentAmount: { decrement: request.amount } }
      });
    }

    return await (prisma as any).potRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' }
    });
  }
}
