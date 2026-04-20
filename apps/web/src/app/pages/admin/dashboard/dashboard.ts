import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { StatCard } from '@rahul-dev/features-admin';
import {
  ContactService,
  FeedService,
  ProjectService,
} from '@rahul-dev/core-supabase';
import { SectionHeading } from '@rahul-dev/shared-ui';
import { BarChart3, FileText, Inbox, Briefcase } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  imports: [SectionHeading, StatCard],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly projects = inject(ProjectService);
  private readonly feed = inject(FeedService);
  private readonly contacts = inject(ContactService);

  protected readonly loading = signal(true);
  protected readonly projectCount = signal<number>(0);
  protected readonly feedCount = signal<number>(0);
  protected readonly unreadCount = signal<number>(0);
  protected readonly error = signal<string | null>(null);

  protected readonly icons = {
    projects: Briefcase,
    feed: FileText,
    inbox: Inbox,
    insights: BarChart3,
  };

  constructor() {
    void this.refresh();
  }

  protected async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [projects, feed, messages] = await Promise.all([
        this.projects.listAll(),
        this.feed.list({ limit: 1000 }),
        this.contacts.listAll(),
      ]);
      this.projectCount.set(projects.length);
      this.feedCount.set(feed.length);
      this.unreadCount.set(messages.filter((m) => !m.is_read).length);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load.');
    } finally {
      this.loading.set(false);
    }
  }
}
