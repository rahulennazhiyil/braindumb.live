import { TestBed } from '@angular/core/testing';
import { THEMES } from './theme-tokens';
import { ThemeService } from './theme.service';

describe('ThemeService matrix', () => {
  it('accepts every published theme without throwing', () => {
    TestBed.configureTestingModule({ providers: [ThemeService] });
    const svc = TestBed.inject(ThemeService);

    for (const theme of THEMES) {
      expect(() => svc.setTheme(theme)).not.toThrow();
    }
  });

  it('exposes all four themes', () => {
    expect(THEMES).toHaveLength(4);
    expect(THEMES).toContain('glass');
    expect(THEMES).toContain('terminal');
    expect(THEMES).toContain('print');
    expect(THEMES).toContain('synthwave');
  });

  it('reflects the active theme on documentElement[data-theme]', () => {
    TestBed.configureTestingModule({ providers: [ThemeService] });
    const svc = TestBed.inject(ThemeService);

    svc.setTheme('synthwave');
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe(
      'synthwave',
    );

    svc.setTheme('print');
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('print');
  });
});
