# 🤖 Kurusla AI Agent Integration Guide

Bu rehber, **Agentic AI** (Yusuf'un modülü) tarafının Kurusla Backend ile nasıl güvenli bir şekilde iletişim kuracağını açıklar.

---

## 🛡️ Sandbox (Tool Calling) Mantığı
AI Agent, veritabanına doğrudan erişmek yerine backend tarafından sunulan kısıtlı ve güvenli "Tool"ları (aletleri) kullanır. Bu sayede:
1. Yetkisiz veri erişimi engellenir.
2. Tüm işlemler `AILog` tablosunda kayıt altına alınır.
3. Hatalı işlemler (örneğin negatif adım güncelleme) backend seviyesinde durdurulur.

---

## 📊 AI İçgörüleri (Profil DB)

Model çıktılarını kullanıcı profiline yazmak için:

- **URL:** `POST /api/insights` (internal `x-api-key` veya JWT)
- **Liste:** `GET /api/insights` (JWT)
- **Detay:** [INSIGHTS.md](./INSIGHTS.md)

---

## 💬 Mobil sohbet (Chat)

Kullanıcıların doğal dilde soru sorması için ayrı endpoint:

- **URL:** `POST /api/chat`
- **Auth:** `Authorization: Bearer <JWT>` (zorunlu)
- **Detay:** [CHAT.md](./CHAT.md)

Tool/action endpoint'leri agent içindir; mobil uygulama doğrudan `/api/chat` kullanır.

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

### 🔗 Action Endpoint (Yeni)
- **URL:** `/api/ai/execute-action`
- **Method:** `POST`
- **Açıklama:** Veritabanında değişiklik yapan veya kritik finansal kararlar içeren işlemler için kullanılır.
- **Gövde (Body):**
```json
{
  "userId": 1,
  "actionName": "ACTION_ADI",
  "parameters": { ... }
}
```

---

## 🛠️ Mevcut Aksiyonlar (Actions)

### 1. `UPDATE_STEP`
Kullanıcının yuvarlama adımını günceller.
- **Parametreler:** `{ "step": number }` (1-1000 arası)
- **Güvenlik:** Doğrudan uygulanır.

### 2. `ALLOCATE_FUNDS`
Kullanıcının birikimlerini fona aktarır.
- **Parametreler:** `{ "amount": number, "approvalCode"?: string }`
- **Güvenlik:** 100 TL üzerindeki işlemler için `approvalCode` zorunludur. Kod yoksa `202 PENDING_APPROVAL` döner.

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
