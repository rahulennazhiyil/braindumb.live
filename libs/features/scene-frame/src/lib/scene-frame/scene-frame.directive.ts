import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  inject,
  input,
  output,
} from '@angular/core';

/**
 * Wraps a section element. Fires `sceneEnter` exactly once when the host
 * crosses the configured intersection threshold, then disconnects the
 * observer. Designed for cinematic "scene reveals" — boot animations
 * triggered by scroll, decrypt-text resolves, kinetic heading entries.
 *
 * SSR-safe: no-ops on the server.
 *
 * Usage:
 *   <section appSceneFrame (sceneEnter)="onEnter()" [threshold]="0.35">…</section>
 */
@Directive({ selector: '[appSceneFrame]', standalone: true })
export class SceneFrame {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly threshold = input<number>(0.35);
  readonly rootMargin = input<string>('0px 0px -10% 0px');
  readonly sceneEnter = output<void>();

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const host = this.el.nativeElement;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          this.sceneEnter.emit();
        }
      },
      { threshold: this.threshold(), rootMargin: this.rootMargin() },
    );
    observer.observe(host);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
