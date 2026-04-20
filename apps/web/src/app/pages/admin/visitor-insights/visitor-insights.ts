import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VisitorInsights } from '@rahul-dev/features-visitor-insights';

@Component({
  selector: 'app-admin-visitor-insights',
  imports: [VisitorInsights],
  templateUrl: './visitor-insights.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitorInsightsPage {}
