import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-privacy',
  imports: [SectionHeading, RouterLink],
  templateUrl: './privacy.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Privacy {}
