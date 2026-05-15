import prisma from '../config/db';

/**
 * Kullanıcı istatistiklerini (UserStats) güncelleyen servis.
 * Büyük veri setlerinde her seferinde SUM/COUNT yapmamak için kullanılır.
 */
export class StatsService {
  /**
   * Kullanıcının toplam birikimini ve işlem sayısını günceller.
   */
  static async updateUserStats(userId: number, addSavingAmount: number = 0, addTransaction: boolean = false) {
    try {
      await prisma.userStats.upsert({
        where: { userId },
        update: {
          totalSavings: { increment: addSavingAmount },
          totalTransactions: { increment: addTransaction ? 1 : 0 },
          lastUpdate: new Date()
        },
        create: {
          userId,
          totalSavings: addSavingAmount,
          totalTransactions: addTransaction ? 1 : 0
        }
      });
    } catch (error) {
      console.error(`[Stats Service] UserStats güncellenirken hata (userId: ${userId}):`, error);
    }
  }
}
