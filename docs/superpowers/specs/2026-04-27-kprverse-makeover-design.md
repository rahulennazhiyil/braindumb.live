# KPR-verse Makeover — Design Spec

**Date:** 2026-04-27
**Status:** Draft — pending user review
**Owner:** Rahul E

## 1. Goal

Lift the rahul-dev portfolio from "well-built developer site" to a cinematic,
KPR-style ARG/cyberpunk experience without losing or weakening any feature
shipped in phases 1–14. Every existing route, easter egg, and integration
keeps working; everything visible to the user gets re-staged.

## 2. Non-goals

- **Don't replace the force graph.** It's the signature interaction; we
  enhance it, never remove it.
- **Don't replace the terminal-overlay auth flow.** It's the auth surface
  and stays. The new "boot terminal" in the hero is *visual only* — typed
  commands are scripted, not reading user input.
- **Don't fork the design system.** Refresh `shared/ui` in place.
  No `shared/ui-v2`.
- **Don't break SSR or prerendering.** Every new visual is browser-only or
  cleanly hydrates after server render.
- **Don't gate the site behind a click.** Hybrid intro plays without an
  "enter site" button — it's a passive boot, not a paywall.

## 3. Decisions locked (from brainstorming)

| Axis | Choice |
|---|---|
| First moment | **Hybrid.** Full 2.5–3.5s boot sequence on first visit (`localStorage` flag), Quiet Glitch reveal on subsequent visits. `~$ replay-intro` in the footer re-triggers the boot at any time. |
| Intensity | **Maximum.** Scroll-locked panels on hero pages; ambient + UI audio (toggle); custom cursor (desktop); ASCII marquee bands; grain + scan-line overlay; decrypt-text reveals. |
| Hero composition | **Two-beat.** Terminal panel auto-types a sequence, dissolves into the force graph as scene 2, with HUD chrome (corner brackets, node count, frame ticker, latency stat). |

## 4. Architecture

### 4.1 New libraries

Three new libs scoped under `libs/features/` and `libs/shared/`. All
buildable, vitest-angular, standalone, prefix `app`, per CLAUDE.md.

**`libs/features/boot-sequence`**
- `BootSequence` standalone component — animated terminal that types
  scripted lines with cursor blink, ASCII progress bar, exit code.
- `BootGuardService` — reads/writes `rahul-dev:boot-seen` in localStorage.
  `shouldPlayLong()` returns `true` once per device.
- Public API: `<app-boot-sequence (done)="…" [mode]="'long'|'short'" />`.

**`libs/features/scene-frame`**
- `SceneFrame` directive — wraps a section element; observes intersection;
  fires a one-shot `sceneEnter` event when the section becomes the active
  panel.
- `SceneScrollLock` directive — installs CSS `scroll-snap-type: y mandatory`
  on the host container, with a `disabled` input bound to a media query so
  small screens fall back gracefully.
- `MarqueeBand` component — horizontal ASCII strip between scenes:
  `// SCENE 02 / projects // RUNTIME 1m24s // BUILD #043 //`. Auto-pauses
  off-screen.

**`libs/shared/cinematics`**
- `GrainOverlay` component — fixed full-viewport SVG turbulence filter,
  cheap, one DOM node, opacity ~6%.
- `ScanLineOverlay` component — pure CSS gradient, fixed full-viewport,
  pointer-events:none.
- `CrosshairCursor` directive — desktop-only fixed crosshair tracking
  pointer; pulses on hover over `[data-cursor="active"]` targets. Hidden
  on touch via `(pointer: coarse)` media query.
- `DecryptText` directive — text scramble-resolve animation. Plays once on
  intersect; respects `prefers-reduced-motion` (instant resolve in that
  case).
- `KineticHeading` component — wraps a heading and reveals letters with a
  staggered transform on scene enter.
- `AmbientAudioService` — manages a single `<audio>` element with the
  ambient drone (looped). Two signals: `enabled`, `volume`.
  Persisted in localStorage.
- `UiSoundService` — short SFX library (hover, click, success, error,
  boot-tick). Pre-loaded buffers via `AudioBuffer` for low latency.
  Off by default.

### 4.2 Page-level scene structure

#### `/` (home) — scroll-locked, 5 scenes
1. **Boot / hero** — boot sequence overlay (first visit) → terminal type-out
   → force graph reveal with HUD chrome, name + tagline kinetic on the left.
2. **Tech graph deep-dive** — keep existing tech-bubbles section, restage as
   a "scope dossier" with a grid of category cards on intersect.
3. **Featured projects** — current cards, restaged as "FILE 01", "FILE 02"
   panels with decrypt-text titles and corner brackets.
4. **What I do / metrics** — current metrics, re-skinned as a HUD readout
   panel (tabular numerals, ASCII gridlines).
5. **About preview + CTA** — current cards become "TRANSMISSION"-styled
   panels.

Marquee band between every scene.

#### `/about` — scroll-locked, 3 scenes
1. **Identity** — career timeline restaged as a cinematic horizontal scroll
   inside a fixed scene panel.
2. **Stack** — tech-bubbles section with the cinematic treatment.
3. **Off-grid** — non-work bio as a "JOURNAL ENTRY" terminal screen.

#### `/projects` — scroll-locked index, 1-scene per featured + "ARCHIVE" grid

#### `/playground` — traditional scroll with kinetic reveals
- Each demo card gets a hover preview (3s SVG snippet) on desktop,
  decrypt-text title, "RUN" CTA.
- **Force Pop** game stays exactly as built (Phase 2 of previous session).

#### `/feed`, `/contact`, `/privacy` — traditional scroll, kinetic-section reveals (cheaper)

#### `/admin/*` — minimal cinematic touch (focus chrome only — these pages need to be productive, not theatrical)
- Decrypt-text on the dashboard heading.
- HUD-style border on the section frames.
- No scroll-locking (admin tables can't snap).

### 4.3 Theme handling

All four themes (`glass`, `terminal`, `print`, `synthwave`) get refreshed.
The cinematic overlays (grain, scan-line) read CSS custom properties so
each theme can dial them per-theme:

- `--cinematic-grain-opacity` (glass: 0.06; print: 0.0; terminal: 0.10; synthwave: 0.04)
- `--cinematic-scan-opacity` (glass: 0.04; print: 0.0; terminal: 0.07; synthwave: 0.05)
- `--cinematic-chromatic-shift` (glass: 1px; print: 0; terminal: 0; synthwave: 1.5px)

`print` deliberately disables most cinematics — it's the "boss-mode" theme
for sharing the site as a reference.

### 4.4 Audio

Two opt-in toggles in the nav (next to the theme toggle):

- `~ AMBIENT` — loops a low-volume drone (custom track, ~30s seamless loop,
  ~120KB OGG). Off by default.
- `~ SFX` — UI sound effects. Off by default.

Both gated behind `prefers-reduced-motion: reduce` (auto-disabled). State
persisted in localStorage. Audio assets live in `apps/web/public/audio/`
and are NOT preloaded — only fetched when first toggled on.

### 4.5 Custom cursor

- Desktop only (`(pointer: coarse)` → reset to default).
- Two layers: outer crosshair (slow follow, ease 0.15) + inner dot (1:1).
- Hover targets with `data-cursor="active"` get a pulse.
- Disabled when `prefers-reduced-motion: reduce`.

### 4.6 Easter eggs

**Existing (preserved):**
1. Type `sudo su` anywhere on desktop.
2. Triple-click the dim `~$ sudo` node in the hero graph.
3. `Cmd/Ctrl+K` palette → "Open admin terminal".
4. Long-press the `~$ rahul` logo (added in prior session).
5. Triple-tap the `~$ exit 0` text in the footer (added in prior session).
6. Visit `/sudo` (added in prior session).

**New (this makeover):**
7. **Shake gesture (mobile)** — `DeviceMotionEvent` listener. Three sharp
   shakes within 1.5s opens the terminal. iOS permission requested on
   first user interaction; gracefully no-ops if denied.
8. **Konami in the boot terminal** — during the boot sequence on first
   visit, if the visitor types `↑↑↓↓` (arrow keys, desktop) or performs
   four corner taps (mobile), the boot ends with `~$ sudo su` instead of
   `~$ rahul --start`, dropping straight into the auth terminal.
9. **`~$ replay-intro` command** in the footer — visible click target
   that re-triggers the boot sequence. Doubles as a discovery moment for
   the boot animation.

### 4.7 Performance and budgets

- Initial JS budget unchanged (warn 700KB / error 1MB).
- Cinematic overlays are pure CSS or 1-DOM-node SVG — zero JS cost when idle.
- Audio assets lazy-loaded on first toggle.
- Custom cursor uses `transform: translate3d` only, no layout thrash.
- Boot sequence is one component, lazy-loaded via `loadComponent` on the
  first-visit path; subsequent visits don't load it at all.
- Scroll-locked sections use native `scroll-snap-type` — no JS scrolljacking.
- All cinematics respect `prefers-reduced-motion`.

### 4.8 Accessibility

- All decorative overlays are `aria-hidden="true"` and `pointer-events:none`.
- Boot sequence skippable with any keypress / tap; auto-skipped when
  `prefers-reduced-motion: reduce`.
- Audio toggles labeled, persistent, default off.
- Custom cursor never hides the system cursor while a focus ring is active.
- Decrypt-text settles on real text within 600ms; screen readers see the
  final string only (set via `aria-label` once).
- Marquee bands `aria-hidden`.

## 5. Component inventory (additions)

| Path | Type | Lazy? |
|---|---|---|
| `libs/features/boot-sequence/src/lib/boot-sequence.ts` | component | yes |
| `libs/features/scene-frame/src/lib/scene-frame.directive.ts` | directive | no |
| `libs/features/scene-frame/src/lib/scene-scroll-lock.directive.ts` | directive | no |
| `libs/features/scene-frame/src/lib/marquee-band.ts` | component | no |
| `libs/shared/cinematics/src/lib/grain-overlay.ts` | component | no |
| `libs/shared/cinematics/src/lib/scan-line-overlay.ts` | component | no |
| `libs/shared/cinematics/src/lib/crosshair-cursor.directive.ts` | directive | no |
| `libs/shared/cinematics/src/lib/decrypt-text.directive.ts` | directive | no |
| `libs/shared/cinematics/src/lib/kinetic-heading.ts` | component | no |
| `libs/shared/cinematics/src/lib/ambient-audio.service.ts` | service | yes |
| `libs/shared/cinematics/src/lib/ui-sound.service.ts` | service | yes |
| `libs/shared/cinematics/src/lib/shake-detector.ts` | service | no |
| `apps/web/public/audio/ambient-drone.ogg` | asset | lazy |
| `apps/web/public/audio/ui-sfx.ogg` | asset | lazy |

## 6. Component changes (existing)

- `libs/features/hero-graph` — accept a new `[bootMode]` input that delays
  the simulation start until the boot terminal scene transitions out;
  add the HUD chrome (corner brackets, node count, frame ticker).
- `libs/shared/ui/Button` — add `[magnetic]` input that interpolates
  cursor distance into a transform. Default off.
- `libs/shared/ui/SectionHeading` — opt-in `[decrypt]` input that wires
  the `DecryptText` directive on the title.
- `libs/shared/ui/Footer` — add the `~$ replay-intro` command target.
- `libs/shared/theme` — add the four `--cinematic-*` CSS custom properties
  to each theme token set.
- `apps/web/src/app/pages/home/home.*` — restage the page in five scenes.
- `apps/web/src/app/pages/about/about.*` — restage in three scenes.

## 7. Scope boundaries — what's NOT in this makeover

- No new content (copy stays).
- No backend / Supabase schema changes.
- No new admin features.
- No new themes (refreshing the four existing ones only).
- No leaderboard for Force Pop (mentioned but parked).
- No real audio composition (drone track is a 30s loop sourced or generated
  externally; the spec describes integration only).

## 8. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Scroll-locking feels claustrophobic on tall content | Hard cap: scenes only on home/about/projects-index; max 5 scenes; below 768px → fallback to traditional scroll |
| Boot sequence on every first visit annoys repeat sharers | localStorage flag persists across sessions; URL param `?noboot=1` skips it explicitly |
| Custom cursor / audio / overlays compound to feel "much" | Each is independently toggleable; `prefers-reduced-motion` disables them all; first-load defaults are conservative |
| iOS Safari `DeviceMotionEvent` permission UX | Permission requested only on first explicit user interaction (a hidden button or theme toggle); silent no-op if denied |
| Heavy first paint with all cinematics enabled | Boot sequence is the only on-load JS dep; overlays are pure CSS; audio is lazy; HUD chrome is SSR'd as static SVG |

## 9. Testing strategy

- Each new component / directive ships with a vitest-angular spec. Boot
  sequence logic (`shouldPlayLong`) gets a pure-data test.
- Playwright smoke test: home page loads, boot sequence completes (or
  skips), all 5 scenes are reachable by scroll, force graph renders.
- Manual cross-device check: iPhone Safari, iPad, Pixel Chrome, desktop
  Chrome/Firefox/Safari. Specifically test scroll-snap fallback at 768px,
  audio permissions on iOS, shake gesture on real devices.
- Lighthouse performance budget: maintain ≥85 on mobile after rollout.

## 10. Rollout phasing

The implementation plan will execute in this order so the site stays
shippable at every checkpoint:

1. **Foundation** — `shared/cinematics` lib (overlays, decrypt, kinetic
   heading, shake detector). Lands without changing any visible behavior;
   components opt-in.
2. **Theme tokens** — add the four `--cinematic-*` properties to all four
   themes; wire overlays to read them.
3. **Scene infrastructure** — `scene-frame` lib. Land with home page
   wired to it but scroll-lock disabled (just intersection-driven reveals).
4. **Hero two-beat** — `boot-sequence` lib + hero rewrite. First visible
   change to the user.
5. **Home other scenes** — restage scenes 2–5 with marquee bands.
6. **About + projects-index** restaging.
7. **Feed/contact/admin/playground** kinetic-only treatment.
8. **Audio + custom cursor** — last because they layer on top of everything
   else.
9. **New easter eggs** — shake gesture, Konami in boot, replay-intro footer.
10. **QA pass + Lighthouse + Playwright smoke + theme matrix.**

Each step is independently mergeable and reversible.
