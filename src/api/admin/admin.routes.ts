import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';

const router = Router();

// Gelecekte buraya requireAdmin middleware eklenecek
router.get('/stats/merchants', AnalyticsController.getTopMerchants);
router.get('/stats/categories', AnalyticsController.getCategoryDistribution);

export default router;
