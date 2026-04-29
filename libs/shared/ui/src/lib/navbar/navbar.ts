import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  NgZone,
  OnInit,
  PLATFORM_ID,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Menu, X } from 'lucide-angular';
import { LongPress } from '../long-press/long-press.directive';

export interface NavLink {
  readonly label: string;
  readonly href: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, LongPress],
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar implements OnInit {
  readonly links = input.required<readonly NavLink[]>();
  readonly logoText = input<string>('rahul');
  readonly logoLongPress = output<void>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);
  protected readonly Menu = Menu;
  protected readonly X = X;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const onScroll = () => this.zone.run(() => this.scrolled.set(window.scrollY > 8));
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', onScroll, { passive: true });
      this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
    });
  }

  protected toggle(): void {
    this.menuOpen.update((v) => !v);
  }

  protected close(): void {
    this.menuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close();
  }
}
