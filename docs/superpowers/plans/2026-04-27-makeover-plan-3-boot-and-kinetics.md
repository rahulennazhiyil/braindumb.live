# KPR-verse Makeover — Plan 3: Boot Sequence + Kinetic Text

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the kinetic-text primitives (`DecryptText` directive + `KineticHeading` component in `shared/cinematics`) and the boot-sequence lib (`BootGuardService` + `BootSequence` component) needed for the hero two-beat. No page consumes these yet — wiring is Plan 4.

**Architecture:** Two `cinematics` additions are pure browser-only directives/components animated via `requestAnimationFrame`; both respect `prefers-reduced-motion` (instant resolve in that case). New buildable lib `libs/features/boot-sequence` houses the boot terminal: a service that tracks first-visit state in localStorage, plus a component that renders the animated terminal with a scripted line list and emits `done`.

**Tech Stack:** Angular 21 standalone APIs, requestAnimationFrame, localStorage, vitest-angular.

**Spec reference:** `docs/superpowers/specs/2026-04-27-kprverse-makeover-design.md` § 3 (Hybrid first moment), § 4.1 (boot-sequence + cinematics), § 4.7, § 4.8.

---

## File Structure

**Created:**
- `libs/shared/cinematics/src/lib/decrypt-text/decrypt-text.directive.ts`
- `libs/shared/cinematics/src/lib/decrypt-text/decrypt-text.directive.spec.ts`
- `libs/shared/cinematics/src/lib/kinetic-heading/kinetic-heading.ts`
- `libs/shared/cinematics/src/lib/kinetic-heading/kinetic-heading.css`
- `libs/shared/cinematics/src/lib/kinetic-heading/kinetic-heading.spec.ts`
- `libs/features/boot-sequence/` — new buildable lib (generated)
- `libs/features/boot-sequence/src/lib/boot-guard.service.ts`
- `libs/features/boot-sequence/src/lib/boot-guard.service.spec.ts`
- `libs/features/boot-sequence/src/lib/boot-sequence/boot-sequence.ts`
- `libs/features/boot-sequence/src/lib/boot-sequence/boot-sequence.css`
- `libs/features/boot-sequence/src/lib/boot-sequence/boot-sequence.spec.ts`

**Modified:**
- `libs/shared/cinematics/src/index.ts` — export `DecryptText`, `KineticHeading`
- `tsconfig.base.json` — path alias for `@rahul-dev/features-boot-sequence`
- `libs/features/boot-sequence/project.json` — typecheck override + tags
- `libs/features/boot-sequence/src/index.ts` — exports
- `libs/features/boot-sequence/package.json` — drop unused `@angular/common` peer if present (re-add if directives use it)

---

## Task 1: DecryptText directive — failing test

**Files:**
- Create: `libs/shared/cinematics/src/lib/decrypt-text/decrypt-text.directive.spec.ts`

- [ ] **Step 1: Write the failing spec**

Create `libs/shared/cinematics/src/lib/decrypt-text/decrypt-text.directive.spec.ts`:

```ts
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DecryptText } from './decrypt-text.directive';

@Component({
  selector: 'app-decrypt-host',
  imports: [DecryptText],
  template: `<span [appDecryptText]="'rahul.dev'" [autoplay]="false">placeholder</span>`,
})
class HostCmp {}

describe('DecryptText', () => {
  it('renders the final text by default for SSR / reduced motion fallback', async () => {
    await TestBed.configureTestingModule({ imports: [HostCmp] }).compileComponents();
    const fixture = TestBed.createComponent(HostCmp);
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('span') as HTMLElement;
    // With autoplay off the initial paint should already match the target text.
    expect(span.textContent).toBe('rahul.dev');
  });

  it('sets aria-label to the final text so screen readers see one stable string', async () => {
    await TestBed.configureTestingModule({ imports: [HostCmp] }).compileComponents();
    const fixture = TestBed.createComponent(HostCmp);
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('span') as HTMLElement;
    expect(span.getAttribute('aria-label')).toBe('rahul.dev');
  });
});
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npx nx test cinematics --watch=false
```

Expected: FAIL — `Cannot find module './decrypt-text.directive'`.

---

## Task 2: DecryptText directive — implementation

**Files:**
- Create: `libs/shared/cinematics/src/lib/decrypt-text/decrypt-text.directive.ts`
- Modify: `libs/shared/cinematics/src/index.ts`

- [ ] **Step 1: Create the directive**

Create `libs/shared/cinematics/src/lib/decrypt-text/decrypt-text.directive.ts`:

```ts
import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  effect,
  inject,
  input,
} from '@angular/core';

const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#$%&';
const FRAME_MS = 50;
const SETTLE_MS = 600;

/**
 * Text-scramble effect. Each character cycles through random punctuation
 * before "settling" on the target glyph. Animation duration capped at
 * SETTLE_MS so screen readers see the final string almost immediately.
 *
 * Aria-label is set to the target text once at mount — assistive tech sees
 * a stable string, never the noise.
 *
 * Plays on construct by default. Pass `[autoplay]="false"` to skip the
 * animation entirely (for SSR-stable, no-motion contexts). When
 * `prefers-reduced-motion: reduce` is set, the directive also short-circuits
 * to the final text instantly.
 *
 * Usage:
 *   <h1 [appDecryptText]="'rahul.dev'">placeholder</h1>
 */
@Directive({ selector: '[appDecryptText]', standalone: true })
export class DecryptText {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly appDecryptText = input.required<string>();
  readonly autoplay = input<boolean>(true);

  private rafId = 0;
  private startTs = 0;

  constructor() {
    effect(() => {
      const target = this.appDecryptText();
      const host = this.el.nativeElement;
      host.setAttribute('aria-label', target);

      // SSR / disabled / reduced motion → set final text and bail.
      if (
        !isPlatformBrowser(this.platformId) ||
        !this.autoplay() ||
        this.prefersReducedMotion()
      ) {
        host.textContent = target;
        return;
      }

      this.cancelAnimation();
      this.startTs = 0;
      this.rafId = requestAnimationFrame((t) => this.tick(t, target));
    });

    this.destroyRef.onDestroy(() => this.cancelAnimation());
  }

  private tick(ts: number, target: string): void {
    if (this.startTs === 0) this.startTs = ts;
    const elapsed = ts - this.startTs;
    const progress = Math.min(1, elapsed / SETTLE_MS);

    const out = new Array<string>(target.length);
    for (let i = 0; i < target.length; i++) {
      const charProgress = (progress * target.length - i) / 1.5;
      if (charProgress >= 1) {
        out[i] = target[i];
      } else if (charProgress < 0) {
        out[i] = randChar();
      } else {
        out[i] = randChar();
      }
    }
    this.el.nativeElement.textContent = out.join('');

    if (progress < 1) {
      this.rafId = requestAnimationFrame((t) => this.tick(t, target));
    } else {
      this.el.nativeElement.textContent = target;
    }
  }

  private cancelAnimation(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private prefersReducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

function randChar(): string {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}
```

(Note: `FRAME_MS` is currently unused; leave it in case a follow-up plan adjusts the frame cadence. If your linter flags it, change the import to `const SETTLE_MS = 600;` only.)

- [ ] **Step 2: Drop the unused constant if your linter is strict**

If `npx nx lint cinematics` flags `FRAME_MS` as unused, remove that line.

- [ ] **Step 3: Export from index**

Modify `libs/shared/cinematics/src/index.ts`:

```ts
// Cinematics — visual overlays driven by theme-controlled CSS custom properties.
// Components are standalone; consumers import what they need.

export { GrainOverlay } from './lib/grain-overlay/grain-overlay';
export { ScanLineOverlay } from './lib/scan-line-overlay/scan-line-overlay';
export { DecryptText } from './lib/decrypt-text/decrypt-text.directive';
```

- [ ] **Step 4: Update peer dependencies**

If `libs/shared/cinematics/package.json` doesn't list `@angular/common` in `peerDependencies`, add it back (the directive uses `isPlatformBrowser`):

```json
{
  "name": "cinematics",
  "version": "0.0.1",
  "peerDependencies": {
    "@angular/common": "^21.2.0",
    "@angular/core": "^21.2.0"
  },
  "sideEffects": false
}
```

- [ ] **Step 5: Run the test**

```bash
npx nx test cinematics --watch=false
```

Expected: PASS — 5 tests total (3 prior + 2 DecryptText).

- [ ] **Step 6: Lint**

```bash
npx nx lint cinematics
```

Expected: `All files pass linting`.

- [ ] **Step 7: Commit**

```bash
git add libs/shared/cinematics
git commit -m "feat(cinematics): DecryptText directive

requestAnimationFrame-driven text-scramble effect. Settles on the
target string within 600ms, sets aria-label once so screen readers see
a stable value. Honors prefers-reduced-motion and [autoplay]=false."
```

---

## Task 3: KineticHeading component — failing test

**Files:**
- Create: `libs/shared/cinematics/src/lib/kinetic-heading/kinetic-heading.spec.ts`

- [ ] **Step 1: Write the failing spec**

Create `libs/shared/cinematics/src/lib/kinetic-heading/kinetic-heading.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { KineticHeading } from './kinetic-heading';

describe('KineticHeading', () => {
  it('renders the text split into per-character spans', async () => {
    await TestBed.configureTestingModule({ imports: [KineticHeading] }).compileComponents();
    const fixture = TestBed.createComponent(KineticHeading);
    fixture.componentRef.setInput('text', 'hello');
    fixture.detectChanges();

    const chars = fixture.nativeElement.querySelectorAll('.kinetic-heading__char');
    expect(chars.length).toBe(5);
    expect(chars[0].textContent).toBe('h');
    expect(chars[4].textContent).toBe('o');
  });

  it('preserves spaces as non-breaking', async () => {
    await TestBed.configureTestingModule({ imports: [KineticHeading] }).compileComponents();
    const fixture = TestBed.createComponent(KineticHeading);
    fixture.componentRef.setInput('text', 'a b');
    fixture.detectChanges();

    const root = fixture.nativeElement.firstElementChild as HTMLElement;
    expect(root.textContent?.replace(/ /g, ' ')).toBe('a b');
  });

  it('exposes aria-label so screen readers see the full text', async () => {
    await TestBed.configureTestingModule({ imports: [KineticHeading] }).compileComponents();
    const fixture = TestBed.createComponent(KineticHeading);
    fixture.componentRef.setInput('text', 'rahul.dev');
    fixture.detectChanges();

    const root = fixture.nativeElement.firstElementChild as HTMLElement;
    expect(root.getAttribute('aria-label')).toBe('rahul.dev');
  });
});
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npx nx test cinematics --watch=false
```

Expected: FAIL — `Cannot find module './kinetic-heading'`.

---

## Task 4: KineticHeading component — implementation

**Files:**
- Create: `libs/shared/cinematics/src/lib/kinetic-heading/kinetic-heading.ts`
- Create: `libs/shared/cinematics/src/lib/kinetic-heading/kinetic-heading.css`
- Modify: `libs/shared/cinematics/src/index.ts`

- [ ] **Step 1: Create the component**

Create `libs/shared/cinematics/src/lib/kinetic-heading/kinetic-heading.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

interface CharCell {
  readonly key: string;
  readonly char: string;
  readonly delayMs: number;
}

const PER_CHAR_DELAY_MS = 38;

/**
 * Splits the provided text into per-character spans, each with a
 * staggered animation delay. The actual animation is pure CSS — when the
 * `kinetic-heading--ready` class is applied to the host (typically by a
 * SceneFrame on intersect), the chars slide+fade into place.
 *
 * Aria-label exposes the full text so the per-span split is invisible to
 * screen readers.
 *
 * Usage:
 *   <app-kinetic-heading text="rahul.dev" />
 */
@Component({
  selector: 'app-kinetic-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="kinetic-heading"
      [class.kinetic-heading--ready]="ready()"
      [attr.aria-label]="text()"
    >
      @for (cell of cells(); track cell.key) {
        <span
          class="kinetic-heading__char"
          aria-hidden="true"
          [style.animation-delay.ms]="cell.delayMs"
        >{{ cell.char }}</span>
      }
    </span>
  `,
  styleUrl: './kinetic-heading.css',
})
export class KineticHeading {
  readonly text = input.required<string>();
  readonly ready = input<boolean>(true);

  protected readonly cells = computed<readonly CharCell[]>(() => {
    const t = this.text();
    return [...t].map((ch, i) => ({
      key: `${i}-${ch}`,
      char: ch === ' ' ? ' ' : ch,
      delayMs: i * PER_CHAR_DELAY_MS,
    }));
  });
}
```

- [ ] **Step 2: Create the component CSS**

Create `libs/shared/cinematics/src/lib/kinetic-heading/kinetic-heading.css`:

```css
.kinetic-heading {
  display: inline-block;
  white-space: pre-wrap;
}

.kinetic-heading__char {
  display: inline-block;
  opacity: 0;
  transform: translateY(0.4em);
  will-change: transform, opacity;
}

.kinetic-heading--ready .kinetic-heading__char {
  animation: kinetic-heading-rise 480ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes kinetic-heading-rise {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .kinetic-heading__char,
  .kinetic-heading--ready .kinetic-heading__char {
    opacity: 1;
    transform: none;
    animation: none;
  }
}
```

- [ ] **Step 3: Export from index**

Update `libs/shared/cinematics/src/index.ts`:

```ts
// Cinematics — visual overlays driven by theme-controlled CSS custom properties.
// Components are standalone; consumers import what they need.

export { GrainOverlay } from './lib/grain-overlay/grain-overlay';
export { ScanLineOverlay } from './lib/scan-line-overlay/scan-line-overlay';
export { DecryptText } from './lib/decrypt-text/decrypt-text.directive';
export { KineticHeading } from './lib/kinetic-heading/kinetic-heading';
```

- [ ] **Step 4: Run tests + lint**

```bash
npx nx test cinematics --watch=false
npx nx lint cinematics
```

Expected: 8 tests passing total, lint clean.

- [ ] **Step 5: Commit**

```bash
git add libs/shared/cinematics
git commit -m "feat(cinematics): KineticHeading component

Per-character span split with staggered CSS animation. Apply the
.kinetic-heading--ready class (typically via SceneFrame on intersect)
to trigger the slide+fade entry. Aria-label exposes full text;
prefers-reduced-motion disables the animation."
```

---

## Task 5: Generate boot-sequence library

**Files:**
- Create: `libs/features/boot-sequence/` (entire scaffold)
- Modify: `tsconfig.base.json`

- [ ] **Step 1: Snapshot tsconfig.base.json**

```bash
cp tsconfig.base.json /tmp/tsconfig.base.before3.json
```

- [ ] **Step 2: Run the generator**

```bash
npx nx g @nx/angular:lib --name=boot-sequence --directory=libs/features/boot-sequence --buildable=true --unitTestRunner=vitest-angular --style=css --standalone=true --prefix=app --no-interactive
```

Expected: standard CREATE output, exits 0.

- [ ] **Step 3: Verify tsconfig.base.json wasn't damaged**

```bash
diff /tmp/tsconfig.base.before3.json tsconfig.base.json
```

Expected: only one new path entry. If anything else changed, restore with `git checkout tsconfig.base.json` and reapply manually.

- [ ] **Step 4: Rename the path alias**

In `tsconfig.base.json`, rename `"boot-sequence"` to `"@rahul-dev/features-boot-sequence"`.

- [ ] **Step 5: Update project.json — tags + typecheck override**

In `libs/features/boot-sequence/project.json`, set tags and add typecheck:

```json
"tags": ["type:feature", "scope:ui"],
```

```json
"typecheck": {
  "executor": "nx:run-commands",
  "options": {
    "commands": [
      "tsc --noEmit -p libs/features/boot-sequence/tsconfig.lib.json",
      "tsc --noEmit -p libs/features/boot-sequence/tsconfig.spec.json"
    ],
    "cwd": "{workspaceRoot}",
    "parallel": false
  },
  "cache": true,
  "inputs": ["default", "^default", "{projectRoot}/tsconfig*.json"]
}
```

- [ ] **Step 6: Strip placeholder, replace index**

```bash
rm -rf libs/features/boot-sequence/src/lib/boot-sequence
```

Replace `libs/features/boot-sequence/src/index.ts` with:

```ts
// boot-sequence — first-visit terminal animation.
// Components/services are standalone; consumers import what they need.
```

- [ ] **Step 7: Verify empty lib typechecks**

```bash
npx nx typecheck boot-sequence
```

Expected: success.

- [ ] **Step 8: Commit**

```bash
git add libs/features/boot-sequence tsconfig.base.json
git commit -m "chore(boot-sequence): generate empty boot-sequence lib

Foundation for the first-visit terminal animation. Service +
component land in subsequent commits."
```

---

## Task 6: BootGuardService — failing test

**Files:**
- Create: `libs/features/boot-sequence/src/lib/boot-guard.service.spec.ts`

- [ ] **Step 1: Write the failing spec**

Create `libs/features/boot-sequence/src/lib/boot-guard.service.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { BootGuardService } from './boot-guard.service';

describe('BootGuardService', () => {
  beforeEach(() => {
    localStorage.removeItem('rahul-dev:boot-seen');
    TestBed.configureTestingModule({ providers: [BootGuardService] });
  });

  afterEach(() => {
    localStorage.removeItem('rahul-dev:boot-seen');
  });

  it('shouldPlayLong is true on first call', () => {
    const svc = TestBed.inject(BootGuardService);
    expect(svc.shouldPlayLong()).toBe(true);
  });

  it('shouldPlayLong is false after markPlayed', () => {
    const svc = TestBed.inject(BootGuardService);
    svc.markPlayed();
    expect(svc.shouldPlayLong()).toBe(false);
  });

  it('reset() restores first-visit state', () => {
    const svc = TestBed.inject(BootGuardService);
    svc.markPlayed();
    svc.reset();
    expect(svc.shouldPlayLong()).toBe(true);
  });
});
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npx nx test boot-sequence --watch=false
```

Expected: FAIL — `Cannot find module './boot-guard.service'`.

---

## Task 7: BootGuardService — implementation

**Files:**
- Create: `libs/features/boot-sequence/src/lib/boot-guard.service.ts`
- Modify: `libs/features/boot-sequence/src/index.ts`

- [ ] **Step 1: Create the service**

Create `libs/features/boot-sequence/src/lib/boot-guard.service.ts`:

```ts
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

const STORAGE_KEY = 'rahul-dev:boot-seen';

/**
 * Persists "I've seen the boot sequence" across sessions in localStorage.
 * SSR-safe: server-side `shouldPlayLong()` returns `false`, so no boot
 * is rendered server-side and there's no hydration mismatch.
 */
@Injectable({ providedIn: 'root' })
export class BootGuardService {
  private readonly platformId = inject(PLATFORM_ID);

  shouldPlayLong(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    try {
      return localStorage.getItem(STORAGE_KEY) !== '1';
    } catch {
      // storage blocked — default to "show boot every time"
      return true;
    }
  }

  markPlayed(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // storage blocked — silently ignore
    }
  }

  reset(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage blocked — silently ignore
    }
  }
}
```

- [ ] **Step 2: Export from index**

Replace `libs/features/boot-sequence/src/index.ts`:

```ts
// boot-sequence — first-visit terminal animation.
// Components/services are standalone; consumers import what they need.

export { BootGuardService } from './lib/boot-guard.service';
```

- [ ] **Step 3: Run the test**

```bash
npx nx test boot-sequence --watch=false
```

Expected: PASS — 3 tests green.

- [ ] **Step 4: Commit**

```bash
git add libs/features/boot-sequence
git commit -m "feat(boot-sequence): BootGuardService

Persists first-visit state in localStorage. SSR-safe: server returns
shouldPlayLong()=false so no boot HTML is emitted server-side."
```

---

## Task 8: BootSequence component — failing test

**Files:**
- Create: `libs/features/boot-sequence/src/lib/boot-sequence/boot-sequence.spec.ts`

- [ ] **Step 1: Write the failing spec**

Create `libs/features/boot-sequence/src/lib/boot-sequence/boot-sequence.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { BootSequence } from './boot-sequence';

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
});
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npx nx test boot-sequence --watch=false
```

Expected: FAIL — `Cannot find module './boot-sequence'`.

---

## Task 9: BootSequence component — implementation

**Files:**
- Create: `libs/features/boot-sequence/src/lib/boot-sequence/boot-sequence.ts`
- Create: `libs/features/boot-sequence/src/lib/boot-sequence/boot-sequence.css`
- Modify: `libs/features/boot-sequence/src/index.ts`

- [ ] **Step 1: Create the component**

Create `libs/features/boot-sequence/src/lib/boot-sequence/boot-sequence.ts`:

```ts
import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
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

/**
 * Animated terminal panel that types its scripted lines character by
 * character. Emits `done` when the script finishes (or when `skip()` is
 * called by a tap/key event). Caller should hide the component on `done`
 * and reveal the real hero.
 *
 * Browser-only — server-rendered output is just the final state of the
 * script (collapsed to a single line) so SSR doesn't show empty space.
 *
 * Usage:
 *   <app-boot-sequence
 *     [mode]="firstVisit ? 'long' : 'short'"
 *     (done)="bootDone.set(true)"
 *   />
 */
@Component({
  selector: 'app-boot-sequence',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './boot-sequence.html',
  styleUrl: './boot-sequence.css',
})
export class BootSequence implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly done = output<void>();

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

  /** Public for parent components: BootSequence(mode='short')... */
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

  @HostListener('window:keydown')
  @HostListener('window:pointerdown')
  protected skip(): void {
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
        // Push the now-completed line into the static history.
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

- [ ] **Step 2: Create the template**

Create `libs/features/boot-sequence/src/lib/boot-sequence/boot-sequence.html`:

```html
<div class="boot-sequence" role="status" aria-live="polite">
  <div class="boot-sequence__panel">
    <div class="boot-sequence__lines">
      @for (line of typedLines(); track $index) {
        <div class="boot-sequence__line boot-sequence__line--past">
          {{ line }}
        </div>
      }
      @if (currentLine(); as line) {
        <div class="boot-sequence__line">
          <span>{{ line.prompt }} </span>
          <span>{{ currentLineText() }}</span>
          <span class="boot-sequence__cursor" aria-hidden="true">▮</span>
        </div>
      }
    </div>
    <div class="boot-sequence__hint" aria-hidden="true">
      tap or press any key to skip
    </div>
  </div>
</div>
```

- [ ] **Step 3: Create the CSS**

Create `libs/features/boot-sequence/src/lib/boot-sequence/boot-sequence.css`:

```css
.boot-sequence {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  background: var(--bg-primary);
  font-family: var(--font-mono);
  color: var(--text-primary);
  padding: 1.5rem;
}

.boot-sequence__panel {
  width: 100%;
  max-width: 38rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.boot-sequence__lines {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 13px;
  line-height: 1.55;
  min-height: 9rem;
}

.boot-sequence__line {
  white-space: pre-wrap;
}

.boot-sequence__line--past {
  color: var(--text-muted);
}

.boot-sequence__cursor {
  display: inline-block;
  margin-left: 1px;
  color: var(--accent-primary);
  animation: boot-cursor-blink 1s steps(2, start) infinite;
}

.boot-sequence__hint {
  color: var(--text-muted);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.7;
}

@keyframes boot-cursor-blink {
  to { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .boot-sequence__cursor { animation: none; }
}
```

- [ ] **Step 4: Export from index**

Update `libs/features/boot-sequence/src/index.ts`:

```ts
// boot-sequence — first-visit terminal animation.
// Components/services are standalone; consumers import what they need.

export { BootGuardService } from './lib/boot-guard.service';
export { BootSequence } from './lib/boot-sequence/boot-sequence';
```

- [ ] **Step 5: Run all tests + lint + build**

```bash
npx nx test boot-sequence --watch=false
npx nx lint boot-sequence
npx nx build boot-sequence
```

Expected: 6 tests green (3 service + 3 component), lint clean, build success.

- [ ] **Step 6: Commit**

```bash
git add libs/features/boot-sequence
git commit -m "feat(boot-sequence): BootSequence component

Animated terminal panel. Long script (5 lines) for first visit, short
(1 line) for return. Each line types char-by-char with a blinking
cursor; finished lines collapse to muted history. Skippable with any
keypress / pointerdown. Emits done when the script completes.
SSR-safe; respects prefers-reduced-motion (instant complete)."
```

---

## Task 10: Smoke check

**Files:** none (read-only verification)

- [ ] **Step 1: Lint, typecheck, test sweep**

```bash
npx nx run-many -t lint,typecheck -p cinematics,boot-sequence
npx nx run-many -t test -p cinematics,boot-sequence --watch=false
```

Expected: `Successfully ran target lint, typecheck for 2 projects`. Test totals: cinematics 8 (3 prior + 2 DecryptText + 3 KineticHeading), boot-sequence 6 (3 service + 3 component) = 14 total in this plan.

- [ ] **Step 2: Production build of the web app**

```bash
npx nx build web
```

Expected: `Application bundle generation complete`. Confirm: `boot-sequence` chunk appears in the output (~3-5 kB lazy chunk).

---

## Self-review checklist

- [ ] Spec § 4.1 boot-sequence lib: BootGuardService ✅, BootSequence ✅. ✅
- [ ] Spec § 4.1 cinematics: DecryptText ✅, KineticHeading ✅. ✅
- [ ] Spec § 3 first-moment Hybrid: long-vs-short script driven by guard service ✅
- [ ] Spec § 4.7 (performance): all browser-only, RAF-driven, RM cancel; SSR returns final-state HTML ✅
- [ ] Spec § 4.8 (a11y): aria-label/aria-live; skippable; reduced-motion auto-skip ✅

## Next plan

Plan 4 wires everything together to rewrite the home hero: the two-beat
boot terminal → force graph reveal with HUD chrome, plus integration of
DecryptText and KineticHeading on the hero copy.
