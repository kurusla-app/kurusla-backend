# AI İçgörüleri (Profil)

Yusuf'un AI modelinden gelen sonuçların kullanıcı profilinde (`AIInsight` tablosu) saklanması.

## Kaydetme (Python / internal)

```http
POST /api/insights
x-api-key: <INTERNAL_SERVICE_KEY>
Content-Type: application/json

{
  "userId": 1,
  "type": "SPENDING",
  "title": "Kahve harcaması arttı",
  "summary": "Bu ay Starbucks harcamaların %20 arttı.",
  "content": { "merchant": "Starbucks", "deltaPercent": 20 },
  "transactionId": 42,
  "source": "kurusla-ai"
}
```

Mobil JWT ile de kayıt yapılabilir (`userId` body'de **gönderilmez** — token kullanıcısı kullanılır).

### `type` değerleri

`SPENDING` | `SAVING` | `CATEGORY` | `GENERAL`

## Okuma (mobil)

```http
GET /api/insights?limit=20&unreadOnly=true
Authorization: Bearer <token>
```

Yanıt:

```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 5,
    "unreadCount": 2,
    "limit": 20
  }
}
```

## Okundu işaretle

```http
PATCH /api/insights/12/read
Authorization: Bearer <token>
```

```http
PATCH /api/insights/read-all
Authorization: Bearer <token>
```

## Akış

1. Harcama kaydı → `analyzeTransaction` → Python `/analyze`
2. Python analiz bitince → `POST /api/insights` (yukarıdaki body)
3. Mobil → `GET /api/insights` profil ekranında gösterir

Tüm kayıtlar `AILog` (`INSIGHT_SAVE`) ile denetlenir.

## Test (PowerShell)

```powershell
$headers = @{
  "x-api-key" = "kurusla_internal_secret_2026"
  "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/insights" -Method Post -Headers $headers -Body (@{
  userId = 4
  type = "SAVING"
  title = "Birikim hedefi"
  summary = "Bu hafta 12 TL biriktirdin, harika gidiyorsun!"
} | ConvertTo-Json)

$login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"veli3@test.com","password":"123456"}'

Invoke-RestMethod -Uri "http://localhost:3000/api/insights" -Headers @{ Authorization = "Bearer $($login.token)" }
```
