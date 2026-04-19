import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import {
  Eye,
  LucideAngularModule,
  LucideIconData,
  Newspaper,
  Sparkles,
  TerminalSquare,
} from 'lucide-angular';
import { ThemeService } from '../theme.service';
import { THEME_LABELS, ThemeName } from '../theme-tokens';

const ICONS: Record<ThemeName, LucideIconData> = {
  glass: Eye,
  terminal: TerminalSquare,
  print: Newspaper,
  synthwave: Sparkles,
};

@Component({
  selector: 'app-theme-toggle',
  imports: [LucideAngularModule],
  templateUrl: './theme-toggle.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggle {
  readonly #service = inject(ThemeService);

  protected readonly current = this.#service.theme;
  protected readonly nextTheme = this.#service.nextTheme;
  protected readonly icon = computed(() => ICONS[this.current()]);
  protected readonly label = computed(() => THEME_LABELS[this.current()]);
  protected readonly nextLabel = computed(() => THEME_LABELS[this.nextTheme()]);

  protected cycle(): void {
    this.#service.cycle();
  }
}
