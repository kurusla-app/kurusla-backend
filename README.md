# Kuruşla - Backend Altyapısı

Kuruşla, Z kuşağına yönelik modern bir "mikro-birikim" fintech çözümüdür. Kullanıcıların günlük harcamalarını analiz ederek, arta kalan kuruşları otomatik olarak yatırım veya emeklilik fonlarına (BES) yönlendirir.

## 🚀 Proje Hakkında
Bu depo (repository), Kuruşla projesinin backend mantığını, veri işleme süreçlerini ve Akbank API entegrasyonu simülasyonlarını içermektedir.

### Temel Özellikler
- **Kural Bazlı Birikim (Rule-Based Saving):** Kullanıcının belirlediği kurallara göre (Örn: "0-200 TL arası harcamalarda %10 biriktir") harcamalardan tasarruf oluşturulması.
- **Akbank API Uyumluluğu:** Altyapı, Akbank API portalındaki gerçek servislerin (Tosla, Yatırım Fonları, AgeSA) veri yapılarıyla tam uyumlu tasarlanmıştır.
- **Hibrit Veri Modeli:** Proje, gerçek bir API entegrasyonuna hazır olmakla birlikte, geliştirme ve test sürecinde Akbank standartlarına göre hazırlanmış **Sentetik Veri Seti** kullanmaktadır.

## 📁 Klasör Yapısı
- `data/synthetic_transactions/`: Akbank `ToslaTransactionList` standartlarına göre yapılandırılmış sentetik harcama verileri.
- `docs/`: 
  - `akbank_api_guide.md`: Akbank API portalındaki servislerin detaylı Türkçe dökümantasyonu ve veri eşleşmeleri.

## 🛠️ Teknik Altyapı ve Veri
Backend altyapısı, verinin kaynağı (gerçek API veya sentetik JSON) fark etmeksizin aynı mantıkla çalışacak şekilde kurgulanmıştır. Kullanılan ana veri alanları:
- `transactionAmount`: Harcama tutarı (Kural hesaplamaları için ana girdi).
- `reqDate`: İşlem tarihi.
- `transactionDescription`: İşlem noktası ve detay bilgisi.

## 📝 Yol Haritası
1. **Veri Entegrasyonu:** Sentetik verilerin Akbank API üzerinden canlı veriyle yer değiştirmesi için gerekli servislerin yazılması.
2. **Kural Motoru (Rule Engine):** Kullanıcı tanımlı karmaşık birikim kurallarının işlenmesi.
3. **BES Transfer Simülasyonu:** Agesa API'leri üzerinden birikimlerin hedeflere aktarılması.
