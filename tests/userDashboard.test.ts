import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserDashboard } from '../src/services/user.service';
import { RoundUpStep } from '@prisma/client';

const mockUserFind = vi.fn();

vi.mock('../src/config/db', () => ({
  default: {
    user: { findUnique: (...args: unknown[]) => mockUserFind(...args) },
    saving: { findMany: vi.fn(), },
    transaction: { count: vi.fn() },
  },
}));

describe('getUserDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserFind.mockResolvedValue({
      id: 1,
      email: 'test@kurusla.app',
      firstName: 'Ali',
      lastName: 'Veli',
      balance: 5.5,
      rule: { roundUpStep: RoundUpStep.STEP_10 },
      stats: { totalSavings: 42, totalTransactions: 7 },
    });
  });

  it('stats tablosundan bakiye ve birikim döner', async () => {
    const data = await getUserDashboard(1);
    expect(data.balance).toBe(5.5);
    expect(data.totalSavings).toBe(42);
    expect(data.roundUpStep).toBe(10);
    expect(data.email).toBe('test@kurusla.app');
  });

  it('kullanıcı yoksa hata fırlatır', async () => {
    mockUserFind.mockResolvedValue(null);
    await expect(getUserDashboard(99)).rejects.toThrow('Kullanıcı bulunamadı');
  });
});
