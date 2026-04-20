import ExcelJS from 'exceljs';
import {
  MONTHLY_SUMMARY_COLUMNS,
  MonthlySummary,
  ParseResult,
  ParseWarning,
  TRANSACTION_COLUMNS,
  Transaction,
  TransactionType,
} from './finance-types';

const TX_SHEET = 'Transactions';
const SUMMARY_SHEET = 'Monthly Summary';

/**
 * Parse a user-uploaded .xlsx. Browser-safe (no Node APIs). Returns a
 * ParseResult with clean rows + human-readable warnings for malformed
 * ones. Missing required columns throws — callers surface the error as
 * a "template mismatch" message.
 */
export async function parseWorkbook(buffer: ArrayBuffer): Promise<ParseResult> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);

  const txSheet = wb.getWorksheet(TX_SHEET);
  if (!txSheet) {
    throw new Error(
      `This workbook is missing the "${TX_SHEET}" sheet. Re-download the template.`,
    );
  }

  const warnings: ParseWarning[] = [];
  const transactions = parseTransactions(txSheet, warnings);

  const summarySheet = wb.getWorksheet(SUMMARY_SHEET);
  const monthlySummary = summarySheet
    ? parseMonthlySummary(summarySheet, warnings)
    : [];

  return { transactions, monthlySummary, warnings };
}

function parseTransactions(
  sheet: ExcelJS.Worksheet,
  warnings: ParseWarning[],
): Transaction[] {
  const header = readHeader(sheet);
  assertColumns(header, TRANSACTION_COLUMNS, sheet.name);

  // assertColumns above guaranteed every TRANSACTION_COLUMN is present, so
  // `indexOf` never returns -1 for these lookups. `+ 1` converts to the
  // 1-indexed column number ExcelJS rows expect.
  const col = (name: string): number => header.indexOf(name) + 1;
  const dateCol = col('Date');
  const typeCol = col('Type');
  const categoryCol = col('Category');
  const descriptionCol = col('Description');
  const amountCol = col('Amount');
  const methodCol = col('Payment Method');

  const out: Transaction[] = [];
  const lastRow = sheet.actualRowCount;

  for (let r = 2; r <= lastRow; r++) {
    const row = sheet.getRow(r);
    if (isBlankRow(row)) continue;

    const rawDate = row.getCell(dateCol).value;
    const date = toDate(rawDate);
    if (!date) {
      warnings.push({
        sheet: sheet.name,
        row: r,
        message: `Row ${r}: Date is missing or not a real date — skipped.`,
      });
      continue;
    }

    const rawType = stringifyCell(row.getCell(typeCol).value)
      .trim()
      .toLowerCase();
    if (rawType !== 'income' && rawType !== 'expense') {
      warnings.push({
        sheet: sheet.name,
        row: r,
        message: `Row ${r}: Type must be "income" or "expense" — skipped.`,
      });
      continue;
    }
    const type: TransactionType = rawType;

    const amount = toNumber(row.getCell(amountCol).value);
    if (amount === null) {
      warnings.push({
        sheet: sheet.name,
        row: r,
        message: `Row ${r}: Amount is missing or not a number — skipped.`,
      });
      continue;
    }
    if (amount < 0) {
      warnings.push({
        sheet: sheet.name,
        row: r,
        message: `Row ${r}: Amount is negative. Use Type=expense instead of a minus sign.`,
      });
      // Keep going with abs value so the row isn't lost entirely.
    }

    const category = stringifyCell(row.getCell(categoryCol).value).trim() || 'Other';
    const description = stringifyCell(
      row.getCell(descriptionCol).value,
    ).trim();
    const paymentMethod =
      stringifyCell(row.getCell(methodCol).value).trim() || 'Other';

    out.push({
      date,
      type,
      category,
      description,
      amount: Math.abs(amount),
      paymentMethod,
    });
  }

  return out;
}

function parseMonthlySummary(
  sheet: ExcelJS.Worksheet,
  warnings: ParseWarning[],
): MonthlySummary[] {
  const header = readHeader(sheet);
  try {
    assertColumns(header, MONTHLY_SUMMARY_COLUMNS, sheet.name);
  } catch (err) {
    warnings.push({
      sheet: sheet.name,
      row: 1,
      message: (err as Error).message,
    });
    return [];
  }

  const idx = (name: string): number => header.indexOf(name) + 1;

  const out: MonthlySummary[] = [];
  for (let r = 2; r <= sheet.actualRowCount; r++) {
    const row = sheet.getRow(r);
    if (isBlankRow(row)) continue;

    const month = stringifyCell(row.getCell(idx('Month')).value).trim();
    if (!month) continue;
    const totalIncome = toNumber(row.getCell(idx('Total Income')).value) ?? 0;
    const totalExpenses =
      toNumber(row.getCell(idx('Total Expenses')).value) ?? 0;
    const savingsTarget =
      toNumber(row.getCell(idx('Savings Target')).value) ?? 0;
    const notes = stringifyCell(row.getCell(idx('Notes')).value).trim();

    out.push({ month, totalIncome, totalExpenses, savingsTarget, notes });
  }
  return out;
}

function readHeader(sheet: ExcelJS.Worksheet): string[] {
  const row = sheet.getRow(1);
  const headers: string[] = [];
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber - 1] = stringifyCell(cell.value).trim();
  });
  return headers;
}

function assertColumns(
  header: readonly string[],
  required: readonly string[],
  sheetName: string,
): void {
  const missing = required.filter((c) => !header.includes(c));
  if (missing.length > 0) {
    throw new Error(
      `Sheet "${sheetName}" is missing required column${
        missing.length === 1 ? '' : 's'
      }: ${missing.join(', ')}. Re-download the template.`,
    );
  }
}

function isBlankRow(row: ExcelJS.Row): boolean {
  let seenValue = false;
  row.eachCell({ includeEmpty: false }, (cell) => {
    if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
      seenValue = true;
    }
  });
  return !seenValue;
}

function stringifyCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object' && 'text' in (value as Record<string, unknown>)) {
    return stringifyCell((value as { text: unknown }).text);
  }
  if (typeof value === 'object' && 'result' in (value as Record<string, unknown>)) {
    return stringifyCell((value as { result: unknown }).result);
  }
  return String(value);
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (typeof value === 'object' && value && 'result' in value) {
    return toNumber((value as { result: unknown }).result);
  }
  return null;
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  if (typeof value === 'number') {
    // Excel serial → JS Date. Days since 1899-12-30.
    const ms = (value - 25569) * 86_400_000;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}
