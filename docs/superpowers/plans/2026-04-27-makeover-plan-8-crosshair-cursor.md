# KPR-verse Makeover — Plan 8: Custom Crosshair Cursor

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the desktop-only custom crosshair cursor described in spec § 4.5. Two-layer crosshair (slow-follow outer ring + 1:1 inner dot) wired via a `CrosshairCursor` directive in `shared/cinematics`. Hover targets opt in via `data-cursor="active"`. Disabled on touch devices and under `prefers-reduced-motion`.

**Architecture:** A standalone `CrosshairCursor` directive applied once on the App root. On construction it appends two fixed-position SVG elements to `document.body`, hooks a `pointermove` listener that updates target coords, and runs a `requestAnimationFrame` loop that interpolates the outer ring toward the target with `ease=0.15`. Browser-only (SSR no-ops). On destroy, removes the DOM nodes and cancels the RAF. Hides the system cursor via a single `body.has-crosshair-cursor { cursor: none }` rule the directive toggles. Hover-pulse triggered by attribute selector `body:has([data-cursor="active"]:hover) .crosshair-cursor__outer` — pure CSS, no extra JS.

**Tech Stack:** Angular 21 standalone APIs, signals, `requestAnimationFrame`, `matchMedia`, vitest-angular.

**Spec reference:** `docs/superpowers/specs/2026-04-27-kprverse-makeover-design.md` § 4.5 (Custom cursor), § 4.7 (perf — `transform: translate3d` only, no layout thrash), § 4.8 (a11y — never hide the system cursor while a focus ring is active).

**Out of scope (deferred to a future plan):**
- **Audio services + nav toggles (spec § 4.4).** OGG drone + UI SFX library are out of scope per spec § 7 ("No real audio composition"). Building toggles for a feature that produces no sound creates broken UX. Defer until the asset(s) are sourced.
- Pulse-on-data-cursor-active pure-CSS hover behavior is included; opting individual targets in across the codebase is **not** — consumers can add `data-cursor="active"` themselves where appropriate.

---

## File Structure

**Created:**
- `libs/shared/cinematics/src/lib/crosshair-cursor/crosshair-cursor.directive.ts` — the directive itself.
- `libs/shared/cinematics/src/lib/crosshair-cursor/crosshair-cursor.directive.spec.ts` — assertions: SSR no-op, browser mount creates DOM, destroy removes DOM.

**Modified:**
- `libs/shared/cinematics/src/index.ts` — export `CrosshairCursor`.
- `apps/web/src/styles.css` — global cursor CSS (`body.has-crosshair-cursor { cursor: none }`, fixed-position layers, hover-pulse via `:has()`).
- `apps/web/src/app/app.ts` — import `CrosshairCursor` and add to component imports.
- `apps/web/src/app/app.html` — apply `appCrosshairCursor` to the root `<div>`.

**Note: directive owns DOM, app owns global CSS.** Angular directives can't ship a `styleUrl` (only components can), and the cursor's CSS rules need to live globally (they target `body` and `document`-mounted elements, not a component's view). The directive creates the layers + adds the body class; the consumer app's `styles.css` styles them. Same separation as `SceneScrollLock` in Plan 5.

---

## Task 1: CrosshairCursor — failing test

**Files:**
- Create: `libs/shared/cinematics/src/lib/crosshair-cursor/crosshair-cursor.directive.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CrosshairCursor } from './crosshair-cursor.directive';

@Component({
  selector: 'app-crosshair-host',
  imports: [CrosshairCursor],
  template: `<div appCrosshairCursor>host</div>`,
})
class HostCmp {}

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
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npx nx test cinematics --watch=false
```

Expected: FAIL — `Cannot find module './crosshair-cursor.directive'`.

---

## Task 2: CrosshairCursor — implementation

**Files:**
- Create: `libs/shared/cinematics/src/lib/crosshair-cursor/crosshair-cursor.directive.ts`
- Modify: `libs/shared/cinematics/src/index.ts`

(No CSS file in the lib. Global cursor CSS lands in `apps/web/src/styles.css` in Task 3 — the directive owns DOM, the app owns global styling.)

- [ ] **Step 1: Create the directive**

Create `libs/shared/cinematics/src/lib/crosshair-cursor/crosshair-cursor.directive.ts`:

```ts
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  PLATFORM_ID,
  inject,
} from '@angular/core';

const EASE = 0.15;
const OUTER_SIZE = 28;
const INNER_SIZE = 4;

/**
 * Two-layer custom cursor: a slow-follow outer ring + a 1:1 inner dot.
 * Mounted once on the App root via `<div appCrosshairCursor>`.
 *
 * Disabled paths (no DOM mounted, no listeners):
 *  - SSR (no document/window).
 *  - Touch primary input — `(pointer: coarse)` matches.
 *  - User prefers reduced motion — `(prefers-reduced-motion: reduce)`.
 *
 * The system cursor is hidden globally while the directive is active via
 * a `body.has-crosshair-cursor` class. Focus rings remain visible
 * because the system cursor is only hidden, not the focus indicator.
 */
@Directive({ selector: '[appCrosshairCursor]', standalone: true })
export class CrosshairCursor {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  private outer: HTMLDivElement | null = null;
  private inner: HTMLDivElement | null = null;
  private rafId = 0;
  private readonly target = { x: -100, y: -100 };
  private readonly current = { x: -100, y: -100 };

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof window === 'undefined' || !window.matchMedia) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.mount();
  }

  private mount(): void {
    const doc = this.document;

    this.outer = doc.createElement('div');
    this.outer.className = 'crosshair-cursor__layer crosshair-cursor__outer';
    this.outer.setAttribute('aria-hidden', 'true');

    this.inner = doc.createElement('div');
    this.inner.className = 'crosshair-cursor__layer crosshair-cursor__inner';
    this.inner.setAttribute('aria-hidden', 'true');

    doc.body.appendChild(this.outer);
    doc.body.appendChild(this.inner);
    doc.body.classList.add('has-crosshair-cursor');

    const onMove = (e: PointerEvent) => {
      this.target.x = e.clientX;
      this.target.y = e.clientY;
      if (this.inner) {
        this.inner.style.transform = `translate3d(${e.clientX - INNER_SIZE / 2}px, ${e.clientY - INNER_SIZE / 2}px, 0)`;
      }
    };
    doc.addEventListener('pointermove', onMove);

    const tick = () => {
      this.current.x += (this.target.x - this.current.x) * EASE;
      this.current.y += (this.target.y - this.current.y) * EASE;
      if (this.outer) {
        this.outer.style.transform = `translate3d(${this.current.x - OUTER_SIZE / 2}px, ${this.current.y - OUTER_SIZE / 2}px, 0)`;
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);

    this.destroyRef.onDestroy(() => {
      doc.removeEventListener('pointermove', onMove);
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.outer?.remove();
      this.inner?.remove();
      this.outer = null;
      this.inner = null;
      doc.body.classList.remove('has-crosshair-cursor');
    });
  }
}
```

- [ ] **Step 2: Export the directive**

Replace `libs/shared/cinematics/src/index.ts` with:

```ts
// Cinematics — visual overlays driven by theme-controlled CSS custom properties.
// Components are standalone; consumers import what they need.

export { GrainOverlay } from './lib/grain-overlay/grain-overlay';
export { ScanLineOverlay } from './lib/scan-line-overlay/scan-line-overlay';
export { DecryptText } from './lib/decrypt-text/decrypt-text.directive';
export { KineticHeading } from './lib/kinetic-heading/kinetic-heading';
export { CrosshairCursor } from './lib/crosshair-cursor/crosshair-cursor.directive';
```

- [ ] **Step 3: Run the directive tests**

```bash
npx nx test cinematics --watch=false
```

Expected: 11 tests total (8 prior + 3 CrosshairCursor). All pass.

- [ ] **Step 4: Lint**

```bash
npx nx lint cinematics
```

Expected: clean.

- [ ] **Step 5: Build (sanity check — buildable lib stays buildable)**

```bash
npx nx build cinematics
```

Expected: success. Confirms no cross-buildable-lib import was introduced (the directive only uses `@angular/core` and `@angular/common`, both peer deps).

- [ ] **Step 6: Commit**

```bash
git add libs/shared/cinematics
git commit -m "feat(cinematics): CrosshairCursor directive

Two-layer custom cursor (slow-follow ring + 1:1 dot) mounted via
[appCrosshairCursor] on a host element. Browser-only — bails on SSR,
on (pointer: coarse), and on prefers-reduced-motion. Uses
requestAnimationFrame + transform: translate3d only (no layout
thrash). DOM and event listeners removed cleanly on destroy.
Global CSS lands with the App-shell wiring in apps/web/src/styles.css."
```

---

## Task 3: App shell wiring + global CSS

**Files:**
- Modify: `apps/web/src/styles.css` — add the cursor CSS rules.
- Modify: `apps/web/src/app/app.ts` — import `CrosshairCursor` into component imports.
- Modify: `apps/web/src/app/app.html` — apply `appCrosshairCursor` on the root `<div>`.

- [ ] **Step 1: Add the CSS to styles.css**

Append to `apps/web/src/styles.css`:

```css
/* ============ CrosshairCursor — engaged via [appCrosshairCursor] ============ */
body.has-crosshair-cursor,
body.has-crosshair-cursor * {
  cursor: none;
}

/* Focus ring still shows even with system cursor hidden. */
body.has-crosshair-cursor :focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.crosshair-cursor__layer {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 2147483646;
  will-change: transform;
}

.crosshair-cursor__outer {
  width: 28px;
  height: 28px;
  border: 1px solid color-mix(in oklab, var(--accent-primary) 75%, transparent);
  border-radius: 50%;
  transition: width 0.18s ease, height 0.18s ease, border-color 0.18s ease;
}

.crosshair-cursor__inner {
  width: 4px;
  height: 4px;
  background: var(--accent-primary);
  border-radius: 50%;
}

body:has([data-cursor='active']:hover) .crosshair-cursor__outer {
  width: 44px;
  height: 44px;
  border-color: var(--accent-primary);
}
```

- [ ] **Step 2: Update app.ts**

Read the current file. Add `CrosshairCursor` to the cinematics import line and to the `imports` array:

```ts
import {
  CrosshairCursor,
  GrainOverlay,
  ScanLineOverlay,
} from '@rahul-dev/shared-cinematics';
```

```ts
@Component({
  imports: [
    RouterOutlet,
    Navbar,
    Footer,
    OfflineBanner,
    ScrollToTop,
    CommandPaletteOverlay,
    TerminalOverlay,
    ThemeToggle,
    GrainOverlay,
    ScanLineOverlay,
    BootSequence,
    CrosshairCursor,
  ],
  …
})
```

Use `Edit` to make those two narrow changes — don't rewrite the file end-to-end.

- [ ] **Step 3: Update app.html**

Apply the directive on the root container. Replace the opening line:

```html
<div class="min-h-dvh flex flex-col bg-bg-primary text-text-primary">
```

with:

```html
<div appCrosshairCursor class="min-h-dvh flex flex-col bg-bg-primary text-text-primary">
```

- [ ] **Step 4: Run web tests**

```bash
npx nx test web --watch=false
```

Expected: all green. The existing App tests still pass; the directive runs in tests under happy-dom but shouldn't throw — `(pointer: coarse)` evaluates falsy in happy-dom and the directive will mount its DOM. The App spec doesn't assert on the cursor DOM, so the test isn't affected by the extra body children.

If the test setup blows up because happy-dom's `matchMedia` returns `undefined` for the queries we read, the directive's guard (`!window.matchMedia`) catches that and bails — confirming clean behaviour.

- [ ] **Step 5: Typecheck + lint + build**

```bash
npx nx typecheck web
npx nx lint web
npx nx build web
```

Expected: clean.

- [ ] **Step 6: Hand-test**

```bash
npx nx serve web
```

Verify on desktop:
1. The system cursor disappears; a thin cyan circle (28px) follows the mouse with a slight lag, plus a 4px solid dot tracking 1:1 with the pointer.
2. Hover any element you tag with `data-cursor="active"` (e.g. add it to a button briefly via DevTools): the outer ring grows to ~44px and brightens.
3. Tab through the page — focus rings still show because we only hid `cursor`, not the outline.
4. Open DevTools → Rendering → Emulate CSS media `prefers-reduced-motion: reduce`, refresh: the cursor falls back to system default (directive bailed at construction).
5. Open DevTools → Device Mode → toggle a touch device, refresh: cursor falls back to system default.

If any step fails, fix and re-run **Step 4**.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/app/app.ts apps/web/src/app/app.html apps/web/src/styles.css
git commit -m "feat(app): wire CrosshairCursor on the root container

[appCrosshairCursor] directive applied to the App root. Global cursor
CSS (body.has-crosshair-cursor { cursor: none }, two-layer fixed
positions, hover-pulse via :has([data-cursor='active']:hover)) lives
in styles.css per the same pattern as .scene-scroll-lock from Plan 5.
Touch devices and reduced-motion users keep the system cursor — the
directive bails on construct."
```

---

## Task 4: Smoke check + plan index update

**Files:**
- Modify: `docs/superpowers/plans/README.md`

- [ ] **Step 1: Multi-project lint + typecheck**

```bash
npx nx run-many -t lint,typecheck -p web,ui,hero-graph,cinematics
```

Expected: 8 successful targets.

- [ ] **Step 2: Multi-project test**

```bash
npx nx run-many -t test -p web,ui,hero-graph,cinematics --watch=false
```

Expected: cinematics +3 (CrosshairCursor); web/ui/hero-graph unchanged. All green.

- [ ] **Step 3: Production build**

```bash
npx nx build web
```

Expected: clean.

- [ ] **Step 4: Plan index update**

Edit `docs/superpowers/plans/README.md`:

- Status row: flip Plan 8 from `🔜 next` to `✅ shipped` with a "(crosshair only — audio deferred)" note; flip Plan 9 from `⏳ planned` to `🔜 next`.
- Briefing: rewrite Plan 8 with as-shipped commits + the deferred-audio note.

Add a new "**Plan 8.5 (deferred)** — Audio (ambient drone + UI sfx) + nav toggles" entry under the briefings, blocked on asset sourcing.

```bash
git add docs/superpowers/plans/README.md docs/superpowers/plans/2026-04-27-makeover-plan-8-crosshair-cursor.md
git commit -m "docs(plans): mark Plan 8 shipped (crosshair cursor only), Plan 9 next

Audio layer (services + nav toggles) deferred — asset sourcing is out
of scope per spec § 7. Plan 8 ships only the CrosshairCursor as a
fully-working independent feature."
```

---

## Self-review checklist

- [ ] Spec § 4.5 desktop-only crosshair: directive guards on `(pointer: coarse)`. ✅
- [ ] Spec § 4.5 two layers (outer slow-follow + inner 1:1): RAF easing on outer, direct write to inner. ✅
- [ ] Spec § 4.5 hover targets `data-cursor="active"` get a pulse: pure CSS via `:has()` selector. ✅
- [ ] Spec § 4.5 disabled under `prefers-reduced-motion: reduce`: directive guards on construct. ✅
- [ ] Spec § 4.7 `transform: translate3d` only: confirmed in directive. ✅
- [ ] Spec § 4.8 never hides system cursor while focus ring is active: focus rings preserved by explicit `:focus-visible` rule under the `has-crosshair-cursor` body class. ✅
- [ ] Memory `feedback_ng_packagr_cross_lib`: cinematics lib still imports nothing from other buildable libs. ✅
- [ ] Audio layer (spec § 4.4): explicitly deferred; documented in "Out of scope" + "Plan 8.5".

## Next plan

Plan 9 (new easter eggs — shake gesture, Konami in boot, replay-intro footer) is up next per the index. Of those three, the footer `~$ replay-intro` already shipped in Plan 4 (commit 2758836); Plan 9 will land the remaining two (shake gesture + Konami).
