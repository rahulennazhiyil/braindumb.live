import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FinanceAnalyzer } from '@rahul-dev/features-finance-analyzer';

@Component({
  selector: 'app-admin-finance',
  imports: [FinanceAnalyzer],
  templateUrl: './finance.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Finance {}
