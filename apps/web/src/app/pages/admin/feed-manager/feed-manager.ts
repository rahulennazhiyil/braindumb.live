import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminEmpty,
  AdminToolbar,
  TagInput,
} from '@rahul-dev/features-admin';
import { FeedService } from '@rahul-dev/core-supabase';
import type {
  FeedItem,
  FeedItemInsert,
  FeedItemType,
  FeedItemUpdate,
} from '@rahul-dev/shared-types';
import { FEED_ITEM_TYPES } from '@rahul-dev/shared-types';
import { SectionHeading } from '@rahul-dev/shared-ui';

interface FeedDraft {
  type: FeedItemType;
  title: string;
  content: string;
  url: string;
  tags: readonly string[];
  is_published: boolean;
}

function emptyDraft(): FeedDraft {
  return {
    type: 'blog',
    title: '',
    content: '',
    url: '',
    tags: [],
    is_published: true,
  };
}

@Component({
  selector: 'app-admin-feed-manager',
  imports: [
    DatePipe,
    FormsModule,
    SectionHeading,
    AdminToolbar,
    AdminEmpty,
    TagInput,
  ],
  templateUrl: './feed-manager.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedManager {
  private readonly service = inject(FeedService);

  protected readonly items = signal<readonly FeedItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly draft = signal<FeedDraft>(emptyDraft());
  protected readonly error = signal<string | null>(null);
  protected readonly feedTypes = FEED_ITEM_TYPES;

  protected readonly isCreating = computed(() => this.editingId() === 'new');
  protected readonly isEditing = computed(() => this.editingId() !== null);

  constructor() {
    void this.refresh();
  }

  protected async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.items.set(await this.service.list({ limit: 100 }));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load.');
    } finally {
      this.loading.set(false);
    }
  }

  protected startCreate(): void {
    this.draft.set(emptyDraft());
    this.editingId.set('new');
  }

  protected startEdit(item: FeedItem): void {
    this.draft.set({
      type: item.type,
      title: item.title,
      content: item.content ?? '',
      url: item.url ?? '',
      tags: item.tags ?? [],
      is_published: item.is_published,
    });
    this.editingId.set(item.id);
  }

  protected cancel(): void {
    this.editingId.set(null);
    this.draft.set(emptyDraft());
    this.error.set(null);
  }

  protected updateDraft<K extends keyof FeedDraft>(
    key: K,
    value: FeedDraft[K],
  ): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  protected async save(): Promise<void> {
    const d = this.draft();
    if (!d.title.trim()) {
      this.error.set('Title is required.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    try {
      const id = this.editingId();
      const payload = {
        type: d.type,
        title: d.title.trim(),
        content: d.content.trim() || null,
        url: d.url.trim() || null,
        tags: d.tags.length > 0 ? d.tags : null,
        image_url: null,
        is_published: d.is_published,
        published_at: new Date().toISOString(),
      } satisfies FeedItemInsert;

      if (id === 'new') {
        await this.service.create(payload);
      } else if (id) {
        const update: FeedItemUpdate = {
          type: payload.type,
          title: payload.title,
          content: payload.content,
          url: payload.url,
          tags: payload.tags,
          is_published: payload.is_published,
        };
        await this.service.update(id, update);
      }
      this.cancel();
      await this.refresh();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async remove(item: FeedItem): Promise<void> {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await this.service.delete(item.id);
      await this.refresh();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Delete failed.');
    }
  }
}
