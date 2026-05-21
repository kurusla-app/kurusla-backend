import { Router } from 'express';
import { postChat } from './chat.controller';
import { requireAuth } from '../../middlewares/auth';
import { chatRateLimiter } from '../../middlewares/chatRateLimiter';

const router = Router();

router.use(requireAuth);
router.use(chatRateLimiter);

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: AI asistan ile sohbet (JWT gerekli)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Tek kullanıcı mesajı
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant, system]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: AI yanıtı
 *       401:
 *         description: Yetkilendirme gerekli
 *       429:
 *         description: Saatlik chat limiti
 *       503:
 *         description: AI servisi kullanılamıyor
 */
router.post('/', postChat);

export default router;
