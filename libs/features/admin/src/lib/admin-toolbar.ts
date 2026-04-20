import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule, Plus, RefreshCw } from 'lucide-angular';

@Component({
  selector: 'app-admin-toolbar',
  imports: [LucideAngularModule],
  templateUrl: './admin-toolbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminToolbar {
  readonly disabled = input<boolean>(false);
  readonly newLabel = input<string>('New');
  readonly refresh = output<void>();
  readonly create = output<void>();

  protected readonly Plus = Plus;
  protected readonly RefreshCw = RefreshCw;
}
