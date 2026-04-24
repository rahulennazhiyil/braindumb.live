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
} from '@angular/core';

@Directive({ selector: '[appReveal]', standalone: true })
export class Reveal implements OnInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = this.el.nativeElement;
    el.classList.add('reveal--hidden');
    afterNextRender(
      () => {
        this.observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              el.classList.add('reveal--ready');
              requestAnimationFrame(() => el.classList.remove('reveal--hidden'));
              this.observer?.unobserve(el);
            }
          },
          { threshold: 0.07, rootMargin: '0px 0px -24px 0px' },
        );
        this.observer.observe(el);
      },
      { injector: this.injector },
    );
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
