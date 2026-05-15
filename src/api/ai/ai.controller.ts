import { Request, Response } from 'express';
import * as aiTools from '../../services/aiTools';

/**
 * AI Tool çalıştırma kontrolcüsü
 */
export async function executeTool(req: Request, res: Response): Promise<any> {
  try {
    const { userId, toolName, parameters } = req.body;

    if (!userId || !toolName) {
      return res.status(400).json({ error: 'userId ve toolName zorunludur.' });
    }

    const result = await aiTools.runAITool(Number(userId), toolName, parameters);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('AI Tool hatası:', error.message);
    return res.status(400).json({ error: error.message });
  }
}
