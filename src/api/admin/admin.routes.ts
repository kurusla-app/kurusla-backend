import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { requireAuth, requireAdmin } from '../../middlewares/auth';

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get('/stats/merchants', AnalyticsController.getTopMerchants);
router.get('/stats/categories', AnalyticsController.getCategoryDistribution);

export default router;
