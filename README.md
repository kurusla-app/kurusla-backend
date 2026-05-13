# Kurusla - Backend API (Python)

**Kurusla**, kullanıcıların harcamalarını takip ederek otomatik birikim yapmasını sağlayan bir fintech çözümüdür. Bu sürüm, **Python**, **FastAPI** ve **Prisma** ile geliştirilmiştir.

## 🎯 Proje Özeti
Bu API, harcama bildirimlerini alır, kullanıcı kurallarına (yuvarlama veya yüzde bazlı) göre birikim hesaplar ve veritabanına kaydeder.

## 🏗️ Mimari Yapı (Layered Architecture)
Sürdürülebilirlik için katmanlı bir mimari benimsenmiştir:
- **app/api**: API uç noktaları (Routers).
- **app/services**: İş mantığı ve hesaplama motoru (Business Logic).
- **app/schemas**: Veri doğrulama modelleri (Pydantic).
- **app/core**: Yapılandırma ve veritabanı istemcisi.

## 💾 Veritabanı Modelleri (Prisma)
- **User**: Kullanıcı bilgileri ve bakiye takibi.
- **Group**: Sosyal birikim grupları.
- **Transaction**: Kullanıcının yaptığı harcamalar.
- **Saving**: Her harcamadan elde edilen mikro-birikimler.

## 🛠️ Teknoloji Stack'i
- **Framework**: FastAPI
- **Database ORM**: Prisma (Python Client)
- **Database**: PostgreSQL (Neon.tech)
- **Validation**: Pydantic v2

## 🚀 Kurulum ve Çalıştırma

1. **Bağımlılıkları yükleyin**
```bash
pip install -r requirements.txt
```

2. **Veritabanını Hazırlayın**
```bash
# Prisma istemcisini üretin
python -m prisma generate

# Veritabanını güncelleyin
python -m prisma migrate dev
```

3. **Sunucuyu başlatın**
```bash
python app/main.py
```

4. **Dokümantasyon**
`http://127.0.0.1:8000/docs` adresinden Swagger arayüzüne ulaşabilirsiniz.

---
**Geliştirici**: Muhammed Beşir Kesen
