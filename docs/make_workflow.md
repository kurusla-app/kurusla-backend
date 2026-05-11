# Make.com E-posta İşleme İş Akışı (Workflow)

Bu döküman, bankalardan gelen harcama bildirim e-postalarının otomatik olarak yakalanması, verilerin ayıklanması ve backend sistemimize iletilmesi sürecini açıklar.

## Genel Akış Yapısı

1. **Tetikleyici (Trigger):** Gmail - Watch Emails
   - Belirlenen klasördeki (Inbox) yeni e-postaları izler.
2. **Filtreleme:**
   - Sadece konu başlığında "Harcama", "İşlem", "Bilgi" gibi anahtar kelimeler geçen mailleri işleme alır.
3. **Veri Ayıklama (Text Parser - Match Pattern):**
   - E-posta gövdesinden Regex kullanılarak tutar ve işyeri bilgisi çekilir.
   - **Pattern:** `(?<amount>\d+[\.,]\d{2})\s?TL` (Örnek)
4. **Webhook/HTTP İletimi:**
   - Ayıklanan veriler JSON formatında backend API'mıza gönderilir.
   - **Method:** POST
   - **URL:** `[BACKEND_URL]/api/transactions` (Backend tamamlandığında güncellenecek)
   - **Payload:**
     ```json
     {
       "amount": "{{amount}}",
       "source": "email",
       "timestamp": "{{now}}"
     }
     ```

## Notlar ve Uyarılar

- **Regex Hassasiyeti:** Banka mail formatı değişirse `Text Parser` modülündeki Regex güncellenmelidir.
- **Güvenlik:** Backend tarafında bu Webhook için bir API Key veya Token doğrulaması eklenmesi önerilir.
- **Hata Yönetimi:** Eğer Regex eşleşme bulamazsa (tutar yoksa), senaryo hata vermeden duracak şekilde konfigüre edilmiştir.

---
*Son Güncelleme: 11.05.2026*
