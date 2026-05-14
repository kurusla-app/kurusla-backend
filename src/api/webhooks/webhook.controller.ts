import { Request, Response } from 'express';
import { parseBankMessage } from '../../services/regexService';
import { processNewTransaction } from '../../services/transactionService';

/**
 * Make.com veya mobil cihazlardan gelen ham metinleri karşılayan Webhook.
 */
export async function handleSmsWebhook(req: Request, res: Response): Promise<any> {
  try {
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ error: 'userId ve text alanları zorunludur.' });
    }

    // 1. Regex ile metni ayrıştır
    const parsedData = parseBankMessage(text);

    if (!parsedData) {
      console.warn(`[Webhook] Metin ayrıştırılamadı: ${text}`);
      return res.status(422).json({ error: 'Metin formatı tanınamadı.' });
    }

    // 2. İşlemi Transaction Service üzerinden kaydet ve diğer çarkları tetikle
    const transaction = await processNewTransaction(
      userId,
      parsedData.amount,
      parsedData.merchant,
      'Banka Bildirimi' // Varsayılan kategori
    );

    return res.status(201).json({
      message: 'İşlem başarıyla kaydedildi.',
      data: transaction,
      parsed: parsedData
    });

  } catch (error: any) {
    console.error('[Webhook Hata]:', error);
    return res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
}
