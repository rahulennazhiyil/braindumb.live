import type { Transaction } from './finance-types';

export interface MonthBucket {
  readonly month: string; // "2026-04"
  readonly income: number;
  readonly expenses: number;
}

export interface CategoryBucket {
  readonly category: string;
  readonly amount: number;
}

export interface DailyPoint {
  readonly day: string; // "2026-04-01"
  readonly amount: number;
}

export interface FinanceAggregates {
  readonly totalIncome: number;
  readonly totalExpenses: number;
  readonly savingsRate: number; // 0..1 ((income - expenses) / income)
  readonly byMonth: readonly MonthBucket[];
  readonly topExpenseCategories: readonly CategoryBucket[];
  readonly paymentSplit: readonly CategoryBucket[];
  readonly dailyExpense: readonly DailyPoint[];
}

export function aggregate(
  transactions: readonly Transaction[],
): FinanceAggregates {
  const income = sumBy(transactions, 'income');
  const expenses = sumBy(transactions, 'expense');

  const byMonthMap = new Map<string, { income: number; expenses: number }>();
  const byCategory = new Map<string, number>();
  const byMethod = new Map<string, number>();
  const byDay = new Map<string, number>();

  for (const t of transactions) {
    const monthKey = monthOf(t.date);
    const bucket = byMonthMap.get(monthKey) ?? { income: 0, expenses: 0 };
    if (t.type === 'income') bucket.income += t.amount;
    else bucket.expenses += t.amount;
    byMonthMap.set(monthKey, bucket);

    if (t.type === 'expense') {
      byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);
      byMethod.set(
        t.paymentMethod,
        (byMethod.get(t.paymentMethod) ?? 0) + t.amount,
      );
      const dayKey = dayOf(t.date);
      byDay.set(dayKey, (byDay.get(dayKey) ?? 0) + t.amount);
    }
  }

  const byMonth: MonthBucket[] = Array.from(byMonthMap.entries())
    .map(([month, v]) => ({ month, ...v }))
    .sort((a, b) => (a.month < b.month ? -1 : 1));

  const topExpenseCategories: CategoryBucket[] = Array.from(
    byCategory.entries(),
  )
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const paymentSplit: CategoryBucket[] = Array.from(byMethod.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const dailyExpense: DailyPoint[] = Array.from(byDay.entries())
    .map(([day, amount]) => ({ day, amount }))
    .sort((a, b) => (a.day < b.day ? -1 : 1));

  const savingsRate = income > 0 ? Math.max(0, (income - expenses) / income) : 0;

  return {
    totalIncome: income,
    totalExpenses: expenses,
    savingsRate,
    byMonth,
    topExpenseCategories,
    paymentSplit,
    dailyExpense,
  };
}

function sumBy(
  txs: readonly Transaction[],
  type: Transaction['type'],
): number {
  return txs.reduce((s, t) => (t.type === type ? s + t.amount : s), 0);
}

function monthOf(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function dayOf(d: Date): string {
  return d.toISOString().slice(0, 10);
}
