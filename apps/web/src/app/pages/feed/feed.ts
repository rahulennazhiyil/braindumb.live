import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-feed',
  imports: [SectionHeading],
  templateUrl: './feed.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Feed {}
