import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import {
  isChatSimulationMode,
  sendChatMessage,
  CHAT_LIMITS,
} from '../src/services/chat.service';

vi.mock('../src/config/db', () => ({
  default: {
    aILog: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
  },
}));

describe('isChatSimulationMode', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('CHAT_SIMULATE=true ise simülasyon', () => {
    process.env.CHAT_SIMULATE = 'true';
    process.env.AI_SERVICE_URL = 'https://ai.prod.example';
    expect(isChatSimulationMode()).toBe(true);
  });

  it('localhost URL ise simülasyon', () => {
    delete process.env.CHAT_SIMULATE;
    process.env.AI_SERVICE_URL = 'http://localhost:8001';
    expect(isChatSimulationMode()).toBe(true);
  });

  it('uzak prod URL ve simulate kapalıysa false', () => {
    delete process.env.CHAT_SIMULATE;
    process.env.AI_SERVICE_URL = 'https://ai.kurusla.app';
    expect(isChatSimulationMode()).toBe(false);
  });
});

describe('sendChatMessage', () => {
  const original = { ...process.env };

  beforeEach(() => {
    process.env.AI_SERVICE_URL = 'http://localhost:8001';
    delete process.env.CHAT_SIMULATE;
  });

  afterEach(() => {
    process.env = { ...original };
    vi.restoreAllMocks();
  });

  it('simülasyon modunda reply döner', async () => {
    const result = await sendChatMessage(1, [
      { role: 'user', content: 'Merhaba' },
    ]);
    expect(result.reply).toContain('simülasyon');
    expect(result.simulated).toBe(true);
  });

  it('prod modunda AI /chat yanıtını normalize eder', async () => {
    process.env.AI_SERVICE_URL = 'https://ai.kurusla.app';
    vi.spyOn(axios, 'post').mockResolvedValue({
      data: { reply: 'Toplam birikimin 42 TL.' },
    });

    const result = await sendChatMessage(2, [
      { role: 'user', content: 'Birikim?' },
    ]);

    expect(result.reply).toBe('Toplam birikimin 42 TL.');
    expect(result.simulated).toBeUndefined();
    expect(axios.post).toHaveBeenCalledWith(
      'https://ai.kurusla.app/chat',
      expect.objectContaining({ userId: 2 }),
      expect.any(Object)
    );
  });

  it('AI servisi erişilemezse 503 fırlatır', async () => {
    process.env.AI_SERVICE_URL = 'https://ai.kurusla.app';
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(
      sendChatMessage(3, [{ role: 'user', content: 'Test' }])
    ).rejects.toMatchObject({
      message: expect.stringContaining('ulaşılamıyor'),
      statusCode: 503,
    });
  });
});

describe('CHAT_LIMITS', () => {
  it('varsayılan limitler tanımlı', () => {
    expect(CHAT_LIMITS.maxMessages).toBeGreaterThan(0);
    expect(CHAT_LIMITS.maxContentLength).toBeGreaterThan(0);
  });
});
