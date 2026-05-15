import prisma from '../config/db';

/**
 * AI tarafından çağrılabilecek güvenli araçların (tools) tanımları
 */
export const AI_TOOLS: Record<string, (userId: number, params: any) => Promise<any>> = {
  
  /**
   * Kullanıcının yuvarlama adımını (step) günceller
   */
  updateUserStep: async (userId: number, params: { step: number }) => {
    const { step } = params;
    if (!step || step <= 0) throw new Error('Geçersiz step değeri.');

    return await prisma.userRule.upsert({
      where: { userId },
      update: { roundUpStep: step },
      create: { userId, roundUpStep: step }
    });
  },

  /**
   * Kullanıcının birikim özetini getirir
   */
  getSavingsSummary: async (userId: number) => {
    const savings = await prisma.saving.findMany({
      where: { userId }
    });

    const total = savings.reduce((sum, s) => sum + s.amount, 0);
    return {
      totalSavings: total,
      savingCount: savings.length,
      lastSaving: savings.length > 0 ? savings[savings.length - 1] : null
    };
  },

  /**
   * Kullanıcının rozet durumlarını listeler
   */
  listBadges: async (userId: number) => {
    const allBadges = await prisma.badge.findMany();
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true }
    });

    const userBadgeIds = userBadges.map(ub => ub.badgeId);

    return allBadges.map(b => ({
      name: b.name,
      description: b.description,
      isEarned: userBadgeIds.includes(b.id)
    }));
  },

  /**
   * Kullanıcının biriktirdiği tutarı AgeSA emeklilik fonuna aktarır
   */
  allocateAgesaFunds: async (userId: number, params: { amount: number }) => {
    const { amount } = params;
    const { allocateFunds } = await import('./ageSaService');
    return await allocateFunds(userId, amount);
  }
};

/**
 * AI Tool çalıştırıcı ve loglayıcı
 */
export async function runAITool(userId: number, toolName: string, parameters: any) {
  const tool = AI_TOOLS[toolName];
  
  if (!tool) {
    throw new Error(`Böyle bir tool tanımlı değil: ${toolName}`);
  }

  try {
    // Tool'u çalıştır
    const result = await tool(userId, parameters);

    // Logla
    await prisma.aILog.create({
      data: {
        userId,
        toolName,
        parameters: parameters || {},
        response: result as any
      }
    });

    return result;
  } catch (error: any) {
    // Hatalı durumu da logla
    await prisma.aILog.create({
      data: {
        userId,
        toolName,
        parameters: parameters || {},
        response: { error: error.message } as any
      }
    });
    throw error;
  }
}
