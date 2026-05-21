import { Request, Response } from 'express';
import { z } from 'zod';
import { InsightType, Prisma } from '@prisma/client';
import { InsightService } from '../../services/insight.service';
import {
  getAuthenticatedUserId,
  handleAuthError,
} from '../../utils/authUser';
import { getInsightTargetUserId } from '../../utils/insightUser';

const CreateInsightSchema = z.object({
  userId: z.number().int().positive().optional(),
  type: z.nativeEnum(InsightType).optional(),
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(2000),
  content: z.record(z.string(), z.unknown()).optional(),
  source: z.string().max(64).optional(),
  transactionId: z.number().int().positive().optional(),
});

/**
 * AI servisinden gelen içgörüyü kullanıcı profiline kaydeder.
 * Internal: x-api-key + body.userId | JWT: kendi profili
 */
export async function createInsight(req: Request, res: Response): Promise<void> {
  try {
    const userId = getInsightTargetUserId(req);
    const parsed = CreateInsightSchema.parse(req.body);

    const insight = await InsightService.createInsight({
      userId,
      type: parsed.type,
      title: parsed.title,
      summary: parsed.summary,
      content: parsed.content as Prisma.InputJsonValue | undefined,
      source: parsed.source,
      transactionId: parsed.transactionId,
    });

    res.status(201).json({ success: true, data: insight });
  } catch (error: unknown) {
    if (handleAuthError(res, error)) return;

    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Geçersiz istek', details: error.issues });
      return;
    }

    const message =
      error instanceof Error ? error.message : 'İçgörü kaydedilemedi.';
    const status = message.includes('bulunamadı') ? 404 : 400;
    res.status(status).json({ error: message });
  }
}

/**
 * Oturum açmış kullanıcının profil içgörülerini listeler.
 */
export async function listInsights(req: Request, res: Response): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(req);
    const limit = req.query.limit
      ? Number(req.query.limit)
      : undefined;
    const unreadOnly = req.query.unreadOnly === 'true';

    const data = await InsightService.listInsights(userId, {
      limit: Number.isNaN(limit) ? undefined : limit,
      unreadOnly,
    });

    res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    if (handleAuthError(res, error)) return;
    res.status(500).json({ error: 'İçgörüler listelenemedi.' });
  }
}

export async function markInsightRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(req);
    const insightId = Number(req.params.id);

    if (!insightId || Number.isNaN(insightId)) {
      res.status(400).json({ error: 'Geçersiz içgörü id.' });
      return;
    }

    const insight = await InsightService.markAsRead(userId, insightId);
    res.status(200).json({ success: true, data: insight });
  } catch (error: unknown) {
    if (handleAuthError(res, error)) return;
    const message =
      error instanceof Error ? error.message : 'İşlem başarısız.';
    const status = message.includes('bulunamadı') ? 404 : 400;
    res.status(status).json({ error: message });
  }
}

export async function markAllInsightsRead(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(req);
    const data = await InsightService.markAllAsRead(userId);
    res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    if (handleAuthError(res, error)) return;
    res.status(500).json({ error: 'İşlem başarısız.' });
  }
}
