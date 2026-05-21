# Docker

## Yerel çalıştırma

`.env` dosyasında en azından şunlar olmalı:

```env
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=...
INTERNAL_SERVICE_KEY=...
REDIS_URL=redis://redis:6379
PORT=3000
# AgeSA (yerel/docker — simülasyon önerilir)
AGESA_API_URL=https://api-sim.agesa.com.tr/v1
AGESA_SIMULATE=true
```

`AGESA_API_URL` boşsa veya `AGESA_SIMULATE=true` ise gerçek HTTP çağrısı yapılmaz; k6 sonrası birikimler `SUCCESS` olur.

Eski yüzlerce `FAILED` kayıt retry job logunu dolduruyorsa (tek seferlik temizlik):

```sql
-- Dikkat: sadece test verisi için
UPDATE "Saving" SET status = 'SUCCESS', "retryCount" = 0 WHERE status = 'FAILED';
```

```bash
docker compose up --build
```

`DATABASE_URL` yalnızca `.env` üzerinden okunur; compose içinde hardcoded credential yok.

## Migration (ilk deploy / şema güncellemesi)

Container dışında veya one-off container ile:

```bash
npx prisma migrate deploy
```

İsteğe bağlı — API container'ında:

```bash
docker compose run --rm api npx prisma migrate deploy
```

## Image güvenliği

- `.env` image'a **kopyalanmaz**
- Gizliler platform secret / `env_file` ile verilir (Render, K8s `secretRef`, vb.)

## Prisma dosya yolları

- Şema: kök `schema.prisma`
- Migration'lar: `migrations/`
- Eski `COPY prisma/` yolu kullanılmıyor (klasör yok)
- Alpine image: `binaryTargets` içinde `linux-musl-openssl-3.0.x` + `openssl` paketi

`libssl.so.1.1` hatası alırsan image'ı yeniden build et:

```bash
docker compose build --no-cache api
docker compose up
```
