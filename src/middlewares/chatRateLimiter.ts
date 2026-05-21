import rateLimit from 'express-rate-limit';

const windowMs = 60 * 60 * 1000;
const max = Number(process.env.CHAT_RATE_LIMIT_MAX) || 30;

/**
 * Chat endpoint için kullanıcı/IP bazlı sıkı limit (saatlik).
 */
export const chatRateLimiter = rateLimit({
  windowMs,
  max,
  message: {
    status: 429,
    error: 'Chat limiti aşıldı',
    message: 'Saatlik mesaj limitine ulaştın. Lütfen bir süre sonra tekrar dene.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // requireAuth sonrası çalışır; IP fallback express-rate-limit IPv6 uyarısı verir
  keyGenerator: (req) => {
    const userId = (req as { user?: { id?: number } }).user?.id;
    return userId ? `user:${userId}` : 'unauthenticated';
  },
});
