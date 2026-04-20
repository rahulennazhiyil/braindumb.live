import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminEmpty } from '@rahul-dev/features-admin';
import { SettingsService } from '@rahul-dev/core-supabase';
import type { SiteSetting } from '@rahul-dev/shared-types';
import { SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-admin-settings',
  imports: [FormsModule, SectionHeading, AdminEmpty],
  templateUrl: './settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  private readonly service = inject(SettingsService);

  protected readonly items = signal<readonly SiteSetting[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly key = signal('');
  protected readonly valueJson = signal('');

  constructor() {
    void this.refresh();
  }

  protected async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.items.set(await this.service.listAll());
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async save(): Promise<void> {
    const k = this.key().trim();
    const raw = this.valueJson().trim();
    if (!k || !raw) {
      this.error.set('Key and value are required.');
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      this.error.set('Value must be valid JSON.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    try {
      await this.service.set(k, parsed);
      this.key.set('');
      this.valueJson.set('');
      await this.refresh();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      this.saving.set(false);
    }
  }

  protected stringify(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }
}
