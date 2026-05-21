import { parseTurkishAmount } from '../utils/amountParser';
import { inferCategoryFromMerchant } from './categoryResolver.service';

export { inferCategoryFromMerchant } from './categoryResolver.service';

export interface ParsedStatementTransaction {
  merchant: string;
  amount: number;
  date?: string;
  category: string;
  rawLine: string;
}

export function normalizeForMatch(text: string): string {
  return text
    .replace(/\u0130/g, 'I') // Türkçe İ
    .replace(/ı/g, 'i')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

const SKIP_KEYWORDS =
  /toplam|bakiye|devir|ekstre|sayfa|hesap kesim|kart limit|asgari odeme|son odeme|borc bakiye|alacak bakiye|onceki donem|donem toplam|limit kullanim|puan bilgi|vergi dairesi|musteri no|kart no|xxxx/;

const INCOME_KEYWORDS =
  /odeme alin|havale gel|maas|iade gel|faiz gelir|nakit giris|tahsilat/;

const AMOUNT_CAPTURE = '([-+]?(?:\\d{1,3}(?:\\.\\d{3})+|\\d+)[,\\.]\\d{2})';

const LINE_PATTERNS: Array<{
  regex: RegExp;
  map: (m: RegExpMatchArray) => Omit<ParsedStatementTransaction, 'category' | 'rawLine'> | null;
}> = [
  {
    // 15.03.2026 STARBUCKS COFFEE 145,50 TL
    regex: new RegExp(
      `^(\\d{2}[./-]\\d{2}[./-]\\d{2,4})\\s+(.+?)\\s+${AMOUNT_CAPTURE}\\s*(?:TL)?\\s*$`,
      'i'
    ),
    map: (m) => ({
      date: m[1],
      merchant: cleanMerchant(m[2]),
      amount: parseTurkishAmount(m[3])!,
    }),
  },
  {
    // STARBUCKS COFFEE 15.03.2026 145,50
    regex: new RegExp(
      `^(.+?)\\s+(\\d{2}[./-]\\d{2}[./-]\\d{2,4})\\s+${AMOUNT_CAPTURE}\\s*(?:TL)?\\s*$`,
      'i'
    ),
    map: (m) => ({
      date: m[2],
      merchant: cleanMerchant(m[1]),
      amount: parseTurkishAmount(m[3])!,
    }),
  },
  {
    // STARBUCKS COFFEE - 145,50 TL
    regex: new RegExp(`^(.+?)\\s+${AMOUNT_CAPTURE}\\s*TL\\s*$`, 'i'),
    map: (m) => ({
      merchant: cleanMerchant(m[1]),
      amount: parseTurkishAmount(m[2])!,
    }),
  },
  {
    // Harcama: Starbucks Tutar: 15,50 TL (ekstre satır varyantı)
    regex: /^(?:harcama|işlem|alıveriş)[:\s]+(.+?)\s+tutar[:\s]+([\d.,]+)\s*TL/i,
    map: (m) => ({
      merchant: cleanMerchant(m[1]),
      amount: parseTurkishAmount(m[2])!,
    }),
  },
];

function cleanMerchant(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/^(POS|VPOS|İNTERNET|MAIL\s*ORDER)\s*/i, '')
    .replace(/\s+(A\.Ş\.|LTD\.?|ŞTİ\.?)\s*.*$/i, '')
    .trim()
    .slice(0, 120);
}


export function isSkippedOrIncomeLine(text: string): boolean {
  const norm = normalizeForMatch(text);
  return SKIP_KEYWORDS.test(norm) || INCOME_KEYWORDS.test(norm);
}

export function mergeParsedTransactions(
  items: ParsedStatementTransaction[]
): ParsedStatementTransaction[] {
  const seen = new Set<string>();
  const results: ParsedStatementTransaction[] = [];

  for (const item of items) {
    const key = transactionKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(item);
  }

  return results;
}

function transactionKey(tx: ParsedStatementTransaction): string {
  return `${tx.date ?? ''}|${tx.merchant.toLowerCase()}|${tx.amount}`;
}

/**
 * Ekstre ham metninden harcama satırlarını çıkarır.
 */
export function parseStatementText(text: string): ParsedStatementTransaction[] {
  const lines = normalizeStatementLines(text);
  const results: ParsedStatementTransaction[] = [];
  const seen = new Set<string>();

  for (const rawLine of lines) {
    const normalizedLine = normalizeForMatch(rawLine);
    if (SKIP_KEYWORDS.test(normalizedLine) || INCOME_KEYWORDS.test(normalizedLine)) {
      continue;
    }

    let parsed: ParsedStatementTransaction | null = null;

    for (const pattern of LINE_PATTERNS) {
      const match = rawLine.match(pattern.regex);
      if (!match) continue;

      const mapped = pattern.map(match);
      if (!mapped || !mapped.amount || mapped.amount < 0.01) continue;

      parsed = {
        ...mapped,
        category: inferCategoryFromMerchant(mapped.merchant),
        rawLine,
      };
      break;
    }

    if (!parsed || !parsed.merchant || parsed.merchant.length < 2) continue;

    const merchantNorm = normalizeForMatch(parsed.merchant);
    if (SKIP_KEYWORDS.test(merchantNorm) || INCOME_KEYWORDS.test(merchantNorm)) {
      continue;
    }

    const key = transactionKey(parsed);
    if (seen.has(key)) continue;
    seen.add(key);

    results.push(parsed);
  }

  return results;
}

function normalizeStatementLines(text: string): string[] {
  return text
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '\n')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length >= 8);
}
