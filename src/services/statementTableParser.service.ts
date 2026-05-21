import { parseTurkishAmount } from '../utils/amountParser';
import {
  ParsedStatementTransaction,
  inferCategoryFromMerchant,
  isSkippedOrIncomeLine,
  mergeParsedTransactions,
  normalizeForMatch,
  parseStatementText,
} from './statementParser.service';

const DATE_PATTERN = /\d{2}[./-]\d{2}[./-]\d{2,4}/;

/**
 * PDF getTable() veya tab ile ayrılmış satırlardan ekstre tablosu okur.
 */
export function parseStatementTables(tables: string[][][]): ParsedStatementTransaction[] {
  const results: ParsedStatementTransaction[] = [];

  for (const table of tables) {
    for (const row of table) {
      if (!row?.length || isHeaderRow(row)) continue;
      const parsed = parseTableRow(row);
      if (parsed) results.push(parsed);
    }
  }

  return results;
}

/**
 * getText çıktısındaki tab (\t) veya çoklu boşluklu kolonları tablo satırı sayar.
 */
export function parseTabularTextLines(text: string): ParsedStatementTransaction[] {
  const results: ParsedStatementTransaction[] = [];

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    let cells: string[] | null = null;

    if (line.includes('\t')) {
      cells = line.split('\t').map((c) => c.trim()).filter(Boolean);
    } else if (/\s{2,}/.test(line) && DATE_PATTERN.test(line)) {
      cells = line.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
    }

    if (!cells || cells.length < 2) continue;

    const parsed = parseTableRow(cells);
    if (parsed) results.push(parsed);
  }

  return results;
}

function parseTableRow(cells: string[]): ParsedStatementTransaction | null {
  const joined = cells.join(' ');
  if (isSkippedOrIncomeLine(joined)) return null;

  const dateIdx = cells.findIndex((c) => DATE_PATTERN.test(c));
  const amountIdx = cells.findIndex((c, i) => i !== dateIdx && extractAmountFromCell(c) !== null);

  if (amountIdx === -1) return null;

  const amount = extractAmountFromCell(cells[amountIdx])!;
  if (amount < 0.01) return null;

  const date = dateIdx >= 0 ? cells[dateIdx].match(DATE_PATTERN)?.[0] : undefined;

  const merchantCells = cells.filter((_, i) => i !== dateIdx && i !== amountIdx);
  const merchant = cleanTableMerchant(merchantCells.join(' '));

  if (!merchant || merchant.length < 2) return null;
  if (isSkippedOrIncomeLine(merchant)) return null;

  return {
    merchant,
    amount,
    date,
    category: inferCategoryFromMerchant(merchant),
    rawLine: cells.join(' | '),
  };
}

function extractAmountFromCell(cell: string): number | null {
  const match = cell.match(/([-+]?(?:\d{1,3}(?:\.\d{3})+|\d+)[,\.]\d{2})\s*(?:TL)?/i);
  if (!match) return parseTurkishAmount(cell);
  return parseTurkishAmount(match[1]);
}

function cleanTableMerchant(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/^(tarih|açıklama|işlem|tutar|açıklama\/işyeri)\s*/i, '')
    .trim()
    .slice(0, 120);
}

function isHeaderRow(cells: string[]): boolean {
  const norm = normalizeForMatch(cells.join(' '));
  return /tarih|aciklama|islem|tutar|isyeri|referans/.test(norm) && !DATE_PATTERN.test(cells.join(' '));
}

export function parseTableRowsWithHeaderSkip(rows: string[][]): ParsedStatementTransaction[] {
  const results: ParsedStatementTransaction[] = [];

  for (const row of rows) {
    if (!row?.length || isHeaderRow(row)) continue;
    const parsed = parseTableRow(row);
    if (parsed) results.push(parsed);
  }

  return results;
}

/**
 * Metin + PDF tablolarını birleştirip tek liste döner.
 */
export function parseStatementFromSources(
  text: string,
  tables: string[][][] = []
): ParsedStatementTransaction[] {
  const fromLines = parseStatementText(text);
  const fromPdfTables = parseStatementTables(tables);
  const fromTabular = parseTabularTextLines(text);

  return mergeParsedTransactions([...fromLines, ...fromPdfTables, ...fromTabular]);
}
