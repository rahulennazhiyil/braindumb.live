import type { PageView } from '@rahul-dev/shared-types';
import { describe, expect, it } from 'vitest';
import { aggregate, rangeFromPreset } from './aggregate';

function view(partial: Partial<PageView>): PageView {
  return {
    id: 1,
    path: '/',
    referrer: null,
    user_agent: null,
    device_type: 'desktop',
    browser: 'Chrome',
    browser_version: null,
    os: 'macOS',
    screen_width: 1920,
    screen_height: 1080,
    country: null,
    city: null,
    language: 'en',
    timezone: 'UTC',
    visitor_hash: 'h1',
    session_duration_ms: null,
    is_bot: false,
    created_at: new Date().toISOString(),
    ...partial,
  };
}

describe('rangeFromPreset', () => {
  it('returns a range spanning the requested days', () => {
    const r = rangeFromPreset('7d');
    const diff = r.to.getTime() - r.from.getTime();
    const days = diff / 86_400_000;
    expect(days).toBeGreaterThan(6.9);
    expect(days).toBeLessThan(7.1);
  });
});

describe('aggregate', () => {
  const range = rangeFromPreset('30d');
  const now = new Date().toISOString();

  it('filters bots', () => {
    const agg = aggregate(
      [
        view({ id: 1, is_bot: true }),
        view({ id: 2, is_bot: false }),
        view({ id: 3, is_bot: false }),
      ],
      range,
    );
    expect(agg.total).toBe(2);
  });

  it('counts unique visitors by hash', () => {
    const agg = aggregate(
      [
        view({ visitor_hash: 'a', created_at: now }),
        view({ visitor_hash: 'a', created_at: now }),
        view({ visitor_hash: 'b', created_at: now }),
      ],
      range,
    );
    expect(agg.uniqueVisitors).toBe(2);
  });

  it('ranks devices and browsers by count', () => {
    const agg = aggregate(
      [
        view({ device_type: 'mobile', browser: 'Safari' }),
        view({ device_type: 'mobile', browser: 'Safari' }),
        view({ device_type: 'desktop', browser: 'Chrome' }),
      ],
      range,
    );
    expect(agg.devices[0]).toEqual({ key: 'mobile', count: 2 });
    expect(agg.browsers[0]).toEqual({ key: 'Safari', count: 2 });
  });

  it('bucketises peak hours on a 7×24 grid', () => {
    const agg = aggregate([view({ created_at: now })], range);
    expect(agg.peakHours).toHaveLength(7);
    expect(agg.peakHours[0]).toHaveLength(24);
  });
});
