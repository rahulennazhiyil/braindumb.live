import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-admin-feed-manager',
  imports: [SectionHeading],
  templateUrl: './feed-manager.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedManager {}
