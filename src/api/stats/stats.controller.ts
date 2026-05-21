import { Request, Response } from 'express';
import { StatsService } from '../../services/stats.service';
import { getAuthenticatedUserId, handleAuthError } from '../../utils/authUser';

export class StatsController {
  /**
   * Birikim geçmişini getirir
   * GET /api/stats/savings?period=week|month
   */
  static async getSavingsStats(req: Request, res: Response) {
    try {
      const userId = getAuthenticatedUserId(req);
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
    } catch (error: unknown) {
      if (handleAuthError(res, error)) return;
      const message = error instanceof Error ? error.message : 'Sunucu hatası';
      return res.status(500).json({ error: message });
    }
  }
}
