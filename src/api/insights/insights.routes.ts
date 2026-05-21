import { Router } from 'express';
import {
  createInsight,
  listInsights,
  markInsightRead,
  markAllInsightsRead,
} from './insights.controller';
import { requireAuth, requireInternalOrAuth } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/insights:
 *   post:
 *     summary: AI içgörüsünü kullanıcı profiline kaydet (internal veya JWT)
 *     tags: [Insights]
 *   get:
 *     summary: Kullanıcının içgörülerini listele
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', requireInternalOrAuth, createInsight);

router.use(requireAuth);

router.get('/', listInsights);
router.patch('/read-all', markAllInsightsRead);
router.patch('/:id/read', markInsightRead);

export default router;
