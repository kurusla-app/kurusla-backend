import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: UserRole;
      };
      /** Webhook: x-api-key ile gelen güvenilir çağrılar */
      authSource?: 'jwt' | 'internal';
    }
  }
}

export {};
