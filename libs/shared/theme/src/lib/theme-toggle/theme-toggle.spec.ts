import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeService } from '../theme.service';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders the current theme label', async () => {
    await TestBed.configureTestingModule({ imports: [ThemeToggle] }).compileComponents();
    const fixture = TestBed.createComponent(ThemeToggle);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Glass');
  });

  it('cycles the theme on click', async () => {
    await TestBed.configureTestingModule({ imports: [ThemeToggle] }).compileComponents();
    const fixture = TestBed.createComponent(ThemeToggle);
    fixture.detectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const svc = TestBed.inject(ThemeService);

    btn.click();
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(svc.theme()).toBe('terminal');
    expect(fixture.nativeElement.textContent).toContain('Terminal');
  });
});
