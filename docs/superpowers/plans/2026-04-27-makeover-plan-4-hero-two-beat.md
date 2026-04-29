# KPR-verse Makeover — Plan 4: Hero Two-Beat

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** First user-visible payoff. Wire `BootSequence` into the App shell as a first-visit overlay (gated by `BootGuardService`), add HUD chrome (corner brackets, node count, frame ticker) inside `HeroGraph`, apply `KineticHeading`/`DecryptText` to the home hero copy, wrap each home section with `[appSceneFrame]` for intersection-driven reveals, and add a `~$ replay-intro` target in the footer that re-triggers the boot.

**Architecture:** App-level `@if (bootVisible())` overlay renders `<app-boot-sequence>` (long script). On `done`, the App marks the guard as played and hides the overlay. Footer fires a new `replayIntroTriggered` output; App handles it by resetting the guard and setting `bootVisible = true` again. `HeroGraph` gains pure-CSS corner brackets plus two browser-only HUD signals (node count from existing data, frame ticker from `requestAnimationFrame`); both SSR-safe (the ticker shows the static initial value server-side). Home page sections become `[appSceneFrame]` hosts and the hero copy adopts `KineticHeading` (name) and `DecryptText` (kicker label) — both kick to "ready" once the hero scene fires `sceneEnter`. **Scroll-lock stays disabled this plan** — Plan 5 enables `[appSceneScrollLock]`.

**Tech Stack:** Angular 21 standalone APIs, signals, `@if` control flow, `requestAnimationFrame`, `IntersectionObserver` (via the existing `SceneFrame` directive), vitest-angular.

**Spec reference:** `docs/superpowers/specs/2026-04-27-kprverse-makeover-design.md` § 3 (Hybrid first moment), § 4.2 (page-level scene structure / Boot+hero), § 4.6 (replay-intro), § 4.7 (perf), § 4.8 (a11y), § 6 (existing-component changes).

**Out of scope (deferred):**
- `[appSceneScrollLock]` on the home root → Plan 5.
- `Button [magnetic]` input → Plan 8 (lands with cursor / audio layer).
- `SectionHeading [decrypt]` opt-in input → Plan 5 / 6 (when other sections need it).
- Marquee bands between scenes → Plan 5.

---

## File Structure

**Created:**
- _(none — every file in this plan already exists)_

**Modified:**
- `apps/web/src/app/app.ts` — import `BootSequence` + `BootGuardService`, add `bootVisible` signal, handlers, footer event binding.
- `apps/web/src/app/app.html` — add `@if (bootVisible())` overlay; bind `(replayIntroTriggered)` on the footer.
- `apps/web/src/app/app.spec.ts` — assert overlay renders only when guard says first visit.
- `libs/shared/ui/src/lib/footer/footer.ts` — add `replayIntroTriggered` output + `onReplayIntro()` handler.
- `libs/shared/ui/src/lib/footer/footer.html` — add the visible `~$ replay-intro` link target.
- `libs/shared/ui/src/lib/footer/footer.spec.ts` — assert click on the new target emits the output.
- `libs/features/hero-graph/src/lib/hero-graph.ts` — node count, frame ticker, RAF lifecycle.
- `libs/features/hero-graph/src/lib/hero-graph.html` — add HUD chrome (4 bracket elements + count + ticker).
- `libs/features/hero-graph/src/lib/hero-graph.css` — bracket / count / ticker styles.
- `libs/features/hero-graph/src/lib/hero-graph.spec.ts` — assert HUD chrome present in DOM.
- `apps/web/src/app/pages/home/home.ts` — import `DecryptText`, `KineticHeading`, `SceneFrame`; add `heroReady` signal.
- `apps/web/src/app/pages/home/home.html` — wrap sections in `[appSceneFrame]`, swap name `<h1>` for `<app-kinetic-heading>`, attach `appDecryptText` to the hero kicker text.
- `apps/web/src/app/pages/home/home.css` — minor adjustments where `KineticHeading` replaces the existing `<h1>` (font sizing inheritance).

---

## Task 1: HeroGraph HUD chrome — failing test

**Files:**
- Modify: `libs/features/hero-graph/src/lib/hero-graph.spec.ts`

- [ ] **Step 1: Replace the spec file with the new assertions**

Replace the entire contents of `libs/features/hero-graph/src/lib/hero-graph.spec.ts` with:

```ts
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
```

- [ ] **Step 2: Run to confirm the new test fails**

```bash
npx nx test hero-graph --watch=false
```

Expected: 2 prior tests pass, new HUD test FAILS — `.hero-graph__bracket--tl is null`.

---

## Task 2: HeroGraph HUD chrome — implementation

**Files:**
- Modify: `libs/features/hero-graph/src/lib/hero-graph.ts`
- Modify: `libs/features/hero-graph/src/lib/hero-graph.html`
- Modify: `libs/features/hero-graph/src/lib/hero-graph.css`

- [ ] **Step 1: Add node count + frame ticker signals to the component**

Open `libs/features/hero-graph/src/lib/hero-graph.ts` and apply two changes.

**1a.** At the top of the class (right after `protected readonly hoveredLabel = computed(...)`), add:

```ts
  protected readonly nodeCount = computed(() => this.data().nodes.length);
  protected readonly frameLabel = signal<string>('FRAME 0000');
```

**1b.** Add a private RAF ticker field next to `private clickTimestamps = …;`:

```ts
  private rafId = 0;
  private frameCount = 0;
```

**1c.** Inside `init()`, after `this.resizeObserver.observe(host);` and before `const onPointerMove`, start the ticker:

```ts
    const tick = () => {
      this.frameCount = (this.frameCount + 1) % 10000;
      this.zone.run(() =>
        this.frameLabel.set(
          `FRAME ${String(this.frameCount).padStart(4, '0')}`,
        ),
      );
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
```

**1d.** Update `ngOnDestroy()` to cancel the RAF:

```ts
  ngOnDestroy(): void {
    this.simulation?.stop();
    this.resizeObserver?.disconnect();
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
```

The full file after these changes should keep all existing logic. Re-read it once and confirm only the four sites above changed.

- [ ] **Step 2: Add HUD chrome to the template**

Replace the entire contents of `libs/features/hero-graph/src/lib/hero-graph.html` with:

```html
<div #host class="hero-graph-host absolute inset-0">
  <div
    #tooltip
    class="hero-graph-tooltip pointer-events-none absolute px-2 py-1 rounded-chip text-xs font-mono bg-bg-elevated/90 border border-glass-border text-text-primary opacity-0 transition-opacity duration-150"
    role="status"
    aria-live="polite"
  >
    {{ hoveredLabel() }}
  </div>

  <span class="hero-graph__bracket hero-graph__bracket--tl" aria-hidden="true"></span>
  <span class="hero-graph__bracket hero-graph__bracket--tr" aria-hidden="true"></span>
  <span class="hero-graph__bracket hero-graph__bracket--bl" aria-hidden="true"></span>
  <span class="hero-graph__bracket hero-graph__bracket--br" aria-hidden="true"></span>

  <span class="hero-graph__node-count" aria-hidden="true">
    NODES {{ nodeCount() }}
  </span>
  <span class="hero-graph__frame-ticker" aria-hidden="true">
    {{ frameLabel() }}
  </span>
</div>
```

- [ ] **Step 3: Add HUD chrome styles**

Append the following block to `libs/features/hero-graph/src/lib/hero-graph.css`:

```css
.hero-graph__bracket {
  position: absolute;
  width: 18px;
  height: 18px;
  pointer-events: none;
  border-color: color-mix(in oklab, var(--accent-primary) 75%, transparent);
}
.hero-graph__bracket--tl { top: 12px; left: 12px; border-top: 1px solid; border-left: 1px solid; }
.hero-graph__bracket--tr { top: 12px; right: 12px; border-top: 1px solid; border-right: 1px solid; }
.hero-graph__bracket--bl { bottom: 12px; left: 12px; border-bottom: 1px solid; border-left: 1px solid; }
.hero-graph__bracket--br { bottom: 12px; right: 12px; border-bottom: 1px solid; border-right: 1px solid; }

.hero-graph__node-count,
.hero-graph__frame-ticker {
  position: absolute;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  color: color-mix(in oklab, var(--accent-primary) 80%, transparent);
  text-transform: uppercase;
  pointer-events: none;
}
.hero-graph__node-count { top: 14px; left: 38px; }
.hero-graph__frame-ticker {
  bottom: 14px;
  right: 38px;
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .hero-graph__frame-ticker { visibility: hidden; }
}
```

(Reduced-motion users hide the ticker; the static initial value would still leak motion semantics, so we hide rather than freeze.)

- [ ] **Step 4: Run the test**

```bash
npx nx test hero-graph --watch=false
```

Expected: 3 tests passing.

- [ ] **Step 5: Lint**

```bash
npx nx lint hero-graph
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add libs/features/hero-graph
git commit -m "feat(hero-graph): HUD chrome — corner brackets, node count, frame ticker

Adds four absolute-positioned brackets plus two signal-driven readouts:
node count derived from input data, and a 4-digit frame ticker driven by
requestAnimationFrame inside ngZone.runOutsideAngular. RAF ticker honors
prefers-reduced-motion (hidden in that case) and is cancelled on destroy."
```

---

## Task 3: Footer ~$ replay-intro target — failing test

**Files:**
- Modify: `libs/shared/ui/src/lib/footer/footer.spec.ts`

- [ ] **Step 1: Replace the spec with the new assertions**

Replace the entire contents of `libs/shared/ui/src/lib/footer/footer.spec.ts` with:

```ts
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Footer } from './footer';

describe('Footer', () => {
  it('renders current year by default', async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      new Date().getFullYear().toString(),
    );
  });

  it('emits replayIntroTriggered when the ~$ replay-intro target is clicked', async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();

    let fired = false;
    fixture.componentInstance.replayIntroTriggered.subscribe(() => (fired = true));

    const target = fixture.nativeElement.querySelector(
      '[data-testid="footer-replay-intro"]',
    ) as HTMLButtonElement;
    expect(target).toBeTruthy();
    target.click();
    expect(fired).toBe(true);
  });
});
```

- [ ] **Step 2: Run to confirm the new test fails**

```bash
npx nx test ui --watch=false
```

Expected: prior `Footer` test passes, new replay-intro test FAILS — `target` is null.

---

## Task 4: Footer ~$ replay-intro target — implementation

**Files:**
- Modify: `libs/shared/ui/src/lib/footer/footer.ts`
- Modify: `libs/shared/ui/src/lib/footer/footer.html`

- [ ] **Step 1: Add the output + handler**

Open `libs/shared/ui/src/lib/footer/footer.ts` and apply two changes.

**1a.** Add a new output next to `readonly secretTriggered = output<void>();`:

```ts
  readonly replayIntroTriggered = output<void>();
```

**1b.** Add a handler method next to `protected onPromptTap()`:

```ts
  protected onReplayIntro(): void {
    this.replayIntroTriggered.emit();
  }
```

- [ ] **Step 2: Add the visible target to the template**

In `libs/shared/ui/src/lib/footer/footer.html`, replace the block:

```html
      <p class="font-mono text-xs text-text-muted flex items-center gap-2">
        <span>© {{ year() }} · Rahul E</span>
        <span aria-hidden="true">·</span>
        <a
          routerLink="/privacy"
          class="hover:text-accent-primary transition-colors"
        >
          privacy
        </a>
      </p>
```

…with:

```html
      <p class="font-mono text-xs text-text-muted flex items-center gap-2 flex-wrap">
        <span>© {{ year() }} · Rahul E</span>
        <span aria-hidden="true">·</span>
        <a
          routerLink="/privacy"
          class="hover:text-accent-primary transition-colors"
        >
          privacy
        </a>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          data-testid="footer-replay-intro"
          class="font-mono text-xs text-text-muted hover:text-accent-primary transition-colors p-0 bg-transparent border-0 cursor-pointer"
          (click)="onReplayIntro()"
        >
          <span class="text-text-muted">~$</span>
          replay-intro
        </button>
      </p>
```

- [ ] **Step 3: Run the test**

```bash
npx nx test ui --watch=false
```

Expected: 2 footer tests pass (prior + replay-intro).

- [ ] **Step 4: Lint**

```bash
npx nx lint ui
```

Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add libs/shared/ui
git commit -m "feat(footer): \`~\$ replay-intro\` target

Adds a visible button next to the privacy link that emits a new
\`replayIntroTriggered\` output. Consumers wire this to BootGuardService
+ a fresh boot overlay. Easter-egg-style discovery moment for the boot
animation: kept in the footer prompt-line family for cohesion."
```

---

## Task 5: App boot overlay — failing test

**Files:**
- Modify: `apps/web/src/app/app.spec.ts`

The existing spec has one test that imports `TERMINAL_AUTH` and provides a `vi.fn()` mock — that test must be preserved, and the new tests need the same mock provider so the terminal overlay still constructs.

- [ ] **Step 1: Replace the spec, keeping the existing test**

Replace the entire contents of `apps/web/src/app/app.spec.ts` with:

```ts
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BootGuardService } from '@rahul-dev/features-boot-sequence';
import { TERMINAL_AUTH } from '@rahul-dev/shared-terminal';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
    const overlay = fixture.nativeElement.querySelector('app-boot-sequence');
    expect(overlay).toBeTruthy();
  });

  it('does NOT render the boot overlay on a return visit', async () => {
    // Pre-flag the localStorage entry so shouldPlayLong() returns false at App
    // construction. BootGuardService is provideIn:'root', so we don't need to
    // touch DI — we just write the key it reads.
    localStorage.setItem(STORAGE_KEY, '1');

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: TERMINAL_AUTH, useValue: { authenticate: vi.fn() } },
      ],
    }).compileComponents();

    // Sanity-check that the guard agrees with what we set.
    expect(TestBed.inject(BootGuardService).shouldPlayLong()).toBe(false);

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('app-boot-sequence');
    expect(overlay).toBeNull();
  });
});
```

- [ ] **Step 2: Run to confirm the new tests fail**

```bash
npx nx test web --watch=false
```

Expected: original `'renders navbar…'` test still PASSES (App is unchanged); both new tests FAIL — App doesn't import `BootSequence` yet, so no `<app-boot-sequence>` element appears, and `BootGuardService` isn't yet a known import path… wait, actually it _is_ already exported from Plan 3. The `import { BootGuardService }` line itself will compile. The FAIL message will be: `expect(overlay).toBeTruthy()` got `null`.

---

## Task 6: App boot overlay — implementation

**Files:**
- Modify: `apps/web/src/app/app.ts`
- Modify: `apps/web/src/app/app.html`

- [ ] **Step 1: Wire the service + signal in app.ts**

Replace the entire contents of `apps/web/src/app/app.ts` with:

```ts
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {
  CommandPaletteOverlay,
  CommandPaletteService,
  type Command,
} from '@rahul-dev/shared-command-palette';
import {
  GrainOverlay,
  ScanLineOverlay,
} from '@rahul-dev/shared-cinematics';
import {
  BootGuardService,
  BootSequence,
} from '@rahul-dev/features-boot-sequence';
import { TerminalOverlay, TerminalService } from '@rahul-dev/shared-terminal';
import {
  THEMES,
  ThemeService,
  ThemeToggle,
  ViewSourceService,
  type ThemeName,
} from '@rahul-dev/shared-theme';
import {
  Footer,
  NavLink,
  Navbar,
  OfflineBanner,
  ScrollToTop,
  SocialLink,
} from '@rahul-dev/shared-ui';

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
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  private readonly palette = inject(CommandPaletteService);
  private readonly theme = inject(ThemeService);
  private readonly viewSource = inject(ViewSourceService);
  private readonly terminal = inject(TerminalService);
  private readonly bootGuard = inject(BootGuardService);

  protected readonly bootVisible = signal<boolean>(this.bootGuard.shouldPlayLong());

  protected readonly navLinks: readonly NavLink[] = [
    { label: 'About', href: '/about' },
    { label: 'Projects', href: '/projects' },
    { label: 'Playground', href: '/playground' },
    { label: 'Feed', href: '/feed' },
    { label: 'Contact', href: '/contact' },
  ];

  protected readonly socials: readonly SocialLink[] = [
    {
      label: 'GitHub',
      href: 'https://github.com/rahuledu6',
      icon: 'github',
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/rahule',
      icon: 'linkedin',
    },
    { label: 'Email', href: 'mailto:duboopathi@gmail.com', icon: 'mail' },
  ];

  constructor() {
    this.palette.register(this.buildCommands());
  }

  protected onLogoLongPress(): void {
    this.terminal.open();
  }

  protected onBootDone(): void {
    this.bootGuard.markPlayed();
    this.bootVisible.set(false);
  }

  protected onReplayIntro(): void {
    this.bootGuard.reset();
    this.bootVisible.set(true);
  }

  private buildCommands(): readonly Command[] {
    const navCommands: Command[] = [
      ...this.navLinks.map<Command>((link) => ({
        id: `nav:${link.href}`,
        label: `Go to ${link.label}`,
        group: 'navigate',
        keywords: [link.href.replace(/^\//, '')],
        run: () => void this.router.navigateByUrl(link.href),
      })),
      {
        id: 'nav:/',
        label: 'Go to Home',
        group: 'navigate',
        keywords: ['home', 'hero'],
        run: () => void this.router.navigateByUrl('/'),
      },
      {
        id: 'nav:/privacy',
        label: 'Go to Privacy policy',
        group: 'navigate',
        keywords: ['privacy', 'policy'],
        run: () => void this.router.navigateByUrl('/privacy'),
      },
    ];

    const themeCommands: Command[] = THEMES.map<Command>((t: ThemeName) => ({
      id: `theme:${t}`,
      label: `Theme: ${t}`,
      group: 'theme',
      keywords: ['theme', t],
      run: () => this.theme.setTheme(t),
    }));

    const actionCommands: Command[] = [
      {
        id: 'action:view-source',
        label: 'Toggle view-source overlay',
        group: 'action',
        keywords: ['source', 'annotate', 'teach'],
        hint: 'overlay',
        run: () => this.viewSource.toggle(),
      },
      {
        id: 'action:admin-login',
        label: 'Open admin terminal',
        group: 'action',
        keywords: ['admin', 'login', 'sudo', 'terminal'],
        hint: 'sudo su',
        run: () => this.terminal.open(),
      },
      {
        id: 'action:replay-intro',
        label: 'Replay intro / boot sequence',
        group: 'action',
        keywords: ['intro', 'boot', 'replay', 'sequence'],
        hint: '~$ replay-intro',
        run: () => this.onReplayIntro(),
      },
    ];

    return [...navCommands, ...themeCommands, ...actionCommands];
  }
}
```

(Note: the file gains `BootGuardService`/`BootSequence` imports, the `bootGuard` injection, the `bootVisible` signal, the `onBootDone()` and `onReplayIntro()` handlers, and a new `action:replay-intro` palette command. Everything else is unchanged.)

- [ ] **Step 2: Bind the overlay + footer event in app.html**

Replace the entire contents of `apps/web/src/app/app.html` with:

```html
<div class="min-h-dvh flex flex-col bg-bg-primary text-text-primary">
  <app-navbar [links]="navLinks" (logoLongPress)="onLogoLongPress()">
    <app-theme-toggle nav-actions />
  </app-navbar>
  <main class="flex-1">
    <router-outlet />
  </main>
  <app-footer
    [socials]="socials"
    (secretTriggered)="onLogoLongPress()"
    (replayIntroTriggered)="onReplayIntro()"
  />
  <app-offline-banner />
  <app-command-palette />
  <app-terminal-overlay />
  <app-scroll-to-top />
  <app-grain-overlay />
  <app-scan-line-overlay />
  @if (bootVisible()) {
    <app-boot-sequence (done)="onBootDone()" />
  }
</div>
```

- [ ] **Step 3: Run the test**

```bash
npx nx test web --watch=false
```

Expected: 2 App tests pass (first-visit overlay present, return-visit overlay absent).

- [ ] **Step 4: Typecheck the app**

```bash
npx nx typecheck web
```

Expected: clean.

- [ ] **Step 5: Lint**

```bash
npx nx lint web
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/app.ts apps/web/src/app/app.html apps/web/src/app/app.spec.ts
git commit -m "feat(app): wire boot-sequence overlay + replay-intro

Renders <app-boot-sequence> as an @if-gated overlay on first visit
(BootGuardService.shouldPlayLong()=true). On (done) marks played and
hides. Wires footer (replayIntroTriggered) -> reset guard + show again,
and adds a matching 'Replay intro' command in the palette.
SSR-safe: shouldPlayLong() returns false on the server, no overlay HTML."
```

---

## Task 7: Hero kinetic + decrypt — failing test

**Files:**
- Create: `apps/web/src/app/pages/home/home.spec.ts` _(new file — confirmed via Glob that no spec exists today)_

- [ ] **Step 1: Write the spec**

Create `apps/web/src/app/pages/home/home.spec.ts` with:

```ts
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';

describe('Home', () => {
  it('renders the kinetic name with aria-label = "Rahul E"', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const heading = fixture.nativeElement.querySelector(
      '.hero__name app-kinetic-heading [aria-label]',
    ) as HTMLElement | null;
    expect(heading).toBeTruthy();
    expect(heading?.getAttribute('aria-label')).toBe('Rahul E');
  });

  it('attaches appDecryptText to the hero kicker', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const kicker = fixture.nativeElement.querySelector(
      '.hero__kicker [aria-label="whoami --verbose"]',
    ) as HTMLElement | null;
    expect(kicker).toBeTruthy();
  });

  it('attaches appDecryptText to the hero tagline', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const tagline = fixture.nativeElement.querySelector(
      '.hero__role [aria-label="Angular · TypeScript · D3.js"]',
    ) as HTMLElement | null;
    expect(tagline).toBeTruthy();
  });

  it('marks every top-level page section as a SceneFrame host', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const scenes = fixture.nativeElement.querySelectorAll(
      'section[appSceneFrame]',
    );
    expect(scenes.length).toBeGreaterThanOrEqual(4);
  });
});
```

- [ ] **Step 2: Run to confirm the new tests fail**

```bash
npx nx test web --watch=false
```

Expected: 4 new Home assertions FAIL — kinetic heading missing, decrypt-text missing on kicker, decrypt-text missing on tagline, no `[appSceneFrame]` sections.

---

## Task 8: Hero kinetic + decrypt — implementation

**Files:**
- Modify: `apps/web/src/app/pages/home/home.ts`
- Modify: `apps/web/src/app/pages/home/home.html`
- Modify: `apps/web/src/app/pages/home/home.css`

- [ ] **Step 1: Update home.ts to import the cinematics + scene-frame**

Replace the entire contents of `apps/web/src/app/pages/home/home.ts` with:

```ts
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroGraph, type TechNode } from '@rahul-dev/features-hero-graph';
import { SceneFrame } from '@rahul-dev/features-scene-frame';
import { DecryptText, KineticHeading } from '@rahul-dev/shared-cinematics';
import { TerminalService } from '@rahul-dev/shared-terminal';
import { Button, Reveal, SectionHeading, TagChip } from '@rahul-dev/shared-ui';
import { Github, Linkedin, LucideAngularModule, Mail, MapPin } from 'lucide-angular';

interface FeaturedProject {
  readonly slug: string;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  readonly tech: readonly string[];
  readonly role: string;
  readonly status: string;
}

interface HomeCard {
  readonly kicker: string;
  readonly title: string;
  readonly description: string;
  readonly href: string;
}

@Component({
  selector: 'app-home',
  imports: [
    Button,
    Reveal,
    SectionHeading,
    TagChip,
    RouterLink,
    HeroGraph,
    LucideAngularModule,
    DecryptText,
    KineticHeading,
    SceneFrame,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly terminal = inject(TerminalService);

  protected readonly Github = Github;
  protected readonly Linkedin = Linkedin;
  protected readonly Mail = Mail;
  protected readonly MapPin = MapPin;

  protected readonly heroReady = signal<boolean>(false);

  protected readonly contact = {
    email: 'rahulennazhiyil6@gmail.com',
    github: 'https://github.com/rahulennazhiyil',
    linkedin: 'https://linkedin.com/in/rahul-ennazhiyil',
    location: 'Bengaluru, IN',
  };

  protected readonly featured: readonly FeaturedProject[] = [
    {
      slug: 'scraii',
      name: 'SCRAII',
      tagline: 'Text → SQL → chart. In one breath.',
      description:
        'AI-powered analytics platform at Data Unveil. Natural-language prompts become SQL queries and render as tables or live D3 / Chart.js visuals. Also home to the task-management & workflow module.',
      tech: ['Angular 19', 'Signals', 'TypeScript', 'D3.js', 'Chart.js', 'REST APIs'],
      role: 'Frontend · Oct 2025 – Present',
      status: 'Shipping',
    },
    {
      slug: 'finchscan',
      name: 'FinchSCAN',
      tagline: 'AML name-screening at enterprise scale.',
      description:
        'SaaS AML portal for screening high-risk individuals and entities. Built the screening + goAML reporting front-end and cut manual review time by 40% with real-time REST integrations and Chart.js visualisations.',
      tech: ['Angular 14–15', 'RxJS', 'Angular Material', 'Chart.js', 'Azure DevOps'],
      role: 'Frontend Engineer · Finch Innovate',
      status: 'Shipped',
    },
    {
      slug: 'finchcomply',
      name: 'FinchCOMPLY',
      tagline: 'Compliance workflows, automated.',
      description:
        'Compliance automation platform for enterprise regulatory workflows. Built risk-assessment and compliance-reporting UIs with PrimeNG and Bootstrap, wired real-time REST pipelines for status tracking.',
      tech: ['Angular 15–18', 'SCSS', 'PrimeNG', 'Bootstrap', 'Azure DevOps'],
      role: 'Frontend Engineer · Finch Innovate',
      status: 'Shipped',
    },
  ];

  protected readonly featuredCard: HomeCard = {
    kicker: 'play',
    title: 'Playground',
    description:
      'Live D3 demos: Kubernetes force graph, CI/CD Sankey, bundle treemap, fully-client-side finance analyzer. The visualization work, running.',
    href: '/playground',
  };

  protected readonly secondaryCards: readonly HomeCard[] = [
    {
      kicker: 'me',
      title: 'About',
      description:
        'Career timeline, tech bubbles, and the path from Angular to data viz.',
      href: '/about',
    },
    {
      kicker: 'write',
      title: 'Feed',
      description:
        'Notes, posts, and links from what I am learning or breaking this week.',
      href: '/feed',
    },
  ];

  protected onSecretTriggered(): void {
    this.terminal.open();
  }

  protected onNodeActivated(node: TechNode): void {
    void node;
  }

  protected onHeroEnter(): void {
    this.heroReady.set(true);
  }
}
```

(The diff vs. the prior file: three new imports — `SceneFrame`, `DecryptText`, `KineticHeading` — added to module + class imports, a new `heroReady` signal, and an `onHeroEnter()` handler. Field shapes are unchanged.)

- [ ] **Step 2: Update home.html — wrap sections + swap kinetic name + decrypt kicker**

Replace the entire contents of `apps/web/src/app/pages/home/home.html` with:

```html
<!-- ================= HERO ================= -->
<section
  appSceneFrame
  (sceneEnter)="onHeroEnter()"
  class="hero relative overflow-hidden"
  aria-label="Rahul E — intro"
>
  <!-- Atmospheric graph (pushed far behind the content). -->
  <div class="hero__graph" aria-hidden="true">
    <app-hero-graph
      (secretTriggered)="onSecretTriggered()"
      (nodeActivated)="onNodeActivated($event)"
    />
  </div>
  <div class="hero__mask" aria-hidden="true"></div>

  <div class="hero__shell">
    <!-- LEFT — identity + pitch + CTAs -->
    <div class="hero__lead">
      <div class="hero__status">
        <span class="hero__dot" aria-hidden="true"></span>
        <span class="hero__status-label">
          Available · Oct 2025 – Present @ Data Unveil
        </span>
      </div>

      <span class="hero__kicker">
        <span class="text-text-muted">~$</span>
        <span [appDecryptText]="'whoami --verbose'" [autoplay]="heroReady()">
          whoami --verbose
        </span>
      </span>

      <h1 class="hero__name">
        <app-kinetic-heading text="Rahul E" [ready]="heroReady()" />
      </h1>

      <p class="hero__role">
        Frontend Developer
        <span class="hero__sep" aria-hidden="true">/</span>
        <span [appDecryptText]="'Angular · TypeScript · D3.js'" [autoplay]="heroReady()">
          Angular · TypeScript · D3.js
        </span>
      </p>

      <p class="hero__pitch">
        I build <span class="hero__hi">fast, accessible web apps</span> that
        make dense data feel approachable. Three-plus years of production
        Angular — currently shipping an
        <span class="hero__hi">AI-powered text-to-SQL interface</span>
        on SCRAII at Data Unveil, and a task-management module alongside it.
      </p>

      <div class="hero__meta">
        <span class="hero__meta-item">
          <lucide-angular [img]="MapPin" [size]="14" aria-hidden="true" />
          {{ contact.location }}
        </span>
        <a class="hero__meta-link" [href]="'mailto:' + contact.email">
          <lucide-angular [img]="Mail" [size]="14" aria-hidden="true" />
          {{ contact.email }}
        </a>
        <a class="hero__meta-link" [href]="contact.github" target="_blank" rel="noopener">
          <lucide-angular [img]="Github" [size]="14" aria-hidden="true" />
          github.com/rahulennazhiyil
        </a>
        <a class="hero__meta-link" [href]="contact.linkedin" target="_blank" rel="noopener">
          <lucide-angular [img]="Linkedin" [size]="14" aria-hidden="true" />
          linkedin.com/in/rahul-ennazhiyil
        </a>
      </div>

      <div class="hero__ctas">
        <a routerLink="/projects">
          <app-button variant="primary" size="lg">View work →</app-button>
        </a>
        <a routerLink="/about" class="hero__inline">About me</a>
      </div>
    </div>

    <!-- RIGHT — telemetry HUD readout -->
    <aside class="hero__hud" aria-label="Profile readout">
      <header class="hero__hud-head">
        <span class="hero__hud-prompt">~$</span>
        <span class="hero__hud-title">scope/active</span>
      </header>

      <dl class="hero__hud-body">
        <div class="hero__hud-row">
          <dt>role</dt>
          <dd>Frontend Engineer</dd>
        </div>
        <div class="hero__hud-row">
          <dt>shipping</dt>
          <dd>SCRAII · text-to-SQL AI</dd>
        </div>
        <div class="hero__hud-row">
          <dt>company</dt>
          <dd>Data Unveil · Bengaluru</dd>
        </div>
        <div class="hero__hud-row">
          <dt>tenure</dt>
          <dd>3+ years production Angular</dd>
        </div>
        <div class="hero__hud-row hero__hud-row--lead">
          <dt>impact</dt>
          <dd>
            <span class="hero__hud-figure">−40%</span>
            <span class="hero__hud-figure-note">manual AML review · FinchSCAN</span>
          </dd>
        </div>
        <div class="hero__hud-row">
          <dt>open to</dt>
          <dd>senior FE / data-viz roles</dd>
        </div>
      </dl>
    </aside>
  </div>
</section>

<!-- ================= FEATURED WORK ================= -->
<section appSceneFrame class="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
  <div appReveal class="flex items-end justify-between flex-wrap gap-4 mb-8">
    <app-section-heading
      kicker="git log --featured"
      title="Selected work"
      subtitle="Three production platforms I've shaped the front end of."
    />
    <a routerLink="/projects" class="featured__more">
      All projects <span aria-hidden="true">→</span>
    </a>
  </div>

  <ul class="featured">
    @for (p of featured; track p.slug) {
      <li appReveal class="featured__card">
        <div class="featured__head">
          <span class="featured__index">{{ '0' + ($index + 1) }}</span>
          <span class="featured__status">{{ p.status }}</span>
        </div>
        <h3 class="featured__name">{{ p.name }}</h3>
        <p class="featured__tagline">{{ p.tagline }}</p>
        <p class="featured__desc">{{ p.description }}</p>
        <div class="featured__tech">
          @for (t of p.tech; track t) {
            <app-tag-chip>{{ t }}</app-tag-chip>
          }
        </div>
        <p class="featured__role">
          <span class="text-text-muted">role ·</span> {{ p.role }}
        </p>
      </li>
    }
  </ul>
</section>

<!-- ================= EXPLORE CARDS ================= -->
<section appSceneFrame class="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
  <div appReveal>
    <app-section-heading
      kicker="ls -la"
      title="What else is here"
      subtitle="A portfolio, a D3.js playground, a feed, and the long story."
    />
  </div>

  <div class="explore mt-10">
    <a
      appReveal
      [routerLink]="featuredCard.href"
      class="explore__hero group"
    >
      <div class="explore__head">
        <span class="explore__kicker">
          <span class="text-text-muted">~$</span> {{ featuredCard.kicker }}
        </span>
        <span class="explore__arrow" aria-hidden="true">→</span>
      </div>
      <h3 class="explore__title">{{ featuredCard.title }}</h3>
      <p class="explore__desc">{{ featuredCard.description }}</p>
    </a>

    <div class="explore__stack">
      @for (card of secondaryCards; track card.href) {
        <a
          appReveal
          [routerLink]="card.href"
          class="explore__small group"
        >
          <div class="explore__head">
            <span class="explore__kicker">
              <span class="text-text-muted">~$</span> {{ card.kicker }}
            </span>
            <span class="explore__arrow" aria-hidden="true">→</span>
          </div>
          <h3 class="explore__title explore__title--sm">{{ card.title }}</h3>
          <p class="explore__desc explore__desc--sm">{{ card.description }}</p>
        </a>
      }
    </div>
  </div>
</section>

<!-- ================= CONTACT CTA ================= -->
<section
  appSceneFrame
  appReveal
  class="max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-24 border-t border-glass-border"
>
  <div class="contact">
    <div class="contact__lead">
      <p class="contact__kicker">
        <span class="text-text-muted">~$</span> transmission/open
      </p>
      <p class="contact__pitch">
        Building the AI-powered
        <span class="text-accent-primary">SCRAII</span> platform at
        <span class="text-accent-primary">Data Unveil</span>.
        Open to senior Angular / data-viz roles and collaborations.
      </p>
    </div>
    <a [href]="'mailto:' + contact.email" class="contact__cta">
      <app-button variant="primary" size="lg">Say hello →</app-button>
    </a>
  </div>
</section>
```

(Notable diffs: hero `<section>` adds `appSceneFrame (sceneEnter)="onHeroEnter()"`; the `~$ whoami --verbose` text is wrapped in `[appDecryptText]="'whoami --verbose'" [autoplay]="heroReady()"`; the role line's `Angular · TypeScript · D3.js` segment becomes `[appDecryptText]="'Angular · TypeScript · D3.js'" [autoplay]="heroReady()"`; the `<h1 class="hero__name">` body becomes `<app-kinetic-heading text="Rahul E" [ready]="heroReady()" />`; the three remaining sections gain `appSceneFrame`. Everything else is unchanged.)

- [ ] **Step 3: Tweak home.css for the kinetic name fit**

The replaced `<h1 class="hero__name">` now contains `<app-kinetic-heading>` whose internal `<span class="kinetic-heading">` uses `display: inline-block`. The existing rule already cascades font-display + size into nested elements, but `KineticHeading` re-declares `font-family` via inherit by default. Append this rule at the end of `apps/web/src/app/pages/home/home.css`:

```css
.hero__name app-kinetic-heading,
.hero__name .kinetic-heading {
  font: inherit;
  letter-spacing: inherit;
  color: inherit;
}
```

(No other CSS edit is needed — the existing `.hero__name` declarations still drive the visual.)

- [ ] **Step 4: Run home tests**

```bash
npx nx test web --watch=false
```

Expected: all Home tests pass plus the App tests from earlier.

- [ ] **Step 5: Typecheck + lint**

```bash
npx nx typecheck web
npx nx lint web
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/pages/home apps/web/src/app/pages/home/home.css
git commit -m "feat(home): kinetic name + decrypt kicker + scene-frame wraps

Hero <h1>Rahul E</h1> now renders via <app-kinetic-heading>, kicker
'whoami --verbose' wraps appDecryptText (autoplays once the hero scene
intersects). Every top-level home section becomes a SceneFrame host;
the hero's sceneEnter flips a heroReady signal that drives the kinetic
ready-state and the decrypt autoplay. No scroll-lock yet (Plan 5)."
```

---

## Task 9: Smoke check

**Files:** none (read-only verification)

- [ ] **Step 1: Lint, typecheck, test sweep**

```bash
npx nx run-many -t lint,typecheck -p hero-graph,ui,web
npx nx run-many -t test -p hero-graph,ui,web --watch=false
```

Expected: all targets green. Test totals delta vs. before this plan:
- `hero-graph`: +1 test (HUD chrome present).
- `ui`: +1 test (footer replay-intro click emits output).
- `web`: +5 tests total — 2 App (overlay first vs. return visit) + 3 Home (kinetic, decrypt, scene-frame count).

- [ ] **Step 2: Production build of the web app**

```bash
npx nx build web
```

Expected: `Application bundle generation complete`. Confirm `dist/apps/web/browser` contains a `boot-sequence` artifact (the lib is consumed eagerly via path alias, so it's bundled into the main chunk — that's fine for this plan; budget impact is small).

- [ ] **Step 3: Hand-test the runtime contract**

```bash
npx nx serve web
```

Open `http://localhost:4200/`. Walk through this checklist out loud:

1. First load (clear `localStorage` first via DevTools → Application → Storage → Clear site data, then refresh): the boot terminal overlay should appear, type its 6 lines (~3s), then dismiss.
2. After dismiss: `Rahul E` should rise letter-by-letter via the kinetic heading; the `~$ whoami --verbose` kicker should briefly scramble before settling.
3. Hero graph should show four corner brackets, a `NODES NN` readout, and a live-updating `FRAME NNNN` counter.
4. Reload (`localStorage` now retains `rahul-dev:boot-seen=1`): no boot overlay; hero copy still animates on intersect.
5. Scroll down — the featured-work and explore sections fade in via `[appReveal]` (the scene-frame is in place but Plan 5 will add visible reveal animations to it).
6. Click the footer's `~$ replay-intro` link: the boot terminal should reappear and play the long script.
7. Toggle DevTools → Rendering → Emulate CSS media `prefers-reduced-motion: reduce`, refresh. Expect: boot auto-completes instantly; kinetic heading shows full text statically; decrypt-text shows final string statically; frame ticker is hidden.
8. View source: hero copy reads "Rahul E" and "whoami --verbose" — server-side Angular paints the final strings (decrypt directive sets target text in its effect; kinetic heading splits per-char but `aria-label` carries the full string).

If any of these fail, fix and re-run **Step 1** before moving on.

- [ ] **Step 4: Commit any post-smoke fixes (optional)**

If steps 1–8 surfaced fixes, commit them as additional small commits before closing the plan.

---

## Self-review checklist

- [ ] Spec § 3 (Hybrid first moment): App overlays the long boot on first visit; localStorage flag persists; replay-intro re-triggers.
- [ ] Spec § 4.2 home scene 1 (Boot / hero): boot overlay → graph reveal with HUD chrome (corner brackets, node count, frame ticker), name + tagline kinetic on the left.
- [ ] Spec § 4.6 easter eggs (existing #5 footer triple-tap, new #9 replay-intro): both wired; the prompt button is the only visible new tap target.
- [ ] Spec § 4.7 (perf): RAF ticker runs `outsideAngular` and uses `zone.run()` only to update the signal; cancelled in `ngOnDestroy`. Boot overlay only renders on first visit; SSR returns no overlay HTML.
- [ ] Spec § 4.8 (a11y): kinetic heading exposes full string via `aria-label`; decrypt-text sets `aria-label` once; frame ticker / brackets are `aria-hidden`. Boot still skippable (Plan 3).
- [ ] CLAUDE.md "The `~$` Prompt Rule": kicker, replay-intro link, frame ticker readouts all lead with the right prompt or namespace.
- [ ] No scroll-lock yet (Plan 5 will add `[appSceneScrollLock]`).

## Next plan

Plan 5 picks up from this checkpoint:
- Add `[appSceneScrollLock]` on the home root container.
- Add `MarqueeBand` strips between every scene.
- Restage scenes 2–5 (tech graph deep-dive, featured restaging into FILE 01/02 panels, HUD-styled metrics, TRANSMISSION about-preview), each with `KineticHeading` titles and `DecryptText` labels.
