import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InsightType } from '@prisma/client';
import { InsightService } from '../src/services/insight.service';

const mockUserFind = vi.fn();
const mockTxFind = vi.fn();
const mockInsightCreate = vi.fn();
const mockInsightFindMany = vi.fn();
const mockInsightCount = vi.fn();
const mockInsightFindFirst = vi.fn();
const mockInsightUpdate = vi.fn();
const mockInsightUpdateMany = vi.fn();
const mockAILogCreate = vi.fn();

vi.mock('../src/config/db', () => ({
  default: {
    user: { findUnique: (...args: unknown[]) => mockUserFind(...args) },
    transaction: { findFirst: (...args: unknown[]) => mockTxFind(...args) },
    aIInsight: {
      create: (...args: unknown[]) => mockInsightCreate(...args),
      findMany: (...args: unknown[]) => mockInsightFindMany(...args),
      count: (...args: unknown[]) => mockInsightCount(...args),
      findFirst: (...args: unknown[]) => mockInsightFindFirst(...args),
      update: (...args: unknown[]) => mockInsightUpdate(...args),
      updateMany: (...args: unknown[]) => mockInsightUpdateMany(...args),
    },
    aILog: { create: (...args: unknown[]) => mockAILogCreate(...args) },
  },
}));

describe('InsightService.createInsight', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserFind.mockResolvedValue({ id: 1 });
    mockTxFind.mockResolvedValue({ id: 10, userId: 1 });
    mockInsightCreate.mockResolvedValue({
      id: 1,
      userId: 1,
      type: InsightType.SAVING,
      title: 'Test',
      summary: 'Özet',
      transactionId: 10,
    });
    mockAILogCreate.mockResolvedValue({ id: 1 });
  });

  it('kullanıcı ve içgörü kaydı oluşturur', async () => {
    const result = await InsightService.createInsight({
      userId: 1,
      type: InsightType.SAVING,
      title: '  Birikim  ',
      summary: 'Haftalık özet',
      transactionId: 10,
    });

    expect(result.id).toBe(1);
    expect(mockInsightCreate).toHaveBeenCalled();
    expect(mockAILogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ toolName: 'INSIGHT_SAVE' }),
      })
    );
  });

  it('kullanıcı yoksa hata fırlatır', async () => {
    mockUserFind.mockResolvedValue(null);
    await expect(
      InsightService.createInsight({
        userId: 99,
        title: 'T',
        summary: 'S',
      })
    ).rejects.toThrow('Kullanıcı bulunamadı');
  });

  it('başka kullanıcının işlemine insight yazılamaz', async () => {
    mockTxFind.mockResolvedValue(null);
    await expect(
      InsightService.createInsight({
        userId: 1,
        title: 'T',
        summary: 'S',
        transactionId: 999,
      })
    ).rejects.toThrow('İşlem bu kullanıcıya ait değil');
  });
});

describe('InsightService.listInsights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsightFindMany.mockResolvedValue([{ id: 1, isRead: false }]);
    mockInsightCount.mockResolvedValueOnce(3).mockResolvedValueOnce(1);
  });

  it('liste ve sayaçları döner', async () => {
    const data = await InsightService.listInsights(1, { unreadOnly: true });
    expect(data.items).toHaveLength(1);
    expect(data.total).toBe(3);
    expect(data.unreadCount).toBe(1);
  });
});
