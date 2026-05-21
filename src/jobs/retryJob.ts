import cron from 'node-cron';
import prisma from '../config/db';
import { allocateFunds, isAgeSaSimulationMode } from '../services/ageSaService';
import { sendCriticalAlert } from '../services/notification.service';

const MAX_BATCH_PER_RUN = 25;
const MIN_MINUTES_SINCE_UPDATE = 10;

/**
 * Başarısız (FAILED) olan finansal işlemleri yeniden deneyen CRON job.
 * Her 30 dakikada bir çalışır; tek seferde en fazla MAX_BATCH_PER_RUN kayıt işler.
 */
export const initRetryJob = () => {
  cron.schedule('*/30 * * * *', async () => {
    console.log('[Retry Job] Başarısız birikim işlemleri taranıyor...');

    if (isAgeSaSimulationMode()) {
      console.log('[Retry Job] AgeSA simülasyon modu aktif.');
    }

    try {
      const cutoff = new Date(Date.now() - 1000 * 60 * MIN_MINUTES_SINCE_UPDATE);

      const failedSavings = await prisma.saving.findMany({
        where: {
          status: 'FAILED',
          retryCount: { lt: 5 },
          updatedAt: { lt: cutoff },
        },
        orderBy: { updatedAt: 'asc' },
        take: MAX_BATCH_PER_RUN,
      });

      if (failedSavings.length === 0) {
        console.log('[Retry Job] Tekrar denenecek işlem bulunamadı.');
        return;
      }

      const totalPending = await prisma.saving.count({
        where: {
          status: 'FAILED',
          retryCount: { lt: 5 },
          updatedAt: { lt: cutoff },
        },
      });

      console.log(
        `[Retry Job] Bu turda ${failedSavings.length} işlem deneniyor` +
          (totalPending > failedSavings.length
            ? ` (kuyrukta ~${totalPending} kayıt var, sonraki turda devam eder).`
            : '.')
      );

      let successCount = 0;
      let failCount = 0;

      for (const saving of failedSavings) {
        const nextRetryCount = saving.retryCount + 1;

        await prisma.saving.update({
          where: { id: saving.id },
          data: { retryCount: nextRetryCount },
        });

        const result = await allocateFunds(saving.userId, saving.amount, saving.id);

        if (result.success) {
          successCount++;
        } else {
          failCount++;
          if (nextRetryCount >= 5) {
            await sendCriticalAlert(
              'Kritik İşlem Hatası (Max Retry)',
              `Kullanıcı ${saving.userId} için ${saving.amount} TL tutarındaki birikim 5 deneme sonrası AgeSA'ya iletilemedi.`
            );
          }
        }

        await new Promise((r) => setTimeout(r, 50));
      }

      console.log(
        `[Retry Job] Tur tamamlandı: ${successCount} başarılı, ${failCount} başarısız.`
      );
    } catch (error) {
      console.error('[Retry Job] Beklenmedik bir hata oluştu:', error);
    }
  });

  console.log('⏰ Retry Job başarıyla zamanlandı (30 dakikalık periyot).');
};
