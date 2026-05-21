# Davet Et Kazan (Referral) Sistemi

Kullanıcılar benzersiz davet linki paylaşır; arkadaş kayıt olunca her iki taraf **ilk kuruş** ödülü alır.

## Veritabanı

- **User.referralCode** — Benzersiz davet kodu (örn. `K7X2AB9C`)
- **User.referredById** — Kim davet etti
- **Referral** — Davet kaydı, ödül tutarları ve durum

## Ödüller (`.env`)

```env
REFERRAL_REFERRER_REWARD=1.0
REFERRAL_REFERRED_REWARD=1.0
REFERRAL_APP_BASE_URL=https://kurusla.app/invite
```

Varsayılan: davet eden ve yeni üye **1 TL** `balance` artışı. AgeSA promosyonu `AILog` ile simüle loglanır.

## API

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/referral/link?userId=1` | Davet kodu + link |
| GET | `/api/referral/validate/:code` | Kod geçerli mi? |
| GET | `/api/referral/stats?userId=1` | İstatistikler |
| GET | `/api/referral/invited?userId=1` | Davet edilenler listesi |
| POST | `/api/auth/register` | `{ email, password, referralCode? }` |

## Örnek akış

1. Ali `GET /api/referral/link` → `https://kurusla.app/invite/ALI7X2AB`
2. Veli kayıt: `POST /api/auth/register` + `referralCode: "ALI7X2AB"`
3. Ali ve Veli bakiyesine +1 TL, `Referral` kaydı `COMPLETED`

## Migration

```bash
npx prisma migrate dev --name referral_system
```
