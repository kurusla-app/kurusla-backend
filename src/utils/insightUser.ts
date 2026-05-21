import { Request } from 'express';
import { getAuthenticatedUserId } from './authUser';

/** Python servisi (x-api-key) → body.userId; mobil JWT → token kullanıcısı */
export function getInsightTargetUserId(req: Request): number {
  if (req.authSource === 'internal') {
    const userId = Number(req.body?.userId);
    if (!userId || Number.isNaN(userId)) {
      throw new Error('USER_ID_REQUIRED');
    }
    return userId;
  }
  return getAuthenticatedUserId(req);
}
