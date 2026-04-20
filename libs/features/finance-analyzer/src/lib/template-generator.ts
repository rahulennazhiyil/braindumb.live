import ExcelJS from 'exceljs';
import {
  CATEGORIES,
  MONTHLY_SUMMARY_COLUMNS,
  PAYMENT_METHODS,
  TRANSACTION_COLUMNS,
  TRANSACTION_TYPES,
} from './finance-types';

/**
 * Generates the Phase-12 finance template per blueprint §5.8. Two sheets:
 *   Transactions — Date | Type | Category | Description | Amount | Payment Method
 *   Monthly Summary — Month | Total Income | Total Expenses | Savings Target | Notes
 *
 * Each enum column (Type, Category, Payment Method) is wired to a data-
 * validation list so spreadsheet editors show a dropdown.
 */
export async function buildTemplateWorkbook(): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'rahul-dev finance analyzer';
  wb.created = new Date();

  const tx = wb.addWorksheet('Transactions');
  tx.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Type', key: 'type', width: 10 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Description', key: 'description', width: 36 },
    { header: 'Amount', key: 'amount', width: 12 },
    { header: 'Payment Method', key: 'paymentMethod', width: 18 },
  ];
  styleHeader(tx);

  // 200 rows of data validation so users can start typing immediately.
  addListValidation(tx, 'B2:B200', TRANSACTION_TYPES);
  addListValidation(tx, 'C2:C200', CATEGORIES);
  addListValidation(tx, 'F2:F200', PAYMENT_METHODS);

  // Sample rows for guidance.
  tx.addRow({
    date: new Date(),
    type: 'income',
    category: 'Salary',
    description: 'Example — replace with your own data',
    amount: 50000,
    paymentMethod: 'Bank Transfer',
  });
  tx.addRow({
    date: new Date(),
    type: 'expense',
    category: 'Food',
    description: 'Delete example rows once you start',
    amount: 450,
    paymentMethod: 'UPI',
  });

  const summary = wb.addWorksheet('Monthly Summary');
  summary.columns = [
    { header: 'Month', key: 'month', width: 14 },
    { header: 'Total Income', key: 'income', width: 14 },
    { header: 'Total Expenses', key: 'expenses', width: 14 },
    { header: 'Savings Target', key: 'target', width: 14 },
    { header: 'Notes', key: 'notes', width: 40 },
  ];
  styleHeader(summary);

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

function styleHeader(sheet: ExcelJS.Worksheet): void {
  const row = sheet.getRow(1);
  row.font = { bold: true };
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1A1A2E' },
  };
  row.font = { bold: true, color: { argb: 'FF00F0FF' } };
  row.alignment = { vertical: 'middle', horizontal: 'left' };
  row.height = 22;
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  // Ensure headers match the constants so the parser can validate.
  row.eachCell((cell, colNumber) => {
    const source =
      sheet.name === 'Transactions'
        ? TRANSACTION_COLUMNS
        : MONTHLY_SUMMARY_COLUMNS;
    cell.value = source[colNumber - 1] ?? cell.value;
  });
}

function addListValidation(
  sheet: ExcelJS.Worksheet,
  range: string,
  options: readonly string[],
): void {
  // ExcelJS expects quoted, comma-joined list literal.
  const formula = `"${options.join(',')}"`;
  for (const address of iterRange(sheet, range)) {
    sheet.getCell(address).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [formula],
    };
  }
}

function* iterRange(sheet: ExcelJS.Worksheet, range: string): Iterable<string> {
  // Very small A1 range parser: "B2:B200" / "C2:C200" etc.
  const match = /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(range);
  if (!match) return;
  const [, startCol, startRow, endCol, endRow] = match;
  if (startCol !== endCol) return;
  for (let r = Number(startRow); r <= Number(endRow); r++) {
    yield `${startCol}${r}`;
  }
}

/**
 * Trigger a download of the given Blob with the given filename. Browser only.
 */
export function downloadBlob(blob: Blob, filename: string, doc: Document): void {
  const win = doc.defaultView;
  if (!win) return;
  const url = win.URL.createObjectURL(blob);
  const anchor = doc.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  doc.body.appendChild(anchor);
  anchor.click();
  doc.body.removeChild(anchor);
  win.URL.revokeObjectURL(url);
}
