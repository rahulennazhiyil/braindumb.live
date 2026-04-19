import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-admin-link-manager',
  imports: [SectionHeading],
  templateUrl: './link-manager.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkManager {}
