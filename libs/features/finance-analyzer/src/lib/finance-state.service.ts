import { Injectable, computed, signal } from '@angular/core';
import type {
  MonthlySummary,
  ParseWarning,
  Transaction,
} from './finance-types';

/**
 * Transient state for the finance analyzer. Providers scope this to the
 * FinanceAnalyzer component so data is released when the user navigates
 * away — blueprint §5.8 demands "no persistence, memory only".
 */
@Injectable()
export class FinanceState {
  readonly #transactions = signal<readonly Transaction[]>([]);
  readonly #monthlySummary = signal<readonly MonthlySummary[]>([]);
  readonly #warnings = signal<readonly ParseWarning[]>([]);
  readonly #loadedAt = signal<Date | null>(null);
  readonly #filename = signal<string | null>(null);
  readonly #error = signal<string | null>(null);

  readonly transactions = this.#transactions.asReadonly();
  readonly monthlySummary = this.#monthlySummary.asReadonly();
  readonly warnings = this.#warnings.asReadonly();
  readonly loadedAt = this.#loadedAt.asReadonly();
  readonly filename = this.#filename.asReadonly();
  readonly error = this.#error.asReadonly();

  readonly hasData = computed(() => this.#transactions().length > 0);

  load(
    filename: string,
    data: {
      transactions: readonly Transaction[];
      monthlySummary: readonly MonthlySummary[];
      warnings: readonly ParseWarning[];
    },
  ): void {
    this.#filename.set(filename);
    this.#transactions.set(data.transactions);
    this.#monthlySummary.set(data.monthlySummary);
    this.#warnings.set(data.warnings);
    this.#loadedAt.set(new Date());
    this.#error.set(null);
  }

  setError(message: string): void {
    this.reset();
    this.#error.set(message);
  }

  reset(): void {
    this.#transactions.set([]);
    this.#monthlySummary.set([]);
    this.#warnings.set([]);
    this.#loadedAt.set(null);
    this.#filename.set(null);
    this.#error.set(null);
  }
}
