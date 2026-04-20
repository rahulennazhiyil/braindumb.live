import { describe, expect, it } from 'vitest';
import {
  APP_CONFIG,
  DEFAULT_APP_CONFIG,
  provideAppConfig,
  type AppConfig,
} from './app-config';

describe('provideAppConfig', () => {
  it('returns a provider bound to APP_CONFIG', () => {
    const provider = provideAppConfig({}) as { provide: unknown };
    expect(provider.provide).toBe(APP_CONFIG);
  });

  it('merges user config over defaults', () => {
    const provider = provideAppConfig({
      supabase: { url: 'https://x', anonKey: 'k' },
    }) as { useValue: AppConfig };
    expect(provider.useValue.supabase).toEqual({
      url: 'https://x',
      anonKey: 'k',
    });
    // analytics stays at default
    expect(provider.useValue.analytics).toEqual(DEFAULT_APP_CONFIG.analytics);
  });

  it('falls back to defaults when called with empty config', () => {
    const provider = provideAppConfig({}) as { useValue: AppConfig };
    expect(provider.useValue).toEqual(DEFAULT_APP_CONFIG);
  });
});
