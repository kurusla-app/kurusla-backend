import prisma from '../config/db';
import { roundUpStepToNumber } from '../utils/roundUpStep';

export interface UserDashboardData {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  balance: number;
  totalSavings: number;
  totalTransactions: number;
  roundUpStep: number;
  roundUpStepLabel: string;
}

/**
 * Mobil ana ekran: bakiye, toplam birikim, yuvarlama kuralı
 */
export async function getUserDashboard(userId: number): Promise<UserDashboardData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      balance: true,
      rule: { select: { roundUpStep: true } },
      stats: {
        select: { totalSavings: true, totalTransactions: true },
      },
    },
  });

  if (!user) {
    throw new Error('Kullanıcı bulunamadı.');
  }

  let totalSavings = user.stats?.totalSavings ?? 0;
  let totalTransactions = user.stats?.totalTransactions ?? 0;

  if (!user.stats) {
    const savings = await prisma.saving.findMany({
      where: { userId, status: 'SUCCESS' },
      select: { amount: true },
    });
    totalSavings = savings.reduce((sum, s) => sum + s.amount, 0);
    totalTransactions = await prisma.transaction.count({ where: { userId } });
  }

  const roundUpStep = user.rule
    ? roundUpStepToNumber(user.rule.roundUpStep)
    : 10;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    balance: user.balance,
    totalSavings,
    totalTransactions,
    roundUpStep,
    roundUpStepLabel: `STEP_${roundUpStep}`,
  };
}

/**
 * Kullanıcının FCM Token bilgisini günceller
 */
export async function updateFcmToken(userId: number, fcmToken: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: { fcmToken }
  });
}

/**
 * Kullanıcı bilgilerini getirir
 */
export async function getUserById(userId: number) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      balance: true,
      fcmToken: true,
      createdAt: true
    }
  });
}
