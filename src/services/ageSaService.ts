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
export async function allocateFunds(userId: number, amount: number) {
  const logPrefix = `[AgeSA Service][${new Date().toISOString()}]`;
  
  console.log(`${logPrefix} Kullanıcı ${userId} için ${amount} TL fon tahsisi başlatıldı.`);

  // 0. Tutar Kontrolü
  if (amount <= 0) {
    return {
      success: false,
      message: 'Gönderilecek tutar 0\'dan büyük olmalıdır.',
      status: 'INVALID_AMOUNT'
    };
  }

  try {
    // 1. Simülasyon Kontrolü (Gerçek URL yoksa sahte başarı dön)
    let responseData;
    
    if (process.env.AGESA_API_URL?.includes('api-sim')) {
      console.log(`${logPrefix} Simülasyon modu aktif. Gerçek ağ isteği atlanıyor.`);
      responseData = {
        id: `AGE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        status: 'COMPLETED',
        message: 'Simulated success',
        processedAt: new Date().toISOString()
      };
    } else {
      // Gerçek AgeSA API'ye İstek Atılması
      const response = await ageSaClient.post('/allocate', {
        customerReference: userId.toString(),
        amount: amount,
        currency: 'TRY',
        type: 'CONTRIBUTION_PAYMENT',
        description: 'Kurusla Uygulaması Otomatik Birikim Transferi'
      });
      responseData = response.data;
    }

    // 2. İşlem Başarılı - Veritabanına Logla
    await prisma.aILog.create({
      data: {
        userId: userId,
        toolName: 'AgeSA_FundAllocation',
        parameters: { amount, status: 'SUCCESS', mode: 'SIMULATED' },
        response: responseData as any
      }
    });

    console.log(`${logPrefix} İşlem Başarılı:`, responseData);

    return {
      success: true,
      transactionId: responseData.id,
      data: responseData
    };

  } catch (error: any) {
    // 3. Hata Yönetimi
    const errorDetail = error.response?.data || error.message;
    console.error(`${logPrefix} İşlem Başarısız:`, errorDetail);

    // Hatalı işlemi de logla (Audit Trail)
    await prisma.aILog.create({
      data: {
        userId: userId,
        toolName: 'AgeSA_FundAllocation',
        parameters: { amount, status: 'FAILED' },
        response: { error: errorDetail }
      }
    });

    return {
      success: false,
      message: 'AgeSA sistemine bağlanırken bir hata oluştu.',
      error: errorDetail,
      status: 'FAILED'
    };
  }
}
