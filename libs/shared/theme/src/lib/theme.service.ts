import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  effect,
  Injectable,
  PLATFORM_ID,
  Signal,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  DEFAULT_THEME,
  isThemeName,
  THEME_STORAGE_KEY,
  THEMES,
  ThemeName,
} from './theme-tokens';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly #document = inject(DOCUMENT);
  readonly #platformId = inject(PLATFORM_ID);
  readonly #isBrowser = isPlatformBrowser(this.#platformId);

  readonly #theme = signal<ThemeName>(this.readInitialTheme());

  readonly theme: Signal<ThemeName> = this.#theme.asReadonly();
  readonly themes: readonly ThemeName[] = THEMES;
  readonly nextTheme = computed<ThemeName>(() => {
    const i = THEMES.indexOf(this.#theme());
    return THEMES[(i + 1) % THEMES.length];
  });

  constructor() {
    effect(() => {
      const name = this.#theme();
      this.#document.documentElement.setAttribute('data-theme', name);
      if (this.#isBrowser) {
        try {
          window.localStorage.setItem(THEME_STORAGE_KEY, name);
        } catch {
          // storage quota or privacy mode — degrade silently
        }
      }
    });
  }

  setTheme(name: ThemeName): void {
    this.#theme.set(name);
  }

  cycle(): void {
    this.#theme.set(this.nextTheme());
  }

  private readInitialTheme(): ThemeName {
    if (!this.#isBrowser) return DEFAULT_THEME;
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (isThemeName(stored)) return stored;
    } catch {
      // storage inaccessible — fall through
    }
    return DEFAULT_THEME;
  }
}
