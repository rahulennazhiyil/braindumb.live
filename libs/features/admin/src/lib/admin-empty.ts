import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-admin-empty',
  imports: [],
  templateUrl: './admin-empty.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminEmpty {
  readonly message = input<string>('Nothing yet.');
  readonly hint = input<string>();
}
