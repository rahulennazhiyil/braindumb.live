import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeAll, describe, expect, it } from 'vitest';
import { HeroGraph } from './hero-graph';

// happy-dom doesn't ship ResizeObserver; stub it so browser-platform
// detectChanges() can complete. Real behavior is covered manually in a
// browser; this just proves the component mounts without throwing.
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    (
      globalThis as unknown as { ResizeObserver: unknown }
    ).ResizeObserver = class {
      observe(): void {
        /* noop */
      }
      unobserve(): void {
        /* noop */
      }
      disconnect(): void {
        /* noop */
      }
    };
  }
});

describe('HeroGraph', () => {
  it('mounts on server without invoking D3 (ngAfterViewInit skipped)', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroGraph],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeroGraph);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.hero-graph-host')).toBeTruthy();
    expect(host.querySelector('svg')).toBeNull();
  });

  it('creates without throwing on the browser platform', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroGraph],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeroGraph);
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
