import { PDFParse } from 'pdf-parse';

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  pages: Array<{ pageNumber: number; text: string }>;
  tables: string[][][];
}

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * E-posta ekleri veya Make.com'dan gelen aylık banka ekstre PDF'lerini ham metne çevirir.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<PdfExtractionResult> {
  if (!buffer?.length) {
    throw new Error('PDF verisi boş.');
  }

  if (buffer.length > MAX_PDF_SIZE_BYTES) {
    throw new Error(`PDF boyutu ${MAX_PDF_SIZE_BYTES / (1024 * 1024)} MB sınırını aşıyor.`);
  }

  const header = buffer.subarray(0, 5).toString('utf8');
  if (!header.startsWith('%PDF')) {
    throw new Error('Geçersiz PDF dosyası.');
  }

  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    let tables: string[][][] = [];

    try {
      const tableResult = await parser.getTable();
      if (tableResult.mergedTables?.length) {
        tables = tableResult.mergedTables as string[][][];
      }
    } catch (tableError) {
      console.warn('[PDF] Tablo çıkarımı atlandı, metin tabanlı parse kullanılacak.');
    }

    return {
      text: result.text.trim(),
      pageCount: result.total,
      pages: result.pages.map((page) => ({
        pageNumber: page.num,
        text: page.text.trim(),
      })),
      tables,
    };
  } finally {
    await parser.destroy();
  }
}

/**
 * Base64 (data URL dahil) PDF içeriğini Buffer'a çevirir.
 */
export function pdfBufferFromBase64(input: string): Buffer {
  const base64 = input.includes(',') ? input.split(',')[1] : input;
  const buffer = Buffer.from(base64, 'base64');

  if (!buffer.length) {
    throw new Error('Base64 PDF verisi çözümlenemedi.');
  }

  return buffer;
}
