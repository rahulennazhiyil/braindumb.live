/**
 * Matches the expanded `page_views` table in Supabase (blueprint §5.7 + §9).
 * Visitor tracking is privacy-first: raw IP is resolved to country at write
 * time then discarded; `visitor_hash` uses a daily-rotated salt.
 */
export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export interface PageView {
  readonly id: number;
  readonly path: string;
  readonly referrer: string | null;
  readonly user_agent: string | null;
  readonly device_type: DeviceType | null;
  readonly browser: string | null;
  readonly browser_version: string | null;
  readonly os: string | null;
  readonly screen_width: number | null;
  readonly screen_height: number | null;
  readonly country: string | null;
  readonly city: string | null;
  readonly language: string | null;
  readonly timezone: string | null;
  readonly visitor_hash: string | null;
  readonly session_duration_ms: number | null;
  readonly is_bot: boolean;
  readonly created_at: string;
}

export type PageViewInsert = Omit<PageView, 'id' | 'created_at'>;
