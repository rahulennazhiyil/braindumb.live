import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-section-heading',
  templateUrl: './section-heading.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeading {
  readonly kicker = input<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly align = input<'left' | 'center'>('left');
}
