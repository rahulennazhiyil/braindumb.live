import {
  Directive,
  ElementRef,
  effect,
  inject,
  input,
} from '@angular/core';

/**
 * Toggles a `.scene-scroll-lock` class on the host element. The actual
 * scroll-snap CSS lives in the consuming app's stylesheet — this
 * directive is just the wiring.
 *
 * The recommended global rule:
 *
 *   .scene-scroll-lock {
 *     scroll-snap-type: y mandatory;
 *     scroll-behavior: smooth;
 *   }
 *   .scene-scroll-lock > * {
 *     scroll-snap-align: start;
 *     scroll-snap-stop: always;
 *     min-height: 100dvh;
 *   }
 *   @media (max-width: 767px), (prefers-reduced-motion: reduce) {
 *     .scene-scroll-lock { scroll-snap-type: none; }
 *     .scene-scroll-lock > * { min-height: 0; }
 *   }
 *
 * Usage:
 *   <main appSceneScrollLock [disabled]="!enabled()">…</main>
 */
@Directive({ selector: '[appSceneScrollLock]', standalone: true })
export class SceneScrollLock {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly disabled = input<boolean>(false);

  constructor() {
    effect(() => {
      const host = this.el.nativeElement;
      if (this.disabled()) host.classList.remove('scene-scroll-lock');
      else host.classList.add('scene-scroll-lock');
    });
  }
}
