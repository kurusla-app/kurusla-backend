import axios from 'axios';
import prisma from '../config/db';

/**
 * AgeSA API İstemcisi
 * Finansal işlemler için özel timeout ve header yapılandırması
 */
const ageSaClient = axios.create({
  baseURL: process.env.AGESA_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': process.env.AGESA_API_KEY,
  },
  timeout: Number(process.env.AGESA_TIMEOUT) || 5000,
});

/**
 * Fon Tahsis Fonksiyonu (Allocate Funds)
 * Kullanıcının biriktirdiği tutarı AgeSA emeklilik fonuna "Katkı Payı" olarak iletir.
 * 
 * @param userId Kullanıcı ID
 * @param amount Gönderilecek tutar (TL)
 */
export async function allocateFunds(userId: number, amount: number, savingId?: number) {
  const logPrefix = `[AgeSA Service][${new Date().toISOString()}]`;
  
  console.log(`${logPrefix} Kullanıcı ${userId} için ${amount} TL fon tahsisi başlatıldı.`);

  try {
    // 1. Simülasyon Kontrolü
    let responseData;
    if (process.env.AGESA_API_URL?.includes('api-sim')) {
      responseData = {
        id: `AGE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        status: 'COMPLETED',
        message: 'Simulated success'
      };
    } else {
      const response = await ageSaClient.post('/allocate', {
        customerReference: userId.toString(),
        amount: amount,
        currency: 'TRY',
        type: 'CONTRIBUTION_PAYMENT'
      });
      responseData = response.data;
    }

    // 2. İşlem Başarılı - DB Güncelle (Eğer savingId varsa)
    if (savingId) {
      await prisma.saving.update({
        where: { id: savingId },
        data: { status: 'SUCCESS' }
      });
    }

    await prisma.aILog.create({
      data: {
        userId,
        toolName: 'AgeSA_FundAllocation',
        parameters: { amount, status: 'SUCCESS', savingId },
        response: responseData as any
      }
    });

    return { success: true, transactionId: responseData.id, data: responseData };

  } catch (error: any) {
    const errorDetail = error.response?.data || error.message;
    
    // 3. Hata Durumu - DB Güncelle (FAILED olarak işaretle)
    if (savingId) {
      await prisma.saving.update({
        where: { id: savingId },
        data: { status: 'FAILED' }
      });
    }

    await prisma.aILog.create({
      data: {
        userId,
        toolName: 'AgeSA_FundAllocation',
        parameters: { amount, status: 'FAILED', savingId },
        response: { error: errorDetail }
      }
    });

    return { success: false, message: 'AgeSA hatası', error: errorDetail, status: 'FAILED' };
  }
}
