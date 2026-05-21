import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/db';
import * as aiTools from '../../services/aiTools';

// --- Validasyon Şemaları ---
const UpdateStepSchema = z.object({
  step: z.union([z.literal(5), z.literal(10), z.literal(50)]),
});

const AllocateFundsSchema = z.object({
  amount: z.number().positive(),
  approvalCode: z.string().optional()
});

const CRITICAL_LIMIT = 100; // 100 TL üzeri onay gerektirir

/**
 * AI tarafından tetiklenen aksiyonları yöneten kontrolcü
 */
export async function executeAction(req: Request, res: Response): Promise<any> {
  try {
    const { userId, actionName, parameters } = req.body;

    if (!userId || !actionName) {
      return res.status(400).json({ error: 'userId ve actionName zorunludur.' });
    }

    let result;

    switch (actionName) {
      case 'UPDATE_STEP':
        // 1. Validasyon
        const stepData = UpdateStepSchema.parse(parameters);
        // 2. İşlem (Onay gerektirmez)
        result = await aiTools.AI_TOOLS.updateUserStep(Number(userId), { step: stepData.step });
        break;

      case 'ALLOCATE_FUNDS':
        // 1. Validasyon
        const fundData = AllocateFundsSchema.parse(parameters);
        
        // 2. Onay Kontrolü (Approval Flow)
        if (fundData.amount > CRITICAL_LIMIT && !fundData.approvalCode) {
          // Logla (Onay Bekliyor)
          await logAIAction(userId, actionName, parameters, { status: 'PENDING_APPROVAL', message: 'Yüksek tutarlı işlem için onay kodu gerekli.' });
          
          return res.status(202).json({
            success: false,
            status: 'PENDING_APPROVAL',
            message: `${CRITICAL_LIMIT} TL üzeri işlemler için onay kodu gereklidir.`,
            approvalCodeRequired: true
          });
        }

        // 3. İşlem Yürütme
        result = await aiTools.AI_TOOLS.allocateAgesaFunds(Number(userId), { amount: fundData.amount });
        break;

      default:
        return res.status(400).json({ error: `Tanımlanamayan aksiyon: ${actionName}` });
    }

    // Başarılı sonucu logla
    await logAIAction(userId, actionName, parameters, result);

    return res.status(200).json({
      success: true,
      data: result,
      message: 'İşlem başarıyla tamamlandı.'
    });

  } catch (error: any) {
    console.error('AI Action Hatası:', error);
    
    // Hatayı logla
    const { userId, actionName, parameters } = req.body;
    if (userId && actionName) {
      await logAIAction(userId, actionName, parameters, { error: error.message });
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Parametre hatası', details: error.issues });
    }
    
    return res.status(500).json({ error: 'İşlem sırasında bir hata oluştu.' });
  }
}

/**
 * Yardımcı Fonksiyon: AI Aksiyonlarını Logla
 */
async function logAIAction(userId: any, toolName: string, parameters: any, response: any) {
  try {
    await prisma.aILog.create({
      data: {
        userId: Number(userId),
        toolName: `ACTION:${toolName}`,
        parameters: parameters || {},
        response: response || {}
      }
    });
  } catch (logError) {
    console.error('Loglama hatası:', logError);
  }
}
