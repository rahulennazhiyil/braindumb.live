import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AdminEmpty } from '@rahul-dev/features-admin';
import { SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-admin-media',
  imports: [SectionHeading, AdminEmpty],
  templateUrl: './media.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Media {}
