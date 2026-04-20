import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CloudOff, LucideAngularModule } from 'lucide-angular';

/**
 * Shows a slim banner when the browser reports it's offline. Hidden on
 * SSR + when online. Uses `online`/`offline` window events; no polling.
 */
@Component({
  selector: 'app-offline-banner',
  imports: [LucideAngularModule],
  templateUrl: './offline-banner.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfflineBanner {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly CloudOff = CloudOff;
  private readonly onlineState = signal(true);
  protected readonly isOffline = computed(() => !this.onlineState());

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    const win = this.document.defaultView;
    if (!win) return;

    this.onlineState.set(win.navigator.onLine);
    const update = () => this.onlineState.set(win.navigator.onLine);
    win.addEventListener('online', update);
    win.addEventListener('offline', update);
    this.destroyRef.onDestroy(() => {
      win.removeEventListener('online', update);
      win.removeEventListener('offline', update);
    });
  }
}
