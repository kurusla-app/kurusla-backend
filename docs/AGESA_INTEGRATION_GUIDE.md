# 🏦 AgeSA Entegrasyon Rehberi (B-01)

Bu doküman, Kurusla uygulamasının AgeSA Emeklilik sistemleri ile olan bağlantısını, test süreçlerini ve teknik detaylarını içerir.

---

## 🛠 1. Ortam Değişkenleri (.env)
Entegrasyonun çalışması için `.env` dosyasında şu tanımlamaların yapılması şarttır:

```env
# AgeSA API Bağlantı Bilgileri
AGESA_API_URL="https://api-sim.agesa.com.tr/v1"
AGESA_API_KEY="agesa_simulated_test_key_2026"
AGESA_TIMEOUT=5000
```
> **Not:** URL içerisinde `api-sim` ifadesi geçiyorsa sistem otomatik olarak **Simülasyon Modu**'na geçer ve gerçek ağ isteği atmadan başarılı yanıt döner.

---

## 🚀 2. Nasıl Test Edilir?

### A. PowerShell ile Test (Önerilen)
Windows terminalini açın ve aşağıdaki komutu yapıştırın:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/ai/execute-tool" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"userId": 1, "toolName": "allocateAgesaFunds", "parameters": {"amount": 15.50}}'
```

### B. cURL ile Test (Git Bash / Linux)
```bash
curl -X POST http://localhost:3000/api/ai/execute-tool \
     -H "Content-Type: application/json" \
     -d '{"userId": 1, "toolName": "allocateAgesaFunds", "parameters": {"amount": 15.50}}'
```

---

## 📊 3. Veritabanı ve Loglama
Yapılan her AgeSA işlemi `AILog` tablosunda saklanır. İşlem detaylarını görmek için:

1. Terminale `npx prisma studio` yazın.
2. `AILog` tablosuna gidin.
3. `toolName: allocateAgesaFunds` filtresini uygulayın.

---

## ⚠️ 4. Hata Kodları ve Çözümleri

| Hata Mesajı | Nedeni | Çözümü |
| :--- | :--- | :--- |
| `ENOTFOUND` | URL bulunamadı ve simülasyon modu kapalı. | .env dosyasındaki URL'yi kontrol edin. |
| `Table does not exist` | Veritabanı tabloları oluşturulmamış. | `npx prisma db push` komutunu çalıştırın. |
| `INVALID_AMOUNT` | Gönderilen tutar 0 veya negatif. | Parametrelerdeki `amount` değerini kontrol edin. |

---
**Geliştirici:** Taha Buğra Çiçek & Antigravity AI
**Sürüm:** 1.0.0
