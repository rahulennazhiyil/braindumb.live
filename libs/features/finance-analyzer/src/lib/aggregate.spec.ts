import { describe, expect, it } from 'vitest';
import { aggregate } from './aggregate';
import type { Transaction } from './finance-types';

const t = (partial: Partial<Transaction>): Transaction => ({
  date: new Date('2026-04-01T00:00:00Z'),
  type: 'expense',
  category: 'Food',
  description: '',
  amount: 100,
  paymentMethod: 'UPI',
  ...partial,
});

describe('aggregate', () => {
  it('sums income and expenses separately', () => {
    const a = aggregate([
      t({ type: 'income', amount: 50000, category: 'Salary' }),
      t({ amount: 500 }),
      t({ amount: 300 }),
    ]);
    expect(a.totalIncome).toBe(50000);
    expect(a.totalExpenses).toBe(800);
  });

  it('computes savings rate as (income - expenses) / income', () => {
    const a = aggregate([
      t({ type: 'income', amount: 1000, category: 'Salary' }),
      t({ amount: 300 }),
    ]);
    expect(a.savingsRate).toBeCloseTo(0.7, 5);
  });

  it('clamps savings rate to 0 when expenses exceed income', () => {
    const a = aggregate([
      t({ type: 'income', amount: 100, category: 'Salary' }),
      t({ amount: 200 }),
    ]);
    expect(a.savingsRate).toBe(0);
  });

  it('returns 0 savings rate when there is no income', () => {
    const a = aggregate([t({ amount: 50 })]);
    expect(a.savingsRate).toBe(0);
  });

  it('buckets by month and sorts ascending', () => {
    const a = aggregate([
      t({ date: new Date('2026-03-15T00:00:00Z'), amount: 100 }),
      t({ date: new Date('2026-05-02T00:00:00Z'), amount: 200 }),
      t({ date: new Date('2026-04-10T00:00:00Z'), amount: 300 }),
    ]);
    expect(a.byMonth.map((b) => b.month)).toEqual([
      '2026-03',
      '2026-04',
      '2026-05',
    ]);
  });

  it('ranks expense categories by amount descending', () => {
    const a = aggregate([
      t({ amount: 200, category: 'Food' }),
      t({ amount: 500, category: 'Rent' }),
      t({ amount: 100, category: 'Food' }),
    ]);
    expect(a.topExpenseCategories[0]).toEqual({ category: 'Rent', amount: 500 });
    expect(a.topExpenseCategories[1]).toEqual({ category: 'Food', amount: 300 });
  });

  it('ignores income rows when bucketing categories / payment methods', () => {
    const a = aggregate([
      t({ type: 'income', amount: 1000, category: 'Salary', paymentMethod: 'Bank Transfer' }),
      t({ amount: 200, paymentMethod: 'UPI' }),
    ]);
    expect(a.topExpenseCategories.map((c) => c.category)).not.toContain('Salary');
    expect(a.paymentSplit.map((c) => c.category)).not.toContain('Bank Transfer');
  });
});
