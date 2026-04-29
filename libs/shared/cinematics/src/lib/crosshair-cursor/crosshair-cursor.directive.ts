import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  PLATFORM_ID,
  inject,
} from '@angular/core';

const EASE = 0.15;
const OUTER_SIZE = 28;
const INNER_SIZE = 4;

/**
 * Two-layer custom cursor: a slow-follow outer ring + a 1:1 inner dot.
 * Mounted once on the App root via `<div appCrosshairCursor>`.
 *
 * Disabled paths (no DOM mounted, no listeners):
 *  - SSR (no document/window).
 *  - Touch primary input — `(pointer: coarse)` matches.
 *  - User prefers reduced motion — `(prefers-reduced-motion: reduce)`.
 *
 * The system cursor is hidden globally while the directive is active via
 * a `body.has-crosshair-cursor` class. Focus rings remain visible
 * because the system cursor is only hidden, not the focus indicator.
 */
@Directive({ selector: '[appCrosshairCursor]', standalone: true })
export class CrosshairCursor {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  private outer: HTMLDivElement | null = null;
  private inner: HTMLDivElement | null = null;
  private rafId = 0;
  private readonly target = { x: -100, y: -100 };
  private readonly current = { x: -100, y: -100 };

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof window === 'undefined' || !window.matchMedia) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.mount();
  }

  private mount(): void {
    const doc = this.document;

    this.outer = doc.createElement('div');
    this.outer.className = 'crosshair-cursor__layer crosshair-cursor__outer';
    this.outer.setAttribute('aria-hidden', 'true');

    this.inner = doc.createElement('div');
    this.inner.className = 'crosshair-cursor__layer crosshair-cursor__inner';
    this.inner.setAttribute('aria-hidden', 'true');

    doc.body.appendChild(this.outer);
    doc.body.appendChild(this.inner);
    doc.body.classList.add('has-crosshair-cursor');

    const onMove = (e: PointerEvent) => {
      this.target.x = e.clientX;
      this.target.y = e.clientY;
      if (this.inner) {
        this.inner.style.transform = `translate3d(${e.clientX - INNER_SIZE / 2}px, ${e.clientY - INNER_SIZE / 2}px, 0)`;
      }
    };
    doc.addEventListener('pointermove', onMove);

    const tick = () => {
      this.current.x += (this.target.x - this.current.x) * EASE;
      this.current.y += (this.target.y - this.current.y) * EASE;
      if (this.outer) {
        this.outer.style.transform = `translate3d(${this.current.x - OUTER_SIZE / 2}px, ${this.current.y - OUTER_SIZE / 2}px, 0)`;
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);

    this.destroyRef.onDestroy(() => {
      doc.removeEventListener('pointermove', onMove);
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.outer?.remove();
      this.inner?.remove();
      this.outer = null;
      this.inner = null;
      doc.body.classList.remove('has-crosshair-cursor');
    });
  }
}
