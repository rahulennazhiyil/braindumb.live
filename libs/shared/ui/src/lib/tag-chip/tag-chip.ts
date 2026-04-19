import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-tag-chip',
  templateUrl: './tag-chip.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagChip {
  readonly variant = input<'default' | 'terminal'>('terminal');
}
