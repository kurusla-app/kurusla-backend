import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

/**
 * Redis İstemcisi Yapılandırması
 */
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Redis bağlantısını başlat (Hata durumunda logla ama uygulamayı çökertme)
redisClient.connect().catch(err => {
  console.warn('⚠️ Redis bağlantısı kurulamadı, Rate Limiter bellek modunda çalışacak:', err.message);
});

/**
 * Kamu API'leri için Hız Sınırlayıcı (Rate Limiter)
 * 15 dakikada maksimum 100 istek.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına maksimum istek
  message: {
    status: 429,
    error: 'Çok hızlı gidiyorsun! 🛑',
    message: 'Güvenlik nedeniyle 15 dakikada en fazla 100 istek atabilirsin. Biraz dinlenip tekrar dene.'
  },
  standardHeaders: true, // `RateLimit-*` header'larını ekle
  legacyHeaders: false, // `X-RateLimit-*` header'larını kapat
  
  // Verileri Redis'te sakla (Dağıtık sistemler için uygun)
  store: new RedisStore({
    // @ts-ignore - redisClient tipi uyumsuzluğu için geçici ignore
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),

  // Whitelist (İstisna) Kuralları
  skip: (req) => {
    // 1. Güvenilir IP'ler (Örn: Make.com veya AgeSA statik IP'leri)
    const trustedIps: string[] = []; // Test için boşaltıldı
    if (trustedIps.includes(req.ip || '')) return true;

    // 2. Özel API Key kullanan iç servisler
    const apiKey = req.headers['x-api-key'];
    return apiKey === process.env.INTERNAL_SERVICE_KEY;
  }
});
