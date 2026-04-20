import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  effect,
  inject,
  signal,
} from '@angular/core';

/**
 * Global "view source" toggle — blueprint §8.3. When on, the `data-view-
 * source="on"` attribute is written to <html> so page sections can
 * render tech annotations via CSS or template guards. Persisted to
 * localStorage so the overlay state survives reload.
 */
const KEY = 'rahul-dev:view-source';

@Injectable({ providedIn: 'root' })
export class ViewSourceService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _enabled = signal(this.readInitial());
  readonly enabled = this._enabled.asReadonly();

  constructor() {
    effect(() => {
      const on = this._enabled();
      this.document.documentElement.setAttribute(
        'data-view-source',
        on ? 'on' : 'off',
      );
      if (this.isBrowser) {
        try {
          this.document.defaultView?.localStorage.setItem(
            KEY,
            on ? '1' : '0',
          );
        } catch {
          /* storage blocked — toggle still works in-memory */
        }
      }
    });
  }

  toggle(): void {
    this._enabled.update((v) => !v);
  }

  set(on: boolean): void {
    this._enabled.set(on);
  }

  private readInitial(): boolean {
    if (!this.isBrowser) return false;
    try {
      return this.document.defaultView?.localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  }
}
