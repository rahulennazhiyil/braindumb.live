import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Menu, X } from 'lucide-angular';

export interface NavLink {
  readonly label: string;
  readonly href: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  readonly links = input.required<readonly NavLink[]>();
  readonly logoText = input<string>('rahul');

  protected readonly menuOpen = signal(false);
  protected readonly Menu = Menu;
  protected readonly X = X;

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
