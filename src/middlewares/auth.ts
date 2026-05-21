import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { UserRole } from '@prisma/client';

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret || secret === 'default_gizli_anahtar') {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[Auth] JWT_SECRET_KEY production ortamında ayarlanmalı.');
    }
  }
  return secret || 'default_gizli_anahtar';
}

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7).trim();
}

function attachUserFromToken(req: Request, token: string): void {
  const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
  req.user = {
    id: decoded.id,
    email: decoded.email,
    role: decoded.role ?? UserRole.USER,
  };
  req.authSource = 'jwt';
}

/**
 * Authorization: Bearer <JWT> zorunlu
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({
      error: 'Yetkilendirme gerekli.',
      message: 'Authorization: Bearer <token> header gönderin.',
    });
    return;
  }

  try {
    attachUserFromToken(req, token);
    next();
  } catch {
    res.status(401).json({
      error: 'Geçersiz veya süresi dolmuş token.',
    });
  }
}

/**
 * JWT doğrulandıktan sonra ADMIN rolü kontrolü
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Yetkilendirme gerekli.' });
    return;
  }

  if (req.user.role === UserRole.ADMIN) {
    next();
    return;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { role: true },
  });

  if (dbUser?.role === UserRole.ADMIN) {
    req.user.role = UserRole.ADMIN;
    next();
    return;
  }

  res.status(403).json({ error: 'Bu işlem için admin yetkisi gerekli.' });
}

/**
 * Webhook / entegrasyon: x-api-key VEYA JWT
 * - Internal key: body.userId kullanılır (Make.com, k6)
 * - JWT: token'daki kullanıcı id'si kullanılır
 */
export function requireInternalOrAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const apiKey = req.headers['x-api-key'];
  const internalKey = process.env.INTERNAL_SERVICE_KEY;

  if (internalKey && apiKey === internalKey) {
    req.authSource = 'internal';
    next();
    return;
  }

  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({
      error: 'Yetkilendirme gerekli.',
      message: 'Bearer token veya geçerli x-api-key gönderin.',
    });
    return;
  }

  try {
    attachUserFromToken(req, token);
    next();
  } catch {
    res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token.' });
  }
}
