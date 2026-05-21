import prisma from '../config/db';
import { extractTextFromPdf, pdfBufferFromBase64 } from './pdfStatement.service';
import { ParsedStatementTransaction } from './statementParser.service';
import { parseStatementFromSources } from './statementTableParser.service';
import { parseStatementText } from './statementParser.service';
import {
  bulkCreateTransactions,
  processBulkTransactionSideEffects,
  toBulkInsertPayload,
} from './transactionBulk.service';

const MAX_IMPORT_COUNT = 200;

export interface StatementImportResult {
  parsedCount: number;
  importedCount: number;
  skippedCount: number;
  failedCount: number;
  bulkSaved: boolean;
  savingsCreated: number;
  totalSavings: number;
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
 * Metin veya PDF ekstresinden işlemleri çıkarıp toplu transaction kaydı yapar.
 */
export async function importStatementForUser(
  userId: number,
  input: { text?: string; pdfBase64?: string }
): Promise<StatementImportResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('Kullanıcı bulunamadı.');
  }

  const { text, tables } = await resolveStatementContent(input);
  const parsed = parseStatementFromSources(text, tables);

  if (parsed.length === 0) {
    throw new Error('Ekstre metninde işlenebilir harcama satırı bulunamadı.');
  }

  if (parsed.length > MAX_IMPORT_COUNT) {
    throw new Error(`Tek seferde en fazla ${MAX_IMPORT_COUNT} işlem içe aktarılabilir.`);
  }

  return bulkImportParsedTransactions(userId, parsed);
}

/**
 * Sadece metin ile parse (tablo yok).
 */
export function parseStatementContent(text: string): ParsedStatementTransaction[] {
  return parseStatementText(text);
}

async function resolveStatementContent(input: {
  text?: string;
  pdfBase64?: string;
}): Promise<{ text: string; tables: string[][][] }> {
  let text = input.text?.trim() ?? '';
  let tables: string[][][] = [];

  if (!text && input.pdfBase64) {
    const buffer = pdfBufferFromBase64(input.pdfBase64);
    const extracted = await extractTextFromPdf(buffer);
    text = extracted.text;
    tables = extracted.tables;
  }

  if (!text) {
    throw new Error('text veya pdfBase64 alanlarından biri zorunludur.');
  }

  return { text, tables };
}

async function bulkImportParsedTransactions(
  userId: number,
  parsed: ParsedStatementTransaction[]
): Promise<StatementImportResult> {
  const result: StatementImportResult = {
    parsedCount: parsed.length,
    importedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    bulkSaved: true,
    savingsCreated: 0,
    totalSavings: 0,
    transactions: [],
  };

  const toImport: ParsedStatementTransaction[] = [];

  for (const item of parsed) {
    const duplicate = await findDuplicateTransaction(userId, item);
    if (duplicate) {
      result.skippedCount++;
      result.transactions.push({
        merchant: item.merchant,
        amount: item.amount,
        category: item.category,
        status: 'skipped',
        reason: 'Benzer işlem zaten kayıtlı.',
        transactionId: duplicate.id,
      });
      continue;
    }

    item.category = await resolveCategory(item.merchant, item.category);
    toImport.push(item);
  }

  if (toImport.length === 0) {
    return result;
  }

  try {
    const created = await bulkCreateTransactions(userId, toBulkInsertPayload(toImport));
    const sideEffects = await processBulkTransactionSideEffects(userId, created);

    result.importedCount = created.length;
    result.savingsCreated = sideEffects.savingsCreated;
    result.totalSavings = sideEffects.totalSavings;

    for (const tx of created) {
      result.transactions.push({
        merchant: tx.merchant,
        amount: tx.amount,
        category: tx.category,
        status: 'imported',
        transactionId: tx.id,
      });
    }
  } catch (error: any) {
    result.failedCount = toImport.length;
    result.bulkSaved = false;

    for (const item of toImport) {
      result.transactions.push({
        merchant: item.merchant,
        amount: item.amount,
        category: item.category,
        status: 'failed',
        reason: error.message || 'Toplu kayıt hatası',
      });
    }
  }

  return result;
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
