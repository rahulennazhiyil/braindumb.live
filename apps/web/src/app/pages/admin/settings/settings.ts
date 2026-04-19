import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-admin-settings',
  imports: [SectionHeading],
  templateUrl: './settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {}
