# KPR-verse Makeover — Plan 2: Scene-Frame Infrastructure

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the scroll-locked-scene primitives — a new buildable lib with `SceneFrame` directive (intersection-driven scene reveals), `SceneScrollLock` directive (CSS scroll-snap on a host container, auto-disabled below 768px or under reduced-motion), and `MarqueeBand` component (ASCII status strip between scenes). Lib is opt-in; no page consumes it yet — wiring lands in Plans 4–6.

**Architecture:** New buildable lib `libs/features/scene-frame`. Two standalone directives + one standalone component, all browser-only-safe (`isPlatformBrowser` guarded where applicable). Directives use the standard `IntersectionObserver` and `matchMedia` patterns already established in `libs/shared/ui/reveal.directive.ts` and `libs/shared/ui/scroll-to-top`.

**Tech Stack:** Angular 21 standalone APIs, IntersectionObserver, CSS scroll-snap, vitest-angular for tests.

**Spec reference:** `docs/superpowers/specs/2026-04-27-kprverse-makeover-design.md` § 4.1 (`scene-frame` lib block), § 4.2, § 4.7, § 4.8.

---

## File Structure

**Created:**
- `libs/features/scene-frame/` — new buildable lib (generated)
- `libs/features/scene-frame/src/lib/scene-frame/scene-frame.directive.ts`
- `libs/features/scene-frame/src/lib/scene-frame/scene-frame.directive.spec.ts`
- `libs/features/scene-frame/src/lib/scene-scroll-lock/scene-scroll-lock.directive.ts`
- `libs/features/scene-frame/src/lib/scene-scroll-lock/scene-scroll-lock.directive.spec.ts`
- `libs/features/scene-frame/src/lib/marquee-band/marquee-band.ts`
- `libs/features/scene-frame/src/lib/marquee-band/marquee-band.css`
- `libs/features/scene-frame/src/lib/marquee-band/marquee-band.spec.ts`

**Modified:**
- `tsconfig.base.json` — path alias added by generator, then renamed to `@rahul-dev/features-scene-frame`
- `libs/features/scene-frame/project.json` — typecheck override added
- `libs/features/scene-frame/src/index.ts` — exports
- `libs/features/scene-frame/package.json` — drop unused `@angular/common` peer

---

## Task 1: Generate the scene-frame library

**Files:**
- Create: `libs/features/scene-frame/` (entire scaffold)
- Modify: `tsconfig.base.json`
- Modify: `libs/features/scene-frame/project.json`
- Modify: `libs/features/scene-frame/package.json`
- Modify: `libs/features/scene-frame/src/index.ts`

- [ ] **Step 1: Snapshot tsconfig.base.json before generating**

```bash
cp tsconfig.base.json /tmp/tsconfig.base.before.json
```

- [ ] **Step 2: Run the generator with the required flags**

```bash
npx nx g @nx/angular:lib --name=scene-frame --directory=libs/features/scene-frame --buildable=true --unitTestRunner=vitest-angular --style=css --standalone=true --prefix=app --no-interactive
```

Expected: prints `CREATE` lines for project.json, ng-package.json, package.json, README.md, tsconfig.*.json, src/index.ts, src/lib/scene-frame/{scene-frame.spec.ts,.ts,.css,.html}, eslint.config.mjs. Exits 0.

- [ ] **Step 3: Verify tsconfig.base.json wasn't damaged**

```bash
diff /tmp/tsconfig.base.before.json tsconfig.base.json
```

Expected: a single added paths entry. If `composite`, `emitDeclarationOnly`, `declarationMap`, `customConditions`, `"module": "nodenext"`, or a top-level `references` array reappeared, run `git checkout tsconfig.base.json` and reapply the path manually.

- [ ] **Step 4: Rename the path alias to follow project convention**

Open `tsconfig.base.json`. The generator added a line like `"scene-frame": ["libs/features/scene-frame/src/index.ts"]`. Rename the key:

```json
"@rahul-dev/features-scene-frame": ["libs/features/scene-frame/src/index.ts"]
```

- [ ] **Step 5: Update project.json — tags + typecheck override**

Open `libs/features/scene-frame/project.json`. Replace the `"tags": []` line with:

```json
"tags": ["type:feature", "scope:ui"],
```

Append a `typecheck` target inside `targets`, after `lint`:

```json
"typecheck": {
  "executor": "nx:run-commands",
  "options": {
    "commands": [
      "tsc --noEmit -p libs/features/scene-frame/tsconfig.lib.json",
      "tsc --noEmit -p libs/features/scene-frame/tsconfig.spec.json"
    ],
    "cwd": "{workspaceRoot}",
    "parallel": false
  },
  "cache": true,
  "inputs": ["default", "^default", "{projectRoot}/tsconfig*.json"]
}
```

- [ ] **Step 6: Drop unused `@angular/common` peer**

Open `libs/features/scene-frame/package.json`. Remove the `"@angular/common"` line from `peerDependencies`. Keep `"@angular/core"`. The lib only uses core APIs.

- [ ] **Step 7: Strip the placeholder component**

```bash
rm -rf libs/features/scene-frame/src/lib/scene-frame
```

(That directory was the generator's placeholder. The real `scene-frame.directive.ts` we add later goes in a sibling folder.)

Replace `libs/features/scene-frame/src/index.ts` with:

```ts
// scene-frame — primitives for scroll-locked cinematic panels.
// Components/directives are standalone; consumers import what they need.
```

- [ ] **Step 8: Verify the empty lib typechecks**

```bash
npx nx typecheck scene-frame
```

Expected: `Successfully ran target typecheck for project scene-frame`.

- [ ] **Step 9: Commit**

```bash
git add libs/features/scene-frame tsconfig.base.json
git commit -m "chore(scene-frame): generate empty scene-frame lib

Foundation for scroll-locked panel scenes. SceneFrame +
SceneScrollLock directives and MarqueeBand component land in the next
commits."
```

---

## Task 2: SceneFrame directive — failing test

**Files:**
- Create: `libs/features/scene-frame/src/lib/scene-frame/scene-frame.directive.spec.ts`

- [ ] **Step 1: Write the failing spec**

Create `libs/features/scene-frame/src/lib/scene-frame/scene-frame.directive.spec.ts`:

```ts
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SceneFrame } from './scene-frame.directive';

@Component({
  selector: 'host-cmp',
  imports: [SceneFrame],
  template: `<section appSceneFrame (sceneEnter)="entered = true">scene</section>`,
})
class HostCmp {
  entered = false;
}

describe('SceneFrame', () => {
  it('attaches to a host element without errors', async () => {
    await TestBed.configureTestingModule({ imports: [HostCmp] }).compileComponents();
    const fixture = TestBed.createComponent(HostCmp);
    fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('section');
    expect(section).not.toBeNull();
  });

  it('does not fire sceneEnter synchronously on mount', async () => {
    await TestBed.configureTestingModule({ imports: [HostCmp] }).compileComponents();
    const fixture = TestBed.createComponent(HostCmp);
    fixture.detectChanges();
    expect(fixture.componentInstance.entered).toBe(false);
  });
});
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npx nx test scene-frame --watch=false
```

Expected: FAIL — `Cannot find module './scene-frame.directive'` or `Cannot find name 'SceneFrame'`.

---

## Task 3: SceneFrame directive — implementation

**Files:**
- Create: `libs/features/scene-frame/src/lib/scene-frame/scene-frame.directive.ts`
- Modify: `libs/features/scene-frame/src/index.ts`

- [ ] **Step 1: Create the directive**

Create `libs/features/scene-frame/src/lib/scene-frame/scene-frame.directive.ts`:

```ts
import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  inject,
  input,
  output,
} from '@angular/core';

/**
 * Wraps a section element. Fires `sceneEnter` exactly once when the host
 * crosses the configured intersection threshold, then disconnects the
 * observer. Designed for cinematic "scene reveals" — boot animations
 * triggered by scroll, decrypt-text resolves, kinetic heading entries.
 *
 * SSR-safe: no-ops on the server.
 *
 * Usage:
 *   <section appSceneFrame (sceneEnter)="onEnter()" [threshold]="0.35">…</section>
 */
@Directive({ selector: '[appSceneFrame]', standalone: true })
export class SceneFrame {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly threshold = input<number>(0.35);
  readonly rootMargin = input<string>('0px 0px -10% 0px');
  readonly sceneEnter = output<void>();

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const host = this.el.nativeElement;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          this.sceneEnter.emit();
        }
      },
      { threshold: this.threshold(), rootMargin: this.rootMargin() },
    );
    observer.observe(host);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
```

- [ ] **Step 2: Export from the lib index**

Replace `libs/features/scene-frame/src/index.ts`:

```ts
// scene-frame — primitives for scroll-locked cinematic panels.
// Components/directives are standalone; consumers import what they need.

export { SceneFrame } from './lib/scene-frame/scene-frame.directive';
```

- [ ] **Step 3: Run the test to confirm it passes**

```bash
npx nx test scene-frame --watch=false
```

Expected: PASS — both `SceneFrame` tests green.

- [ ] **Step 4: Commit**

```bash
git add libs/features/scene-frame/src/lib/scene-frame libs/features/scene-frame/src/index.ts
git commit -m "feat(scene-frame): SceneFrame directive

One-shot intersection observer that fires sceneEnter when the host
becomes visible. Disconnects after firing — no flutter, no per-frame
work. SSR-safe."
```

---

## Task 4: SceneScrollLock directive — failing test

**Files:**
- Create: `libs/features/scene-frame/src/lib/scene-scroll-lock/scene-scroll-lock.directive.spec.ts`

- [ ] **Step 1: Write the failing spec**

Create `libs/features/scene-frame/src/lib/scene-scroll-lock/scene-scroll-lock.directive.spec.ts`:

```ts
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SceneScrollLock } from './scene-scroll-lock.directive';

@Component({
  selector: 'host-cmp',
  imports: [SceneScrollLock],
  template: `<main appSceneScrollLock>content</main>`,
})
class HostCmp {}

describe('SceneScrollLock', () => {
  it('applies the scroll-lock class to the host', async () => {
    await TestBed.configureTestingModule({ imports: [HostCmp] }).compileComponents();
    const fixture = TestBed.createComponent(HostCmp);
    fixture.detectChanges();
    const main = fixture.nativeElement.querySelector('main') as HTMLElement;
    expect(main.classList.contains('scene-scroll-lock')).toBe(true);
  });

  it('removes the lock class when [disabled] is true', async () => {
    @Component({
      selector: 'host-cmp-disabled',
      imports: [SceneScrollLock],
      template: `<main appSceneScrollLock [disabled]="true">content</main>`,
    })
    class DisabledHost {}

    await TestBed.configureTestingModule({ imports: [DisabledHost] }).compileComponents();
    const fixture = TestBed.createComponent(DisabledHost);
    fixture.detectChanges();
    const main = fixture.nativeElement.querySelector('main') as HTMLElement;
    expect(main.classList.contains('scene-scroll-lock')).toBe(false);
  });
});
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npx nx test scene-frame --watch=false
```

Expected: FAIL — `Cannot find module './scene-scroll-lock.directive'`.

---

## Task 5: SceneScrollLock directive — implementation

**Files:**
- Create: `libs/features/scene-frame/src/lib/scene-scroll-lock/scene-scroll-lock.directive.ts`
- Modify: `libs/features/scene-frame/src/index.ts`

- [ ] **Step 1: Create the directive**

Create `libs/features/scene-frame/src/lib/scene-scroll-lock/scene-scroll-lock.directive.ts`:

```ts
import {
  Directive,
  ElementRef,
  effect,
  inject,
  input,
} from '@angular/core';

/**
 * Toggles a `.scene-scroll-lock` class on the host element. The actual
 * scroll-snap CSS lives in the consuming app's stylesheet (or the host
 * page's CSS) — this directive is just the wiring.
 *
 * The recommended global rule:
 *
 *   .scene-scroll-lock {
 *     scroll-snap-type: y mandatory;
 *     scroll-behavior: smooth;
 *   }
 *   .scene-scroll-lock > * {
 *     scroll-snap-align: start;
 *     scroll-snap-stop: always;
 *     min-height: 100dvh;
 *   }
 *   @media (max-width: 767px), (prefers-reduced-motion: reduce) {
 *     .scene-scroll-lock { scroll-snap-type: none; }
 *     .scene-scroll-lock > * { min-height: 0; }
 *   }
 *
 * Usage:
 *   <main appSceneScrollLock [disabled]="!enabled()">…</main>
 */
@Directive({ selector: '[appSceneScrollLock]', standalone: true })
export class SceneScrollLock {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly disabled = input<boolean>(false);

  constructor() {
    effect(() => {
      const host = this.el.nativeElement;
      if (this.disabled()) host.classList.remove('scene-scroll-lock');
      else host.classList.add('scene-scroll-lock');
    });
  }
}
```

- [ ] **Step 2: Export from the lib index**

Update `libs/features/scene-frame/src/index.ts`:

```ts
// scene-frame — primitives for scroll-locked cinematic panels.
// Components/directives are standalone; consumers import what they need.

export { SceneFrame } from './lib/scene-frame/scene-frame.directive';
export { SceneScrollLock } from './lib/scene-scroll-lock/scene-scroll-lock.directive';
```

- [ ] **Step 3: Run the tests**

```bash
npx nx test scene-frame --watch=false
```

Expected: PASS — 4 tests green (2 SceneFrame + 2 SceneScrollLock).

- [ ] **Step 4: Commit**

```bash
git add libs/features/scene-frame/src/lib/scene-scroll-lock libs/features/scene-frame/src/index.ts
git commit -m "feat(scene-frame): SceneScrollLock directive

Adds/removes a .scene-scroll-lock class on the host based on a
[disabled] input. Consumers ship the snap-CSS; this directive is just
the toggle. Auto-disabled CSS for <768px and prefers-reduced-motion is
documented in the directive comment."
```

---

## Task 6: MarqueeBand component — failing test

**Files:**
- Create: `libs/features/scene-frame/src/lib/marquee-band/marquee-band.spec.ts`

- [ ] **Step 1: Write the failing spec**

Create `libs/features/scene-frame/src/lib/marquee-band/marquee-band.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { MarqueeBand } from './marquee-band';

describe('MarqueeBand', () => {
  it('renders the label content as ASCII strip', async () => {
    await TestBed.configureTestingModule({ imports: [MarqueeBand] }).compileComponents();
    const fixture = TestBed.createComponent(MarqueeBand);
    fixture.componentRef.setInput('label', 'SCENE 02 / projects');
    fixture.detectChanges();

    const root = fixture.nativeElement.firstElementChild as HTMLElement;
    expect(root.classList.contains('marquee-band')).toBe(true);
    expect(root.getAttribute('aria-hidden')).toBe('true');
    expect(root.textContent).toContain('SCENE 02 / projects');
  });

  it('repeats the label so the strip stays full-width', async () => {
    await TestBed.configureTestingModule({ imports: [MarqueeBand] }).compileComponents();
    const fixture = TestBed.createComponent(MarqueeBand);
    fixture.componentRef.setInput('label', 'X');
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.marquee-band__item');
    expect(items.length).toBeGreaterThan(1);
  });
});
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npx nx test scene-frame --watch=false
```

Expected: FAIL — `Cannot find module './marquee-band'`.

---

## Task 7: MarqueeBand component — implementation

**Files:**
- Create: `libs/features/scene-frame/src/lib/marquee-band/marquee-band.ts`
- Create: `libs/features/scene-frame/src/lib/marquee-band/marquee-band.css`
- Modify: `libs/features/scene-frame/src/index.ts`

- [ ] **Step 1: Create the component**

Create `libs/features/scene-frame/src/lib/marquee-band/marquee-band.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * ASCII status strip rendered between scenes. Auto-pauses off-screen via
 * pure CSS `animation-play-state: paused` — no JS observer needed.
 *
 * Repeats the label enough times to cover any reasonable viewport width;
 * the container is overflow-hidden, the inner is animation-translated.
 *
 * Usage:
 *   <app-marquee-band label="SCENE 02 / projects" />
 */
@Component({
  selector: 'app-marquee-band',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="marquee-band" aria-hidden="true">
      <div class="marquee-band__track">
        @for (i of repeats(); track i) {
          <span class="marquee-band__item">{{ separator() }} {{ label() }} </span>
        }
      </div>
    </div>
  `,
  styleUrl: './marquee-band.css',
})
export class MarqueeBand {
  readonly label = input.required<string>();
  readonly separator = input<string>('//');
  /**
   * How many copies of the label to render. Default 12 covers ultrawide
   * monitors with a 12-character label; consumers can override for very
   * short or very long labels.
   */
  readonly count = input<number>(12);

  protected readonly repeats = computed(() =>
    Array.from({ length: this.count() }, (_, i) => i),
  );
}
```

- [ ] **Step 2: Create the component CSS**

Create `libs/features/scene-frame/src/lib/marquee-band/marquee-band.css`:

```css
.marquee-band {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-block: 1px solid var(--glass-border);
  background: var(--glass-bg);
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1;
  color: var(--text-muted);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  user-select: none;
  pointer-events: none;
}

.marquee-band__track {
  display: inline-flex;
  white-space: nowrap;
  padding-block: 0.55rem;
  animation: marquee-band-scroll 30s linear infinite;
  will-change: transform;
}

.marquee-band__item {
  padding-inline: 0.6rem;
}

@keyframes marquee-band-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-band__track {
    animation: none;
    transform: translateX(0);
  }
}
```

- [ ] **Step 3: Export from the lib index**

Update `libs/features/scene-frame/src/index.ts`:

```ts
// scene-frame — primitives for scroll-locked cinematic panels.
// Components/directives are standalone; consumers import what they need.

export { SceneFrame } from './lib/scene-frame/scene-frame.directive';
export { SceneScrollLock } from './lib/scene-scroll-lock/scene-scroll-lock.directive';
export { MarqueeBand } from './lib/marquee-band/marquee-band';
```

- [ ] **Step 4: Run the tests**

```bash
npx nx test scene-frame --watch=false
```

Expected: PASS — 6 tests total (2 SceneFrame + 2 SceneScrollLock + 2 MarqueeBand).

- [ ] **Step 5: Lint pass**

```bash
npx nx lint scene-frame
```

Expected: `All files pass linting`.

- [ ] **Step 6: Commit**

```bash
git add libs/features/scene-frame/src/lib/marquee-band libs/features/scene-frame/src/index.ts
git commit -m "feat(scene-frame): MarqueeBand component

Pure-CSS ASCII status strip rendered between scenes. Animation runs in
the GPU via translateX, auto-pauses under prefers-reduced-motion. Label
repeats N times so the strip stays full-width on any viewport."
```

---

## Task 8: Smoke check the integrated lib

**Files:** none (read-only verification)

- [ ] **Step 1: Lint, typecheck, test sweep**

```bash
npx nx run-many -t lint,typecheck -p scene-frame
npx nx test scene-frame --watch=false
```

Expected: `Successfully ran target lint, typecheck for project scene-frame`. Test run: `6 passed`.

- [ ] **Step 2: Production build check**

```bash
npx nx build scene-frame
```

Expected: `Successfully ran target build for project scene-frame`.

---

## Self-review checklist

- [ ] Spec § 4.1 (`scene-frame` lib): SceneFrame ✅, SceneScrollLock ✅, MarqueeBand ✅. ✅ no gap.
- [ ] Spec § 4.7 (performance): one IntersectionObserver per scene, disconnects after firing; CSS-only marquee animation; class-toggle directive. ✅
- [ ] Spec § 4.8 (accessibility): all visuals are `aria-hidden`; `prefers-reduced-motion` cancels animation. ✅
- [ ] Spec § 4.2: scroll-snap CSS rule documented in directive comment for consumers in Plans 4–6 to apply. ✅

## Next plan

Plan 3 will introduce `libs/features/boot-sequence` — the on-load terminal animation that types `~$ rahul --whoami` etc., plus the `DecryptText` and `KineticHeading` directives in `shared/cinematics` (deferred from Plan 1). After Plan 3, Plan 4 wires everything together to rewrite the home hero.
