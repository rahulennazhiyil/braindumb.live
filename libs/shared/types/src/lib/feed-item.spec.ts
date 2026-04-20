import { describe, expect, it } from 'vitest';
import { FEED_ITEM_TYPES, type FeedItemType } from './feed-item';

describe('FEED_ITEM_TYPES', () => {
  it('contains the 5 blueprint-defined types in deterministic order', () => {
    expect(FEED_ITEM_TYPES).toEqual([
      'blog',
      'link',
      'update',
      'note',
      'article',
    ]);
  });

  it('is assignable to readonly FeedItemType[]', () => {
    const _types: readonly FeedItemType[] = FEED_ITEM_TYPES;
    expect(_types.length).toBe(5);
  });
});
