# AI Chatbot (`/api/chat`)

Mobil uygulamanın Kurusla AI asistanına güvenli soru sorması için endpoint.

## Kimlik doğrulama

```http
POST /api/chat
Authorization: Bearer <JWT>
Content-Type: application/json
```

`userId` body'de **gönderilmez** — token'daki kullanıcı AI servisine iletilir.

## İstek gövdeleri

**Tek mesaj (mobil için önerilen):**

```json
{
  "message": "Toplam birikimim ne kadar?"
}
```

**Konuşma geçmişi:**

```json
{
  "messages": [
    { "role": "user", "content": "Merhaba" },
    { "role": "assistant", "content": "Merhaba! Nasıl yardımcı olabilirim?" },
    { "role": "user", "content": "Rozetlerim neler?" }
  ]
}
```

## Yanıt

```json
{
  "success": true,
  "data": {
    "reply": "...",
    "conversationId": "opsiyonel",
    "simulated": true
  }
}
```

`simulated: true` → Python AI servisi yerine yerel mock yanıt (geliştirme).

## Ortam değişkenleri

| Değişken | Varsayılan | Açıklama |
|----------|------------|----------|
| `AI_SERVICE_URL` | `http://localhost:8001` | Python FastAPI kök URL |
| `CHAT_SIMULATE` | — | `true` ise HTTP çağrısı yapılmaz |
| `CHAT_MAX_MESSAGES` | `20` | Konuşma dizisi üst sınırı |
| `CHAT_MAX_CONTENT_LENGTH` | `4000` | Mesaj karakter limiti |
| `CHAT_TIMEOUT_MS` | `30000` | AI servisi timeout |
| `CHAT_RATE_LIMIT_MAX` | `30` | Kullanıcı başına saatlik istek |

`AI_SERVICE_URL` localhost içeriyorsa otomatik simülasyon modu açılır.

## Python AI servisi sözleşmesi

Backend şu isteği gönderir:

```http
POST {AI_SERVICE_URL}/chat
Content-Type: application/json

{
  "userId": 1,
  "messages": [{ "role": "user", "content": "..." }]
}
```

Beklenen yanıt (en az biri):

```json
{ "reply": "..." }
```

veya `{ "message": "..." }` / `{ "content": "..." }`.

## Güvenlik

- JWT zorunlu (`requireAuth`)
- Global `/api` rate limit + chat'e özel saatlik limit
- Tüm istekler `AILog` (`toolName: CHAT`) — mesaj içeriği logda kısaltılır
- Finansal işlem bu endpoint'ten **yapılmaz**; fon aktarımı vb. → `/api/ai/execute-action`

## Hata kodları

| Kod | Durum |
|-----|--------|
| 400 | Validasyon (boş mesaj, çok uzun, çok fazla mesaj) |
| 401 | Token yok/geçersiz |
| 429 | Saatlik chat limiti |
| 503 | AI servisi kapalı (simülasyon kapalıyken) |

## Test (PowerShell)

```powershell
$token = (Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"veli3@test.com","password":"123456"}').token

Invoke-RestMethod -Uri "http://localhost:3000/api/chat" -Method Post `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"message":"Birikimlerim nasil gidiyor?"}'
```
