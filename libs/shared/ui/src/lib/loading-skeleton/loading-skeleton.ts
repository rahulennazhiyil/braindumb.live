import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  templateUrl: './loading-skeleton.html',
  styleUrl: './loading-skeleton.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSkeleton {
  readonly lines = input<number>(1);
  readonly width = input<string>('100%');
  readonly height = input<string>('1rem');
  readonly rounded = input<boolean>(true);

  protected readonly indices = Array.from({ length: 8 }, (_, i) => i);
}
