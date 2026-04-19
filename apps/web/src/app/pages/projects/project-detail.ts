import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-project-detail',
  imports: [SectionHeading],
  templateUrl: './project-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetail {
  readonly slug = input.required<string>();
}
