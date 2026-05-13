# Make.com ve Webhook Entegrasyon Rehberi

Kurusla uygulaması, kullanıcıların harcamalarını otomatik olarak algılamak için **Make.com** otomasyon aracını kullanır. Bu rehber, ekibimize bu sistemin nasıl çalıştığını ve yerel ortamda nasıl test edileceğini açıklamaktadır.

## 🔗 Sistem Nasıl Çalışıyor?

Sistem temel olarak 3 halkadan oluşur:
1. **Gmail Modülü (Make.com):** Kullanıcının gelen kutusunu sürekli dinler. Bankadan gelen bir e-posta (harcama bildirimi) yakalarsa tetiklenir.
2. **Text Parser Modülü (Make.com):** Yakalanan e-postanın içindeki metni tarar (Regex yardımıyla) ve "Tutar" (Amount) bilgisini cımbızla çeker.
3. **HTTP Modülü (Make.com):** Çıkarılan tutarı ve diğer bilgileri (satıcı, kullanıcı numarası) alır ve Kurusla Backend sunucusuna (FastAPI) gönderir.

## 🛡️ Güvenlik Kalkanımız (Webhook Secret Key)

Sistemimizin dış dünyaya açık olan tek kapısı `/api/webhook/transaction` rotasıdır. Herhangi birinin sahte harcama verisi göndermesini engellemek için **API Key (Header)** yöntemi kullanıyoruz.

- **Backend Tarafında:** `app/api/webhook.py` dosyası, gelen isteğin Header (Başlık) kısmında `x-webhook-key` adında bir şifre arar. Şifre eksikse veya `.env` dosyasındaki `WEBHOOK_SECRET_KEY` ile eşleşmiyorsa, sunucu içeri almaz ve **401 Unauthorized** hatası verir.
- **Make.com Tarafında:** HTTP modülü ayarlarındaki "Headers" kısmına `x-webhook-key` eklenmeli ve değeri projenin .env dosyasındaki anahtarla aynı olmalıdır.

## 💻 Geliştirme Aşamasında Tünelleme (Ngrok)

Sunucumuz (Backend) geliştirme sırasında yerel bilgisayarımızda (`localhost:8000`) çalıştığı için Make.com dışarıdan buraya ulaşamaz. Bilgisayarımızı geçici olarak internete açmak için **Ngrok** kullanırız.

### Adım Adım Kurulum ve Test
1. İlk terminalde Backend sunucusunu çalıştırın:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
2. İkinci bir terminal açın ve Ngrok'u başlatın:
   ```bash
   ngrok http 8000
   ```
3. Ngrok'un ekranda verdiği `https://abc-123.ngrok-free.app` şeklindeki tünel adresini kopyalayın.
4. Make.com'daki HTTP modülüne giderek **URL** kısmını şu şekilde güncelleyin:
   `https://abc-123.ngrok-free.app/api/webhook/transaction`
5. HTTP modülünün **Body Content** (Gövde) kısmı, veritabanımızın (`webhook.py` şeması) hata (422 Unprocessable Content) vermemesi için kesinlikle şu JSON formatında olmalıdır (köşeli parantezsiz):
   ```json
   {
     "amount": {{Make_Degiskeni}},
     "merchant": "Test Satıcısı",
     "userId": 1
   }
   ```
6. Make.com'da sol alttan "Run once" veya modüle sağ tıklayıp "Run this module only" diyerek uçtan uca testinizi gerçekleştirebilirsiniz. İşlem başarılı olursa terminalde **200 OK** mesajını göreceksiniz.
