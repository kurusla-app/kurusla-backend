import { Request, Response } from 'express';

export function getAuthenticatedUserId(req: Request): number {
  if (!req.user?.id) {
    throw new Error('AUTH_REQUIRED');
  }
  return req.user.id;
}

/** SMS webhook: internal key → body userId; JWT → token kullanıcısı */
export function getWebhookUserId(req: Request): number {
  if (req.authSource === 'internal') {
    const userId = Number(req.body?.userId);
    if (!userId || Number.isNaN(userId)) {
      throw new Error('USER_ID_REQUIRED');
    }
    return userId;
  }
  return getAuthenticatedUserId(req);
}

export function handleAuthError(res: Response, error: unknown): boolean {
  const msg = error instanceof Error ? error.message : '';
  if (msg === 'AUTH_REQUIRED') {
    res.status(401).json({ error: 'Yetkilendirme gerekli.' });
    return true;
  }
  if (msg === 'USER_ID_REQUIRED') {
    res.status(400).json({ error: 'userId zorunludur.' });
    return true;
  }
  return false;
}
