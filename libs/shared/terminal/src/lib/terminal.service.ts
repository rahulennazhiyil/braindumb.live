import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TERMINAL_AUTH } from './terminal-auth.port';

export type TerminalStatus =
  | 'idle'
  | 'submitting'
  | 'granted'
  | 'denied';

@Injectable({ providedIn: 'root' })
export class TerminalService {
  readonly #auth = inject(TERMINAL_AUTH);
  readonly #router = inject(Router);

  readonly #isOpen = signal(false);
  readonly #status = signal<TerminalStatus>('idle');
  readonly #lastError = signal<string | null>(null);

  readonly isOpen = this.#isOpen.asReadonly();
  readonly status = this.#status.asReadonly();
  readonly lastError = this.#lastError.asReadonly();

  open(): void {
    if (this.#isOpen()) return;
    this.#status.set('idle');
    this.#lastError.set(null);
    this.#isOpen.set(true);
  }

  close(): void {
    if (!this.#isOpen()) return;
    this.#isOpen.set(false);
    this.#status.set('idle');
    this.#lastError.set(null);
  }

  async submit(password: string): Promise<void> {
    if (!password) return;
    this.#status.set('submitting');
    this.#lastError.set(null);

    const result = await this.#auth.authenticate(password);
    if (result.ok) {
      this.#status.set('granted');
      // Brief pause so the "access_granted" line is visible before navigating.
      setTimeout(() => {
        this.close();
        void this.#router.navigate(['/admin']);
      }, 700);
    } else {
      this.#status.set('denied');
      this.#lastError.set(result.error ?? 'Access denied.');
    }
  }
}
