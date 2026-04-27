import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  NgZone,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { ChevronUp, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-scroll-to-top',
  imports: [LucideAngularModule],
  template: `
    @if (visible()) {
      <button
        type="button"
        aria-label="Scroll to top"
        class="fixed bottom-6 right-6 z-30 p-2.5 glass cursor-pointer text-text-secondary hover:text-accent-primary hover:border-accent-primary/40 hover:shadow-glow hover:-translate-y-0.5 transition-all duration-200"
        (click)="scrollTop()"
      >
        <lucide-angular [img]="ChevronUp" [size]="18" aria-hidden="true" />
      </button>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollToTop implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly visible = signal(false);
  protected readonly ChevronUp = ChevronUp;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const onScroll = () => this.zone.run(() => this.visible.set(window.scrollY > 280));
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', onScroll, { passive: true });
      this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
    });
  }

  protected scrollTop(): void {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  }
}
