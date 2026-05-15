import prisma from '../config/db';
import { calculateRoundUp } from './mathEngine';
import { analyzeTransaction } from './aiService';

/**
 * Gelen harcamayı işleyen, birikim hesaplayan ve AI servisini tetikleyen ana akış.
 */
export async function processNewTransaction(userId: number, amount: number, merchant: string, category: string) {
  try {
    // 1. İşlemi (Transaction) veritabanına kaydet
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount,
        merchant,
        category
      }
    });

    // 2. Yuvarlama Kuralını getir ve Birikim (Saving) hesapla
    const rule = await prisma.userRule.findUnique({ where: { userId } });
    const step = rule ? rule.roundUpStep : 10; // Varsayılan 10
    
    const savingAmount = calculateRoundUp(amount, step);
    
    // Eğer yuvarlanacak bir küsurat varsa Saving tablosuna kaydet
    if (savingAmount > 0) {
      const saving = await prisma.saving.create({
        data: {
          userId,
          transactionId: transaction.id,
          amount: savingAmount,
          status: 'PENDING'
        }
      });

      // AgeSA Fon Tahsisini Başlat (Arka planda çalışabilir ama sonucunu bekleyip statü güncelliyoruz)
      const { allocateFunds } = await import('./ageSaService');
      allocateFunds(userId, savingAmount, saving.id);
    }

    // 3. AI Servisini Tetikle (Fire-and-forget)
    // await KULLANMIYORUZ! Çünkü kullanıcıyı veya sistemi AI analizinin bitmesini bekletmek istemiyoruz.
    analyzeTransaction({
      transactionId: transaction.id,
      amount: transaction.amount,
      merchant: transaction.merchant,
      category: transaction.category
    });

    return transaction;

  } catch (error) {
    console.error('[Transaction Service] İşlem kaydedilirken hata oluştu:', error);
    throw error;
  }
}
