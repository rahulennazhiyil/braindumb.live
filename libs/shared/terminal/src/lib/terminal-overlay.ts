import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TerminalService } from './terminal.service';

@Component({
  selector: 'app-terminal-overlay',
  imports: [RouterLink],
  templateUrl: './terminal-overlay.html',
  styleUrl: './terminal-overlay.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerminalOverlay {
  private readonly terminal = inject(TerminalService);
  private readonly injector = inject(Injector);
  private readonly input =
    viewChild<ElementRef<HTMLInputElement>>('passwordInput');

  protected readonly isOpen = this.terminal.isOpen;
  protected readonly status = this.terminal.status;
  protected readonly lastError = this.terminal.lastError;
  protected readonly password = signal('');

  protected readonly promptSuffix = computed(() => {
    switch (this.status()) {
      case 'submitting':
        return 'authenticating…';
      case 'granted':
        return 'access_granted';
      case 'denied':
        return 'access_denied';
      default:
        return '';
    }
  });

  constructor() {
    // Focus the input when the overlay opens. `afterNextRender` needs an
    // explicit injector here because the effect callback runs outside the
    // component's DI context. SSR-safe: afterNextRender only runs in browser.
    effect(() => {
      if (this.isOpen() && this.status() === 'idle') {
        afterNextRender(() => this.input()?.nativeElement.focus(), {
          injector: this.injector,
        });
      }
    });
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isOpen()) this.terminal.close();
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const pwd = this.password();
    if (!pwd) return;
    await this.terminal.submit(pwd);
    if (this.status() !== 'granted') {
      // Clear the field but keep overlay open so user can retry or Escape out.
      this.password.set('');
    }
  }

  protected close(): void {
    this.terminal.close();
    this.password.set('');
  }
}
