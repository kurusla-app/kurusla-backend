import { Request, Response, NextFunction } from 'express';

// Güvenlik ve yetkilendirme (Daha sonra eklenecek)
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Authentication logic...
  next();
}
