# KPR-verse Makeover — Plan 10: QA Pass

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Final verification of the KPR-verse makeover. Replace the placeholder Playwright spec with a real smoke suite, confirm production-build bundle sizes still respect the 700kb-warn / 1mb-error initial budget, sanity-check the theme matrix at the unit-test layer, and capture a manual QA checklist for the cross-device / Lighthouse / iOS DeviceMotion verifications that need real hardware.

**Architecture:** This is a verification plan, not a feature plan. Three slices:

1. **Automatable (this plan ships it):**
   - Playwright smoke spec covering home, /about, /projects, /playground, /feed, /contact, /privacy reachability + boot dismiss + force-graph mount.
   - Theme-matrix unit test asserting `ThemeService.setTheme()` doesn't throw on any of the four themes and the body data attribute / class flips.
   - Production-build run + recorded bundle sizes vs. the 700kb-warn / 1mb-error initial budget from `apps/web/project.json`.

2. **Manual (this plan documents it):** A new `docs/QA-CHECKLIST.md` covering iPhone Safari + iPad + Pixel Chrome + desktop Chrome/Firefox/Safari + iOS DeviceMotion permission UX + the four themes' visual integrity. Lives at the doc level so future passes have a checklist; it's an SOP, not a gate.

3. **Punted to a follow-up:** Lighthouse pass with a target ≥85 on mobile. Lighthouse needs a public deploy (Vercel preview) or a properly-warmed local server with realistic CPU throttling, neither of which lands cleanly inside an inline plan execution. Once Vercel deploy is wired (per pre-Vercel audit memory IDs 36/37), Lighthouse runs as a CI step.

**Tech Stack:** Playwright, vitest-angular, Nx CLI.

**Spec reference:** `docs/superpowers/specs/2026-04-27-kprverse-makeover-design.md` § 9 (testing strategy), § 10 step 10 (final QA pass).

**Out of scope (deferred):**
- Live Lighthouse run — needs deploy or a CI workflow, see "punted" above.
- Real-device cross-browser execution — captured in the checklist instead.
- Visual regression / screenshot tests — would be useful but adds infra cost; defer.

---

## File Structure

**Created:**
- `apps/web-e2e/src/home.spec.ts` — boot dismiss + hero scene reachable.
- `apps/web-e2e/src/scenes.spec.ts` — `/about`, `/projects`, `/playground`, `/feed`, `/contact`, `/privacy` all load and render their kinetic title.
- `libs/shared/theme/src/lib/theme.matrix.spec.ts` — unit test that walks all four themes via `ThemeService.setTheme()`.
- `docs/QA-CHECKLIST.md` — manual cross-device / theme / Lighthouse checklist.

**Modified:**
- `apps/web-e2e/src/example.spec.ts` — delete (placeholder from generator).

---

## Task 1: Playwright smoke — home boot + force graph

**Files:**
- Create: `apps/web-e2e/src/home.spec.ts`
- Modify: delete `apps/web-e2e/src/example.spec.ts`

- [ ] **Step 1: Write the spec**

Create `apps/web-e2e/src/home.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.describe('Home — KPR-verse smoke', () => {
  test('boot overlay dismisses and hero renders', async ({ page }) => {
    // Force first-visit state by clearing the boot-seen flag before the
    // page initialises its component tree.
    await page.addInitScript(() => {
      try {
        localStorage.removeItem('rahul-dev:boot-seen');
      } catch {
        // localStorage may be blocked — the boot still plays.
      }
    });

    await page.goto('/');

    // Boot overlay is mounted on first visit.
    const boot = page.locator('app-boot-sequence');
    await expect(boot).toBeVisible();

    // Tap to skip — boot dismisses.
    await page.click('body');
    await expect(boot).toBeHidden();

    // Hero is now visible: kinetic name + decrypt kicker.
    await expect(page.locator('.hero__name')).toBeVisible();
    await expect(
      page.locator('.hero__name app-kinetic-heading [aria-label="Rahul E"]'),
    ).toBeAttached();

    // Hero graph mounts an SVG once D3 finishes its init.
    await expect(page.locator('app-hero-graph svg')).toBeAttached({ timeout: 5000 });
  });

  test('return visit skips boot overlay', async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('rahul-dev:boot-seen', '1');
      } catch {
        // ignore
      }
    });

    await page.goto('/');

    await expect(page.locator('app-boot-sequence')).toHaveCount(0);
    await expect(page.locator('.hero__name')).toBeVisible();
  });
});
```

- [ ] **Step 2: Delete the placeholder**

```bash
rm apps/web-e2e/src/example.spec.ts
```

- [ ] **Step 3: Lint the e2e project**

```bash
npx nx lint web-e2e
```

Expected: clean.

- [ ] **Step 4: Commit (without running e2e — see Task 4 for the run)**

```bash
git add apps/web-e2e/src/home.spec.ts apps/web-e2e/src/example.spec.ts
git commit -m "test(web-e2e): home smoke — boot dismiss + hero graph mount

Replaces the generator-placeholder spec with two scenarios:
1. First-visit boot overlay is visible, dismisses on tap, hero renders
   with kinetic name + force-graph SVG.
2. Return-visit (boot-seen flag set) skips the overlay entirely.

Run via: npx nx e2e web-e2e"
```

---

## Task 2: Playwright smoke — every public route renders

**Files:**
- Create: `apps/web-e2e/src/scenes.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
import { test, expect } from '@playwright/test';

const ROUTES: ReadonlyArray<{ path: string; kineticTitle: string }> = [
  { path: '/about', kineticTitle: 'Rahul E' }, // bio scene H1
  { path: '/projects', kineticTitle: 'Projects' },
  { path: '/playground', kineticTitle: 'Visualization playground' },
  { path: '/feed', kineticTitle: 'Feed' },
  { path: '/contact', kineticTitle: 'Contact' },
  { path: '/privacy', kineticTitle: 'Privacy' },
];

test.describe('Public routes — kinetic-title smoke', () => {
  for (const route of ROUTES) {
    test(`${route.path} renders ${route.kineticTitle}`, async ({ page }) => {
      // Skip the boot overlay so we can hit deep routes directly.
      await page.addInitScript(() => {
        try {
          localStorage.setItem('rahul-dev:boot-seen', '1');
        } catch {
          // ignore
        }
      });

      await page.goto(route.path);

      // Every restaged page exposes its title via app-kinetic-heading
      // with aria-label = the title text.
      await expect(
        page.locator(`app-kinetic-heading [aria-label="${route.kineticTitle}"]`),
      ).toBeAttached();
    });
  }
});
```

- [ ] **Step 2: Lint**

```bash
npx nx lint web-e2e
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add apps/web-e2e/src/scenes.spec.ts
git commit -m "test(web-e2e): every public route renders its kinetic title

Smoke test that walks /about, /projects, /playground, /feed, /contact,
/privacy and asserts each page's <app-kinetic-heading> exposes the
expected aria-label. Boot-seen flag pre-set to avoid the first-visit
overlay blocking the test."
```

---

## Task 3: Theme matrix — unit-level

**Files:**
- Create: `libs/shared/theme/src/lib/theme.matrix.spec.ts`

- [ ] **Step 1: Read the existing ThemeService to confirm its surface**

```bash
cat libs/shared/theme/src/lib/theme.service.ts
```

(Confirm the public method is `setTheme(name: ThemeName)` and the side effect is that the body class / data attribute changes. The plan's spec assumes this — verify before writing.)

- [ ] **Step 2: Write the spec**

```ts
import { TestBed } from '@angular/core/testing';
import { THEMES } from './theme-tokens';
import { ThemeService } from './theme.service';

describe('ThemeService matrix', () => {
  it('accepts every published theme without throwing', () => {
    TestBed.configureTestingModule({ providers: [ThemeService] });
    const svc = TestBed.inject(ThemeService);

    for (const theme of THEMES) {
      expect(() => svc.setTheme(theme)).not.toThrow();
    }
  });

  it('exposes all four themes', () => {
    expect(THEMES).toHaveLength(4);
    expect(THEMES).toContain('glass');
    expect(THEMES).toContain('terminal');
    expect(THEMES).toContain('print');
    expect(THEMES).toContain('synthwave');
  });
});
```

- [ ] **Step 3: Run + lint**

```bash
npx nx test theme --watch=false
npx nx lint theme
```

Expected: green. If `theme` isn't the project name, run `npx nx show projects | grep theme` and substitute.

If the theme spec doesn't exist yet at that path because the lib uses a different folder, look for an existing `theme.service.spec.ts` and put the matrix tests in the same file as a separate `describe` block.

- [ ] **Step 4: Commit**

```bash
git add libs/shared/theme
git commit -m "test(theme): matrix smoke — all 4 themes accepted

Walks THEMES via ThemeService.setTheme() to confirm none throw, and
asserts THEMES still has the four expected entries (glass, terminal,
print, synthwave). Last gate before Plan 10 closes — the visual
matrix is captured in docs/QA-CHECKLIST.md for manual passes."
```

---

## Task 4: Run the e2e suite + capture bundle sizes

**Files:** none (read-only verification + a recorded result in the QA checklist created in Task 5).

- [ ] **Step 1: Run the e2e suite (chromium only is fine for the smoke)**

```bash
npx nx e2e web-e2e --project=chromium
```

Expected: 7 tests pass (2 home + 6 routes — `/about`, `/projects`, `/playground`, `/feed`, `/contact`, `/privacy`).

If Playwright isn't installed yet:

```bash
npx playwright install chromium
```

…and rerun.

- [ ] **Step 2: Production build**

```bash
npx nx build web
```

Capture from the output:
- "Initial total" raw + estimated transfer size.
- The largest few lazy chunks.
- Any budget warnings (the home.css 8.54kB warning is expected; the 12kb error cap is not exceeded).

- [ ] **Step 3: Record the numbers in `docs/QA-CHECKLIST.md`**

(See Task 5 for the doc shape — the Bundle-size section there is where these numbers go.)

- [ ] **Step 4: Commit any test fixes that surfaced**

If a test fails because of an actual regression (not a flaky timing), fix the regression with a small-scope commit before continuing. Do **not** "fix" a failing smoke test by loosening its assertion.

---

## Task 5: QA checklist doc

**Files:**
- Create: `docs/QA-CHECKLIST.md`

- [ ] **Step 1: Write the doc**

Create `docs/QA-CHECKLIST.md`:

````markdown
# rahul-dev — QA Checklist

Manual verification gate for shipping the KPR-verse makeover (and
every subsequent visible change). Use after running the automated
smoke + lint + typecheck + build chain.

## How to run a pass

1. `npx nx run-many -t lint,typecheck -p web,ui,hero-graph,cinematics,boot-sequence,theme`
2. `npx nx run-many -t test -p web,ui,hero-graph,cinematics,boot-sequence,theme --watch=false`
3. `npx nx e2e web-e2e --project=chromium`
4. `npx nx build web`
5. Walk this checklist on real hardware.

## Bundle size — recorded against the 700kb / 1mb initial budget

| Run date | Initial raw | Initial transfer | Largest lazy chunk | Within budget? |
|---|---|---|---|---|
| 2026-04-29 (Plan 10 baseline) | _record from build output_ | _record_ | _record_ | _yes / no_ |

Budget config lives in `apps/web/project.json` (initial: 700kb warn / 1mb error; anyComponentStyle: 8kb warn / 12kb error after Plan 4 commit 4b190aa).

## Cross-device matrix

For each device, walk: `/`, `/about`, `/projects`, `/playground`,
`/feed`, `/contact`, `/privacy`.

| Device | Browser | Boot OK | Scroll-snap OK | Marquees OK | Kinetic OK | Decrypt OK | Cursor OK | Notes |
|---|---|---|---|---|---|---|---|---|
| iPhone (recent) | Safari | | | | | | _N/A — touch_ | |
| iPad | Safari | | | | | | _N/A — touch_ | |
| Pixel | Chrome | | | | | | _N/A — touch_ | |
| Desktop | Chrome | | | | | | | |
| Desktop | Firefox | | | | | | | |
| Desktop | Safari | | | | | | | |

Tick each cell. Note any glitch under "Notes".

## Theme matrix

For each theme (`glass`, `terminal`, `print`, `synthwave`), reload the
home page, walk all four scenes, then visit `/admin` and confirm:

| Theme | Home reads cleanly | Scenes don't ghost | Admin still neutral | Reduced-motion safe |
|---|---|---|---|---|
| glass | | | | |
| terminal | | | | |
| print | | _expected: cinematics dialed down_ | | |
| synthwave | | | | |

Reminder: `print` deliberately disables most cinematics (spec § 4.3).
`/admin/*` should NOT show grain/scan/decrypt/kinetic on any theme
(CLAUDE.md "Design Context").

## iOS DeviceMotion permission UX

1. Open the site on a real iPhone (Safari).
2. Tap once anywhere on the page.
3. Confirm Safari shows the "Motion & Orientation Access" prompt.
4. Grant.
5. Shake the device three times within ~1.5s.
6. The auth terminal should open.
7. Repeat with permission **denied** — site should function normally
   (no console errors, no crashes), shake just doesn't trigger.

## Reduced-motion sanity

DevTools → Rendering → Emulate CSS media `prefers-reduced-motion: reduce`,
reload, walk every route:

- Boot overlay should auto-skip on first visit.
- Kinetic / decrypt animations collapse to final text instantly.
- Force graph hover transitions disabled.
- Crosshair cursor falls back to system default.
- Marquees pause (existing CSS rule).
- Scroll-snap disabled (existing media rule).

## Lighthouse pass — deferred

Run after the Vercel deploy is live (pre-deploy audit memory IDs
36/37 noted three blockers; resolve those first). Target: mobile
Performance ≥85, Accessibility ≥95, Best Practices ≥95, SEO ≥90.

If a metric regresses, the typical culprits are:
- Large initial JS chunk → check the project.json budget; lazy-load
  any new feature that bloats initial.
- LCP delay → ensure the hero name renders during SSR (kinetic-heading
  always exposes the final text via `aria-label`, so it should).
- CLS → confirm scene-frame doesn't trigger layout-shift on intersect
  (the kinetic "rise" animation uses transform only, not height).
````

- [ ] **Step 2: Commit**

```bash
git add docs/QA-CHECKLIST.md
git commit -m "docs(qa): manual QA checklist — bundle, devices, themes, a11y

Permanent SOP for shipping visible changes. Captures the manual
matrix the spec calls out (cross-device, theme, iOS DeviceMotion,
reduced-motion). Lighthouse pass is documented as deferred until the
Vercel deploy lands."
```

---

## Task 6: Plan index update

**Files:**
- Modify: `docs/superpowers/plans/README.md`

- [ ] **Step 1: Flip the status table**

Edit `docs/superpowers/plans/README.md`:

- Row Plan 10: `🔜 next` → `✅ shipped` (note "Lighthouse deferred until Vercel deploy").
- Add a top-of-file note: **"KPR-verse makeover complete via plans 1–10. Plan 8.5 (audio) deferred to a future plan once OGG asset is sourced."**

- [ ] **Step 2: Briefing rewrite**

Rewrite the Plan 10 briefing entry with the as-shipped commits + deferred Lighthouse.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/plans/README.md docs/superpowers/plans/2026-04-27-makeover-plan-10-qa-pass.md
git commit -m "docs(plans): mark Plan 10 shipped; KPR-verse makeover complete

Plan 10 (QA pass) shipped via [commits]. Lighthouse pass deferred
until Vercel deploy. Plan 8.5 (audio) still deferred. Adds the Plan
10 doc itself."
```

---

## Self-review checklist

- [ ] Spec § 9 testing strategy (vitest-angular per component, Playwright smoke, manual cross-device): unit tests are now ~88 across 5 projects; Playwright smoke covers home + 6 deep routes; manual matrix captured in `docs/QA-CHECKLIST.md`. ✅
- [ ] Spec § 10 step 10 (final QA pass): bundle size + theme matrix + Playwright + manual checklist all addressed; Lighthouse explicitly punted with a clear unblocker (Vercel deploy). ✅
- [ ] Memory IDs 36/37 (pre-Vercel audit blockers): referenced in the deferred-Lighthouse note so the next pass knows where to start. ✅

## What ships, what doesn't

**Shipped this plan:** Playwright smoke covering home + 6 deep routes + boot dismiss + force-graph mount; theme-matrix unit test; QA checklist as living doc.

**Not shipped, by design:**
- Lighthouse — needs Vercel deploy.
- Real-device cross-browser run — needs hardware; the user runs the matrix and updates `docs/QA-CHECKLIST.md`.
- Visual regression screenshots — adds infra; defer to a follow-up.

## After this plan

The KPR-verse makeover is complete via plans 1–10. The remaining
buckets:
- **Plan 8.5** — audio layer + nav toggles, blocked on OGG asset.
- **Pre-Vercel deploy work** (memory IDs 36/37) — three hard blockers
  identified Apr 24 that need clearing before public ship + Lighthouse
  CI hookup.
- **Optional polish** — featured/project-card "FILE NN" decrypt
  labels with corner brackets (carried since Plans 5–7 — needs the
  buildable-lib import problem solved or inlined per-page).
