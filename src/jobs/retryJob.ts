import cron from 'node-cron';
import prisma from '../config/db';
import { allocateFunds } from '../services/ageSaService';
import { sendCriticalAlert } from '../services/notification.service';

/**
 * Başarısız (FAILED) olan finansal işlemleri yeniden deneyen CRON job.
 * Her 30 dakikada bir çalışır.
 */
export const initRetryJob = () => {
  // '*/30 * * * *' -> Her 30 dakikada bir
  // Test kolaylığı için şimdilik '*/5 * * * *' (5 dk) da yapılabilir
  cron.schedule('*/30 * * * *', async () => {
    console.log('[Retry Job] Başarısız birikim işlemleri taranıyor...');

    try {
      const failedSavings = await prisma.saving.findMany({
        where: {
          status: 'FAILED',
          retryCount: { lt: 5 },
          // Basit Backoff: Son denemeden en az 10 dakika geçmiş olmalı
          updatedAt: {
            lt: new Date(Date.now() - 1000 * 60 * 10)
          }
        }
      });

      if (failedSavings.length === 0) {
        console.log('[Retry Job] Tekrar denenecek işlem bulunamadı.');
        return;
      }

      console.log(`[Retry Job] ${failedSavings.length} adet başarısız işlem bulundu. Yeniden deneme başlatılıyor...`);

      for (const saving of failedSavings) {
        const nextRetryCount = saving.retryCount + 1;

        console.log(`[Retry Job] Deneme #${nextRetryCount} | SavingID: ${saving.id} | Kullanıcı: ${saving.userId}`);

        // 1. Retry count'u hemen güncelle (Infinite loop önlemi)
        await prisma.saving.update({
          where: { id: saving.id },
          data: { retryCount: nextRetryCount }
        });

        // 2. İşlemi tekrar dene
        const result = await allocateFunds(saving.userId, saving.amount, saving.id);

        if (result.success) {
          console.log(`[Retry Job] ✅ Başarılı: SavingID ${saving.id} artık SUCCESS.`);
        } else {
          console.warn(`[Retry Job] ❌ Başarısız: SavingID ${saving.id} hala FAILED.`);
          
          // 3. Eğer 5. deneme de başarısızsa KRİTİK UYARI gönder
          if (nextRetryCount >= 5) {
            await sendCriticalAlert(
              'Kritik İşlem Hatası (Max Retry)',
              `Kullanıcı ${saving.userId} için ${saving.amount} TL tutarındaki birikim 5 deneme sonrası AgeSA'ya iletilemedi.`
            );
          }
        }
      }
    } catch (error) {
      console.error('[Retry Job] Beklenmedik bir hata oluştu:', error);
    }
  });

  console.log('⏰ Retry Job başarıyla zamanlandı (30 dakikalık periyot).');
};
