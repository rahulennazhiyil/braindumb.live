import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AdminEmpty, TagInput } from '@rahul-dev/features-admin';
import { FeedService } from '@rahul-dev/core-supabase';
import type { FeedItem } from '@rahul-dev/shared-types';
import { SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-admin-link-manager',
  imports: [FormsModule, DatePipe, SectionHeading, AdminEmpty, TagInput],
  templateUrl: './link-manager.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkManager {
  private readonly service = inject(FeedService);

  protected readonly links = signal<readonly FeedItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly title = signal('');
  protected readonly url = signal('');
  protected readonly tags = signal<readonly string[]>([]);

  constructor() {
    void this.refresh();
  }

  protected async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.links.set(await this.service.list({ type: 'link', limit: 50 }));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async save(): Promise<void> {
    const t = this.title().trim();
    const u = this.url().trim();
    if (!t || !u) {
      this.error.set('Title and URL are required.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    try {
      await this.service.create({
        type: 'link',
        title: t,
        url: u,
        tags: this.tags().length > 0 ? this.tags() : null,
        content: null,
        image_url: null,
        is_published: true,
        published_at: new Date().toISOString(),
      });
      this.title.set('');
      this.url.set('');
      this.tags.set([]);
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
