import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { CrosshairCursor } from './crosshair-cursor.directive';

@Component({
  selector: 'app-crosshair-host',
  imports: [CrosshairCursor],
  template: `<div appCrosshairCursor>host</div>`,
})
class HostCmp {}

// happy-dom doesn't ship matchMedia. Stub it so the directive's
// `(pointer: coarse)` / `(prefers-reduced-motion: reduce)` checks
// resolve falsy and the directive proceeds to mount.
const originalMatchMedia = window.matchMedia;
beforeAll(() => {
  (window as unknown as { matchMedia: typeof window.matchMedia }).matchMedia =
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
});
afterAll(() => {
  if (originalMatchMedia) {
    (window as unknown as { matchMedia: typeof window.matchMedia }).matchMedia =
      originalMatchMedia;
  }
});

describe('CrosshairCursor', () => {
  afterEach(() => {
    document.querySelectorAll('.crosshair-cursor__layer').forEach((n) => n.remove());
    document.body.classList.remove('has-crosshair-cursor');
  });

  it('does NOT mount any DOM on the server', async () => {
    await TestBed.configureTestingModule({
      imports: [HostCmp],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostCmp);
    fixture.detectChanges();

    expect(
      document.querySelectorAll('.crosshair-cursor__layer').length,
    ).toBe(0);
    expect(document.body.classList.contains('has-crosshair-cursor')).toBe(
      false,
    );
  });

  it('mounts two layers on the body when constructed in the browser', async () => {
    await TestBed.configureTestingModule({ imports: [HostCmp] }).compileComponents();
    const fixture = TestBed.createComponent(HostCmp);
    fixture.detectChanges();

    const layers = document.querySelectorAll('.crosshair-cursor__layer');
    expect(layers.length).toBe(2);
    expect(
      document.querySelector('.crosshair-cursor__outer'),
    ).toBeTruthy();
    expect(
      document.querySelector('.crosshair-cursor__inner'),
    ).toBeTruthy();
    expect(document.body.classList.contains('has-crosshair-cursor')).toBe(
      true,
    );
  });

  it('removes the layers and the body class on destroy', async () => {
    await TestBed.configureTestingModule({ imports: [HostCmp] }).compileComponents();
    const fixture = TestBed.createComponent(HostCmp);
    fixture.detectChanges();

    expect(
      document.querySelectorAll('.crosshair-cursor__layer').length,
    ).toBe(2);

    fixture.destroy();

    expect(
      document.querySelectorAll('.crosshair-cursor__layer').length,
    ).toBe(0);
    expect(document.body.classList.contains('has-crosshair-cursor')).toBe(
      false,
    );
  });
});
