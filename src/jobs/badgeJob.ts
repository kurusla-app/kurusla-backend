import cron from 'node-cron';
import prisma from '../config/db';
import * as badgeService from '../services/badge.service';
import { TransactionCategories } from '../constants/categories';

/**
 * Rozet Kontrol Job'ı
 * Her gece 00:00'da çalışır.
 */
export function initBadgeJobs() {
  // 0 0 * * * -> Her gece 00:00
  cron.schedule('0 0 * * *', async () => {
    console.log('🚀 Rozet kontrol jobı başlatıldı...');
    
    await checkIradeSahibi();
    await checkGrupLideri();
    await checkKuruscu();

    console.log('✅ Gece yarısı rozet kontrolleri tamamlandı.');
  });
}

/**
 * 3 gün boyunca "Yeme-İçme" (Food & Drink) harcaması yapmayanları kontrol eder
 */
export async function checkIradeSahibi() {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const users = await prisma.user.findMany();

  for (const user of users) {
    const foodTransactions = await prisma.transaction.findFirst({
      where: {
        userId: user.id,
        category: TransactionCategories.FOOD_DRINK,
        createdAt: {
          gte: threeDaysAgo
        }
      }
    });

    // Eğer son 3 günde hiç yeme-içme harcaması yoksa rozeti ver
    if (!foodTransactions) {
      await badgeService.awardBadge(user.id, 'İrade Sahibi');
    }
  }
}

/**
 * Gruplarda en çok birikim yapan liderleri kontrol eder
 */
export async function checkGrupLideri() {
  const groups = await prisma.group.findMany({
    include: {
      users: {
        include: {
          savings: true
        }
      }
    }
  });

  for (const group of groups) {
    let leaderId = -1;
    let maxSaving = 0;

    for (const user of group.users) {
      const totalSaving = user.savings.reduce((sum, s) => sum + s.amount, 0);
      if (totalSaving > maxSaving) {
        maxSaving = totalSaving;
        leaderId = user.id;
      }
    }

    if (leaderId !== -1) {
      await badgeService.awardBadge(leaderId, 'Grup Lideri');
    }
  }
}

/**
 * İlk birikimini yapanları kontrol eder
 */
export async function checkKuruscu() {
  const usersWithSavings = await prisma.user.findMany({
    where: {
      savings: {
        some: {} // En az 1 birikimi olanlar
      },
      badges: {
        none: {
          badge: {
            name: 'Kuruşçu'
          }
        }
      }
    }
  });

  for (const user of usersWithSavings) {
    await badgeService.awardBadge(user.id, 'Kuruşçu');
  }
}
