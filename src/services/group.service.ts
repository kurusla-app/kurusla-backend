import prisma from '../config/db';

/**
 * Kuruşla Paylaş — grup yönetimi
 */
export class GroupService {
  static async createGroup(name: string, creatorUserId?: number) {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const group = await prisma.group.create({
      data: { name, inviteCode },
    });

    if (creatorUserId) {
      await prisma.user.update({
        where: { id: creatorUserId },
        data: { groupId: group.id },
      });
    }

    return group;
  }

  /**
   * Davet kodu ile gruba katılır (Kuruşla Paylaş)
   */
  static async joinGroup(inviteCode: string, userId: number) {
    const group = await prisma.group.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
    });

    if (!group) {
      throw new Error('Geçersiz davet kodu.');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('Kullanıcı bulunamadı.');
    }

    if (user.groupId && user.groupId !== group.id) {
      throw new Error('Kullanıcı zaten başka bir grupta.');
    }

    return prisma.user.update({
      where: { id: userId },
      data: { groupId: group.id },
      include: {
        group: {
          include: {
            pots: { where: { isActive: true }, include: { participants: true } },
            users: { select: { id: true, email: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  static async getGroupById(groupId: number) {
    return prisma.group.findUnique({
      where: { id: groupId },
      include: {
        users: { select: { id: true, email: true, firstName: true, lastName: true } },
        pots: {
          where: { isActive: true },
          include: {
            participants: {
              include: {
                user: { select: { id: true, email: true, firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });
  }
}
