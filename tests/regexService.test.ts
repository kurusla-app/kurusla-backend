import { describe, it, expect } from 'vitest';
import { parseBankMessage } from '../src/services/regexService';

describe('parseBankMessage', () => {
  it('Garanti SMS formatini ayrıştırır', () => {
    const text =
      'Garanti BBVA: STARBUCKS COFFEE TR isyerinde 45,50 TL harcama yapilmistir.';
    const result = parseBankMessage(text);

    expect(result).not.toBeNull();
    expect(result!.merchant).toContain('STARBUCKS');
    expect(result!.amount).toBe(45.5);
  });

  it('tanınmayan metin için null döner', () => {
    expect(parseBankMessage('merhaba dunya')).toBeNull();
  });
});
