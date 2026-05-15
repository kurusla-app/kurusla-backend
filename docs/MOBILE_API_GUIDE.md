# 📱 Kurusla Mobile API Guide

Bu doküman, Kurusla mobil uygulamasını geliştirecek olan arkadaşımız için hazırlanmıştır. Tüm API uç noktaları (endpoints), beklenen JSON formatları ve örnek yanıtlar aşağıda yer almaktadır.

---

## 🌍 Sunucu Bilgileri
- **Base URL:** `https://kurusla-backend.onrender.com`
- **Content-Type:** `application/json`

---

## 🔐 Kimlik Doğrulama (Authentication)
Bazı uç noktalar güvenlik gereği **JWT Token** bekler. Giriş yapıldıktan sonra dönen token bilgisini tüm isteklere şu şekilde eklemelisiniz:
`Authorization: Bearer <TOKEN_BURAYA>`

---

## 🚀 API Uç Noktaları

### 1. Kullanıcı İşlemleri (Auth)

#### 📝 Kayıt Ol (Register)
- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Body:**
```json
{
  "email": "test@example.com",
  "password": "guclu_sifre123"
}
```

#### 🔑 Giriş Yap (Login)
- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Body:**
```json
{
  "email": "test@example.com",
  "password": "guclu_sifre123"
}
```
- **Başarılı Yanıt:**
```json
{
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": {
    "id": 1,
    "email": "test@example.com"
  }
}
```

---

### 2. Sosyal Birikim Grupları

#### ➕ Grup Oluştur
- **URL:** `/api/groups/create`
- **Method:** `POST`
- **Body:**
```json
{
  "name": "Haftalık Kahve Birikimi",
  "userId": 1
}
```
- **Yanıt:** Grup bilgileri ve arkadaşlarınızı davet edebileceğiniz eşsiz bir **Invite Code** döner.

---

### 3. Harcama Bildirimleri (Webhooks)

#### 💬 Metin Ayrıştırma ve Kayıt
Eğer mobil uygulama üzerinden telefonun bildirimlerine erişip ham metni göndermek isterseniz bu endpoint'i kullanabilirsiniz.
- **URL:** `/api/webhooks/sms`
- **Method:** `POST`
- **Body:**
```json
{
  "userId": 1,
  "text": "Garanti BBVA: Starbucks isyerinde 45.50 TL harcama yapilmistir."
}
```
- **İşlem:** Sistem metni otomatik analiz eder, harcamayı kaydeder, yuvarlamayı hesaplar ve AI analizini başlatır.

---

### 4. Kullanıcı Profil ve Bildirim İşlemleri (User)

#### 📲 FCM Token Kaydetme
Mobil uygulama açıldığında veya token yenilendiğinde bu endpoint'e güncel token gönderilmelidir.
- **URL:** `/api/user/fcm-token`
- **Method:** `POST`
- **Body:**
```json
{
  "userId": 1,
  "fcmToken": "firebase_cihaz_token_buraya"
}
```

#### 🔔 Test Bildirimi Gönder
Sistemin bildirim gönderip göndermediğini test etmek için kullanılır.
- **URL:** `/api/user/test-notification`
- **Method:** `POST`
- **Body:**
```json
{
  "userId": 1,
  "title": "Merhaba Kurusla!",
  "body": "Bu bir test bildirimidir."
}
```

#### 🏆 Rozet Kontrollerini Tetikle (Dev/Test)
Gece yarısı çalışacak olan rozet kontrollerini manuel olarak tetikler.
- **URL:** `/api/user/trigger-badges`
- **Method:** `POST`
- **Yanıt:** `200 OK`

---

### 5. Sistem Durumu

#### 🏥 Sağlık Kontrolü
- **URL:** `/healthz`
- **Method:** `GET`
- **Yanıt:** Sunucunun aktif olup olmadığını kontrol eder.

---

## ⚠️ Hata Yönetimi
API hata durumlarında uygun HTTP statü kodları ve şu formatta hata mesajı döner:
```json
{
  "error": "Hata mesajı buraya yazılır."
}
```
- `400`: Hatalı istek (Eksik parametre vb.)
- `401`: Yetkisiz erişim (Hatalı şifre veya token)
- `422`: İşlenemeyen veri (Regex analiz hatası vb.)
