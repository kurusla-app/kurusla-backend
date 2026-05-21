import { Request, Response } from 'express';
import * as aiTools from '../../services/aiTools';
import { getAuthenticatedUserId, handleAuthError } from '../../utils/authUser';

/**
 * AI Tool çalıştırma kontrolcüsü
 */
export async function executeTool(req: Request, res: Response): Promise<any> {
  try {
    const userId = getAuthenticatedUserId(req);
    const { toolName, parameters } = req.body;

    if (!toolName) {
      return res.status(400).json({ error: 'toolName zorunludur.' });
    }

    const result = await aiTools.runAITool(userId, toolName, parameters);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: unknown) {
    if (handleAuthError(res, error)) return;
    const message = error instanceof Error ? error.message : 'İşlem başarısız';
    console.error('AI Tool hatası:', message);
    return res.status(400).json({ error: message });
  }
}
