import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-projects-index',
  imports: [SectionHeading],
  templateUrl: './projects-index.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsIndex {}
