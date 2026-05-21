import { Router } from 'express';
import {
  getMyReferralLink,
  validateCode,
  getStats,
  listInvited,
} from './referral.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/referral/link:
 *   get:
 *     summary: Kullanıcının benzersiz davet linkini getirir/oluşturur
 *     tags: [Referral]
 */
router.get('/validate/:code', validateCode);

router.use(requireAuth);

router.get('/link', getMyReferralLink);

router.get('/stats', getStats);
router.get('/invited', listInvited);

export default router;
