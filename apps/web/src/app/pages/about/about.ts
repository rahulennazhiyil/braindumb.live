import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CareerTimeline } from '@rahul-dev/features-career-timeline';
import { TechBubbles } from '@rahul-dev/features-tech-bubbles';
import { SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-about',
  imports: [SectionHeading, CareerTimeline, TechBubbles],
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  protected readonly openToOpportunities = signal(true);
}
