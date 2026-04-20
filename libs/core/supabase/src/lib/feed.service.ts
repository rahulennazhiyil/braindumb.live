import { Injectable, inject } from '@angular/core';
import type {
  FeedItem,
  FeedItemInsert,
  FeedItemType,
  FeedItemUpdate,
} from '@rahul-dev/shared-types';
import { SUPABASE_CLIENT } from './supabase-client';

const TABLE = 'feed_items';

export interface FeedQuery {
  readonly type?: FeedItemType;
  readonly limit?: number;
  readonly offset?: number;
}

@Injectable({ providedIn: 'root' })
export class FeedService {
  readonly #supabase = inject(SUPABASE_CLIENT);

  async list(query: FeedQuery = {}): Promise<readonly FeedItem[]> {
    let q = this.#supabase
      .from(TABLE)
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (query.type) q = q.eq('type', query.type);
    if (query.limit !== undefined) {
      const offset = query.offset ?? 0;
      q = q.range(offset, offset + query.limit - 1);
    }

    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as readonly FeedItem[];
  }

  async create(payload: FeedItemInsert): Promise<FeedItem> {
    const { data, error } = await this.#supabase
      .from(TABLE)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as FeedItem;
  }

  async update(id: string, patch: FeedItemUpdate): Promise<FeedItem> {
    const { data, error } = await this.#supabase
      .from(TABLE)
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as FeedItem;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.#supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  }
}
