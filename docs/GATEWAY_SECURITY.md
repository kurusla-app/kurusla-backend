# 🛡️ API Gateway ve Güvenlik Yapılandırması

Kurusla API'leri, kötü niyetli kullanım ve aşırı yüklenmeye karşı **Rate Limiting** (İstek Sınırlama) katmanı ile korunmaktadır.

---

## 🚦 Hız Sınırları (Rate Limits)

Tüm `/api/*` uç noktaları için aşağıdaki sınırlamalar geçerlidir:

- **Sınır:** 15 dakikalık periyot başına IP başına **100 istek**.
- **Hata Mesajı:** `429 Too Many Requests`
- **Header Bilgileri:**
    - `RateLimit-Limit`: Toplam izin verilen istek sayısı.
    - `RateLimit-Remaining`: Mevcut periyotta kalan istek hakkınız.
    - `RateLimit-Reset`: Sınırın sıfırlanacağı zaman (Unix Timestamp).

---

## 💾 Rate limit store

Rate limiting şu an **bellek içi** store kullanır (`src/middlewares/rateLimiter.ts`).  
**Redis** yalnızca istatistik cache için kullanılır (`stats.service.ts`).

Çoklu instance için ileride `rate-limit-redis` entegrasyonu planlanabilir.

---

## 🏳️ Beyaz Liste (Whitelisting)

Bazı kritik servisler ve güvenilir ortaklar için hız sınırı uygulanmaz:

1. **Güvenilir IP'ler:** Localhost ve belirli statik IP'ler.
2. **Internal Service Key:** İstek başlığında (Header) `x-api-key` ile geçerli anahtar (`INTERNAL_SERVICE_KEY`) gönderen servisler (Örn: Make.com, AgeSA Webhook) sınıra takılmaz.

---

## 🛠️ Teknik Uygulama

Sınırlayıcı `src/middlewares/rateLimiter.ts` dosyasında tanımlanmış ve `src/app.ts` üzerinde en üst seviyede devreye alınmıştır.

```typescript
// Örnek Kullanım (Whitelist için)
// Header: x-api-key = kurusla_internal_secret_...
```

---
**Hazırlayan:** Antigravity (AI)
**Tarih:** 2026-05-15
