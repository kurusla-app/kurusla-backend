import { describe, it, expect } from 'vitest';
import { calculateRoundUp } from '../src/services/mathEngine';

describe('calculateRoundUp', () => {
  it('42.5 TL ve 10 TL adiminda 7.5 birikim hesaplar', () => {
    expect(calculateRoundUp(42.5, 10)).toBe(7.5);
  });

  it('tam kat ise 0 doner', () => {
    expect(calculateRoundUp(50, 10)).toBe(0);
  });

  it('negatif veya sifir tutarda 0 doner', () => {
    expect(calculateRoundUp(0, 10)).toBe(0);
    expect(calculateRoundUp(-5, 10)).toBe(0);
  });
});
