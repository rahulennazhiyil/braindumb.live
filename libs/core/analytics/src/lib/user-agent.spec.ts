import { describe, expect, it } from 'vitest';
import { parseUserAgent } from './user-agent';

describe('parseUserAgent', () => {
  it('detects desktop Chrome on macOS', () => {
    const p = parseUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    );
    expect(p.deviceType).toBe('desktop');
    expect(p.browser).toBe('Chrome');
    expect(p.os).toBe('macOS');
    expect(p.isBot).toBe(false);
  });

  it('detects mobile Safari on iPhone', () => {
    const p = parseUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    );
    expect(p.deviceType).toBe('mobile');
    expect(p.browser).toBe('Safari');
    expect(p.os).toBe('iOS');
  });

  it('detects tablet from iPad UA', () => {
    const p = parseUserAgent(
      'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    );
    expect(p.deviceType).toBe('tablet');
  });

  it('detects Edge over Chrome', () => {
    const p = parseUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36 Edg/131.0',
    );
    expect(p.browser).toBe('Edge');
    expect(p.os).toBe('Windows');
  });

  it('flags common bots', () => {
    expect(parseUserAgent('Googlebot/2.1').isBot).toBe(true);
    expect(parseUserAgent('Mozilla/5.0 (compatible; bingbot/2.0)').isBot).toBe(
      true,
    );
    expect(parseUserAgent('Playwright/1.40').isBot).toBe(true);
    expect(parseUserAgent('HeadlessChrome/120.0').isBot).toBe(true);
  });

  it('returns safe defaults for empty input', () => {
    const p = parseUserAgent('');
    expect(p.deviceType).toBe('desktop');
    expect(p.browser).toBe('Other');
    expect(p.os).toBe('Other');
  });
});
