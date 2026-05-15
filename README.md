# Kurusla - Backend API (TypeScript / Node.js)

**Kurusla**, kullanıcıların harcamalarını takip ederek otomatik birikim yapmasını sağlayan bir fintech çözümüdür. Bu sürüm, "Hibrit Mükemmellik" mikroservis mimarisine geçiş kapsamında **TypeScript**, **Node.js**, **Express.js** ve **Prisma** ile baştan yazılmıştır.

## 🎯 Proje Özeti
Bu API, harcama bildirimlerini alır, kullanıcı kurallarına (yuvarlama veya yüzde bazlı) göre birikim hesaplar ve veritabanına kaydeder.
- **Otomatik Birikim:** Harcamaları analiz eder ve belirlenen kurallar dahilinde tasarruf oluşturur.
- **Dirençli Ödeme Altyapısı (Resilient Payment Gateway):** Başarısız AgeSA transferlerini otomatik olarak 5 kez yeniden dener.
- **AI Agent Sandbox:** Güvenli tool-calling mekanizması ile AI üzerinden işlem yapma imkanı.
- **Güvenlik ve KVKK:** AES-256-CBC algoritması ile veritabanı seviyesinde (at-rest) hassas veri şifreleme.

## 🏗️ Mimari Yapı (Layered Architecture)
Sürdürülebilirlik için profesyonel bir Node.js/TS klasör mimarisi benimsenmiştir:
- **src/server.ts**: Uygulama giriş kapısı (Entry point).
- **src/app.ts**: Express konfigürasyonları.
- **src/api/[feature]/**: Her özelliğin kendi Route ve Controller dosyaları. (Sektör standardı).
- **src/services/**: İş mantığı ve hesaplama motoru (Business Logic & Math Engine).
- **src/services/aiService.ts**: Python tabanlı AI Mikroservisi ile (Yusuf'un modülü) iletişim kuran köprü katmanı.
- **src/services/aiTools.ts**: Agentic AI için güvenli Sandbox araçları.
- **src/jobs/**: Arka plan görevleri ve zamanlanmış kontroller (Cron Jobs).
- **src/middlewares/**: Güvenlik, Auth ve hata yakalama.
- **src/config/**: Veritabanı istemcisi (Prisma Client).

## 💾 Veritabanı Modelleri (Prisma)
- **User**: Kullanıcı bilgileri, bakiye ve bildirim token (FCM) takibi.
- **Group**: Sosyal birikim grupları.
- **Transaction**: Kullanıcının yaptığı harcamalar.
- **Saving**: Her harcamadan elde edilen mikro-birikimler.
- **Badge & UserBadge**: Oyunlaştırma sistemi (Rozetler).
- **AILog**: AI Agent tarafından yapılan işlemlerin denetim kaydı.
- **MerchantCategory**: Satıcı ve kategori eşleştirmeleri.

## 🛠️ Teknoloji Stack'i
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database ORM**: Prisma (v5)
- **Database**: PostgreSQL (Neon.tech)

## 🚀 Kurulum ve Çalıştırma

1. **Bağımlılıkları yükleyin**
```bash
npm install
```

2. **Veritabanını Hazırlayın**
```bash
# Veritabanı tiplerini TS için oluşturun
npx prisma generate

# Geliştirme ortamı için veritabanını güncelleyin
npx prisma migrate dev
```

3. **Sunucuyu başlatın**
```bash
# Geliştirme modu (Kodu değiştirdikçe otomatik yenilenir)
npm run dev

# Canlı ortam (Build alarak)
npm run build
npm start
```

## 🌍 CI/CD ve Deploy (Render)
Bu proje GitHub Actions üzerinden otomatik CI/CD sürecine sahiptir. `main` branch'ine yapılan push'lar otomatik derlenerek Render sunucusuna gönderilir.

---
**Geliştirici**: Muhammed Beşir Kesen / Taha Buğra Çiçek
