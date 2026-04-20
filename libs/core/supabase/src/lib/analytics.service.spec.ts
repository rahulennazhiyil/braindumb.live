import { TestBed } from '@angular/core/testing';
import { provideAppConfig } from '@rahul-dev/core-config';
import type { PageViewInsert } from '@rahul-dev/shared-types';
import { describe, expect, it, vi } from 'vitest';
import { AnalyticsService } from './analytics.service';
import { SUPABASE_CLIENT } from './supabase-client';

function makeSupabase() {
  const insert = vi.fn(async () => ({ error: null }));
  const from = vi.fn(() => ({ insert }));
  return { client: { from } as unknown, insert, from };
}

const samplePageView: PageViewInsert = {
  path: '/',
  referrer: null,
  user_agent: null,
  device_type: 'desktop',
  browser: 'Chrome',
  browser_version: null,
  os: 'macOS',
  screen_width: 1920,
  screen_height: 1080,
  country: 'IN',
  city: null,
  language: 'en',
  timezone: 'Asia/Kolkata',
  visitor_hash: 'abc',
  session_duration_ms: null,
  is_bot: false,
};

describe('AnalyticsService', () => {
  it('no-ops when analytics is disabled', async () => {
    const { client, from } = makeSupabase();
    TestBed.configureTestingModule({
      providers: [
        provideAppConfig({
          supabase: { url: 'https://x', anonKey: 'y' },
          analytics: { enabled: false },
        }),
        { provide: SUPABASE_CLIENT, useValue: client },
      ],
    });
    await TestBed.inject(AnalyticsService).track(samplePageView);
    expect(from).not.toHaveBeenCalled();
  });

  it('no-ops when supabase url is empty (unconfigured)', async () => {
    const { client, from } = makeSupabase();
    TestBed.configureTestingModule({
      providers: [
        provideAppConfig({
          supabase: { url: '', anonKey: '' },
          analytics: { enabled: true },
        }),
        { provide: SUPABASE_CLIENT, useValue: client },
      ],
    });
    await TestBed.inject(AnalyticsService).track(samplePageView);
    expect(from).not.toHaveBeenCalled();
  });

  it('inserts when enabled and configured', async () => {
    const { client, insert, from } = makeSupabase();
    TestBed.configureTestingModule({
      providers: [
        provideAppConfig({
          supabase: { url: 'https://x', anonKey: 'y' },
          analytics: { enabled: true },
        }),
        { provide: SUPABASE_CLIENT, useValue: client },
      ],
    });
    await TestBed.inject(AnalyticsService).track(samplePageView);
    expect(from).toHaveBeenCalledWith('page_views');
    expect(insert).toHaveBeenCalledWith(samplePageView);
  });

  it('logs but swallows errors from track (never breaks render)', async () => {
    const insert = vi.fn(async () => ({ error: { message: 'down' } }));
    const client = { from: vi.fn(() => ({ insert })) } as unknown;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [
        provideAppConfig({
          supabase: { url: 'https://x', anonKey: 'y' },
          analytics: { enabled: true },
        }),
        { provide: SUPABASE_CLIENT, useValue: client },
      ],
    });
    await expect(
      TestBed.inject(AnalyticsService).track(samplePageView),
    ).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
