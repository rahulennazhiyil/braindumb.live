import { Injectable, inject } from '@angular/core';
import type { SiteSetting } from '@rahul-dev/shared-types';
import { SUPABASE_CLIENT } from './supabase-client';

const TABLE = 'site_settings';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly #supabase = inject(SUPABASE_CLIENT);

  async get<TValue = unknown>(key: string): Promise<TValue | null> {
    const { data, error } = await this.#supabase
      .from(TABLE)
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) throw error;
    return (data?.value as TValue | undefined) ?? null;
  }

  async set<TValue>(key: string, value: TValue): Promise<void> {
    const { error } = await this.#supabase.from(TABLE).upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' },
    );

    if (error) throw error;
  }

  async listAll(): Promise<readonly SiteSetting[]> {
    const { data, error } = await this.#supabase
      .from(TABLE)
      .select('*')
      .order('key', { ascending: true });

    if (error) throw error;
    return (data ?? []) as readonly SiteSetting[];
  }
}
