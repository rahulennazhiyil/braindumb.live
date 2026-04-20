import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '@rahul-dev/core-config';
import type { PageView, PageViewInsert } from '@rahul-dev/shared-types';
import { SUPABASE_CLIENT } from './supabase-client';

const TABLE = 'page_views';

export interface AnalyticsRange {
  readonly from: string;
  readonly to: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  readonly #supabase = inject(SUPABASE_CLIENT);
  readonly #config = inject(APP_CONFIG);

  /**
   * Write a page view. No-ops when analytics is disabled or Supabase is
   * unconfigured, so callers don't need to gate at the call site.
   */
  async track(view: PageViewInsert): Promise<void> {
    if (!this.#config.analytics.enabled) return;
    if (!this.#config.supabase.url) return;

    const { error } = await this.#supabase.from(TABLE).insert(view);
    if (error) {
      // Analytics must never break the render path — log but don't throw.
       
      console.warn('[AnalyticsService] track failed', error.message);
    }
  }

  async listRange(range: AnalyticsRange): Promise<readonly PageView[]> {
    const { data, error } = await this.#supabase
      .from(TABLE)
      .select('*')
      .gte('created_at', range.from)
      .lte('created_at', range.to)
      .eq('is_bot', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as readonly PageView[];
  }
}
