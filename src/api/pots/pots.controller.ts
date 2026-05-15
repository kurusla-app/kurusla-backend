import { Request, Response } from 'express';
import { PotService } from '../../services/pot.service';
import prisma from '../../config/db';

/**
 * Ortak Birikim (Pot) Kontrolcüsü
 */
export class PotController {
  
  static async create(req: Request, res: Response) {
    try {
      const { groupId, name, targetAmount } = req.body;
      const pot = await PotService.createPot(Number(groupId), name, Number(targetAmount));
      return res.status(201).json({ success: true, data: pot });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async listByGroup(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const pots = await (prisma as any).pot.findMany({
        where: { groupId: Number(groupId) },
        include: { requests: { include: { user: true } } }
      });
      return res.status(200).json({ success: true, data: pots });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Para çekme veya büyük katkı talebi onayı
   */
  static async approve(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const result = await PotService.approveRequest(Number(requestId));
      return res.status(200).json({ success: true, data: result, message: 'Talep onaylandı.' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
