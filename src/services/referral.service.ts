import prisma from '../config/db';
import { ReferralRewardType, ReferralStatus } from '@prisma/client';

const DEFAULT_REFERRER_REWARD = Number(process.env.REFERRAL_REFERRER_REWARD) || 1.0;
const DEFAULT_REFERRED_REWARD = Number(process.env.REFERRAL_REFERRED_REWARD) || 1.0;
const APP_BASE_URL = process.env.REFERRAL_APP_BASE_URL || 'https://kurusla.app/invite';

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

async function createUniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateReferralCode();
    const exists = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!exists) return code;
  }
  throw new Error('Davet kodu üretilemedi, lütfen tekrar deneyin.');
}

export class ReferralService {
  /**
   * Kullanıcı için benzersiz davet kodu ve link oluşturur veya mevcut olanı döner.
   */
  static async getOrCreateReferralLink(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Kullanıcı bulunamadı.');

    let code = user.referralCode;
    if (!code) {
      code = await createUniqueReferralCode();
      await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
      });
    }

    return {
      referralCode: code,
      inviteLink: `${APP_BASE_URL}/${code}`,
      referrerReward: DEFAULT_REFERRER_REWARD,
      referredReward: DEFAULT_REFERRED_REWARD,
    };
  }

  static async validateReferralCode(code: string) {
    const normalized = code.trim().toUpperCase();
    const referrer = await prisma.user.findUnique({
      where: { referralCode: normalized },
      select: { id: true, email: true, firstName: true },
    });

    if (!referrer) {
      return { valid: false, message: 'Geçersiz davet kodu.' };
    }

    return {
      valid: true,
      referrerId: referrer.id,
      message: 'Davet kodu geçerli.',
    };
  }

  /**
   * Kayıt sırasında davet kodunu işler ve ödülleri dağıtır.
   */
  static async processReferralOnSignup(referredUserId: number, referralCode?: string) {
    if (!referralCode?.trim()) return null;

    const normalized = referralCode.trim().toUpperCase();
    const referrer = await prisma.user.findUnique({
      where: { referralCode: normalized },
    });

    if (!referrer) {
      throw new Error('Geçersiz davet kodu.');
    }

    if (referrer.id === referredUserId) {
      throw new Error('Kendi davet kodunuzu kullanamazsınız.');
    }

    const existing = await prisma.referral.findUnique({
      where: { referredUserId },
    });
    if (existing) {
      throw new Error('Bu hesap için davet ödülü zaten işlendi.');
    }

    const referrerReward = DEFAULT_REFERRER_REWARD;
    const referredReward = DEFAULT_REFERRED_REWARD;

    const referral = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: referredUserId },
        data: { referredById: referrer.id },
      });

      const record = await tx.referral.create({
        data: {
          referrerId: referrer.id,
          referredUserId,
          status: ReferralStatus.PENDING,
          rewardType: ReferralRewardType.BALANCE_KURUS,
          referrerReward,
          referredReward,
        },
      });

      await tx.user.update({
        where: { id: referrer.id },
        data: { balance: { increment: referrerReward } },
      });

      await tx.user.update({
        where: { id: referredUserId },
        data: { balance: { increment: referredReward } },
      });

      return tx.referral.update({
        where: { id: record.id },
        data: {
          status: ReferralStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
    });

    await prisma.aILog.create({
      data: {
        userId: referrer.id,
        toolName: 'Referral_Reward_AgeSA_Promo',
        parameters: {
          referredUserId,
          reward: referrerReward,
          type: 'referrer_bonus',
        },
        response: { status: 'simulated_agesa_promo_granted' },
      },
    });

    return referral;
  }

  static async getReferralStats(userId: number) {
    const [totalInvited, completed, pending, user] = await Promise.all([
      prisma.referral.count({ where: { referrerId: userId } }),
      prisma.referral.count({
        where: { referrerId: userId, status: ReferralStatus.COMPLETED },
      }),
      prisma.referral.count({
        where: { referrerId: userId, status: ReferralStatus.PENDING },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { balance: true, referralCode: true },
      }),
    ]);

    const totalEarned = await prisma.referral.aggregate({
      where: { referrerId: userId, status: ReferralStatus.COMPLETED },
      _sum: { referrerReward: true },
    });

    const link = await this.getOrCreateReferralLink(userId);

    return {
      referralCode: user?.referralCode ?? link.referralCode,
      inviteLink: link.inviteLink,
      totalInvited,
      completedReferrals: completed,
      pendingReferrals: pending,
      totalEarned: totalEarned._sum.referrerReward ?? 0,
      currentBalance: user?.balance ?? 0,
    };
  }

  static async listReferrals(userId: number) {
    return prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        referredUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            createdAt: true,
          },
        },
      },
    });
  }
}
