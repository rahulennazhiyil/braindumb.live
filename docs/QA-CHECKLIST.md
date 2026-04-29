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

## Bundle size — recorded against the 700kb warn / 1mb error initial budget

| Run date | Initial raw | Initial transfer | Largest lazy chunk (raw / transfer) | Within budget? |
|---|---|---|---|---|
| 2026-04-29 (Plan 10 baseline) | 615.94 kB | 162.82 kB | finance · 974.87 kB / 224.57 kB | ✅ initial well under 700kb warn |

Notable lazy chunks at the Plan 10 baseline:
- `home` 33.31 kB / 8.65 kB — restaged hero + scroll-lock + marquees + 3 scenes' worth of cinematic markup.
- `about` 28.71 kB / 8.10 kB — 3 scenes (bio / career / stack) plus career-timeline + tech-bubbles deps.
- `visitor-insights` 17.38 kB / 4.34 kB — admin-only.
- `cicd-sankey` 12.66 kB / 4.39 kB — playground demo.
- `finance` 974.87 kB / 224.57 kB — playground demo, single largest. Acceptable because it's lazy and only loaded when the user opens that demo.

Build config: `apps/web/project.json` — initial 700kb/1mb; anyComponentStyle 8kb/12kb (after Plan 4 commit 4b190aa).

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

Reminder: scroll-snap auto-disables under 768px and under
`prefers-reduced-motion: reduce` (global rule shipped in Plan 5).
On phones, expect free scrolling.

## Theme matrix

For each theme (`glass`, `terminal`, `print`, `synthwave`), reload the
home page, walk all four scenes, then visit `/admin` and confirm:

| Theme | Home reads cleanly | Scenes don't ghost | Admin still neutral | Reduced-motion safe |
|---|---|---|---|---|
| glass | | | | |
| terminal | | | | |
| print | | _expected: cinematics dialed down_ | | |
| synthwave | | | | |

Reminder: `print` deliberately disables most cinematics (spec § 4.3 —
`--cinematic-grain-opacity: 0`, `--cinematic-scan-opacity: 0`). It's
the "boss-mode" theme for sharing the site as a reference.

`/admin/*` should NOT show grain / scan / decrypt / kinetic on any
theme (CLAUDE.md "Design Context" — admin is product-register,
productivity-first).

## iOS DeviceMotion permission UX

1. Open the site on a real iPhone (Safari).
2. Tap once anywhere on the page — App's `(window:pointerdown)`
   listener calls `ShakeDetector.start()` which triggers Safari's
   "Motion & Orientation Access" prompt.
3. Grant.
4. Shake the device three times within ~1.5s.
5. The auth terminal (sudo overlay) should open.
6. Repeat with permission **denied** — site should function normally
   (no console errors, no crashes); shake just doesn't trigger.

## Reduced-motion sanity

DevTools → Rendering → Emulate CSS media `prefers-reduced-motion: reduce`,
reload, walk every route. Expect:

- Boot overlay auto-skips on first visit.
- Kinetic / decrypt animations collapse to final text instantly
  (`aria-label` already exposes the final string for screen readers).
- Force graph hover transitions disabled; frame-ticker hidden via
  `visibility: hidden`.
- Crosshair cursor falls back to system default (directive bails on
  construct).
- Marquees pause (`@media (prefers-reduced-motion: reduce)` rule in
  the marquee-band lib).
- Scroll-snap disabled (global rule in `apps/web/src/styles.css`).

## Lighthouse pass — deferred

Run after the Vercel deploy is live (pre-Vercel-deploy audit memory
IDs 36/37 noted three blockers; resolve those first). Target:

- mobile Performance ≥85
- Accessibility ≥95
- Best Practices ≥95
- SEO ≥90

If a metric regresses, the typical culprits are:
- Large initial JS chunk → check the project.json budget; lazy-load
  any new feature that bloats initial.
- LCP delay → ensure the hero name renders during SSR (kinetic-heading
  always exposes the final text via `aria-label`).
- CLS → confirm scene-frame doesn't trigger layout-shift on intersect
  (the kinetic "rise" animation uses `transform` only, not height).
