import { Request, Response } from 'express';
import { PotService } from '../../services/pot.service';
import { getAuthenticatedUserId, handleAuthError } from '../../utils/authUser';

export class PotController {
  static async create(req: Request, res: Response) {
    try {
      const { groupId, name, targetAmount, description } = req.body;
      const createdById = getAuthenticatedUserId(req);
      const pot = await PotService.createPot(
        Number(groupId),
        name,
        Number(targetAmount),
        createdById,
        description
      );
      return res.status(201).json({ success: true, data: pot });
    } catch (error: unknown) {
      if (handleAuthError(res, error)) return;
      const message = error instanceof Error ? error.message : 'İşlem başarısız';
      return res.status(400).json({ error: message });
    }
  }

  static async listByGroup(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const pots = await PotService.listGroupPots(Number(groupId));
      return res.status(200).json({ success: true, data: pots });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'İşlem başarısız';
      return res.status(400).json({ error: message });
    }
  }

  static async join(req: Request, res: Response) {
    try {
      const { potId } = req.params;
      const userId = getAuthenticatedUserId(req);
      const participant = await PotService.joinPot(Number(potId), userId);
      return res.status(200).json({
        success: true,
        data: participant,
        message: 'Pota katıldınız.',
      });
    } catch (error: unknown) {
      if (handleAuthError(res, error)) return;
      const message = error instanceof Error ? error.message : 'İşlem başarısız';
      return res.status(400).json({ error: message });
    }
  }

  static async listParticipants(req: Request, res: Response) {
    try {
      const { potId } = req.params;
      const participants = await PotService.listPotParticipants(Number(potId));
      return res.status(200).json({ success: true, data: participants });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'İşlem başarısız';
      return res.status(400).json({ error: message });
    }
  }

  static async contribute(req: Request, res: Response) {
    try {
      const { potId } = req.params;
      const userId = getAuthenticatedUserId(req);
      const { amount } = req.body;

      if (!amount) {
        return res.status(400).json({ error: 'amount zorunludur.' });
      }

      const pot = await PotService.contributeToPot(Number(potId), userId, Number(amount));
      return res.status(200).json({ success: true, data: pot });
    } catch (error: unknown) {
      if (handleAuthError(res, error)) return;
      const message = error instanceof Error ? error.message : 'İşlem başarısız';
      return res.status(400).json({ error: message });
    }
  }

  static async requestWithdrawal(req: Request, res: Response) {
    try {
      const { potId } = req.params;
      const userId = getAuthenticatedUserId(req);
      const { amount } = req.body;

      if (!amount) {
        return res.status(400).json({ error: 'amount zorunludur.' });
      }

      const request = await PotService.requestWithdrawal(
        Number(potId),
        userId,
        Number(amount)
      );
      return res.status(201).json({ success: true, data: request });
    } catch (error: unknown) {
      if (handleAuthError(res, error)) return;
      const message = error instanceof Error ? error.message : 'İşlem başarısız';
      return res.status(400).json({ error: message });
    }
  }

  static async approve(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const result = await PotService.approveRequest(Number(requestId));
      return res.status(200).json({ success: true, data: result, message: 'Talep onaylandı.' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'İşlem başarısız';
      return res.status(400).json({ error: message });
    }
  }
}
