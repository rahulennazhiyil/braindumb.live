# KPR-verse Makeover — Plans Index

Master roadmap for the 10-plan rollout. Spec lives at
[`../specs/2026-04-27-kprverse-makeover-design.md`](../specs/2026-04-27-kprverse-makeover-design.md).

Each plan ships independently and produces working, testable software. The
site stays deployable after every plan.

## Status

| # | Plan | Status | Spec phase | Touches user-visible behavior? |
|---|---|---|---|---|
| 1 | Foundation: cinematics overlays + theme tokens | ✅ shipped | 1 + 2 | Yes (subtle grain + scan-lines) |
| 2 | Scene-frame: SceneFrame / SceneScrollLock / MarqueeBand | ✅ shipped | 3 | No (lib only) |
| 3 | Boot terminal + kinetic-text primitives | ✅ shipped | 1 + 3 | No (lib only) |
| 4 | Hero two-beat — boot terminal → force graph | ✅ shipped | 4 | **Yes — major** |
| 5 | Home other scenes — scroll-lock + marquees + decrypt/kinetic on scenes 2-4 | ✅ shipped | 5 | Yes |
| 6 | About + projects-index restaging | ✅ shipped | 6 | Yes |
| 7 | Kinetic-only treatment: feed, contact, privacy, playground (admin excluded per CLAUDE.md) | ✅ shipped | 7 | Yes (subtle) |
| 8 | Audio (ambient + UI sfx) + custom crosshair cursor | 🔜 next | 8 | Yes |
| 9 | New easter eggs: shake gesture, Konami in boot, replay-intro | ⏳ planned | 9 | Yes (mobile) |
| 10 | QA pass: Lighthouse, Playwright smoke, theme matrix | ⏳ planned | 10 | No (verification) |

## How to pick up

1. Read the spec. Know what goal each plan serves.
2. Read the most recently shipped plan to understand the conventions
   (TDD, vitest globals, `await TestBed.configureTestingModule().compileComponents()`,
   per-task commits, typecheck-override per-lib).
3. Read this index. The "Plan N spec" column tells you which spec section
   to focus on.
4. Open the next plan's `.md` if it exists. If it doesn't, draft it using
   `superpowers:writing-plans`.

## Plan-by-plan briefing

### Plan 4 — Hero two-beat ✅ shipped

**Goal:** First user-visible payoff. Wire the boot sequence to the App
shell, restage the home hero with the two-beat (terminal → graph), add
HUD chrome around the force graph, apply `KineticHeading` and
`DecryptText` to the name + tagline, wrap each home section with
`[appSceneFrame]`.

**Shipped via commits 2bb383e → b5cf558 on 2026-04-29:**
- `apps/web/src/app/app.ts` / `app.html` — `@if (bootVisible())` boot overlay gated by `BootGuardService` + footer `replayIntroTriggered` handler + palette `Replay intro` command.
- `apps/web/src/app/pages/home/home.*` — hero `<h1>` swapped for `<app-kinetic-heading>`; kicker + tagline wrap `appDecryptText`; every section gains `appSceneFrame`; `heroReady` signal flips on intersect.
- `libs/features/hero-graph` — four corner brackets, signal-driven `NODES NN` readout, RAF-driven `FRAME NNNN` ticker (cancelled on destroy, hidden under reduced-motion).
- `libs/shared/ui/src/lib/footer/footer.*` — visible `~$ replay-intro` button emits new `replayIntroTriggered` output.
- `apps/web/project.json` — bumped `anyComponentStyle` budget to 8kb warn / 12kb error to fit the redesigned hero CSS.

**Plan doc:** [`2026-04-27-makeover-plan-4-hero-two-beat.md`](2026-04-27-makeover-plan-4-hero-two-beat.md).

### Plan 5 — Home other scenes ✅ shipped

**Goal:** Restage scenes 2–4 of the home page (featured-work, explore,
contact). Every section keeps its content; gains kinetic title, decrypt
kicker, per-scene `(sceneEnter)` ready signal, marquee band between
scenes, and `[appSceneScrollLock]` on the page root.

**Shipped via commit d9792b1 on 2026-04-29:**
- `apps/web/src/styles.css` — global `.scene-scroll-lock` rule (auto-disabled <768px and under reduced motion).
- `apps/web/src/app/pages/home/home.ts` — three new ready signals (`featuredReady`, `exploreReady`, `contactReady`) + handlers; imports `SceneScrollLock`, `MarqueeBand` from `features-scene-frame`.
- `apps/web/src/app/pages/home/home.html` — `<div class="home__page" appSceneScrollLock>` wrapper; three `<app-marquee-band>` strips between sections; inline `appDecryptText` kickers + `<app-kinetic-heading>` titles on featured-work, explore, and contact.
- `apps/web/src/app/pages/home/home.css` — page wrapper rule + kinetic-heading inheritance reset for the inline section heads.

**Deferred:** spec § 6 `SectionHeading [decrypt]` opt-in input. Cross-buildable-lib path-alias imports hit an ng-packagr `referencedFiles` bug; the cinematic primitives are wired inline in `home.html` instead, achieving the same UX without the build issue. Will revisit when the lib pipeline allows.

**Plan doc:** [`2026-04-27-makeover-plan-5-home-scenes.md`](2026-04-27-makeover-plan-5-home-scenes.md).

### Plan 6 — About + projects-index restaging ✅ shipped

**Goal:** Apply the home cinematic treatment to `/about` (3 scenes:
Bio / Career / Tech Stack) and `/projects` (cinematic header on the
existing grid).

**Shipped via commits 7609183 + 7992a48 on 2026-04-29:**
- `apps/web/src/app/pages/about/about.*` — `<main appSceneScrollLock>`
  wrapper; three `appSceneFrame` sections with their own ready signals;
  inline `appDecryptText` kickers (`whoami --about`, `git log --career`,
  `npm list --depth=0`); `<app-kinetic-heading>` titles; two
  `<app-marquee-band>` strips between sections.
- `apps/web/src/app/pages/projects/projects-index.*` — `<section
  appSceneFrame>` wrapper; inline cinematic header (`ls ./projects`
  decrypts; `Projects` rises). Empty-state kicker tracking corrected
  to 0.18em (system label spec).

**Deferred:**
- About "Off-grid" scene from spec § 4.2 — no source content; spec § 7
  forbids new copy.
- Projects-index "1-featured-panel + ARCHIVE-grid" restructure — content
  rework, not a primitive treatment.
- Featured/project-card "FILE 01 / FILE 02" decrypt labels with corner
  brackets — same cross-buildable-lib import problem the SectionHeading
  enhancement hit.

**Plan doc:** [`2026-04-27-makeover-plan-6-about-projects.md`](2026-04-27-makeover-plan-6-about-projects.md).

### Plan 7 — Kinetic-only treatment for remaining pages ✅ shipped

**Goal:** Lighter cinematic treatment (no scroll-lock, no marquees)
applied across `/feed`, `/contact`, `/privacy`, `/playground` (index +
DemoFrame). Each page gets an inline `appDecryptText` kicker +
`<app-kinetic-heading>` title and a per-page `[appSceneFrame]` reveal
signal. Bonus 0.18em-tracking sweep on every kicker / form label /
button touched (memory tag 373).

**Shipped via commits 8d9bddb → 4a2cef3 on 2026-04-29:**
- `apps/web/src/app/pages/feed/*` — `~$ tail -f feed.log` decrypt + kinetic `Feed` title; filter tabs + empty-state tracking flipped to 0.18em.
- `apps/web/src/app/pages/contact/*` — `~$ echo $EMAIL` decrypt + kinetic `Contact` title; six tracking-[0.2em]/wider violations across form labels, socials kicker, denied-banner kicker, send button → 0.18em.
- `apps/web/src/app/pages/privacy/*` — `~$ cat /privacy` decrypt + kinetic `Privacy` title.
- `apps/web/src/app/pages/playground/playground-index.*` — `~$ ls ./playground` decrypt + kinetic title; "soon" badge tracking → 0.18em.
- `apps/web/src/app/pages/playground/demo-frame.*` — kicker/title inputs piped into the inline cinematic header; cd-back link + view-notes button tracking → 0.18em.

**Deferred (per CLAUDE.md "Design Context"):**
- `/admin/*` cinematic touch — admin is product-register, productivity-first; brand cinematics stay off that surface.
- Playground demo-card hover preview SVGs (spec § 4.2) — content/D3 build.
- Featured/project-card "FILE NN" decrypt labels with corner brackets — same buildable-lib import problem.

**Plan doc:** [`2026-04-27-makeover-plan-7-kinetic-only.md`](2026-04-27-makeover-plan-7-kinetic-only.md).

### Plan 8 — Audio + custom cursor

**Goal:** Add the optional layers — ambient drone (off by default) and
UI sound effects (off by default), both toggleable in the nav and gated
behind `prefers-reduced-motion`. Custom monospace crosshair cursor on
desktop only.

**New components/services:**
- `AmbientAudioService` (in `shared/cinematics`)
- `UiSoundService` (in `shared/cinematics`)
- `CrosshairCursor` directive (in `shared/cinematics`)
- Audio toggles in the nav

**Audio assets:** ambient drone (~30s seamless OGG loop, ~120KB) and a
small UI SFX library lazy-loaded on first toggle. The OGG loop itself is
out of scope — needs to be sourced or synthesized externally.

**Dependencies:** None (independent layer). Could ship before Plan 7 if
desired.

### Plan 9 — New easter eggs

**Goal:** Three more mobile-friendly admin entry points beyond the five
already shipped.

**New units:**
- `ShakeDetector` service (in `shared/cinematics`) — handles `DeviceMotionEvent`
  permission UX on iOS, fires on three shakes within 1.5s.
- Konami sequence trap inside `BootSequence` — `↑↑↓↓` on desktop or
  four-corner taps on mobile during the boot, jumps straight to the
  auth terminal.
- Footer `~$ replay-intro` target — calls `BootGuardService.reset()` then
  reloads. Doubles as a discovery moment for the boot animation.

**Dependencies:** Plan 4 (uses `BootGuardService`); Plan 8 is independent.

### Plan 10 — QA pass

**Goal:** Final verification.

- Lighthouse pass (target ≥85 on mobile).
- Playwright smoke: home loads, boot completes/skips, all 5 scenes
  reachable, force graph renders.
- Manual cross-device matrix: iPhone Safari, iPad, Pixel Chrome, desktop
  Chrome/Firefox/Safari.
- Theme matrix: all 4 themes don't break in any scene.
- iOS DeviceMotion permission UX sanity check.
- Bundle size check: initial JS still <700KB warn / <1MB error.

**Dependencies:** All prior plans.

## Conventions reminder for future sessions

- Lib generation: `npx nx g @nx/angular:lib --name=X --directory=libs/<scope>/X --buildable=true --unitTestRunner=vitest-angular --style=css --standalone=true --prefix=app --no-interactive`
- After generating, **rename the path alias** in `tsconfig.base.json` from
  the bare lib name to `@rahul-dev/<scope>-<name>`.
- After generating, **add the `typecheck` override** to `project.json`
  (see CLAUDE.md for why; copy the pattern from any existing lib).
- After generating, **delete the placeholder component** the generator
  creates and **replace `src/index.ts`** with a clean header comment.
- Test specs use vitest globals (no imports), `await
  TestBed.configureTestingModule({imports:[...]}).compileComponents()`.
- Each plan ships in one focused commit with a `Co-Authored-By`
  attribution and references to the plan + spec docs.
- All cinematic / kinetic effects must respect `prefers-reduced-motion`
  and `aria-hidden` decorative content.
