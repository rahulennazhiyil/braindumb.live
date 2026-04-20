import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { APP_CONFIG } from '@rahul-dev/core-config';
import { AnalyticsService } from '@rahul-dev/core-supabase';
import type { PageViewInsert } from '@rahul-dev/shared-types';
import { filter } from 'rxjs';
import { parseUserAgent } from './user-agent';
import { computeVisitorHash } from './visitor-hash';

@Injectable({ providedIn: 'root' })
export class PageViewTracker {
  readonly #platformId = inject(PLATFORM_ID);
  readonly #document = inject(DOCUMENT);
  readonly #router = inject(Router);
  readonly #analytics = inject(AnalyticsService);
  readonly #config = inject(APP_CONFIG);

  /**
   * Subscribes to Router.events and tracks each NavigationEnd. Safe to call
   * from `provideAppInitializer` — no-ops on the server platform or when
   * analytics is disabled in APP_CONFIG.
   */
  start(): void {
    if (!isPlatformBrowser(this.#platformId)) return;
    if (!this.#config.analytics.enabled) return;

    this.#router.events
      .pipe(
        filter(
          (e): e is NavigationEnd => e instanceof NavigationEnd,
        ),
        takeUntilDestroyed(),
      )
      .subscribe((e) => void this.trackNavigation(e.urlAfterRedirects));
  }

  private async trackNavigation(path: string): Promise<void> {
    const nav = this.#document.defaultView?.navigator;
    const screen = this.#document.defaultView?.screen;
    const ua = nav?.userAgent ?? '';
    const parsed = parseUserAgent(ua);
    if (parsed.isBot) return;

    const storage = this.#document.defaultView?.localStorage;
    const visitorHash = await computeVisitorHash(ua, storage);

    const tzOpts = Intl.DateTimeFormat().resolvedOptions();
    const referrer = this.#document.referrer || null;

    const payload: PageViewInsert = {
      path,
      referrer,
      user_agent: ua || null,
      device_type: parsed.deviceType,
      browser: parsed.browser,
      browser_version: parsed.browserVersion,
      os: parsed.os,
      screen_width: screen?.width ?? null,
      screen_height: screen?.height ?? null,
      country: null, // filled server-side in Phase 11.1
      city: null,
      language: nav?.language ?? null,
      timezone: tzOpts.timeZone,
      visitor_hash: visitorHash,
      session_duration_ms: null,
      is_bot: false,
    };

    await this.#analytics.track(payload);
  }
}
