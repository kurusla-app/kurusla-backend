import { Router } from 'express';
import {
  getMyReferralLink,
  validateCode,
  getStats,
  listInvited,
} from './referral.controller';

const router = Router();

/**
 * @swagger
 * /api/referral/link:
 *   get:
 *     summary: Kullanıcının benzersiz davet linkini getirir/oluşturur
 *     tags: [Referral]
 */
router.get('/link', getMyReferralLink);

/**
 * @swagger
 * /api/referral/validate/{code}:
 *   get:
 *     summary: Davet kodunun geçerliliğini kontrol eder
 *     tags: [Referral]
 */
router.get('/validate/:code', validateCode);

router.get('/stats', getStats);
router.get('/invited', listInvited);

export default router;
