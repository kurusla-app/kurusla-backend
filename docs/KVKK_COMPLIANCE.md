# ⚖️ KVKK Uyumluluk ve Veri Güvenliği Rehberi (Kurusla)

Bu döküman, Kurusla Backend projesinde kişisel verilerin korunması (KVKK) kapsamında uygulanan teknik tedbirleri açıklar.

## 🔒 1. Veri Şifreleme (Encryption at Rest)

Finansal ve kişisel veriler, veritabanına kaydedilmeden önce uygulama seviyesinde şifrelenir. Bu sayede veritabanı dosyalarına doğrudan erişim sağlansa bile (Data Breach), veriler okunamaz halde kalır.

### Şifreleme Algoritması
- **Algoritma:** AES-256-CBC (Advanced Encryption Standard)
- **Mod:** CBC (Cipher Block Chaining)
- **Anahtar Uzunluğu:** 256-bit (32 karakter)
- **IV (Initialization Vector):** Her kayıt için benzersiz (random) bir IV oluşturulur ve şifreli metnin başına eklenir (`iv:ciphertext`).

### Şifrelenen Alanlar
| Tablo | Alan | Neden? |
| :--- | :--- | :--- |
| `Transaction` | `merchant` | Kullanıcının harcama alışkanlıklarını ve ticari sırlarını korumak. |
| `User` | `firstName` | Kimlik bilgilerini gizlemek. |
| `User` | `lastName` | Kimlik bilgilerini gizlemek. |

---

## 🛠 2. Teknik Uygulama

Şifreleme süreci **Prisma Client Extensions** kullanılarak otomatikleştirilmiştir. Geliştiricinin manuel olarak şifreleme/çözme yapmasına gerek yoktur.

- **Yazma:** `prisma.transaction.create` çağrıldığında veri şifrelenir.
- **Okuma:** Veri çekildiğinde (örn: `findUnique`) veri otomatik olarak çözülür ve temiz metin olarak döner.

---

## 🔑 3. Anahtar Yönetimi

Şifreleme anahtarı (`ENCRYPTION_KEY`) kesinlikle kaynak kodda tutulmaz.
- **Yerel Geliştirme:** `.env` dosyasında saklanır.
- **Üretim (Production):** Render.com Environment Variables veya GitHub Secrets üzerinde güvenli bir şekilde saklanır.

> [!WARNING]
> Şifreleme anahtarı kaybolursa, veritabanındaki mevcut şifreli veriler asla geri döndürülemez!

---

## 🧪 4. Doğrulama ve Test

Veritabanındaki verinin şifreli olduğunu doğrulamak için Prisma Studio veya doğrudan SQL sorgusu kullanılabilir:

```sql
-- Merchant isminin şifreli (hex formatında) olduğunu göreceksiniz
SELECT "merchant" FROM "Transaction" LIMIT 1;
```

API üzerinden çekildiğinde ise veri orijinal haliyle görünür:

```bash
GET /api/transactions
# Response: { "merchant": "Starbucks", ... }
```

---

## 📜 5. KVKK Sorumlusu
- **Veri Sorumlusu:** Taha Buğra Çiçek
- **Son Güncelleme:** 2026-05-15
