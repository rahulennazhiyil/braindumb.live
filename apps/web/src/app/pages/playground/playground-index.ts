import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-playground-index',
  imports: [SectionHeading],
  templateUrl: './playground-index.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaygroundIndex {}
