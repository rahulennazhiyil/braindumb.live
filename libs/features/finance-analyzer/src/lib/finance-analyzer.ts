import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  Download,
  LucideAngularModule,
  RotateCcw,
  TriangleAlert,
} from 'lucide-angular';
import { SectionHeading } from '@rahul-dev/shared-ui';
import { aggregate } from './aggregate';
import { FinanceState } from './finance-state.service';
import { PanelCategoryDonut } from './panel-category-donut';
import { PanelDailySpend } from './panel-daily-spend';
import { PanelIncomeExpenses } from './panel-income-expenses';
import { PanelPaymentPie } from './panel-payment-pie';
import { PanelSavingsGauge } from './panel-savings-gauge';
import { parseWorkbook } from './parser';
import { buildTemplateWorkbook, downloadBlob } from './template-generator';
import { UploadDropzone } from './upload-dropzone';

@Component({
  selector: 'app-finance-analyzer',
  imports: [
    LucideAngularModule,
    SectionHeading,
    UploadDropzone,
    PanelIncomeExpenses,
    PanelCategoryDonut,
    PanelDailySpend,
    PanelSavingsGauge,
    PanelPaymentPie,
  ],
  templateUrl: './finance-analyzer.html',
  styleUrl: './finance-analyzer.css',
  providers: [FinanceState],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceAnalyzer {
  private readonly state = inject(FinanceState);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly Download = Download;
  protected readonly RotateCcw = RotateCcw;
  protected readonly TriangleAlert = TriangleAlert;

  protected readonly hasData = this.state.hasData;
  protected readonly transactions = this.state.transactions;
  protected readonly warnings = this.state.warnings;
  protected readonly error = this.state.error;
  protected readonly filename = this.state.filename;
  protected readonly loadedAt = this.state.loadedAt;

  protected readonly busy = signal(false);
  protected readonly aggregates = computed(() =>
    aggregate(this.transactions()),
  );

  protected async downloadTemplate(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    this.busy.set(true);
    try {
      const blob = await buildTemplateWorkbook();
      downloadBlob(blob, 'rahul-dev-finance-template.xlsx', this.document);
    } finally {
      this.busy.set(false);
    }
  }

  protected async onFile(file: File): Promise<void> {
    this.busy.set(true);
    try {
      const buffer = await file.arrayBuffer();
      const result = await parseWorkbook(buffer);
      this.state.load(file.name, result);
    } catch (err) {
      this.state.setError(
        err instanceof Error ? err.message : 'Could not read that file.',
      );
    } finally {
      this.busy.set(false);
    }
  }

  protected reset(): void {
    this.state.reset();
  }
}
