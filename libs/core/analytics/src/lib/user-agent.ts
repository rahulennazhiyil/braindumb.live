import type { DeviceType } from '@rahul-dev/shared-types';

export interface ParsedUserAgent {
  readonly deviceType: DeviceType;
  readonly browser: string;
  readonly browserVersion: string | null;
  readonly os: string;
  readonly isBot: boolean;
}

const BOT_PATTERNS = [
  /bot\b/i,
  /crawl/i,
  /spider/i,
  /scrape/i,
  /headlesschrome/i,
  /lighthouse/i,
  /phantomjs/i,
  /playwright/i,
  /slurp/i,
  /facebookexternalhit/i,
];

/**
 * Minimal UA parser. Not trying to beat ua-parser-js on accuracy — this is
 * a dependency-free classifier for the rahul-dev dashboard which only
 * cares about coarse device/browser/OS buckets.
 */
export function parseUserAgent(ua: string | undefined | null): ParsedUserAgent {
  const agent = (ua ?? '').trim();
  if (!agent) {
    return {
      deviceType: 'desktop',
      browser: 'Other',
      browserVersion: null,
      os: 'Other',
      isBot: false,
    };
  }

  const isBot = BOT_PATTERNS.some((p) => p.test(agent));

  const deviceType: DeviceType = /tablet|ipad/i.test(agent)
    ? 'tablet'
    : /mobile|iphone|android|phone/i.test(agent)
      ? 'mobile'
      : 'desktop';

  const os = detectOs(agent);
  const { browser, version } = detectBrowser(agent);

  return {
    deviceType,
    browser,
    browserVersion: version,
    os,
    isBot,
  };
}

function detectOs(ua: string): string {
  // Order matters — iPhone/iPad UAs contain "like Mac OS X"; iOS must win.
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/android/i.test(ua)) return 'Android';
  if (/windows nt/i.test(ua)) return 'Windows';
  if (/mac os x|macintosh/i.test(ua)) return 'macOS';
  if (/cros/i.test(ua)) return 'ChromeOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Other';
}

function detectBrowser(ua: string): { browser: string; version: string | null } {
  // Order matters — specific before general.
  const rules: Array<[RegExp, string]> = [
    [/Edg\/([\d.]+)/, 'Edge'],
    [/OPR\/([\d.]+)/, 'Opera'],
    [/Firefox\/([\d.]+)/, 'Firefox'],
    [/Chrome\/([\d.]+)/, 'Chrome'],
    [/Version\/([\d.]+).*Safari/, 'Safari'],
    [/Safari\/([\d.]+)/, 'Safari'],
  ];
  for (const [re, name] of rules) {
    const match = re.exec(ua);
    if (match) return { browser: name, version: match[1] ?? null };
  }
  return { browser: 'Other', version: null };
}
