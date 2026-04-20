import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AnalyticsService } from '@rahul-dev/core-supabase';
import type { PageView } from '@rahul-dev/shared-types';
import {
  aggregate,
  rangeFromPreset,
  type RangePreset,
} from './aggregate';
import { PanelBrowserBar } from './panel-browser-bar';
import { PanelDeviceDonut } from './panel-device-donut';
import { PanelPeakHours } from './panel-peak-hours';
import { PanelTraffic } from './panel-traffic';

const PRESETS: readonly RangePreset[] = ['7d', '30d', '90d'];

@Component({
  selector: 'app-visitor-insights',
  imports: [PanelTraffic, PanelDeviceDonut, PanelBrowserBar, PanelPeakHours],
  templateUrl: './visitor-insights.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitorInsights {
  private readonly service = inject(AnalyticsService);

  protected readonly presets = PRESETS;
  protected readonly preset = signal<RangePreset>('30d');
  protected readonly views = signal<readonly PageView[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly range = computed(() => rangeFromPreset(this.preset()));
  protected readonly aggregates = computed(() =>
    aggregate(this.views(), this.range()),
  );

  constructor() {
    void this.refresh();
  }

  protected setPreset(p: RangePreset): void {
    if (this.preset() === p) return;
    this.preset.set(p);
    void this.refresh();
  }

  protected async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    const { from, to } = this.range();
    try {
      this.views.set(
        await this.service.listRange({
          from: from.toISOString(),
          to: to.toISOString(),
        }),
      );
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load.');
    } finally {
      this.loading.set(false);
    }
  }
}
