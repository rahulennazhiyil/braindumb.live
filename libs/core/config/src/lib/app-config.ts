import { InjectionToken, Provider } from '@angular/core';

/**
 * Runtime application configuration. Supplied at bootstrap via
 * `provideAppConfig({ ... })` from the host app. Keep it small and flat —
 * this is crossed into every environment (SSR, browser, tests, CI).
 */
export interface AppConfig {
  readonly supabase: {
    readonly url: string;
    readonly anonKey: string;
  };
  readonly analytics: {
    /** When false, the AnalyticsService skips all writes. */
    readonly enabled: boolean;
  };
  readonly admin: {
    /**
     * Hard-coded admin email. The terminal overlay prompts only for password
     * and calls signInWithPassword({ email, password }). Empty in dev → sign
     * in will fail and the terminal shows "access denied".
     */
    readonly email: string;
  };
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

/**
 * Placeholder config used when the host app doesn't provide one (local
 * dev before Supabase credentials are wired). Services should degrade
 * gracefully when `supabase.url` is empty (log a warning, no-op).
 */
export const DEFAULT_APP_CONFIG: AppConfig = {
  supabase: { url: '', anonKey: '' },
  analytics: { enabled: false },
  admin: { email: '' },
};

export function provideAppConfig(config: Partial<AppConfig>): Provider {
  const merged: AppConfig = {
    supabase: {
      ...DEFAULT_APP_CONFIG.supabase,
      ...config.supabase,
    },
    analytics: {
      ...DEFAULT_APP_CONFIG.analytics,
      ...config.analytics,
    },
    admin: {
      ...DEFAULT_APP_CONFIG.admin,
      ...config.admin,
    },
  };
  return { provide: APP_CONFIG, useValue: merged };
}
