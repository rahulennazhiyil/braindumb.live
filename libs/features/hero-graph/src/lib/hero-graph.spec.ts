import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeAll, describe, expect, it } from 'vitest';
import { HeroGraph } from './hero-graph';

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

  it('renders four corner brackets, a node count, and a frame ticker', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroGraph],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeroGraph);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.hero-graph__bracket--tl')).toBeTruthy();
    expect(host.querySelector('.hero-graph__bracket--tr')).toBeTruthy();
    expect(host.querySelector('.hero-graph__bracket--bl')).toBeTruthy();
    expect(host.querySelector('.hero-graph__bracket--br')).toBeTruthy();
    const count = host.querySelector('.hero-graph__node-count');
    const ticker = host.querySelector('.hero-graph__frame-ticker');
    expect(count?.textContent).toMatch(/NODES \d+/);
    expect(ticker?.textContent).toMatch(/FRAME \d{4}/);
  });
});
