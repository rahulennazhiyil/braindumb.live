# KPR-verse Makeover — Plan 9: New Easter Eggs (Shake + Konami)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the two outstanding "new" easter eggs from spec § 4.6:
1. **Shake gesture (mobile)** — three sharp shakes within 1.5s opens the terminal. Listens for `DeviceMotionEvent`; iOS permission requested on first explicit user interaction; gracefully no-ops if denied or unsupported.
2. **Konami in the boot terminal** — during the boot sequence, typing `↑↑↓↓` swaps the final line from `~$ rahul --start` to `~$ sudo su` and drops directly into the auth terminal.

(Spec § 4.6 #9 — `~$ replay-intro` in the footer — already shipped in Plan 4 commit 2758836.)

**Architecture:**

- **`ShakeDetector` service** lives in `shared/cinematics`. Tracks the last three high-magnitude `DeviceMotionEvent` accelerations within a 1500 ms window and emits `shake$` (RxJS Subject or Angular `OutputEmitterRef`-style signal). Exposes a public `processMotionEvent(event: DeviceMotionEvent)` for testability — the production listener and the test both call into it. iOS permission is requested via `start()`, which must be called from a user-gesture handler (App calls `start()` on the first `pointerdown` after page load).
- **Konami detection inside `BootSequence`** — replaces the existing blanket `@HostListener('window:keydown')` skip with a selective handler that buffers arrow-key sequences, matches `↑↑↓↓`, and on match emits a new `konamiTriggered` output and skips. Non-arrow keys still skip immediately. `pointerdown` skip behavior stays unchanged.
- **App-shell wiring** — App injects `ShakeDetector`, calls `start()` on first user pointerdown, opens the terminal on `shake$`. App also listens to `BootSequence (konamiTriggered)` and opens the terminal after the boot dismisses.

**Tech Stack:** Angular 21 standalone APIs, RxJS Subject (already a transitive dep), `DeviceMotionEvent`, vitest-angular.

**Spec reference:** `docs/superpowers/specs/2026-04-27-kprverse-makeover-design.md` § 4.1 (`ShakeDetector` service in `shared/cinematics`), § 4.6 (#7 shake, #8 Konami, #9 already shipped), § 4.7 (perf — listeners are passive), § 4.8 (a11y — gestures are bonus paths, no required UI).

**Out of scope (deferred):**
- Four-corner-tap variant of Konami (mobile alternative). Unusual UX, hard to test reliably without real touch hardware. The shake gesture already serves the mobile easter-egg slot; corner taps can land in a future plan if a user requests them.
- Visual hint that the easter eggs exist (intentional — they're discovery moments).

---

## File Structure

**Created:**
- `libs/shared/cinematics/src/lib/shake-detector/shake-detector.service.ts`
- `libs/shared/cinematics/src/lib/shake-detector/shake-detector.service.spec.ts`

**Modified:**
- `libs/shared/cinematics/src/index.ts` — export `ShakeDetector`.
- `libs/features/boot-sequence/src/lib/boot-sequence/boot-sequence.ts` — selective keydown handler + new `konamiTriggered` output.
- `libs/features/boot-sequence/src/lib/boot-sequence/boot-sequence.spec.ts` — assertions for Konami detection.
- `apps/web/src/app/app.ts` — inject ShakeDetector, wire pointerdown → `start()`, subscribe to shake$ → open terminal; new `(konamiTriggered)` handler on `<app-boot-sequence>`.
- `apps/web/src/app/app.html` — add `(konamiTriggered)="onBootKonami()"` binding.

---

## Task 1: ShakeDetector — failing test

**Files:**
- Create: `libs/shared/cinematics/src/lib/shake-detector/shake-detector.service.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
import { TestBed } from '@angular/core/testing';
import { ShakeDetector } from './shake-detector.service';

function fakeMotionEvent(magnitude: number): DeviceMotionEvent {
  return {
    acceleration: { x: magnitude, y: magnitude, z: magnitude },
    accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
    rotationRate: { alpha: 0, beta: 0, gamma: 0 },
    interval: 16,
  } as unknown as DeviceMotionEvent;
}

describe('ShakeDetector', () => {
  it('emits shake$ after 3 high-magnitude events within 1.5s', async () => {
    TestBed.configureTestingModule({ providers: [ShakeDetector] });
    const svc = TestBed.inject(ShakeDetector);

    let count = 0;
    svc.shake$.subscribe(() => count++);

    svc.processMotionEvent(fakeMotionEvent(60));
    svc.processMotionEvent(fakeMotionEvent(60));
    svc.processMotionEvent(fakeMotionEvent(60));

    expect(count).toBe(1);
  });

  it('ignores low-magnitude motion (no shake)', async () => {
    TestBed.configureTestingModule({ providers: [ShakeDetector] });
    const svc = TestBed.inject(ShakeDetector);

    let count = 0;
    svc.shake$.subscribe(() => count++);

    svc.processMotionEvent(fakeMotionEvent(2));
    svc.processMotionEvent(fakeMotionEvent(2));
    svc.processMotionEvent(fakeMotionEvent(2));

    expect(count).toBe(0);
  });

  it('drops events older than the window', async () => {
    TestBed.configureTestingModule({ providers: [ShakeDetector] });
    const svc = TestBed.inject(ShakeDetector);

    let count = 0;
    svc.shake$.subscribe(() => count++);

    // Two old shakes.
    svc.processMotionEvent(fakeMotionEvent(60));
    svc.processMotionEvent(fakeMotionEvent(60));

    // Wait past the 1500ms window.
    await new Promise((resolve) => setTimeout(resolve, 1600));

    // One fresh shake — old two are stale, so total under window = 1.
    svc.processMotionEvent(fakeMotionEvent(60));

    expect(count).toBe(0);
  });

  it('start() is a no-op on the server', async () => {
    TestBed.configureTestingModule({ providers: [ShakeDetector] });
    const svc = TestBed.inject(ShakeDetector);

    // Should not throw even without a user gesture.
    await expect(svc.start()).resolves.not.toThrow();
  });
});
```

(`start()` is the iOS-permission entry point. On a non-iOS user agent it just attaches the listener; on iOS it calls `DeviceMotionEvent.requestPermission()`. The test asserts it doesn't throw — full iOS coverage isn't viable in happy-dom.)

- [ ] **Step 2: Run to confirm it fails**

```bash
npx nx test cinematics --watch=false
```

Expected: FAIL — `Cannot find module './shake-detector.service'`.

---

## Task 2: ShakeDetector — implementation

**Files:**
- Create: `libs/shared/cinematics/src/lib/shake-detector/shake-detector.service.ts`
- Modify: `libs/shared/cinematics/src/index.ts`

- [ ] **Step 1: Create the service**

Create `libs/shared/cinematics/src/lib/shake-detector/shake-detector.service.ts`:

```ts
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Subject, type Observable } from 'rxjs';

const SHAKE_THRESHOLD = 25;
const WINDOW_MS = 1500;
const REQUIRED_SHAKES = 3;

interface ShakeStamp {
  readonly t: number;
}

interface IosDeviceMotionEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

/**
 * Detects "three sharp shakes within 1.5s" by listening to DeviceMotionEvent.
 *
 * iOS Safari requires `DeviceMotionEvent.requestPermission()` to be called
 * inside a user-gesture handler. The consumer (App) wires `start()` to the
 * first `pointerdown` after page load. On non-iOS browsers `start()` just
 * attaches the listener.
 *
 * Tests inject events directly via `processMotionEvent(event)`; the
 * production listener delegates to that same path.
 */
@Injectable({ providedIn: 'root' })
export class ShakeDetector {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _shake$ = new Subject<void>();
  readonly shake$: Observable<void> = this._shake$.asObservable();

  private stamps: ShakeStamp[] = [];
  private listenerAttached = false;

  /**
   * Attach the listener (after iOS permission grant if needed).
   * Safe to call multiple times — only attaches once.
   */
  async start(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.listenerAttached) return;
    if (typeof window === 'undefined') return;

    const motionCtor = (
      window as unknown as { DeviceMotionEvent?: IosDeviceMotionEvent }
    ).DeviceMotionEvent;
    if (!motionCtor) return;

    if (typeof motionCtor.requestPermission === 'function') {
      try {
        const result = await motionCtor.requestPermission();
        if (result !== 'granted') return;
      } catch {
        return;
      }
    }

    window.addEventListener(
      'devicemotion',
      (e: DeviceMotionEvent) => this.processMotionEvent(e),
      { passive: true },
    );
    this.listenerAttached = true;
  }

  processMotionEvent(event: DeviceMotionEvent): void {
    const a = event.acceleration;
    if (!a) return;
    const magnitude = Math.sqrt(
      (a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2,
    );
    if (magnitude < SHAKE_THRESHOLD) return;

    const now = Date.now();
    this.stamps.push({ t: now });
    this.stamps = this.stamps.filter((s) => now - s.t <= WINDOW_MS);

    if (this.stamps.length >= REQUIRED_SHAKES) {
      this.stamps = [];
      this._shake$.next();
    }
  }
}
```

- [ ] **Step 2: Export from index**

Replace `libs/shared/cinematics/src/index.ts` with:

```ts
// Cinematics — visual overlays driven by theme-controlled CSS custom properties.
// Components are standalone; consumers import what they need.

export { GrainOverlay } from './lib/grain-overlay/grain-overlay';
export { ScanLineOverlay } from './lib/scan-line-overlay/scan-line-overlay';
export { DecryptText } from './lib/decrypt-text/decrypt-text.directive';
export { KineticHeading } from './lib/kinetic-heading/kinetic-heading';
export { CrosshairCursor } from './lib/crosshair-cursor/crosshair-cursor.directive';
export { ShakeDetector } from './lib/shake-detector/shake-detector.service';
```

- [ ] **Step 3: Run tests + lint + build**

```bash
npx nx test cinematics --watch=false
npx nx lint cinematics
npx nx build cinematics
```

Expected: 14 tests passing (10 prior + 4 ShakeDetector), lint clean, build success.

If `nx/dependency-checks` flags `rxjs` as missing from `peerDependencies`, add it:

```json
{
  "name": "cinematics",
  "version": "0.0.1",
  "peerDependencies": {
    "@angular/common": "^21.2.0",
    "@angular/core": "^21.2.0",
    "rxjs": "^7.0.0"
  },
  "sideEffects": false
}
```

- [ ] **Step 4: Commit**

```bash
git add libs/shared/cinematics
git commit -m "feat(cinematics): ShakeDetector service

Detects three high-magnitude DeviceMotionEvent shakes within 1.5s and
emits shake\$. SSR-safe; iOS permission requested via start() (consumer
calls inside a user-gesture handler). processMotionEvent(event) is the
public test surface — the production listener delegates to it.

Plan: docs/superpowers/plans/2026-04-27-makeover-plan-9-easter-eggs.md
Spec: docs/superpowers/specs/2026-04-27-kprverse-makeover-design.md § 4.6 #7"
```

---

## Task 3: BootSequence Konami — failing test

**Files:**
- Modify: `libs/features/boot-sequence/src/lib/boot-sequence/boot-sequence.spec.ts`

- [ ] **Step 1: Read the existing spec**

```bash
cat libs/features/boot-sequence/src/lib/boot-sequence/boot-sequence.spec.ts
```

Confirm the three existing assertions (renders aria-live, `done` is an output, `skip()` emits done synchronously). The new tests append.

- [ ] **Step 2: Replace the spec, preserving prior tests + adding 3 new**

Replace the entire contents of `libs/features/boot-sequence/src/lib/boot-sequence/boot-sequence.spec.ts` with:

```ts
import { TestBed } from '@angular/core/testing';
import { BootSequence } from './boot-sequence';

function dispatchKey(key: string): void {
  window.dispatchEvent(new KeyboardEvent('keydown', { key }));
}

describe('BootSequence', () => {
  it('renders an aria-live region that consumers can announce', async () => {
    await TestBed.configureTestingModule({ imports: [BootSequence] }).compileComponents();
    const fixture = TestBed.createComponent(BootSequence);
    fixture.detectChanges();
    const root = fixture.nativeElement.firstElementChild as HTMLElement;
    expect(root.classList.contains('boot-sequence')).toBe(true);
    expect(root.getAttribute('role')).toBe('status');
  });

  it('exposes a `done` output signal that consumers can listen to', async () => {
    await TestBed.configureTestingModule({ imports: [BootSequence] }).compileComponents();
    const fixture = TestBed.createComponent(BootSequence);
    fixture.detectChanges();
    expect(typeof fixture.componentInstance.done).toBe('object');
  });

  it('skip() emits done synchronously', async () => {
    await TestBed.configureTestingModule({ imports: [BootSequence] }).compileComponents();
    const fixture = TestBed.createComponent(BootSequence);
    fixture.detectChanges();
    let fired = false;
    fixture.componentInstance.done.subscribe(() => (fired = true));
    fixture.componentInstance.skip();
    expect(fired).toBe(true);
  });

  it('exposes a `konamiTriggered` output', async () => {
    await TestBed.configureTestingModule({ imports: [BootSequence] }).compileComponents();
    const fixture = TestBed.createComponent(BootSequence);
    fixture.detectChanges();
    expect(typeof fixture.componentInstance.konamiTriggered).toBe('object');
  });

  it('emits konamiTriggered + done after the ↑↑↓↓ sequence', async () => {
    await TestBed.configureTestingModule({ imports: [BootSequence] }).compileComponents();
    const fixture = TestBed.createComponent(BootSequence);
    fixture.detectChanges();
    let konami = false;
    let done = false;
    fixture.componentInstance.konamiTriggered.subscribe(() => (konami = true));
    fixture.componentInstance.done.subscribe(() => (done = true));

    dispatchKey('ArrowUp');
    expect(done).toBe(false); // arrow keys must NOT skip prematurely

    dispatchKey('ArrowUp');
    dispatchKey('ArrowDown');
    dispatchKey('ArrowDown');

    expect(konami).toBe(true);
    expect(done).toBe(true);

    fixture.destroy();
  });

  it('non-arrow keys still skip immediately (no konami)', async () => {
    await TestBed.configureTestingModule({ imports: [BootSequence] }).compileComponents();
    const fixture = TestBed.createComponent(BootSequence);
    fixture.detectChanges();
    let konami = false;
    let done = false;
    fixture.componentInstance.konamiTriggered.subscribe(() => (konami = true));
    fixture.componentInstance.done.subscribe(() => (done = true));

    dispatchKey('Enter');

    expect(done).toBe(true);
    expect(konami).toBe(false);

    fixture.destroy();
  });
});
```

- [ ] **Step 3: Run to confirm new tests fail**

```bash
npx nx test boot-sequence --watch=false
```

Expected: 3 prior tests pass; the `konamiTriggered` output test fails (`Property 'konamiTriggered' does not exist`); both Konami-flow tests fail because every keydown currently calls `skip()`.

---

## Task 4: BootSequence Konami — implementation

**Files:**
- Modify: `libs/features/boot-sequence/src/lib/boot-sequence/boot-sequence.ts`

- [ ] **Step 1: Update the component**

Replace the imports + class body in `libs/features/boot-sequence/src/lib/boot-sequence/boot-sequence.ts` with:

```ts
import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  PLATFORM_ID,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';

interface ScriptedLine {
  readonly prompt: string;
  readonly text: string;
  /** Optional ms to dwell after the line completes before the next starts. */
  readonly dwellMs?: number;
}

const SCRIPT_LONG: readonly ScriptedLine[] = [
  { prompt: '~$', text: 'init theme...', dwellMs: 80 },
  { prompt: '~$', text: 'init graph...', dwellMs: 80 },
  { prompt: '~$', text: 'auth daemon idle.', dwellMs: 120 },
  { prompt: '~$', text: 'rahul --whoami', dwellMs: 200 },
  { prompt: '>', text: 'frontend engineer · data unveil · bengaluru', dwellMs: 280 },
  { prompt: '~$', text: 'rahul --start', dwellMs: 0 },
];

const SCRIPT_SHORT: readonly ScriptedLine[] = [
  { prompt: '~$', text: 'rahul --start', dwellMs: 0 },
];

const CHAR_INTERVAL_MS = 34;

const KONAMI_SEQUENCE: readonly string[] = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
];

/**
 * Animated terminal panel … (existing docstring preserved)
 */
@Component({
  selector: 'app-boot-sequence',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './boot-sequence.html',
  styleUrl: './boot-sequence.css',
})
export class BootSequence implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  readonly done = output<void>();
  readonly konamiTriggered = output<void>();

  protected readonly mode = signal<'long' | 'short'>('long');
  protected readonly typedLines = signal<readonly string[]>([]);
  protected readonly currentLineText = signal<string>('');
  protected readonly currentLine = signal<ScriptedLine | null>(null);
  protected readonly finished = signal<boolean>(false);

  protected readonly script = computed<readonly ScriptedLine[]>(() =>
    this.mode() === 'long' ? SCRIPT_LONG : SCRIPT_SHORT,
  );

  private timer: ReturnType<typeof setTimeout> | null = null;
  private skipped = false;
  private konamiBuffer: string[] = [];

  setMode(mode: 'long' | 'short'): void {
    this.mode.set(mode);
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.finished.set(true);
      return;
    }
    if (this.prefersReducedMotion()) {
      this.finished.set(true);
      this.done.emit();
      return;
    }
    this.typeNextLine(0);
  }

  ngOnDestroy(): void {
    this.cancelTimer();
  }

  @HostListener('window:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (this.skipped) return;

    const expected = KONAMI_SEQUENCE[this.konamiBuffer.length];
    if (event.key === expected) {
      this.konamiBuffer.push(event.key);
      if (this.konamiBuffer.length === KONAMI_SEQUENCE.length) {
        this.konamiBuffer = [];
        this.konamiTriggered.emit();
        this.skip();
      }
      return;
    }

    // Reset the buffer if the wrong key was pressed mid-sequence …
    this.konamiBuffer = [];
    // … then fall through to normal skip behavior.
    this.skip();
  }

  @HostListener('window:pointerdown')
  skip(): void {
    if (this.skipped) return;
    this.skipped = true;
    this.cancelTimer();
    this.finished.set(true);
    this.done.emit();
  }

  private typeNextLine(index: number): void {
    const lines = this.script();
    if (index >= lines.length) {
      this.finished.set(true);
      this.done.emit();
      return;
    }
    const line = lines[index];
    this.currentLine.set(line);
    this.currentLineText.set('');

    const target = line.text;
    let i = 0;
    const tick = () => {
      if (this.skipped) return;
      i++;
      this.currentLineText.set(target.slice(0, i));
      if (i < target.length) {
        this.timer = setTimeout(tick, CHAR_INTERVAL_MS);
      } else {
        this.typedLines.update((arr) => [...arr, `${line.prompt} ${target}`]);
        this.currentLine.set(null);
        this.currentLineText.set('');
        this.timer = setTimeout(
          () => this.typeNextLine(index + 1),
          line.dwellMs ?? 100,
        );
      }
    };
    this.timer = setTimeout(tick, CHAR_INTERVAL_MS);
  }

  private cancelTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private prefersReducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
```

(Notable diffs vs. prior:
1. Add `readonly konamiTriggered = output<void>();`.
2. Add `private konamiBuffer: string[] = [];`.
3. Replace the previous `@HostListener('window:keydown') @HostListener('window:pointerdown') skip()` with two separate handlers — `onKeydown` (keyboard, with Konami detection) and `skip` (kept for pointerdown + the two emit-callsites: `typeNextLine` and `prefersReducedMotion`).)

- [ ] **Step 2: Run tests + lint + build**

```bash
npx nx test boot-sequence --watch=false
npx nx lint boot-sequence
npx nx build boot-sequence
```

Expected: 5 tests passing total (3 prior + 2 new — the `konamiTriggered`-output existence test and the keydown-flow test), lint clean, build success. Note: the spec defines 6 `it` blocks in Task 3, but `'exposes a konamiTriggered output'` and `'emits konamiTriggered + done after the ↑↑↓↓ sequence'` overlap on the existence check. Both should pass.

- [ ] **Step 3: Commit**

```bash
git add libs/features/boot-sequence
git commit -m "feat(boot-sequence): Konami detection (↑↑↓↓)

Splits the previous blanket window:keydown -> skip() handler into a
selective keydown handler that buffers arrow-key sequences. On
↑↑↓↓ match, emits a new konamiTriggered output then skips. Any
non-arrow key still skips immediately. Pointerdown skip behaviour
unchanged.

Plan: docs/superpowers/plans/2026-04-27-makeover-plan-9-easter-eggs.md
Spec: docs/superpowers/specs/2026-04-27-kprverse-makeover-design.md § 4.6 #8"
```

---

## Task 5: App wires shake + konami — failing test

**Files:**
- Modify: `apps/web/src/app/app.spec.ts`

- [ ] **Step 1: Add new tests preserving the existing ones**

Replace the entire contents of `apps/web/src/app/app.spec.ts` with:

```ts
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

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: TERMINAL_AUTH, useValue: { authenticate: vi.fn() } },
        { provide: ShakeDetector, useValue: stubShake },
        { provide: TerminalService, useValue: { open, close: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    fakeShake$.next();

    expect(open).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run to confirm new test fails**

```bash
npx nx test web --watch=false
```

Expected: prior 3 App tests still pass; new `'opens the terminal when shake$ emits'` test FAILS — App doesn't subscribe to `ShakeDetector.shake$` yet.

---

## Task 6: App wires shake + konami — implementation

**Files:**
- Modify: `apps/web/src/app/app.ts`
- Modify: `apps/web/src/app/app.html`

- [ ] **Step 1: Update app.ts**

Open `apps/web/src/app/app.ts`. Apply four narrow Edits:

**1a.** Add `ShakeDetector` to the cinematics import:

```ts
import {
  CrosshairCursor,
  GrainOverlay,
  ScanLineOverlay,
  ShakeDetector,
} from '@rahul-dev/shared-cinematics';
```

**1b.** Add `DestroyRef` to the angular/core import + bring in the rxjs interop helper:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
```

(The existing `import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';` line should be replaced with the new shape above.)

**1c.** In the `App` class, inject `ShakeDetector` + `DestroyRef`, and subscribe to `shake$` in the constructor. Find the constructor block:

```ts
constructor() {
  this.palette.register(this.buildCommands());
}
```

Replace with:

```ts
private readonly shake = inject(ShakeDetector);
private readonly destroyRef = inject(DestroyRef);
private shakeStarted = false;

constructor() {
  this.palette.register(this.buildCommands());
  this.shake.shake$
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(() => this.terminal.open());
}

@HostListener('window:pointerdown')
private onFirstPointerDown(): void {
  if (this.shakeStarted) return;
  this.shakeStarted = true;
  void this.shake.start();
}

protected onBootKonami(): void {
  this.terminal.open();
}
```

(Note: the `@HostListener` decorator + `HostListener` import must already be in scope; if not, also add `HostListener` to the `@angular/core` import in step 1b — it is in the snippet above.)

**1d.** Verify there's no second `inject(DestroyRef)` line elsewhere in the file. The patch above is the only one.

- [ ] **Step 2: Update app.html**

Bind the new Konami output on `<app-boot-sequence>`. Find:

```html
@if (bootVisible()) {
  <app-boot-sequence (done)="onBootDone()" />
}
```

Replace with:

```html
@if (bootVisible()) {
  <app-boot-sequence
    (done)="onBootDone()"
    (konamiTriggered)="onBootKonami()"
  />
}
```

- [ ] **Step 3: Run web tests + typecheck + lint + build**

```bash
npx nx test web --watch=false
npx nx typecheck web
npx nx lint web
npx nx build web
```

Expected: all green. The new shake-emits-open-terminal test passes.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/app.ts apps/web/src/app/app.html apps/web/src/app/app.spec.ts
git commit -m "feat(app): shake-to-open-terminal + konami-to-open-terminal

Injects ShakeDetector and subscribes to shake\$ — emits on three
high-magnitude DeviceMotionEvents within 1.5s, opens the terminal.
Calls ShakeDetector.start() on the first window:pointerdown to
satisfy iOS's user-gesture requirement for the permission prompt
(silent no-op on non-iOS / denied / unsupported).

Wires <app-boot-sequence (konamiTriggered)> -> open terminal so the
↑↑↓↓ sequence during boot drops the user straight into the auth
terminal after the boot dismisses.

Plan: docs/superpowers/plans/2026-04-27-makeover-plan-9-easter-eggs.md
Spec: docs/superpowers/specs/2026-04-27-kprverse-makeover-design.md § 4.6"
```

---

## Task 7: Smoke check + plan index update

**Files:**
- Modify: `docs/superpowers/plans/README.md`

- [ ] **Step 1: Multi-project lint + typecheck**

```bash
npx nx run-many -t lint,typecheck -p web,ui,hero-graph,cinematics,boot-sequence
```

Expected: 10 successful targets.

- [ ] **Step 2: Multi-project test**

```bash
npx nx run-many -t test -p web,ui,hero-graph,cinematics,boot-sequence --watch=false
```

Expected: cinematics +4 (ShakeDetector); boot-sequence +2 (Konami flow); web +1 (shake-opens-terminal). All green.

- [ ] **Step 3: Production build**

```bash
npx nx build web
```

Expected: clean.

- [ ] **Step 4: Hand-test**

```bash
npx nx serve web
```

Walk:
1. Clear `localStorage` → reload. Boot overlay plays.
2. **Konami:** during boot, press ↑↑↓↓ — terminal overlay opens after boot dismisses (the existing TerminalService open path).
3. Reload. Confirm any non-arrow key during boot still dismisses the boot normally.
4. **Shake (mobile only — desktop browsers don't fire DeviceMotionEvent reliably):** test on a real iPhone via your local IP. Tap once anywhere to grant motion permission, then shake the device three times — terminal opens.
5. Confirm shake-to-open is a no-op on desktop.

If any step fails, fix and re-run **Step 1** + **Step 2**.

- [ ] **Step 5: Plan index update**

Edit `docs/superpowers/plans/README.md`:

- Status row: flip Plan 9 from `🔜 next` to `✅ shipped` (note "corner-tap variant deferred"); flip Plan 10 from `⏳ planned` to `🔜 next`.
- Briefing: rewrite Plan 9 with as-shipped commits + deferred items.

```bash
git add docs/superpowers/plans/README.md docs/superpowers/plans/2026-04-27-makeover-plan-9-easter-eggs.md
git commit -m "docs(plans): mark Plan 9 shipped, Plan 10 next + plan doc"
```

---

## Self-review checklist

- [ ] Spec § 4.6 #7 shake gesture: ShakeDetector service shipped, App subscribes to shake$, iOS permission via start(). ✅
- [ ] Spec § 4.6 #8 Konami in boot: ↑↑↓↓ detection in BootSequence, App handler opens terminal. Corner-tap variant deferred. ✅
- [ ] Spec § 4.6 #9 replay-intro footer: already shipped Plan 4. ✅ (no work in this plan)
- [ ] Spec § 4.7 perf: passive event listeners; SSR-safe; no DOM mutations on the server. ✅
- [ ] Spec § 4.8 a11y: easter eggs are bonus paths, no required UI surface; no aria changes. ✅
- [ ] Memory `feedback_ng_packagr_cross_lib`: ShakeDetector lives in `shared/cinematics` — that lib still imports nothing from another buildable lib. App imports both via the path alias, which is fine for the app (esbuild). ✅

## Next plan

Plan 10 (QA pass — Lighthouse + Playwright smoke + theme matrix + bundle budget) is up next per the index.
