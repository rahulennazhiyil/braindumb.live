import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeService } from './theme.service';
import { THEME_STORAGE_KEY } from './theme-tokens';

describe('ThemeService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('applies default (glass) theme when storage is empty', () => {
    TestBed.configureTestingModule({});
    const svc = TestBed.inject(ThemeService);
    TestBed.flushEffects();
    expect(svc.theme()).toBe('glass');
    expect(document.documentElement.getAttribute('data-theme')).toBe('glass');
  });

  it('restores stored theme on init', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'synthwave');
    TestBed.configureTestingModule({});
    const svc = TestBed.inject(ThemeService);
    TestBed.flushEffects();
    expect(svc.theme()).toBe('synthwave');
    expect(document.documentElement.getAttribute('data-theme')).toBe('synthwave');
  });

  it('ignores invalid stored values', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'hackerman');
    TestBed.configureTestingModule({});
    const svc = TestBed.inject(ThemeService);
    expect(svc.theme()).toBe('glass');
  });

  it('setTheme updates signal, DOM, and storage', () => {
    TestBed.configureTestingModule({});
    const svc = TestBed.inject(ThemeService);
    svc.setTheme('terminal');
    TestBed.flushEffects();
    expect(svc.theme()).toBe('terminal');
    expect(document.documentElement.getAttribute('data-theme')).toBe('terminal');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('terminal');
  });

  it('cycle advances through themes in order and wraps', () => {
    TestBed.configureTestingModule({});
    const svc = TestBed.inject(ThemeService);
    const order = ['terminal', 'print', 'synthwave', 'glass'] as const;
    for (const expected of order) {
      svc.cycle();
      expect(svc.theme()).toBe(expected);
    }
  });

  it('survives localStorage throwing (privacy mode)', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });
    TestBed.configureTestingModule({});
    const svc = TestBed.inject(ThemeService);
    expect(() => {
      svc.setTheme('print');
      TestBed.flushEffects();
    }).not.toThrow();
    expect(svc.theme()).toBe('print');
    expect(document.documentElement.getAttribute('data-theme')).toBe('print');
    setItem.mockRestore();
  });

  it('does not read localStorage on the server platform', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const svc = TestBed.inject(ThemeService);
    expect(svc.theme()).toBe('glass');
    expect(getItem).not.toHaveBeenCalled();
    getItem.mockRestore();
  });

  it('sets data-theme on the injected DOCUMENT', () => {
    TestBed.configureTestingModule({});
    const doc = TestBed.inject(DOCUMENT);
    const svc = TestBed.inject(ThemeService);
    svc.setTheme('synthwave');
    TestBed.flushEffects();
    expect(doc.documentElement.getAttribute('data-theme')).toBe('synthwave');
  });
});
