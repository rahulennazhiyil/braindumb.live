/**
 * Client-side visitor hash with a daily-rotated salt stored in localStorage.
 *
 * Blueprint §5.7 called for a server-side rotating salt (Supabase Edge
 * Function), which would prevent cross-day correlation even for someone
 * with raw DB access. Until that lands in Phase 11.1 we use a client
 * salt that still rotates every UTC day. Trade-off documented on the
 * /privacy page.
 *
 * Browser-only — callers (PageViewTracker) guard with isPlatformBrowser
 * before invoking. Node/SSR has no reason to compute visitor hashes.
 */
const SALT_KEY = 'rahul-dev:visitor-salt';

interface StoredSalt {
  readonly salt: string;
  readonly day: string;
}

export async function computeVisitorHash(
  userAgent: string,
  storage: Storage | undefined,
): Promise<string> {
  const salt = getOrRotateSalt(storage);
  const payload = `${salt}|${userAgent}`;
  return sha256(payload);
}

function getOrRotateSalt(storage: Storage | undefined): string {
  const today = new Date().toISOString().slice(0, 10);
  if (!storage) return `${today}|ephemeral`;

  try {
    const raw = storage.getItem(SALT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredSalt;
      if (parsed.day === today && typeof parsed.salt === 'string') {
        return parsed.salt;
      }
    }
  } catch {
    // fall through
  }

  const salt = randomSalt();
  const next: StoredSalt = { salt, day: today };
  try {
    storage.setItem(SALT_KEY, JSON.stringify(next));
  } catch {
    // storage disabled — use the fresh salt without persistence
  }
  return salt;
}

function randomSalt(): string {
  const buf = new Uint8Array(16);
  globalThis.crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hash = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
}
