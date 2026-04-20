/**
 * Matches the `feed_items` table in Supabase (blueprint §9).
 */
export type FeedItemType = 'blog' | 'link' | 'update' | 'note' | 'article';

export const FEED_ITEM_TYPES: readonly FeedItemType[] = [
  'blog',
  'link',
  'update',
  'note',
  'article',
] as const;

export interface FeedItem {
  readonly id: string;
  readonly type: FeedItemType;
  readonly title: string;
  readonly content: string | null;
  readonly url: string | null;
  readonly tags: readonly string[] | null;
  readonly image_url: string | null;
  readonly is_published: boolean;
  readonly published_at: string;
  readonly created_at: string;
}

export type FeedItemInsert = Omit<FeedItem, 'id' | 'created_at'>;

export type FeedItemUpdate = Partial<
  Omit<FeedItem, 'id' | 'created_at'>
>;
