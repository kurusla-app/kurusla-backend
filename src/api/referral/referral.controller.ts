import { Request, Response } from 'express';
import { ReferralService } from '../../services/referral.service';

export async function getMyReferralLink(req: Request, res: Response): Promise<any> {
  try {
    const userId = Number(req.query.userId || req.body?.userId);
    if (!userId) {
      return res.status(400).json({ error: 'userId zorunludur.' });
    }

    const data = await ReferralService.getOrCreateReferralLink(userId);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export async function validateCode(req: Request, res: Response): Promise<any> {
  try {
    const code = String(req.params.code ?? '');
    const result = await ReferralService.validateReferralCode(code);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export async function getStats(req: Request, res: Response): Promise<any> {
  try {
    const userId = Number(req.query.userId);
    if (!userId) {
      return res.status(400).json({ error: 'userId zorunludur.' });
    }

    const data = await ReferralService.getReferralStats(userId);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export async function listInvited(req: Request, res: Response): Promise<any> {
  try {
    const userId = Number(req.query.userId);
    if (!userId) {
      return res.status(400).json({ error: 'userId zorunludur.' });
    }

    const data = await ReferralService.listReferrals(userId);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
