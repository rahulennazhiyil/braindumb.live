import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { TerminalService } from './terminal.service';

const SEQUENCE = 'sudo su';
const QUIET_MS = 2000;

/**
 * Global keystroke trap that opens the terminal overlay when a visitor
 * types "sudo su" anywhere on the page outside an input or editable
 * field. Buffer resets after 2s of silence so stale partial matches
 * don't carry over.
 */
@Injectable({ providedIn: 'root' })
export class SudoKeystrokeTrap {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly terminal = inject(TerminalService);

  private buffer = '';
  private resetTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    const listener = (e: KeyboardEvent) => this.onKeydown(e);
    this.document.addEventListener('keydown', listener);
    this.destroyRef.onDestroy(() => {
      this.document.removeEventListener('keydown', listener);
      if (this.resetTimer) clearTimeout(this.resetTimer);
    });
  }

  private onKeydown(event: KeyboardEvent): void {
    // Ignore when the user is typing into an input, textarea, or
    // contentEditable — they're not trying to trigger a secret.
    const target = event.target as HTMLElement | null;
    if (this.isEditable(target)) return;

    // Only accept single-character keys (letters + space). Modifier keys,
    // arrows, F-keys etc. reset nothing — they just pass through.
    if (event.key.length !== 1) return;

    this.buffer = (this.buffer + event.key)
      .toLowerCase()
      .slice(-SEQUENCE.length);

    if (this.buffer === SEQUENCE) {
      this.buffer = '';
      this.terminal.open();
      return;
    }

    // Reset stale partial matches after a quiet period.
    if (this.resetTimer) clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => (this.buffer = ''), QUIET_MS);
  }

  private isEditable(el: HTMLElement | null): boolean {
    if (!el) return false;
    if (el.isContentEditable) return true;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  }
}
