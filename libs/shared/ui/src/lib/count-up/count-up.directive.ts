import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
} from '@angular/core';

/**
 * Animates a text span from 0 up to a target integer once it scrolls into view.
 * Respects prefers-reduced-motion — sets the final value immediately in that case.
 *
 * Usage:
 *   <span [appCountUp]="40" suffix="%">0</span>
 */
@Directive({ selector: '[appCountUp]', standalone: true })
export class CountUp implements OnInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);
  private observer?: IntersectionObserver;
  private rafId = 0;

  /** Target number to count up to. */
  readonly appCountUp = input.required<number>();

  /** Text appended after the number (e.g. "+", "%"). */
  readonly suffix = input<string>('');

  /** Animation duration in ms. */
  readonly durationMs = input<number>(1100);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      this.setValue(this.appCountUp());
      return;
    }

    this.setValue(0);

    afterNextRender(
      () => {
        const el = this.el.nativeElement;
        this.observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              this.observer?.unobserve(el);
              this.animate();
            }
          },
          { threshold: 0.35 },
        );
        this.observer.observe(el);
      },
      { injector: this.injector },
    );
  }

  private animate(): void {
    const start = performance.now();
    const to = this.appCountUp();
    const dur = Math.max(300, this.durationMs());

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const current = Math.round(to * eased);
      this.setValue(current);
      if (t < 1) this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private setValue(n: number): void {
    this.el.nativeElement.textContent = `${n}${this.suffix()}`;
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
