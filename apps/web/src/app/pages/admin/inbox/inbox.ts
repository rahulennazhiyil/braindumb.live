import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminEmpty, AdminToolbar } from '@rahul-dev/features-admin';
import { ContactService } from '@rahul-dev/core-supabase';
import type { ContactMessage } from '@rahul-dev/shared-types';
import { SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-admin-inbox',
  imports: [DatePipe, SectionHeading, AdminToolbar, AdminEmpty],
  templateUrl: './inbox.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InboxPage {
  private readonly service = inject(ContactService);

  protected readonly messages = signal<readonly ContactMessage[]>([]);
  protected readonly loading = signal(false);
  protected readonly expandedId = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly unreadCount = computed(
    () => this.messages().filter((m) => !m.is_read).length,
  );

  constructor() {
    void this.refresh();
  }

  protected async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.messages.set(await this.service.listAll());
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async toggle(item: ContactMessage): Promise<void> {
    if (this.expandedId() === item.id) {
      this.expandedId.set(null);
      return;
    }
    this.expandedId.set(item.id);
    if (!item.is_read) {
      try {
        await this.service.markRead(item.id, true);
        this.messages.update((rows) =>
          rows.map((r) => (r.id === item.id ? { ...r, is_read: true } : r)),
        );
      } catch {
        // Non-fatal — visual stays unread, next refresh corrects it.
      }
    }
  }

  protected async remove(item: ContactMessage): Promise<void> {
    if (!confirm(`Delete message from ${item.name}?`)) return;
    try {
      await this.service.delete(item.id);
      if (this.expandedId() === item.id) this.expandedId.set(null);
      await this.refresh();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Delete failed.');
    }
  }

  protected replyHref(item: ContactMessage): string {
    const subject = encodeURIComponent(`Re: your message on rahul.dev`);
    const body = encodeURIComponent(
      `Hi ${item.name},\n\n> ${item.message.split('\n').join('\n> ')}\n\n`,
    );
    return `mailto:${item.email}?subject=${subject}&body=${body}`;
  }
}
