import rateLimit from 'express-rate-limit';

/**
 * Kamu API'leri için Hız Sınırlayıcı (Rate Limiter)
 * 15 dakikada maksimum 100 istek / IP.
 *
 * Not: Redis store geliştirme ortamında bağlantı hatası verdiği için
 * varsayılan bellek içi store kullanılır. Production'da Redis ayrıca
 * stats cache için kullanılır.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    error: 'Çok hızlı gidiyorsun! 🛑',
    message:
      'Güvenlik nedeniyle 15 dakikada en fazla 100 istek atabilirsin. Biraz dinlenip tekrar dene.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const trustedIps: string[] = [];
    if (trustedIps.includes(req.ip || '')) return true;

    const apiKey = req.headers['x-api-key'];
    return apiKey === process.env.INTERNAL_SERVICE_KEY;
  },
});
