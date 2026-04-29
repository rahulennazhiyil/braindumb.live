import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FeedService } from '@rahul-dev/core-supabase';
import { SceneFrame } from '@rahul-dev/features-scene-frame';
import { DecryptText, KineticHeading } from '@rahul-dev/shared-cinematics';
import {
  FEED_ITEM_TYPES,
  type FeedItem,
  type FeedItemType,
} from '@rahul-dev/shared-types';
import { BlogCard, LoadingSkeleton, Reveal } from '@rahul-dev/shared-ui';

type FilterValue = 'all' | FeedItemType;

@Component({
  selector: 'app-feed',
  imports: [
    BlogCard,
    LoadingSkeleton,
    Reveal,
    DecryptText,
    KineticHeading,
    SceneFrame,
  ],
  templateUrl: './feed.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Feed {
  protected readonly skeletonItems = Array.from({ length: 4 }, (_, i) => i);
  private readonly service = inject(FeedService);

  protected readonly filters: readonly FilterValue[] = [
    'all',
    ...FEED_ITEM_TYPES,
  ];
  protected readonly filter = signal<FilterValue>('all');
  protected readonly items = signal<readonly FeedItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly feedReady = signal<boolean>(false);

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

  protected onFeedEnter(): void {
    this.feedReady.set(true);
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

  protected hrefFor(item: FeedItem): string | undefined {
    return item.url ?? undefined;
  }
}
