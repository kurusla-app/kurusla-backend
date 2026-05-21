import prisma from '../config/db';

/**
 * Kullanıcı istatistiklerini (UserStats) güncelleyen servis.
 * Büyük veri setlerinde her seferinde SUM/COUNT yapmamak için kullanılır.
 */
export class StatsService {
  /**
   * Kullanıcının toplam birikimini ve işlem sayısını günceller.
   */
  static async updateUserStats(
    userId: number,
    addSavingAmount: number = 0,
    addTransaction: boolean | number = false
  ) {
    const txIncrement =
      typeof addTransaction === 'number' ? addTransaction : addTransaction ? 1 : 0;

    try {
      await prisma.userStats.upsert({
        where: { userId },
        update: {
          totalSavings: { increment: addSavingAmount },
          totalTransactions: { increment: txIncrement },
          lastUpdate: new Date()
        },
        create: {
          userId,
          totalSavings: addSavingAmount,
          totalTransactions: txIncrement
        }
      });
    } catch (error) {
      console.error(`[Stats Service] UserStats güncellenirken hata (userId: ${userId}):`, error);
    }
  }

  /**
   * Kullanıcının birikim geçmişini (günlük bazda) getirir.
   */
  static async getSavingsHistory(userId: number, period: 'week' | 'month' = 'week') {
    const days = period === 'week' ? 7 : 30;
    const cacheKey = `stats:savings:${userId}:${period}`;

    try {
      // 1. Redis Cache Kontrolü
      const { default: redisClient, connectRedis } = await import('../config/redis');
      
      try {
        await connectRedis(); 
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) return JSON.parse(cachedData);
      } catch (redisError) {
        console.warn('⚠️ Redis ulaşılamadı, veritabanından devam ediliyor...');
      }

      // 2. Veritabanı Sorgusu (Son X gün)
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);

      // Prisma ile tarih bazlı gruplandırma (Postgres DATE_TRUNC)
      const stats = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('day', "createdAt") as date, 
          SUM(amount) as total
        FROM "Saving"
        WHERE "userId" = ${userId} AND "createdAt" >= ${dateLimit}
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY date ASC
      `;

      // 3. Veriyi Formatla (Mobil grafik uyumlu)
      const formattedStats = (stats as any[]).map(s => ({
        date: s.date.toISOString().split('T')[0],
        total: Number(s.total) || 0
      }));

      // 4. Redis'e Kaydet (1 saatlik cache - Opsiyonel)
      if (redisClient.isOpen) {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(formattedStats)).catch(() => {});
      }

      return formattedStats;
    } catch (error) {
      console.error(`[Stats Service] Birikim geçmişi çekilirken hata (userId: ${userId}):`, error);
      throw error;
    }
  }
}
