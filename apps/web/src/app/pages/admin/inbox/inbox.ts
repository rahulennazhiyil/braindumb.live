import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-admin-inbox',
  imports: [SectionHeading],
  templateUrl: './inbox.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InboxPage {}
