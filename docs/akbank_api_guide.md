# Akbank API Rehberi - Kuruşla Projesi

Bu döküman, Kuruşla mikro-birikim projesi için Akbank API Portal üzerinden erişilebilen tüm servislerin detaylı analizini ve projemizle olan ilişkisini içermektedir.

## 1. Genel Bilgiler
- **Geliştirici Portalı:** [Akbank API Portal](https://apiportal.akbank.com/apis)
- **Erişim Türü:** Proje kapsamında incelenen API'lerin çoğu "Private" (Özel) statüsündedir ve Akbank ile iş ortaklığı gerektirir.
- **Güvenlik:** Tüm isteklerde `Ocp-Apim-Subscription-Key` başlığı (header) zorunludur.

---

## 2. API Kategorileri ve Fonksiyonları

### 💳 Kart Hizmetleri (En Kritik Kategori)
Kullanıcıların harcamalarını takip etmek ve yuvarlama mekanizmasını çalıştırmak için kullanılır.

- **ToslaTransactionList:** Tosla kart harcamalarını listeler. Yuvarlama (Round-up) hesaplamaları için ana veri kaynağıdır.
- **HcePrepaidCard / HceToslaPrepaidCard:** Ön ödemeli kart işlemlerini yönetir.
- **KrediKartiListele:** Kullanıcının tüm banka ve kredi kartlarını görmemizi sağlar.
- **HceCardProvision:** NFC ile mobil temassız ödeme yetkilendirmesi yapar.

### 📈 Yatırım Hizmetleri
Biriktirilen küçük tutarların nasıl değerleneceğini belirlemek ve kullanıcıya göstermek için kullanılır.

- **FundPrices:** Yatırım fonlarının güncel birim fiyatlarını sağlar.
- **FundPriceStatistics:** Fonların geçmiş performans istatistiklerini getirir (Motivasyon amaçlı dashboardlar için).

### 🏥 Sigorta ve Emeklilik (AgeSA Entegrasyonu)
Birikimlerin hedeflenen BES (Bireysel Emeklilik Sistemi) hesaplarına aktarımı için gereklidir.

- **InsuranceRefundAccountList:** İadelerin/birikimlerin aktarılabileceği hesapları listeler.
- **InsuranceAccountList:** Mevcut poliçe ve emeklilik hesaplarını döndürür.

### ⚙️ Genel ve Tanımlama Servisleri
Uygulama içi formlarda ve lokasyon bazlı servislerde kullanılır.

- **Branches & Cities:** Şube ve şehir bilgileri.
- **JobTypes & EducationTypes:** Müşteri profilleme için gerekli tanımlar.

---

## 3. Veri Yapısı ve Eşleşme (Mapping)

Sentetik verilerimiz, Akbank API standartlarına uygun hale getirilmiştir:

| Orijinal Alan (Sentetik) | Akbank API Alanı | Açıklama |
| :--- | :--- | :--- |
| `amount` | `transactionAmount` | İşlem tutarı |
| `date` | `reqDate` | İşlem tarihi (ISO 8601) |
| `description` | `transactionDescription` | İşlem açıklaması ve işyeri adı |
| `id` | `transactionId` | Benzersiz işlem numarası |
| (Yeni) | `cardNo` | Maskelenmiş kart numarası (4355-XXXX...) |

---

## 4. Kullanım Senaryosu (Kuruşla Akışı)
1. **Veri Çekme:** `ToslaTransactionList` ile harcamalar periyodik olarak kontrol edilir (Örn: 150 TL'lik kahve harcaması).
2. **Kural Uygulama:** Kullanıcının önceden belirlediği kural (Örn: "0-200 TL arası harcamalarda %10 biriktir") backend tarafında işletilir. 
3. **Hesaplama:** Harcama tutarı üzerinden birikim miktarı hesaplanır (Örn: 150 TL'nin %10'u olan 15 TL).
4. **Aktarım:** `InsuranceRefundAccountList` ile belirlenen BES veya hedef potuna 15 TL'lik birikim talimatı tetiklenir (Simüle edilir).
5. **Değerleme:** `FundPrices` ile biriken bu tutarların (15 TL) seçili fonlardaki güncel değeri kullanıcıya gösterilir.
