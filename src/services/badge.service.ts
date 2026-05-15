import prisma from '../config/db';
import * as notificationService from './notification.service';

/**
 * Kullanıcıya rozet verir
 */
export async function awardBadge(userId: number, badgeName: string) {
  try {
    // 1. Rozeti bul
    const badge = await prisma.badge.findUnique({
      where: { name: badgeName }
    });

    if (!badge) {
      console.error(`Rozet bulunamadı: ${badgeName}`);
      return;
    }

    // 2. Kullanıcının zaten bu rozeti olup olmadığını kontrol et
    const existingUserBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId: userId,
          badgeId: badge.id
        }
      }
    });

    if (existingUserBadge) return; // Zaten sahip

    // 3. Rozeti ata
    await prisma.userBadge.create({
      data: {
        userId: userId,
        badgeId: badge.id
      }
    });

    console.log(`Kullanıcı (${userId}) yeni bir rozet kazandı: ${badgeName}`);

    // 4. Bildirim gönder
    await notificationService.sendNotificationToUser(
      userId,
      'Yeni Bir Rozet Kazandın! 🏆',
      `Tebrikler! "${badge.name}" rozetini kazandın: ${badge.description}`
    );

  } catch (error) {
    console.error('Rozet verme işlemi sırasında hata:', error);
  }
}

/**
 * Temel rozetleri sisteme tanımlar (Sadece bir kez veya her başlatmada çalışabilir)
 */
export async function seedBadges() {
  const basicBadges = [
    {
      name: 'Kuruşçu',
      description: 'İlk birikimini başarıyla gerçekleştiren kullanıcı.',
      icon: 'piggy-bank'
    },
    {
      name: 'İrade Sahibi',
      description: '3 gün boyunca yeme-içme harcaması yapmayarak iradesini kanıtlayan.',
      icon: 'brain'
    },
    {
      name: 'Grup Lideri',
      description: 'Bir grup içinde en çok tasarruf yapan lider kullanıcı.',
      icon: 'crown'
    }
  ];

  for (const b of basicBadges) {
    await prisma.badge.upsert({
      where: { name: b.name },
      update: {},
      create: b
    });
  }
  console.log('✅ Temel rozet tanımları güncellendi.');
}
