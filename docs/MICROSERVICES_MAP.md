# 🗺️ Kurusla Mikroservis Dönüşüm Yol Haritası

Bu döküman, monolitik backend uygulamasının hangi parçalara bölüneceğini ve mikroservis mimarisine nasıl geçileceğini açıklar.

---

## 🏗️ 1. Mevcut Durum (Monolith)
Şu an tüm özellikler (Auth, Transaction, Pot, Notification, AI) tek bir Node.js projesi içinde çalışmaktadır.

---

## 🚀 2. Ayrıştırma Planı (Microservices)

Sırasıyla bağımsız hale getirilecek servisler:

### A. Notification Service (İlk Ayrılacak Parça)
- **Neden?** Firebase bildirimleri dış dünyaya bağımlıdır ve ağ gecikmeleri ana uygulamayı yavaşlatabilir.
- **İletişim:** RabbitMQ veya Redis Pub/Sub üzerinden "Bildirim Gönder" mesajlarını dinler.
- **Teknoloji:** Node.js veya Go.

### B. AI Connector Service
- **Neden?** Yusuf'un AI modülüyle iletişim kuran katman, yoğun yük altında ana uygulamadan ayrılmalıdır.
- **İletişim:** gRPC (Düşük gecikme için).
- **Teknoloji:** Python (AI ekosistemiyle uyum için).

### C. Transaction & Math Engine
- **Neden?** Finansal hesaplamalar ve harcama işleme projenin kalbidir. En çok "Scale" edilmesi gerekecek parça budur.
- **İletişim:** REST API veya gRPC.

---

## 🌐 3. API Gateway & Ingress
Tüm mikroservislerin önünde tek bir giriş kapısı bulunacaktır.
- **Çözüm:** Nginx Ingress Controller veya Kong.
- **Görev:** İstekleri `/api/auth` -> Auth Service, `/api/pots` -> Pot Service şeklinde yönlendirmek.

---

## 🛠️ 4. Teknoloji Seçimleri
- **Containerization:** Docker
- **Orchestration:** Kubernetes (K8s)
- **CI/CD:** GitHub Actions -> Google Artifact Registry -> GKE
- **Service Mesh:** Istio (Gelecekte servisler arası güvenlik için)

---
**Hazırlayan:** Antigravity (AI)
**Tarih:** 2026-05-15
