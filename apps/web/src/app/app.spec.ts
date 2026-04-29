import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BootGuardService } from '@rahul-dev/features-boot-sequence';
import { ShakeDetector } from '@rahul-dev/shared-cinematics';
import { TerminalService, TERMINAL_AUTH } from '@rahul-dev/shared-terminal';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Subject } from 'rxjs';
import { App } from './app';

const STORAGE_KEY = 'rahul-dev:boot-seen';

describe('App shell', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('renders navbar, outlet, footer, and terminal overlay', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: TERMINAL_AUTH, useValue: { authenticate: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('app-navbar')).toBeTruthy();
    expect(root.querySelector('router-outlet')).toBeTruthy();
    expect(root.querySelector('app-footer')).toBeTruthy();
    expect(root.querySelector('app-terminal-overlay')).toBeTruthy();
  });

  it('renders the boot overlay on a first visit', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: TERMINAL_AUTH, useValue: { authenticate: vi.fn() } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-boot-sequence')).toBeTruthy();
  });

  it('does NOT render the boot overlay on a return visit', async () => {
    localStorage.setItem(STORAGE_KEY, '1');
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: TERMINAL_AUTH, useValue: { authenticate: vi.fn() } },
      ],
    }).compileComponents();
    expect(TestBed.inject(BootGuardService).shouldPlayLong()).toBe(false);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-boot-sequence')).toBeNull();
  });

  it('opens the terminal when shake$ emits', async () => {
    const fakeShake$ = new Subject<void>();
    const stubShake = {
      shake$: fakeShake$.asObservable(),
      start: vi.fn().mockResolvedValue(undefined),
      processMotionEvent: vi.fn(),
    };
    const open = vi.fn();
    const stubTerminal = {
      open,
      close: vi.fn(),
      isOpen: () => false,
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: TERMINAL_AUTH, useValue: { authenticate: vi.fn() } },
        { provide: ShakeDetector, useValue: stubShake },
        { provide: TerminalService, useValue: stubTerminal },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    fakeShake$.next();

    expect(open).toHaveBeenCalledTimes(1);
  });
});
