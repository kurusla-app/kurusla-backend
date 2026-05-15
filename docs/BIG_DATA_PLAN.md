# 🚀 Büyük Veri (Big Data) ve Ölçeklenebilirlik Planı

Kurusla projesinin büyümesiyle birlikte milyonlarca harcama verisinin hızlı bir şekilde işlenmesi ve analiz edilmesi için hazırlanan mimari yol haritası.

---

## 🏗️ 1. Veritabanı Optimizasyon Stratejisi

### İndeksleme (Indexing)
- **Transaction Tablosu:** `userId`, `createdAt` ve `merchant` alanları indekslendi. Bu sayede kullanıcının harcama geçmişi ve satıcı bazlı raporlamalar saniyeler içinde çekilir.
- **Saving Tablosu:** `userId`, `createdAt` ve `status` alanları indekslendi. Başarısız işlemlerin takibi ve birikim özetleri hızlandırıldı.

### Özet Tablolar (Aggregated Views)
- **UserStats Tablosu:** Her sorguda `SUM()` veya `COUNT()` yapmak yerine, kullanıcının toplam birikimi ve toplam işlem sayısı bu tabloda anlık olarak tutulur. 
- **Güncelleme Tetikleyicisi:** Yeni bir birikim oluştuğunda veya harcama geldiğinde uygulama seviyesinde `UserStats` güncellenir.

---

## 🌊 2. Analitik Veri Hattı (Analytical Pipeline)

Verilerin ana veritabanından (OLTP - Neon.tech) analitik veritabanına (OLAP) taşınması için önerilen mimari:

### ClickHouse Entegrasyonu
ClickHouse, devasa boyutlardaki veriler üzerinde saniyeler içinde karmaşık analitik sorgular yapmamızı sağlar.
1. **CDC (Change Data Capture):** Neon.tech üzerindeki değişiklikler (PostgreSQL Logical Replication) izlenir.
2. **Debezium / Airbyte:** Veriler anlık olarak ClickHouse'a aktarılır.
3. **Analiz:** Yusuf (AI), ClickHouse üzerindeki bu verileri kullanarak "Gelecek ayki birikim tahmini" gibi ağır hesaplamaları ana DB'yi yormadan yapar.

---

## ❄️ 3. Arşivleme ve Cold Storage (TTL)

Veritabanı şişmesini önlemek için uygulanacak politika:

- **Hot Data (0-6 Ay):** Neon.tech ana veritabanında tutulur. En sık erişilen veridir.
- **Warm Data (6-12 Ay):** Neon.tech üzerinde kalır ancak ayrı bir "Partition" olarak saklanır.
- **Cold Data (12 Ay+):** PostgreSQL'den silinir ve **Google Cloud Storage** veya **Amazon S3** üzerinde JSON/Parquet formatında "Cold Storage"a taşınır. İhtiyaç duyulduğunda BigQuery üzerinden sorgulanabilir.

---

## 📈 4. Gelecek Adımlar (Next Steps)
- [ ] Redis Caching: Sık sorgulanan `UserStats` verilerinin cache katmanına taşınması.
- [ ] Database Partitioning: `Transaction` tablosunun aya göre partisyonlara bölünmesi.
- [ ] Materialized Views: Postgres tarafında karmaşık raporlar için materialized view kullanımı.

---
**Hazırlayan:** Antigravity (AI)
**Tarih:** 2026-05-15
