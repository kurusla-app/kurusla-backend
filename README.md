# Kuruşla - Backend Altyapısı

Kuruşla, Z kuşağına yönelik modern bir "mikro-birikim" fintech çözümüdür. Kullanıcıların günlük harcamalarını analiz ederek, arta kalan kuruşları otomatik olarak yatırım veya emeklilik fonlarına (BES) yönlendirir.

## 🚀 Proje Hakkında
Bu depo (repository), Kuruşla projesinin backend mantığını, veri işleme süreçlerini ve Akbank API entegrasyonu simülasyonlarını içermektedir.

### Temel Özellikler
- **Otomatik Yuvarlama (Round-up):** Kart harcamalarının tam sayıya yuvarlanarak farkın biriktirilmesi.
- **Akbank Entegrasyonu:** Gerçek dünya bankacılık API'leri (Tosla, Yatırım Fonları) ile uyumlu veri yapısı.
- **Sentetik Veri Seti:** 10 farklı kategoride (Kahve, Ulaşım, Market vb.) binlerce gerçekçi işlem verisi.

## 📁 Klasör Yapısı
- `data/synthetic_transactions/`: Akbank API standartlarına göre yapılandırılmış sentetik harcama verileri.
- `docs/`: 
  - `akbank_api_guide.md`: Akbank API portalındaki servislerin detaylı Türkçe dökümantasyonu.
  - `project_plan.md`: Geliştirme notları ve gelecek hedefleri.

## 🛠️ Teknik Altyapı ve Veri
Proje şu anda sentetik veriler üzerinden çalışmaktadır. Veri alanları Akbank'ın `ToslaTransactionList` ve `FundPrices` servisleriyle tam uyumludur:
- `transactionAmount`: Harcama tutarı.
- `reqDate`: İşlem tarihi.
- `transactionDescription`: Harcama noktası bilgisi.

## 📝 Gelecek Planları
1. Gerçek Akbank API Sandbox ortamına geçiş.
2. Agesa BES hesapları için otomatik transfer logic'inin kurulması.
3. Birikimlerin fon performansına göre anlık değerleme motorunun yazılması.
