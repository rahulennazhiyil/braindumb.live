import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-admin-media',
  imports: [SectionHeading],
  templateUrl: './media.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Media {}
