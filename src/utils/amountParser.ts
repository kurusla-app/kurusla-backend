/**
 * Türk banka formatındaki tutarları sayıya çevirir.
 * Örnekler: 1.234,56 | 45,50 | -120,00 TL
 */
export function parseTurkishAmount(raw: string): number | null {
  if (!raw) return null;

  let cleaned = raw.trim().replace(/\s*TL\s*/gi, '').replace(/\s/g, '');
  const isNegative = cleaned.startsWith('-') || cleaned.startsWith('(');
  cleaned = cleaned.replace(/^[-+(]/, '').replace(/\)$/, '');

  // 1.234,56 → binlik nokta, ondalık virgül
  if (cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  }

  const value = parseFloat(cleaned);
  if (isNaN(value) || value <= 0) return null;

  return isNegative ? value : value;
}
