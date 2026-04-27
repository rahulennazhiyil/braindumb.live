import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

const STORAGE_KEY = 'rahul-dev:boot-seen';

/**
 * Persists "I've seen the boot sequence" across sessions in localStorage.
 * SSR-safe: server-side `shouldPlayLong()` returns `false`, so no boot
 * is rendered server-side and there's no hydration mismatch.
 */
@Injectable({ providedIn: 'root' })
export class BootGuardService {
  private readonly platformId = inject(PLATFORM_ID);

  shouldPlayLong(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    try {
      return localStorage.getItem(STORAGE_KEY) !== '1';
    } catch {
      return true;
    }
  }

  markPlayed(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // storage blocked — silently ignore
    }
  }

  reset(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage blocked — silently ignore
    }
  }
}
