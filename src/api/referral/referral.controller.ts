import { Request, Response } from 'express';
import { ReferralService } from '../../services/referral.service';
import { getAuthenticatedUserId, handleAuthError } from '../../utils/authUser';

export async function getMyReferralLink(req: Request, res: Response): Promise<any> {
  try {
    const userId = getAuthenticatedUserId(req);
    const data = await ReferralService.getOrCreateReferralLink(userId);
    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    if (handleAuthError(res, error)) return;
    const message = error instanceof Error ? error.message : 'İşlem başarısız';
    return res.status(400).json({ error: message });
  }
}

export async function validateCode(req: Request, res: Response): Promise<any> {
  try {
    const code = String(req.params.code ?? '');
    const result = await ReferralService.validateReferralCode(code);
    return res.status(200).json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'İşlem başarısız';
    return res.status(400).json({ error: message });
  }
}

export async function getStats(req: Request, res: Response): Promise<any> {
  try {
    const userId = getAuthenticatedUserId(req);
    const data = await ReferralService.getReferralStats(userId);
    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    if (handleAuthError(res, error)) return;
    const message = error instanceof Error ? error.message : 'İşlem başarısız';
    return res.status(400).json({ error: message });
  }
}

export async function listInvited(req: Request, res: Response): Promise<any> {
  try {
    const userId = getAuthenticatedUserId(req);
    const data = await ReferralService.listReferrals(userId);
    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    if (handleAuthError(res, error)) return;
    const message = error instanceof Error ? error.message : 'İşlem başarısız';
    return res.status(400).json({ error: message });
  }
}
