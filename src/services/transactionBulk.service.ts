import prisma from '../config/db';
import { calculateRoundUp } from './mathEngine';
import { analyzeTransaction } from './aiService';
import { ParsedStatementTransaction } from './statementParser.service';
import { roundUpStepToNumber } from '../utils/roundUpStep';

export interface BulkTransactionRecord {
  id: number;
  amount: number;
  merchant: string;
  category: string;
}

/**
 * Ayrıştırılmış ekstre satırlarını toplu olarak Transaction tablosuna yazar.
 */
export async function bulkCreateTransactions(
  userId: number,
  items: Array<{ merchant: string; amount: number; category: string }>
): Promise<BulkTransactionRecord[]> {
  if (items.length === 0) return [];

  const created = await prisma.$transaction(
    items.map((item) =>
      prisma.transaction.create({
        data: {
          userId,
          amount: item.amount,
          merchant: item.merchant,
          category: item.category,
        },
        select: {
          id: true,
          amount: true,
          merchant: true,
          category: true,
        },
      })
    )
  );

  return created;
}

/**
 * Toplu kayıt sonrası birikim, AgeSA, pot ve AI tetikleyicilerini çalıştırır.
 */
export async function processBulkTransactionSideEffects(
  userId: number,
  transactions: BulkTransactionRecord[]
): Promise<{ totalSavings: number; savingsCreated: number }> {
  const rule = await prisma.userRule.findUnique({ where: { userId } });
  const step = rule ? roundUpStepToNumber(rule.roundUpStep) : 10;

  let totalSavings = 0;
  let savingsCreated = 0;

  const userWithGroup = (await prisma.user.findUnique({
    where: { id: userId },
    include: { group: { include: { pots: { where: { isActive: true }, take: 1 } } } } as any,
  })) as any;

  const activePot = userWithGroup?.group?.pots?.[0];

  for (const tx of transactions) {
    const savingAmount = calculateRoundUp(tx.amount, step);

    if (savingAmount > 0) {
      const saving = await prisma.saving.create({
        data: {
          userId,
          transactionId: tx.id,
          amount: savingAmount,
          status: 'PENDING',
        },
      });

      const { allocateFunds } = await import('./ageSaService');
      allocateFunds(userId, savingAmount, saving.id);

      if (activePot) {
        const { PotService } = await import('./pot.service');
        await PotService.contributeToPot(activePot.id, userId, savingAmount);
      }

      totalSavings += savingAmount;
      savingsCreated++;
    }

    analyzeTransaction({
      transactionId: tx.id,
      amount: tx.amount,
      merchant: tx.merchant,
      category: tx.category,
    });
  }

  if (transactions.length > 0) {
    const { StatsService } = await import('./stats.service');
    await StatsService.updateUserStats(userId, totalSavings, transactions.length);
  }

  return { totalSavings, savingsCreated };
}

export function toBulkInsertPayload(items: ParsedStatementTransaction[]) {
  return items.map((item) => ({
    merchant: item.merchant,
    amount: item.amount,
    category: item.category,
  }));
}
