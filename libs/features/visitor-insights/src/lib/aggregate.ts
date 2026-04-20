import type { PageView } from '@rahul-dev/shared-types';

export type RangePreset = '7d' | '30d' | '90d';

export interface DateRange {
  readonly from: Date;
  readonly to: Date;
  readonly preset: RangePreset;
}

export function rangeFromPreset(preset: RangePreset): DateRange {
  const to = new Date();
  const from = new Date(to);
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
  from.setUTCDate(from.getUTCDate() - days);
  return { from, to, preset };
}

export interface DailyCount {
  readonly day: string; // YYYY-MM-DD
  readonly count: number;
  readonly unique: number;
}

export interface Bucket {
  readonly key: string;
  readonly count: number;
}

export interface Aggregates {
  readonly total: number;
  readonly uniqueVisitors: number;
  readonly daily: readonly DailyCount[];
  readonly devices: readonly Bucket[];
  readonly browsers: readonly Bucket[];
  readonly topPaths: readonly Bucket[];
  /** 7 × 24 grid, [weekday][hourOfDay], weekday 0 = Monday. */
  readonly peakHours: readonly (readonly number[])[];
}

export function aggregate(
  views: readonly PageView[],
  range: DateRange,
): Aggregates {
  const dayStrings = enumerateDays(range);
  const byDay = new Map<string, { count: number; hashes: Set<string> }>();
  for (const d of dayStrings) {
    byDay.set(d, { count: 0, hashes: new Set() });
  }

  const deviceCounts = new Map<string, number>();
  const browserCounts = new Map<string, number>();
  const pathCounts = new Map<string, number>();
  const uniqueHashes = new Set<string>();

  const peakHours: number[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => 0),
  );

  for (const v of views) {
    if (v.is_bot) continue;
    const date = new Date(v.created_at);
    const day = toDayString(date);
    const bucket = byDay.get(day);
    if (!bucket) continue;
    bucket.count += 1;
    if (v.visitor_hash) {
      bucket.hashes.add(v.visitor_hash);
      uniqueHashes.add(v.visitor_hash);
    }

    inc(deviceCounts, v.device_type ?? 'unknown');
    inc(browserCounts, v.browser ?? 'Other');
    inc(pathCounts, v.path);

    // weekday 0 = Monday, 6 = Sunday (Intl-friendly).
    const weekday = (date.getUTCDay() + 6) % 7;
    const hour = date.getUTCHours();
    peakHours[weekday][hour] += 1;
  }

  const daily: DailyCount[] = dayStrings.map((day) => {
    const b = byDay.get(day) ?? { count: 0, hashes: new Set<string>() };
    return { day, count: b.count, unique: b.hashes.size };
  });

  return {
    total: views.filter((v) => !v.is_bot).length,
    uniqueVisitors: uniqueHashes.size,
    daily,
    devices: toRankedBuckets(deviceCounts),
    browsers: toRankedBuckets(browserCounts).slice(0, 6),
    topPaths: toRankedBuckets(pathCounts).slice(0, 10),
    peakHours,
  };
}

function inc(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function toRankedBuckets(map: Map<string, number>): Bucket[] {
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

function enumerateDays(range: DateRange): string[] {
  const days: string[] = [];
  const cursor = new Date(
    Date.UTC(
      range.from.getUTCFullYear(),
      range.from.getUTCMonth(),
      range.from.getUTCDate(),
    ),
  );
  const end = new Date(
    Date.UTC(
      range.to.getUTCFullYear(),
      range.to.getUTCMonth(),
      range.to.getUTCDate(),
    ),
  );
  while (cursor <= end) {
    days.push(toDayString(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

function toDayString(d: Date): string {
  return d.toISOString().slice(0, 10);
}
