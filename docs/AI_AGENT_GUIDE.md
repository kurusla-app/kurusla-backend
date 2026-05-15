# 🤖 Kurusla AI Agent Integration Guide

Bu rehber, **Agentic AI** (Yusuf'un modülü) tarafının Kurusla Backend ile nasıl güvenli bir şekilde iletişim kuracağını açıklar.

---

## 🛡️ Sandbox (Tool Calling) Mantığı
AI Agent, veritabanına doğrudan erişmek yerine backend tarafından sunulan kısıtlı ve güvenli "Tool"ları (aletleri) kullanır. Bu sayede:
1. Yetkisiz veri erişimi engellenir.
2. Tüm işlemler `AILog` tablosunda kayıt altına alınır.
3. Hatalı işlemler (örneğin negatif adım güncelleme) backend seviyesinde durdurulur.

---

## 🚀 API Kullanımı

### 🔗 Endpoint
- **URL:** `/api/ai/execute-tool`
- **Method:** `POST`
- **Gövde (Body):**
```json
{
  "userId": 1,
  "toolName": "TOOL_ADI",
  "parameters": {
    "key": "value"
  }
}
```

---

## 🛠️ Mevcut Tool'lar

### 1. `updateUserStep`
Kullanıcının yuvarlama adımını (round-up step) günceller.
- **Parametreler:** `{ "step": number }`
- **Örnek:** `{"step": 50}` (Harcamaları bir sonraki 50 TL'ye tamamlar).

### 2. `getSavingsSummary`
Kullanıcının toplam birikim miktarını ve işlem sayısını getirir.
- **Parametreler:** `{}` (Parametre gerektirmez)
- **Dönen Veri:** `{ "totalSavings": 125.50, "savingCount": 10, "lastSaving": {...} }`

### 3. `listBadges`
Kullanıcının hangi rozetleri kazandığını ve hangi rozetlerin henüz kazanılmadığını listeler.
- **Parametreler:** `{}`
- **Dönen Veri:** `[ { "name": "Kuruşçu", "description": "...", "isEarned": true }, ... ]`

### 4. `allocateAgesaFunds`
Kullanıcının biriktirdiği kuruşları AgeSA emeklilik fonuna aktarır.
- **Parametreler:** `{ "amount": number }`
- **Dönen Veri:** `{ "success": true, "transactionId": "AGE-..." }`

---

## 🧪 Nasıl Test Edilir? (Terminal)

AI Tool'larını test etmek için şu PowerShell komutunu kullanabilirsiniz:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/ai/execute-tool" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"userId": 1, "toolName": "allocateAgesaFunds", "parameters": {"amount": 5.00}}'
```

---

## 📝 Denetim (Logging)
Yapılan her istek backend üzerinde şu formatta kaydedilir:
- **`toolName`**: Çağrılan fonksiyonun adı.
- **`parameters`**: AI tarafından gönderilen parametreler.
- **`response`**: Fonksiyonun döndüğü sonuç veya hata mesajı.

---
**Önemli Not:** Yeni bir tool eklenmesi gerekiyorsa lütfen backend geliştiricisine (Taha Buğra Çiçek) bildirin.
