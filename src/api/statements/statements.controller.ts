import { Request, Response } from 'express';
import {
  extractTextFromPdf,
  pdfBufferFromBase64,
} from '../../services/pdfStatement.service';
import { parseStatementFromSources } from '../../services/statementTableParser.service';
import { importStatementForUser } from '../../services/statementImport.service';

/**
 * Aylık ekstre PDF'ini ham metne dönüştürür.
 * Make.com veya mobil istemci base64 PDF gönderebilir.
 */
export async function parseStatementPdf(req: Request, res: Response): Promise<any> {
  try {
    const { pdfBase64 } = req.body;

    if (!pdfBase64 || typeof pdfBase64 !== 'string') {
      return res.status(400).json({
        error: 'pdfBase64 alanı zorunludur (Base64 kodlu PDF).',
      });
    }

    const buffer = pdfBufferFromBase64(pdfBase64);
    const result = await extractTextFromPdf(buffer);

    if (!result.text) {
      return res.status(422).json({
        error: 'PDF okundu ancak metin çıkarılamadı (boş veya taranmış görüntü olabilir).',
        pageCount: result.pageCount,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'PDF başarıyla metne dönüştürüldü.',
      data: {
        text: result.text,
        pageCount: result.pageCount,
        charCount: result.text.length,
        pages: result.pages,
        tableCount: result.tables.length,
      },
    });
  } catch (error: any) {
    console.error('[PDF Statement] Ayrıştırma hatası:', error.message);

    const status = error.message?.includes('Geçersiz') || error.message?.includes('boş')
      ? 400
      : 500;

    return res.status(status).json({ error: error.message || 'PDF işlenemedi.' });
  }
}

/**
 * Ekstre metninden harcama satırlarını ayrıştırır (kayıt yapmaz).
 */
export async function parseStatementTransactions(req: Request, res: Response): Promise<any> {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text alanı zorunludur.' });
    }

    const transactions = parseStatementFromSources(text);

    if (transactions.length === 0) {
      return res.status(422).json({
        error: 'Metinde işlenebilir harcama satırı bulunamadı.',
      });
    }

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * PDF veya metin ekstresini içe aktarır: parse → transaction → birikim akışı.
 */
export async function importStatement(req: Request, res: Response): Promise<any> {
  try {
    const { userId, text, pdfBase64 } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId zorunludur.' });
    }

    if (!text && !pdfBase64) {
      return res.status(400).json({
        error: 'text veya pdfBase64 alanlarından biri zorunludur.',
      });
    }

    const result = await importStatementForUser(Number(userId), { text, pdfBase64 });

    return res.status(200).json({
      success: true,
      message: `${result.importedCount} işlem içe aktarıldı.`,
      data: result,
    });
  } catch (error: any) {
    const status =
      error.message?.includes('bulunamadı') ||
      error.message?.includes('zorunlu') ||
      error.message?.includes('en fazla')
        ? 400
        : 422;

    return res.status(status).json({ error: error.message });
  }
}
