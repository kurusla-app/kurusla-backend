import prisma from '../config/db';
import { PotRequestType } from '@prisma/client';
import { sendNotificationToUser } from './notification.service';

/**
 * Kuruşla Paylaş — ortak birikim (Pot) yönetimi
 */
export class PotService {
  static async createPot(
    groupId: number,
    name: string,
    targetAmount: number,
    createdById?: number,
    description?: string
  ) {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new Error('Grup bulunamadı.');

    const pot = await prisma.pot.create({
      data: {
        groupId,
        name,
        description,
        targetAmount,
        currentAmount: 0,
        createdById,
      },
    });

    if (createdById) {
      await this.joinPot(pot.id, createdById);
    }

    return pot;
  }

  /**
   * Kullanıcıyı pota katılımcı olarak ekler
   */
  static async joinPot(potId: number, userId: number) {
    const pot = await prisma.pot.findUnique({
      where: { id: potId },
      include: { group: true },
    });

    if (!pot || !pot.isActive) {
      throw new Error('Pot bulunamadı veya aktif değil.');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Kullanıcı bulunamadı.');

    if (user.groupId !== pot.groupId) {
      throw new Error('Bu pota katılmak için önce gruba dahil olmalısınız.');
    }

    return prisma.potParticipant.upsert({
      where: { userId_potId: { userId, potId } },
      update: {},
      create: { userId, potId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        pot: true,
      },
    });
  }

  static async contributeToPot(potId: number, userId: number, amount: number) {
    await this.joinPot(potId, userId);

    const pot = await prisma.pot.update({
      where: { id: potId },
      data: { currentAmount: { increment: amount } },
      include: { group: { include: { users: true } } },
    });

    await prisma.potParticipant.update({
      where: { userId_potId: { userId, potId } },
      data: { totalContributed: { increment: amount } },
    });

    await prisma.potRequest.create({
      data: {
        potId,
        userId,
        amount,
        type: PotRequestType.CONTRIBUTION,
        status: 'APPROVED',
      },
    });

    await prisma.group.update({
      where: { id: pot.groupId },
      data: { totalSavings: { increment: amount } },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const notificationBody = `${user?.firstName || 'Biri'}, ${pot.name} potuna ${amount.toFixed(2)} TL ekledi!`;

    if (pot.group?.users) {
      for (const groupUser of pot.group.users) {
        if (groupUser.fcmToken) {
          await sendNotificationToUser(
            groupUser.id,
            'Kuruşla Paylaş — Birikim Güncellendi',
            notificationBody
          );
        }
      }
    }

    return pot;
  }

  static async requestWithdrawal(potId: number, userId: number, amount: number) {
    await this.joinPot(potId, userId);

    return prisma.potRequest.create({
      data: {
        potId,
        userId,
        amount,
        type: PotRequestType.WITHDRAWAL,
        status: 'PENDING',
      },
    });
  }

  static async approveRequest(requestId: number) {
    const request = await prisma.potRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new Error('Talep bulunamadı.');

    if (request.type === PotRequestType.WITHDRAWAL) {
      await prisma.pot.update({
        where: { id: request.potId },
        data: { currentAmount: { decrement: request.amount } },
      });
    }

    return prisma.potRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' },
    });
  }

  static async listPotParticipants(potId: number) {
    return prisma.potParticipant.findMany({
      where: { potId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { totalContributed: 'desc' },
    });
  }

  static async listGroupPots(groupId: number) {
    return prisma.pot.findMany({
      where: { groupId, isActive: true },
      include: {
        participants: {
          include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true } },
          },
        },
        requests: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { user: { select: { id: true, email: true, firstName: true } } },
        },
      },
    });
  }
}
