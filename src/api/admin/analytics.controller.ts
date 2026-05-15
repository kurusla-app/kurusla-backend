import { Request, Response } from 'express';
import prisma from '../../config/db';

/**
 * AgeSA Yöneticileri için Anonim Analitik Kontrolcüsü
 */
export class AnalyticsController {
  
  /**
   * En çok kuruş biriktirilen ilk 10 marka (Anonim)
   * GET /api/admin/stats/merchants
   */
  static async getTopMerchants(req: Request, res: Response) {
    try {
      const topMerchants = await prisma.transaction.groupBy({
        by: ['merchant'],
        _count: {
          merchant: true
        },
        where: {
          saving: {
            isNot: null
          }
        },
        orderBy: {
          _count: {
            merchant: 'desc'
          }
        },
        take: 10
      });

      const result = topMerchants.map((m: any) => ({
        merchant: m.merchant,
        transactionCount: m._count?.merchant || 0
      }));

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Harcama kategorilerinin genel dağılımı (Anonim)
   * GET /api/admin/stats/categories
   */
  static async getCategoryDistribution(req: Request, res: Response) {
    try {
      const categoryStats = await prisma.transaction.groupBy({
        by: ['category'],
        _count: {
          category: true
        },
        _sum: {
          amount: true
        }
      });

      const result = categoryStats.map(c => ({
        category: c.category,
        count: c._count.category,
        totalVolume: c._sum.amount
      }));

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
