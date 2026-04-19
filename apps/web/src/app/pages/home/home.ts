import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-home',
  imports: [Button, SectionHeading, RouterLink],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}
