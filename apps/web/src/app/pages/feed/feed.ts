import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FeedService } from '@rahul-dev/core-supabase';
import {
  FEED_ITEM_TYPES,
  type FeedItem,
  type FeedItemType,
} from '@rahul-dev/shared-types';
import { BlogCard, SectionHeading } from '@rahul-dev/shared-ui';

type FilterValue = 'all' | FeedItemType;

@Component({
  selector: 'app-feed',
  imports: [BlogCard, SectionHeading],
  templateUrl: './feed.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Feed {
  private readonly service = inject(FeedService);

  protected readonly filters: readonly FilterValue[] = [
    'all',
    ...FEED_ITEM_TYPES,
  ];
  protected readonly filter = signal<FilterValue>('all');
  protected readonly items = signal<readonly FeedItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly visible = computed<readonly FeedItem[]>(() => {
    const f = this.filter();
    const list = this.items();
    return f === 'all' ? list : list.filter((i) => i.type === f);
  });

  constructor() {
    void this.refresh();
  }

  protected setFilter(v: FilterValue): void {
    this.filter.set(v);
  }

  protected async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.items.set(await this.service.list({ limit: 50 }));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load.');
    } finally {
      this.loading.set(false);
    }
  }

  protected countFor(f: FilterValue): number {
    const list = this.items();
    return f === 'all' ? list.length : list.filter((i) => i.type === f).length;
  }

  /** Resolve the best link for a feed item: external URL for links/articles,
   *  internal /feed/slug later when blog rendering lands. */
  protected hrefFor(item: FeedItem): string | undefined {
    return item.url ?? undefined;
  }
}
