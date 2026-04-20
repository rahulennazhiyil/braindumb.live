/**
 * Matches the `site_settings` table in Supabase (blueprint §9).
 * Values are untyped JSON — callers narrow by known key.
 */
export interface SiteSetting<TValue = unknown> {
  readonly key: string;
  readonly value: TValue;
  readonly updated_at: string;
}

export interface SiteBioValue {
  readonly headline: string;
  readonly body: string;
  readonly location: string;
  readonly openToOpportunities: boolean;
}

export interface SiteSocialsValue {
  readonly github: string;
  readonly linkedin: string;
  readonly email: string;
}
