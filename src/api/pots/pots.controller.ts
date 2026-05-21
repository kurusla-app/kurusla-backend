import { Request, Response } from 'express';
import { PotService } from '../../services/pot.service';

export class PotController {
  static async create(req: Request, res: Response) {
    try {
      const { groupId, name, targetAmount, createdById, description } = req.body;
      const pot = await PotService.createPot(
        Number(groupId),
        name,
        Number(targetAmount),
        createdById ? Number(createdById) : undefined,
        description
      );
      return res.status(201).json({ success: true, data: pot });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async listByGroup(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const pots = await PotService.listGroupPots(Number(groupId));
      return res.status(200).json({ success: true, data: pots });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async join(req: Request, res: Response) {
    try {
      const { potId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId zorunludur.' });
      }

      const participant = await PotService.joinPot(Number(potId), Number(userId));
      return res.status(200).json({
        success: true,
        data: participant,
        message: 'Pota katıldınız.',
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async listParticipants(req: Request, res: Response) {
    try {
      const { potId } = req.params;
      const participants = await PotService.listPotParticipants(Number(potId));
      return res.status(200).json({ success: true, data: participants });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async contribute(req: Request, res: Response) {
    try {
      const { potId } = req.params;
      const { userId, amount } = req.body;

      if (!userId || !amount) {
        return res.status(400).json({ error: 'userId ve amount zorunludur.' });
      }

      const pot = await PotService.contributeToPot(Number(potId), Number(userId), Number(amount));
      return res.status(200).json({ success: true, data: pot });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async requestWithdrawal(req: Request, res: Response) {
    try {
      const { potId } = req.params;
      const { userId, amount } = req.body;

      if (!userId || !amount) {
        return res.status(400).json({ error: 'userId ve amount zorunludur.' });
      }

      const request = await PotService.requestWithdrawal(
        Number(potId),
        Number(userId),
        Number(amount)
      );
      return res.status(201).json({ success: true, data: request });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

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
