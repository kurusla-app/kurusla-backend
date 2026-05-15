# 🛡️ Kurusla Resiliency (Dirençli Sistem) Rehberi

Bu doküman, finansal işlemlerin (AgeSA transferleri) başarısız olması durumunda devreye giren **Otomatik Yeniden Deneme (Retry)** ve **Kuyruk** mekanizmasını açıklar.

---

## 🛠 1. Mimari Yapı
Sistem şu bileşenlerden oluşur:
- **`Saving` Modeli:** Her birikim işleminin statüsünü (`PENDING`, `SUCCESS`, `FAILED`) ve deneme sayısını (`retryCount`) tutar.
- **`AgeSaService`:** İşlem sonucuna göre veritabanını günceller.
- **`Retry Job` (Cron):** Her 30 dakikada bir çalışarak başarısızları tekrar dener.
- **`Exponential Backoff`:** Hatalı işlemler hemen değil, son denemeden en az 10 dakika sonra tekrar işleme alınır.

---

## 🚀 2. Hata Senaryosu Nasıl Test Edilir?

Sistemin bir hatayı nasıl yakaladığını ve tekrar denediğini görmek için şu adımları izleyin:

### Adım 1: Hata Alacak Bir İstek Atın
Terminale şu PowerShell komutunu yazın (Not: .env dosyasındaki URL'yi geçici olarak bozarsanız gerçek hata alırsınız, yoksa simülasyon modunda kalır).

```powershell
# Bu komut birikim oluşturur.
Invoke-RestMethod -Uri "http://localhost:3000/api/ai/execute-tool" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"userId": 1, "toolName": "allocateAgesaFunds", "parameters": {"amount": 50.00}}'
```

### Adım 2: Veritabanında Statüyü Manuel Olarak "FAILED" Yapın
Eğer simülasyon modu başarı dönüyorsa, retry mekanizmasını test etmek için bir kaydı manuel olarak bozun:

1. `npx prisma studio` komutuyla veritabanını açın.
2. `Saving` tablosuna gidin.
3. Bir kaydın `status` alanını `FAILED`, `retryCount` alanını `0` yapın.
4. `Save Changes` butonuna basın.

### Adım 3: Retry Job'u Gözlemleyin
Sunucu loglarında (npm run dev ekranında) şu mesajı göreceksiniz:
`[Retry Job] 1 adet başarısız işlem bulundu. Yeniden deneme başlatılıyor...`

---

## 🔔 3. Kritik Uyarılar (Admin Bildirimi)
Eğer bir işlem **5 kez** üst üste başarısız olursa:
1. Sistem denemeyi bırakır.
2. Teknik ekibe (Admin) **Kritik İşlem Hatası** bildirimi gönderilir.
3. Loglarda şu mesaj görünür: `🚨 [KRİTİK UYARI] Kritik İşlem Hatası (Max Retry)`

---

## 💻 4. Önemli Terminal Komutları

| Komut | Açıklama |
| :--- | :--- |
| `npx prisma db push` | Şema değişikliklerini veritabanına uygular. |
| `npx prisma studio` | Veritabanını görsel arayüzle incelemenizi sağlar. |
| `npm run dev` | Sunucuyu ve Cron Job'ları başlatır. |

---
**Geliştirici:** Taha Buğra Çiçek & Antigravity AI
**Sürüm:** 1.1.0 (Retry Mechanism Added)
