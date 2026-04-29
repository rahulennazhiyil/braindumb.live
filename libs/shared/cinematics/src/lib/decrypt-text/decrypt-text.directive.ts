import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  effect,
  inject,
  input,
} from '@angular/core';

const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#$%&';
const SETTLE_MS = 600;

/**
 * Text-scramble effect. Each character cycles through random punctuation
 * before "settling" on the target glyph. Animation duration capped at
 * SETTLE_MS so screen readers see the final string almost immediately.
 *
 * Aria-label is set to the target text once at mount — assistive tech sees
 * a stable string, never the noise.
 *
 * Plays on construct by default. Pass `[autoplay]="false"` to skip the
 * animation entirely (for SSR-stable, no-motion contexts). When
 * `prefers-reduced-motion: reduce` is set, the directive also short-circuits
 * to the final text instantly.
 *
 * Usage:
 *   <h1 [appDecryptText]="'rahul.dev'">placeholder</h1>
 */
@Directive({ selector: '[appDecryptText]', standalone: true })
export class DecryptText {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly appDecryptText = input.required<string>();
  readonly autoplay = input<boolean>(true);

  private rafId = 0;
  private startTs = 0;

  constructor() {
    effect(() => {
      const target = this.appDecryptText();
      const host = this.el.nativeElement;
      host.setAttribute('aria-label', target);

      if (
        !isPlatformBrowser(this.platformId) ||
        !this.autoplay() ||
        this.prefersReducedMotion()
      ) {
        host.textContent = target;
        return;
      }

      this.cancelAnimation();
      this.startTs = 0;
      this.rafId = requestAnimationFrame((t) => this.tick(t, target));
    });

    this.destroyRef.onDestroy(() => this.cancelAnimation());
  }

  private tick(ts: number, target: string): void {
    if (this.startTs === 0) this.startTs = ts;
    const elapsed = ts - this.startTs;
    const progress = Math.min(1, elapsed / SETTLE_MS);

    const out = new Array<string>(target.length);
    for (let i = 0; i < target.length; i++) {
      const charProgress = (progress * target.length - i) / 1.5;
      if (charProgress >= 1) {
        out[i] = target[i];
      } else {
        out[i] = randChar();
      }
    }
    this.el.nativeElement.textContent = out.join('');

    if (progress < 1) {
      this.rafId = requestAnimationFrame((t) => this.tick(t, target));
    } else {
      this.el.nativeElement.textContent = target;
    }
  }

  private cancelAnimation(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private prefersReducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

function randChar(): string {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}
