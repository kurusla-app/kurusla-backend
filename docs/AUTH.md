# Kimlik Doğrulama (JWT)

## Giriş

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "...", "password": "..." }
```

Yanıt: `{ "token": "...", "user": { ... } }`

## Korunan istekler

```http
Authorization: Bearer <token>
```

`userId` artık body/query'de **gönderilmez** — token'daki kullanıcı kullanılır.

AI sohbet: `POST /api/chat` — ayrıntı: [CHAT.md](./CHAT.md)

AI içgörüleri: `GET /api/insights`, kayıt `POST /api/insights` (internal key) — [INSIGHTS.md](./INSIGHTS.md)

## Açık endpoint'ler

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/referral/validate/:code`
- `GET /healthz`, `GET /api-docs`

## Webhook (Make.com / k6)

```http
POST /api/webhooks/sms
x-api-key: <INTERNAL_SERVICE_KEY>
Content-Type: application/json

{ "userId": 1, "text": "..." }
```

Alternatif: mobil uygulama `Authorization: Bearer` ile çağırırsa `userId` body'de gerekmez.

## Admin

`User.role = ADMIN` + JWT gerekir:

- `GET /api/admin/stats/merchants`
- `GET /api/admin/stats/categories`
- `POST /api/user/trigger-badges`
