import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-admin-finance',
  imports: [SectionHeading],
  templateUrl: './finance.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Finance {}
