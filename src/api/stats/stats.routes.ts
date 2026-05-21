import { Router } from 'express';
import { StatsController } from './stats.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * /api/stats/savings:
 *   get:
 *     summary: Kullanıcının tarih bazlı birikim istatistiklerini getirir
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Kullanıcı ID'si
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month]
 *         description: İstatistik periyodu (Haftalık veya Aylık)
 *     responses:
 *       200:
 *         description: Başarılı, tarih bazlı toplamlar döner
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       total:
 *                         type: number
 */
router.get('/savings', StatsController.getSavingsStats);

export default router;
