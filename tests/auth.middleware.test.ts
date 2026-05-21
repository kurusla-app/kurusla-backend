import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { requireAuth, requireInternalOrAuth } from '../src/middlewares/auth';
import { UserRole } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

function mockRes() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res as unknown as Response & { statusCode: number; body: unknown };
}

describe('requireAuth', () => {
  const secret = 'test-secret-key';

  beforeEach(() => {
    process.env.JWT_SECRET_KEY = secret;
  });

  it('token yoksa 401 döner', () => {
    const req = { headers: {} } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('geçerli token ile req.user set eder', () => {
    const token = jwt.sign(
      { id: 7, email: 'test@kurusla.app', role: UserRole.USER },
      secret
    );
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user?.id).toBe(7);
    expect(req.user?.email).toBe('test@kurusla.app');
  });
});

describe('requireInternalOrAuth', () => {
  it('geçerli x-api-key ile devam eder', () => {
    process.env.INTERNAL_SERVICE_KEY = 'test-internal-key';
    const req = {
      headers: { 'x-api-key': 'test-internal-key' },
      body: { userId: 1 },
    } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    requireInternalOrAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.authSource).toBe('internal');
  });
});
