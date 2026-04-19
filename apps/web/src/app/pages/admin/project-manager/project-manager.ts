import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-admin-project-manager',
  imports: [SectionHeading],
  templateUrl: './project-manager.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectManager {}
