/**
 * Finance analyzer — domain types per blueprint §5.8.
 * All data lives in Angular Signals; nothing is persisted anywhere
 * outside the user's .xlsx file.
 */

export type TransactionType = 'income' | 'expense';

export const TRANSACTION_TYPES: readonly TransactionType[] = [
  'income',
  'expense',
] as const;

export const CATEGORIES = [
  'Salary',
  'Rent',
  'Food',
  'Transport',
  'Entertainment',
  'Savings',
  'Investment',
  'Utilities',
  'Subscriptions',
  'Other',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const PAYMENT_METHODS = [
  'Bank Transfer',
  'UPI',
  'Credit Card',
  'Cash',
  'Debit Card',
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface Transaction {
  readonly date: Date;
  readonly type: TransactionType;
  readonly category: string; // Free-form — user may invent; Category is UI suggestion
  readonly description: string;
  readonly amount: number;
  readonly paymentMethod: string;
}

export interface MonthlySummary {
  readonly month: string; // "Apr 2026"
  readonly totalIncome: number;
  readonly totalExpenses: number;
  readonly savingsTarget: number;
  readonly notes: string;
}

export interface ParseWarning {
  readonly sheet: string;
  readonly row: number; // 1-indexed to match spreadsheet readers
  readonly message: string;
}

export interface ParseResult {
  readonly transactions: readonly Transaction[];
  readonly monthlySummary: readonly MonthlySummary[];
  readonly warnings: readonly ParseWarning[];
}

export const TRANSACTION_COLUMNS = [
  'Date',
  'Type',
  'Category',
  'Description',
  'Amount',
  'Payment Method',
] as const;

export const MONTHLY_SUMMARY_COLUMNS = [
  'Month',
  'Total Income',
  'Total Expenses',
  'Savings Target',
  'Notes',
] as const;
