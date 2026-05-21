import prisma from '../config/db';
import { extractTextFromPdf, pdfBufferFromBase64 } from './pdfStatement.service';
import { parseStatementText, ParsedStatementTransaction } from './statementParser.service';
import { processNewTransaction } from './transactionService';

const MAX_IMPORT_COUNT = 200;

export interface StatementImportResult {
  parsedCount: number;
  importedCount: number;
  skippedCount: number;
  failedCount: number;
  transactions: Array<{
    merchant: string;
    amount: number;
    category: string;
    status: 'imported' | 'skipped' | 'failed';
    reason?: string;
    transactionId?: number;
  }>;
}

/**
 * Metin veya PDF ekstresinden işlemleri çıkarıp birikim akışına sokar.
 */
export async function importStatementForUser(
  userId: number,
  input: { text?: string; pdfBase64?: string }
): Promise<StatementImportResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('Kullanıcı bulunamadı.');
  }

  let text = input.text?.trim() ?? '';

  if (!text && input.pdfBase64) {
    const buffer = pdfBufferFromBase64(input.pdfBase64);
    const extracted = await extractTextFromPdf(buffer);
    text = extracted.text;
  }

  if (!text) {
    throw new Error('text veya pdfBase64 alanlarından biri zorunludur.');
  }

  const parsed = parseStatementText(text);

  if (parsed.length === 0) {
    throw new Error('Ekstre metninde işlenebilir harcama satırı bulunamadı.');
  }

  if (parsed.length > MAX_IMPORT_COUNT) {
    throw new Error(`Tek seferde en fazla ${MAX_IMPORT_COUNT} işlem içe aktarılabilir.`);
  }

  const result: StatementImportResult = {
    parsedCount: parsed.length,
    importedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    transactions: [],
  };

  for (const item of parsed) {
    const entry = await importSingleTransaction(userId, item);
    result.transactions.push(entry);

    if (entry.status === 'imported') result.importedCount++;
    else if (entry.status === 'skipped') result.skippedCount++;
    else result.failedCount++;
  }

  return result;
}

async function importSingleTransaction(
  userId: number,
  item: ParsedStatementTransaction
) {
  try {
    const duplicate = await findDuplicateTransaction(userId, item);
    if (duplicate) {
      return {
        merchant: item.merchant,
        amount: item.amount,
        category: item.category,
        status: 'skipped' as const,
        reason: 'Benzer işlem zaten kayıtlı.',
        transactionId: duplicate.id,
      };
    }

    const category = await resolveCategory(item.merchant, item.category);
    const saved = await processNewTransaction(userId, item.amount, item.merchant, category);

    return {
      merchant: item.merchant,
      amount: item.amount,
      category,
      status: 'imported' as const,
      transactionId: saved.id,
    };
  } catch (error: any) {
    return {
      merchant: item.merchant,
      amount: item.amount,
      category: item.category,
      status: 'failed' as const,
      reason: error.message || 'Kayıt hatası',
    };
  }
}

async function findDuplicateTransaction(userId: number, item: ParsedStatementTransaction) {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const candidates = await prisma.transaction.findMany({
    where: {
      userId,
      amount: item.amount,
      createdAt: { gte: since },
    },
    take: 20,
  });

  const merchantKey = item.merchant.toLowerCase();
  return candidates.find((tx) => tx.merchant.toLowerCase() === merchantKey);
}

async function resolveCategory(merchant: string, fallback: string): Promise<string> {
  const known = await prisma.merchantCategory.findFirst({
    where: {
      name: { contains: merchant.slice(0, 20), mode: 'insensitive' },
    },
  });

  return known?.category ?? fallback;
}
