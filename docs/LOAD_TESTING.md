# Yük ve Stres Testleri (k6 / JMeter)

Görev: **10.000 kullanıcının aynı anda harcama (transaction) simülasyonu**

Test edilen ana uç: `POST /api/webhooks/sms` → regex parse → `processNewTransaction` (DB + birikim + AgeSA tetik).

---

## Ön hazırlık

### 1. k6 kurulumu (önerilen)

Windows (Chocolatey):

```powershell
choco install k6
```

veya: https://grafana.com/docs/k6/latest/set-up/install-k6/

### 2. Sunucuyu çalıştır

```powershell
npm run dev
```

### 3. Rate limit bypass

API limiti: **15 dk / 100 istek / IP**. Yük testinde 429 almamak için `.env` içindeki anahtarı gönderin:

```powershell
$env:INTERNAL_SERVICE_KEY="kurusla_internal_secret_2026"
```

### 4. Test kullanıcıları

**Duman testi** varsayılan `userId=1` kullanır (tek kayıtlı kullanıcı yeterli).

**Yük/stres testi** için 10 kullanıcı oluştur:

```powershell
.\load-tests\seed-users.ps1
$env:MAX_USER_ID="10"
```

Tek kullanıcı kaydı (PowerShell):

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -ContentType "application/json" -Body '{"email":"loadtest@test.com","password":"test123456"}'
```

---

## k6 senaryoları

| Dosya | Amaç | Eşzamanlı kullanıcı |
|-------|------|---------------------|
| `load-tests/k6/spending-smoke.js` | Duman | 10 |
| `load-tests/k6/spending-load.js` | Yük | ~1000 (kademeli) |
| `load-tests/k6/spending-stress.js` | Stres | **10.000** (kademeli) |

### Duman testi

```powershell
cd c:\Users\Muhammed\Desktop\kurusla-backend
$env:BASE_URL="http://localhost:3000"
$env:INTERNAL_SERVICE_KEY="kurusla_internal_secret_2026"
k6 run load-tests/k6/spending-smoke.js
```

### Yük testi (~1000 VU)

```powershell
$env:BASE_URL="http://localhost:3000"
$env:INTERNAL_SERVICE_KEY="kurusla_internal_secret_2026"
$env:MAX_USER_ID="500"
k6 run load-tests/k6/spending-load.js
```

### Stres testi (10.000 VU hedef)

**Tek makinede 10k VU çoğu zaman mümkün değildir** — RAM/CPU sınırı. Seçenekler:

- k6 Cloud / Grafana Cloud k6
- Birden fazla k6 instance + load balancer
- Daha düşük hedef: `$env:TARGET_VUS="2000"`

```powershell
$env:BASE_URL="http://localhost:3000"
$env:INTERNAL_SERVICE_KEY="kurusla_internal_secret_2026"
$env:MAX_USER_ID="10000"
$env:TARGET_VUS="10000"
k6 run load-tests/k6/spending-stress.js
```

### Canlı (Render) test — dikkat

Production URL ile test **veri kirletir** ve servisi düşürebilir. Sadece staging ortamında çalıştırın.

```powershell
$env:BASE_URL="https://kurusla-backend.onrender.com"
```

---

## JMeter alternatifi

Plan: `load-tests/jmeter/kurusla-spending.jmx`

JMeter GUI veya CLI:

```bash
jmeter -n -t load-tests/jmeter/kurusla-spending.jmx \
  -JHOST=localhost -JPORT=3000 -JPROTOCOL=http \
  -JTHREADS=10000 -JRAMP_UP=1200 -JLOOPS=1 \
  -JINTERNAL_SERVICE_KEY=kurusla_internal_secret_2026
```

---

## Başarı kriterleri (örnek)

| Metrik | Hedef |
|--------|--------|
| `http_req_failed` | < %10 (stres), < %5 (yük) |
| `p(95)` gecikme | < 5 sn (yük), < 10 sn (stres) |
| HTTP 201 oranı | Harcama kaydı başarılı |

k6 sonunda özet tablo otomatik basılır. Rapor için:

```powershell
k6 run --out json=load-tests/results/stress.json load-tests/k6/spending-stress.js
```

---

## Notion görevi için teslim

1. `spending-smoke.js` çıktı ekran görüntüsü  
2. `spending-load.js` veya `spending-stress.js` özet metrikleri  
3. Darboğaz notu (DB connection pool, Redis, rate limit, AgeSA async)
