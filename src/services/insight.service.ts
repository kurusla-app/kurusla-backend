import prisma from '../config/db';
import { InsightType, Prisma } from '@prisma/client';

export interface CreateInsightInput {
  userId: number;
  type?: InsightType;
  title: string;
  summary: string;
  content?: Prisma.InputJsonValue;
  source?: string;
  transactionId?: number;
}

export interface ListInsightsOptions {
  limit?: number;
  unreadOnly?: boolean;
}

const DEFAULT_LIST_LIMIT = 20;
const MAX_LIST_LIMIT = 50;
const MAX_TITLE_LENGTH = 200;
const MAX_SUMMARY_LENGTH = 2000;

export class InsightService {
  static async createInsight(input: CreateInsightInput) {
    const user = await prisma.user.findUnique({ where: { id: input.userId } });
    if (!user) {
      throw new Error('Kullanıcı bulunamadı.');
    }

    if (input.transactionId != null) {
      const tx = await prisma.transaction.findFirst({
        where: { id: input.transactionId, userId: input.userId },
      });
      if (!tx) {
        throw new Error('İşlem bu kullanıcıya ait değil.');
      }
    }

    const title = input.title.trim().slice(0, MAX_TITLE_LENGTH);
    const summary = input.summary.trim().slice(0, MAX_SUMMARY_LENGTH);

    if (!title || !summary) {
      throw new Error('title ve summary boş olamaz.');
    }

    const insight = await prisma.aIInsight.create({
      data: {
        userId: input.userId,
        type: input.type ?? InsightType.GENERAL,
        title,
        summary,
        content: input.content ?? undefined,
        source: (input.source ?? 'kurusla-ai').slice(0, 64),
        transactionId: input.transactionId ?? null,
      },
    });

    await prisma.aILog.create({
      data: {
        userId: input.userId,
        toolName: 'INSIGHT_SAVE',
        parameters: {
          insightId: insight.id,
          type: insight.type,
          transactionId: insight.transactionId,
        },
        response: { title: insight.title },
      },
    });

    return insight;
  }

  static async listInsights(userId: number, options: ListInsightsOptions = {}) {
    const limit = Math.min(
      Math.max(options.limit ?? DEFAULT_LIST_LIMIT, 1),
      MAX_LIST_LIMIT
    );

    const where: Prisma.AIInsightWhereInput = {
      userId,
      ...(options.unreadOnly ? { isRead: false } : {}),
    };

    const [items, total, unreadCount] = await Promise.all([
      prisma.aIInsight.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.aIInsight.count({ where: { userId } }),
      prisma.aIInsight.count({ where: { userId, isRead: false } }),
    ]);

    return { items, total, unreadCount, limit };
  }

  static async markAsRead(userId: number, insightId: number) {
    const insight = await prisma.aIInsight.findFirst({
      where: { id: insightId, userId },
    });

    if (!insight) {
      throw new Error('İçgörü bulunamadı.');
    }

    if (insight.isRead) {
      return insight;
    }

    return prisma.aIInsight.update({
      where: { id: insightId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: number) {
    const result = await prisma.aIInsight.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { updated: result.count };
  }
}
