# Kurusla - Backend API (Python)

**Kurusla**, kullanıcıların harcamalarını takip ederek otomatik birikim yapmasını sağlayan bir fintech çözümüdür. Bu v2.0 sürümü, **Python** ve **FastAPI** ile geliştirilerek AI süreçlerine tam uyumlu hale getirilmiştir.

## 🎯 Proje Özeti
Bu API, harcama bildirimlerini alır, kullanıcı kurallarına (yuvarlama veya yüzde bazlı) göre birikim hesaplar ve tasarruf potlarına (BES/Hayal) aktarır.

## ✨ Özellikler (V2.0)
- **FastAPI Framework**: Yüksek performanslı ve modern backend.
- **Smart Rule Engine**: Gelişmiş yüzde ve yuvarlama hesaplamaları.
- **AI Integration Support**: Python ekosistemi sayesinde yapay zeka entegrasyonu hazır.
- **Pydantic Validation**: Tüm istekler (requests) sıkı tip kontrolünden geçer.

## 🛠️ Teknoloji Stack'i
- **Language**: Python 3.10+
- **Framework**: FastAPI
- **WebServer**: Uvicorn
- **Validation**: Pydantic
- **AI/LLM Support**: LangChain, OpenAI/Gemini (Planlanıyor)

## 📁 Proje Yapısı
```
kurusla-backend/
├── app/
│   ├── main.py              # Uygulama giriş noktası
│   ├── services/            # İş mantığı servisleri
│   │   └── savings_service.py # Birikim hesaplama motoru
├── tests/                   # Python testleri
│   └── test_savings.py      # Birikim motoru testi
├── requirements.txt         # Bağımlılıklar
└── README.md
```

## 🚀 Kurulum ve Çalıştırma

1. **Bağımlılıkları yükleyin**
```bash
pip install -r requirements.txt
```

2. **Sunucuyu başlatın**
```bash
uvicorn app.main:app --reload
```

3. **Dokümantasyonu görün**
Sunucu çalıştıktan sonra `http://127.0.0.1:8000/docs` adresinden API dökümantasyonuna ulaşabilirsiniz.

---
**Not**: Bu proje v2.0 sürümüne geçiş aşamasındadır.
