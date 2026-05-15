import { Request, Response } from 'express';
import { StatsService } from '../../services/stats.service';

export class StatsController {
  /**
   * Birikim geçmişini getirir
   * GET /api/stats/savings?period=week|month
   */
  static async getSavingsStats(req: Request, res: Response) {
    try {
      // Not: Normalde userId auth middleware'den (req.user.id) gelir. 
      // Test aşamasında query'den alıyoruz.
      const userId = Number(req.query.userId) || 1;
      const period = (req.query.period as 'week' | 'month') || 'week';

      if (!['week', 'month'].includes(period)) {
        return res.status(400).json({ error: 'Geçersiz periyot. "week" veya "month" olmalı.' });
      }

      const stats = await StatsService.getSavingsHistory(userId, period);
      
      return res.status(200).json({
        success: true,
        period,
        data: stats
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
