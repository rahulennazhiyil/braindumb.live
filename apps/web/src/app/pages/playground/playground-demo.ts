import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-playground-demo',
  imports: [SectionHeading],
  templateUrl: './playground-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaygroundDemo {
  readonly demo = input.required<string>();
}
