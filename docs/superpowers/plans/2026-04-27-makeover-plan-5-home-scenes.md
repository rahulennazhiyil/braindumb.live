# KPR-verse Makeover — Plan 5: Home Other Scenes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restage scenes 2–4 of the home page (featured-work, explore, contact) with kinetic + decrypt headings driven by their own `(sceneEnter)` ready signals; insert `<app-marquee-band>` strips between every scene; enable `[appSceneScrollLock]` on the home root with the global CSS rule the directive expects.

**Architecture:** SectionHeading gains three opt-in inputs — `[decrypt]`, `[kineticTitle]`, `[ready]` — that wrap the kicker in `appDecryptText` and the title in `<app-kinetic-heading>` respectively. All defaults are off, keeping the 34 other consumers untouched. Home gets per-scene `featuredReady`/`exploreReady`/`contactReady` signals flipped by each section's existing `appSceneFrame`. `<app-marquee-band>` lives between sections (3 bands across 4 scenes). The home root container takes `[appSceneScrollLock]` and the matching `.scene-scroll-lock` rule lands in the global stylesheet (auto-disables under 768px / `prefers-reduced-motion` per the directive's documented contract).

**Tech Stack:** Angular 21 standalone APIs, signals, native CSS `scroll-snap-type`, vitest-angular.

**Spec reference:** `docs/superpowers/specs/2026-04-27-kprverse-makeover-design.md` § 4.2 (page-level scenes 2–5), § 6 (SectionHeading `[decrypt]`), § 4.7 (perf budget — pure CSS scroll-snap, no JS scrolljacking), § 4.8 (a11y — marquee `aria-hidden`, scroll-snap fallback).

**Out of scope (deferred):**
- **`SectionHeading [decrypt]` opt-in input (spec § 6) — deferred.** Crossing
  buildable libs via TS path aliases (`shared-ui` → `shared-cinematics`) hits
  ng-packagr's `Cannot destructure property 'pos' of 'file.referencedFiles'`
  bug. The user-visible result (decrypted kicker, kinetic title) is achieved
  inline in `home.html` instead — same UX, no cross-lib build issue. The
  enhancement can land in a later plan once we either (a) inline cinematics
  into `shared-ui`, (b) drop ng-packagr for an esbuild-based library
  pipeline, or (c) accept relative cross-lib imports.
- Featured-card "FILE 01 / FILE 02" labels with corner brackets → Plan 6
  (about + projects-index restaging — same primitive).
- Tech-graph deep-dive scene + metrics scene from spec § 4.2 — both deleted
  in the impeccable polish (memory tag 350); spec is now stale on those.
- `Button [magnetic]` input → Plan 8 with cursor / audio.

---

## File Structure

**Created:** _(none — every file in this plan already exists)_

**Modified:**
- `libs/shared/ui/src/lib/section-heading/section-heading.ts` — add `decrypt`, `kineticTitle`, `ready` inputs; import `DecryptText`, `KineticHeading`.
- `libs/shared/ui/src/lib/section-heading/section-heading.html` — conditional template that uses kinetic/decrypt when opted in.
- `libs/shared/ui/src/lib/section-heading/section-heading.spec.ts` — three new assertions covering the new inputs.
- `apps/web/src/styles.css` — global `.scene-scroll-lock` block per the directive's documented contract.
- `apps/web/src/app/pages/home/home.ts` — three new scene-ready signals and matching handlers; add `SceneScrollLock`, `MarqueeBand` to imports.
- `apps/web/src/app/pages/home/home.html` — root container gets `appSceneScrollLock`; insert three `<app-marquee-band>` strips; pass `[decrypt]/[kineticTitle]/[ready]` to two `<app-section-heading>` calls; decrypt the contact kicker.
- `apps/web/src/app/pages/home/home.css` — `.home__page` wrapper rule + tiny marquee-band spacing adjustment.
- `apps/web/src/app/pages/home/home.spec.ts` — assertions for the marquee bands, the scroll-lock attribute, the new sceneEnter handlers' wiring.

---

## Task 1: SectionHeading new inputs — failing test

**Files:**
- Modify: `libs/shared/ui/src/lib/section-heading/section-heading.spec.ts`

- [ ] **Step 1: Read the existing spec**

```bash
cat libs/shared/ui/src/lib/section-heading/section-heading.spec.ts
```

(Use the Read tool. Confirm what's currently asserted so the new assertions append cleanly under the same `describe`.)

- [ ] **Step 2: Replace the spec with the existing tests + the three new ones**

Replace the entire contents of `libs/shared/ui/src/lib/section-heading/section-heading.spec.ts` with:

```ts
import { TestBed } from '@angular/core/testing';
import { SectionHeading } from './section-heading';

describe('SectionHeading', () => {
  it('renders title text', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHeading],
    }).compileComponents();
    const fixture = TestBed.createComponent(SectionHeading);
    fixture.componentRef.setInput('title', 'Selected work');
    fixture.detectChanges();
    const h2 = fixture.nativeElement.querySelector('h2');
    expect(h2?.textContent).toContain('Selected work');
  });

  it('renders kicker as plain text by default (no decrypt)', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHeading],
    }).compileComponents();
    const fixture = TestBed.createComponent(SectionHeading);
    fixture.componentRef.setInput('title', 'X');
    fixture.componentRef.setInput('kicker', 'git log --featured');
    fixture.detectChanges();
    // Default render — no aria-label injected by DecryptText.
    expect(
      fixture.nativeElement.querySelector('[aria-label="git log --featured"]'),
    ).toBeNull();
  });

  it('wraps the kicker in appDecryptText when [decrypt]=true', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHeading],
    }).compileComponents();
    const fixture = TestBed.createComponent(SectionHeading);
    fixture.componentRef.setInput('title', 'X');
    fixture.componentRef.setInput('kicker', 'git log --featured');
    fixture.componentRef.setInput('decrypt', true);
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector(
      '[aria-label="git log --featured"]',
    );
    expect(span).toBeTruthy();
  });

  it('replaces the title with <app-kinetic-heading> when [kineticTitle]=true', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHeading],
    }).compileComponents();
    const fixture = TestBed.createComponent(SectionHeading);
    fixture.componentRef.setInput('title', 'Selected work');
    fixture.componentRef.setInput('kineticTitle', true);
    fixture.detectChanges();
    const kinetic = fixture.nativeElement.querySelector(
      'h2 app-kinetic-heading [aria-label]',
    );
    expect(kinetic?.getAttribute('aria-label')).toBe('Selected work');
  });
});
```

- [ ] **Step 3: Run to confirm the new tests fail**

```bash
npx nx test ui --watch=false
```

Expected: prior 1 test (the inferred title-render) passes; the three new tests FAIL because the inputs don't exist yet (TS error: `Property 'decrypt' does not exist on type 'SectionHeading'.`).

---

## Task 2: SectionHeading new inputs — implementation

**Files:**
- Modify: `libs/shared/ui/src/lib/section-heading/section-heading.ts`
- Modify: `libs/shared/ui/src/lib/section-heading/section-heading.html`

- [ ] **Step 1: Add the three new inputs and imports**

Replace the entire contents of `libs/shared/ui/src/lib/section-heading/section-heading.ts` with:

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecryptText, KineticHeading } from '@rahul-dev/shared-cinematics';

@Component({
  selector: 'app-section-heading',
  imports: [DecryptText, KineticHeading],
  templateUrl: './section-heading.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeading {
  readonly kicker = input<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly align = input<'left' | 'center'>('left');

  /** When true, the kicker text scrambles into place via DecryptText. */
  readonly decrypt = input<boolean>(false);
  /** When true, the title renders via <app-kinetic-heading>. */
  readonly kineticTitle = input<boolean>(false);
  /**
   * Drives both DecryptText autoplay and KineticHeading ready-state.
   * Defaults to true so non-cinematic consumers (the 34 existing pages
   * that don't opt into [decrypt] / [kineticTitle]) still get a stable
   * paint with no animation flicker.
   */
  readonly ready = input<boolean>(true);
}
```

- [ ] **Step 2: Update the template to opt into kinetic + decrypt**

Replace the entire contents of `libs/shared/ui/src/lib/section-heading/section-heading.html` with:

```html
<header
  [class]="
    'flex flex-col gap-2 ' +
    (align() === 'center' ? 'items-center text-center' : 'items-start text-left')
  "
>
  @if (kicker(); as k) {
    <span class="font-mono text-xs uppercase tracking-[0.18em] text-accent-primary">
      <span class="text-text-muted">~$</span>
      @if (decrypt()) {
        <span [appDecryptText]="k" [autoplay]="ready()">{{ k }}</span>
      } @else {
        {{ k }}
      }
    </span>
  }
  <h2 class="font-display font-bold text-3xl md:text-4xl text-text-primary">
    @if (kineticTitle()) {
      <app-kinetic-heading [text]="title()" [ready]="ready()" />
    } @else {
      {{ title() }}
    }
  </h2>
  @if (subtitle(); as s) {
    <p class="font-body text-text-secondary max-w-2xl">{{ s }}</p>
  }
</header>
```

(Notice the kicker tracking value flipped from `0.2em` to `0.18em` to match the system label spec the impeccable polish enforces — memory tag 337/338.)

- [ ] **Step 3: Run the tests**

```bash
npx nx test ui --watch=false
```

Expected: 4 SectionHeading tests pass plus the 2 existing Footer tests = 6 ui tests total.

- [ ] **Step 4: Lint**

```bash
npx nx lint ui
```

Expected: clean.

- [ ] **Step 5: Build (sanity check — SectionHeading depends on `@rahul-dev/shared-cinematics`)**

```bash
npx nx build ui
```

Expected: success. (If the path alias resolution fails, confirm `tsconfig.base.json` lists `@rahul-dev/shared-cinematics` and that `peerDependencies` in `libs/shared/ui/package.json` allows the import.)

- [ ] **Step 6: Commit**

```bash
git add libs/shared/ui
git commit -m "feat(section-heading): opt-in [decrypt] + [kineticTitle] + [ready]

Three additive inputs, all defaulting off. When [decrypt]=true the
kicker text scrambles into place via the cinematics DecryptText
directive; when [kineticTitle]=true the title renders inside an
<app-kinetic-heading>. [ready] gates both animations so consumers can
flip them on once a SceneFrame fires (sceneEnter). Existing 34
consumers untouched: defaults make this a no-op for them.

Plan: docs/superpowers/plans/2026-04-27-makeover-plan-5-home-scenes.md
Spec: docs/superpowers/specs/2026-04-27-kprverse-makeover-design.md § 6"
```

(The `§` is the literal section-symbol escape — write `§` directly if your shell handles it. The point is "spec § 6".)

---

## Task 3: Home scenes — failing test

**Files:**
- Modify: `apps/web/src/app/pages/home/home.spec.ts`

- [ ] **Step 1: Replace the spec with prior + new assertions**

Replace the entire contents of `apps/web/src/app/pages/home/home.spec.ts` with:

```ts
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TERMINAL_AUTH } from '@rahul-dev/shared-terminal';
import { describe, expect, it, vi } from 'vitest';
import { Home } from './home';

const baseProviders = [
  provideRouter([]),
  { provide: TERMINAL_AUTH, useValue: { authenticate: vi.fn() } },
  { provide: PLATFORM_ID, useValue: 'server' },
];

describe('Home', () => {
  it('renders the kinetic name with aria-label = "Rahul E"', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: baseProviders,
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
      providers: baseProviders,
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
      providers: baseProviders,
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
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const scenes = fixture.nativeElement.querySelectorAll(
      'section[appSceneFrame]',
    );
    expect(scenes.length).toBeGreaterThanOrEqual(4);
  });

  it('wraps the page root in an [appSceneScrollLock] container', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('[appSceneScrollLock]');
    expect(root).toBeTruthy();
  });

  it('inserts marquee bands between scenes', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const bands = fixture.nativeElement.querySelectorAll('app-marquee-band');
    // Four scenes -> three between-bands.
    expect(bands.length).toBeGreaterThanOrEqual(3);
  });

  it('decrypts the kickers on featured + explore section headings', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const featuredKicker = fixture.nativeElement.querySelector(
      '[aria-label="git log --featured"]',
    );
    const exploreKicker = fixture.nativeElement.querySelector(
      '[aria-label="ls -la"]',
    );
    expect(featuredKicker).toBeTruthy();
    expect(exploreKicker).toBeTruthy();
  });

  it('decrypts the contact kicker', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const contact = fixture.nativeElement.querySelector(
      '.contact__kicker [aria-label="transmission/open"]',
    );
    expect(contact).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run to confirm the new tests fail**

```bash
npx nx test web --watch=false
```

Expected: 4 prior Home tests still pass; 4 new tests FAIL — no `[appSceneScrollLock]` host, no `<app-marquee-band>` elements, no decrypt aria-labels on the section kickers or contact kicker.

---

## Task 4: Home scenes — implementation

**Files:**
- Modify: `apps/web/src/styles.css`
- Modify: `apps/web/src/app/pages/home/home.ts`
- Modify: `apps/web/src/app/pages/home/home.html`
- Modify: `apps/web/src/app/pages/home/home.css`

- [ ] **Step 1: Add the global `.scene-scroll-lock` block to styles.css**

Append this block to `apps/web/src/styles.css` (or merge with adjacent rules if your linter prefers grouping):

```css
/* ============ SceneScrollLock — engaged via [appSceneScrollLock] ============ */
.scene-scroll-lock {
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
}
.scene-scroll-lock > section {
  scroll-snap-align: start;
  scroll-snap-stop: always;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
@media (max-width: 767px), (prefers-reduced-motion: reduce) {
  .scene-scroll-lock { scroll-snap-type: none; }
  .scene-scroll-lock > section { min-height: 0; }
}
```

(`> section` instead of `> *` because the home root will mix `<section>`s and `<app-marquee-band>`s — only sections snap.)

- [ ] **Step 2: Read the current home.ts**

```bash
cat apps/web/src/app/pages/home/home.ts
```

Confirm the imports list and the existing `heroReady` / `onHeroEnter()` shape.

- [ ] **Step 3: Update home.ts with new signals + handlers + imports**

Replace the entire contents of `apps/web/src/app/pages/home/home.ts` with:

```ts
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroGraph, type TechNode } from '@rahul-dev/features-hero-graph';
import {
  MarqueeBand,
  SceneFrame,
  SceneScrollLock,
} from '@rahul-dev/features-scene-frame';
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
    SceneScrollLock,
    MarqueeBand,
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
  protected readonly featuredReady = signal<boolean>(false);
  protected readonly exploreReady = signal<boolean>(false);
  protected readonly contactReady = signal<boolean>(false);

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

  protected onFeaturedEnter(): void {
    this.featuredReady.set(true);
  }

  protected onExploreEnter(): void {
    this.exploreReady.set(true);
  }

  protected onContactEnter(): void {
    this.contactReady.set(true);
  }
}
```

(Diff vs. the prior file: three new signals, three new handlers, three new imports — `SceneScrollLock`, `MarqueeBand`, plus they were added to the @Component imports array. Field shapes unchanged.)

- [ ] **Step 4: Update home.html — root container + marquees + section-heading inputs + contact decrypt**

Replace the entire contents of `apps/web/src/app/pages/home/home.html` with:

```html
<div class="home__page" appSceneScrollLock>
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

  <app-marquee-band label="SCENE 02 / selected work · git log --featured · runtime live" />

  <!-- ================= FEATURED WORK ================= -->
  <section
    appSceneFrame
    (sceneEnter)="onFeaturedEnter()"
    class="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 w-full"
  >
    <div appReveal class="flex items-end justify-between flex-wrap gap-4 mb-8">
      <app-section-heading
        kicker="git log --featured"
        title="Selected work"
        subtitle="Three production platforms I've shaped the front end of."
        [decrypt]="true"
        [kineticTitle]="true"
        [ready]="featuredReady()"
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

  <app-marquee-band label="SCENE 03 / what else is here · ls -la · 03 entries" />

  <!-- ================= EXPLORE CARDS ================= -->
  <section
    appSceneFrame
    (sceneEnter)="onExploreEnter()"
    class="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 w-full"
  >
    <div appReveal>
      <app-section-heading
        kicker="ls -la"
        title="What else is here"
        subtitle="A portfolio, a D3.js playground, a feed, and the long story."
        [decrypt]="true"
        [kineticTitle]="true"
        [ready]="exploreReady()"
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

  <app-marquee-band label="SCENE 04 / transmission/open · mailto rahul · open to roles" />

  <!-- ================= CONTACT CTA ================= -->
  <section
    appSceneFrame
    (sceneEnter)="onContactEnter()"
    appReveal
    class="max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-24 border-t border-glass-border w-full"
  >
    <div class="contact">
      <div class="contact__lead">
        <p class="contact__kicker">
          <span class="text-text-muted">~$</span>
          <span [appDecryptText]="'transmission/open'" [autoplay]="contactReady()">
            transmission/open
          </span>
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
</div>
```

(Notable diffs: outer `<div class="home__page" appSceneScrollLock>`; three `<app-marquee-band>` strips between the four sections; each post-hero section gains `(sceneEnter)="on…Enter()"`; both `<app-section-heading>` calls take `[decrypt]="true" [kineticTitle]="true" [ready]="<scene>Ready()"`; contact kicker wraps `appDecryptText`; sections gain `w-full` so the scroll-lock min-height works without horizontal centering issues.)

- [ ] **Step 5: Update home.css for the page wrapper**

Append this block to `apps/web/src/app/pages/home/home.css`:

```css
/* ============ Page wrapper for SceneScrollLock ============ */
.home__page {
  display: flex;
  flex-direction: column;
}
.home__page > app-marquee-band {
  /* Marquee bands are visual interstitials — keep them out of the snap target list. */
  flex: 0 0 auto;
}
```

(The directive's contract says `> section { min-height: 100dvh; }`; we already match that, and `app-marquee-band` is intentionally excluded from `> section` so it doesn't snap.)

- [ ] **Step 6: Run the tests**

```bash
npx nx test web --watch=false
```

Expected: 8 Home tests pass + 2 App + 4 routes + 1 NotFound = 15 web tests total.

- [ ] **Step 7: Typecheck + lint + build**

```bash
npx nx typecheck web
npx nx lint web
npx nx build web
```

Expected: all clean. Build will recompile home.css; check the warning line for the new size — it should still fit within the 12kb error cap from Plan 4 (commit 4b190aa).

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/app/pages/home apps/web/src/styles.css
git commit -m "feat(home): scenes 2-4 cinematic restage + scroll-lock + marquees

Home root container takes [appSceneScrollLock]; styles.css gains the
matching .scene-scroll-lock global rule (auto-disabled <768px and
under prefers-reduced-motion). Three <app-marquee-band> strips land
between the four scenes. Each post-hero section now flips its own
ready signal via (sceneEnter), driving the new SectionHeading [decrypt]
+ [kineticTitle] inputs on the featured-work and explore headings.
Contact kicker wraps appDecryptText.

Plan: docs/superpowers/plans/2026-04-27-makeover-plan-5-home-scenes.md
Spec: docs/superpowers/specs/2026-04-27-kprverse-makeover-design.md § 4.2"
```

---

## Task 5: Smoke check

**Files:** none (read-only verification)

- [ ] **Step 1: Lint + typecheck sweep**

```bash
npx nx run-many -t lint,typecheck -p ui,web
```

Expected: 4 successful targets.

- [ ] **Step 2: Test sweep**

```bash
npx nx run-many -t test -p ui,web --watch=false
```

Expected: ui +3 tests (4 SectionHeading total — 1 prior + 3 new) and web +4 tests (8 Home total — 4 prior + 4 new). All green.

- [ ] **Step 3: Production build of the web app**

```bash
npx nx build web
```

Expected: success. home.css size: should land between 8.5–10kb (warning between 8 and 12 is acceptable; error >12kb is not).

- [ ] **Step 4: Hand-test the runtime contract**

```bash
npx nx serve web
```

Open `http://localhost:4200/` and walk through:

1. Clear `localStorage` → refresh. The boot overlay plays (Plan 4).
2. After dismiss: hero kinetic name + decrypt-text kicker/tagline animate.
3. Scroll down. The viewport snaps to the **featured-work** scene (it covers ≥100dvh now). The `~$ git log --featured` kicker scrambles into place; `Selected work` rises letter-by-letter.
4. Continue scrolling: a marquee band scrolls horizontally between scenes (label `SCENE 03 / what else is here · ls -la · 03 entries`).
5. **Explore** scene snaps next; its kicker + title animate the same way.
6. Final marquee band → **contact** snaps; `~$ transmission/open` decrypts.
7. Resize the window below 768px or toggle `prefers-reduced-motion` in DevTools → refresh: scroll-snap is **off** (free scrolling); marquees pause; kinetic / decrypt animations all collapse to final text instantly.
8. View source: kicker labels read as plain final strings; titles read as full strings (kinetic-heading exposes `aria-label` with the full text).

If any step fails, fix and re-run **Step 1** + **Step 2**.

- [ ] **Step 5: Plan index update**

In `docs/superpowers/plans/README.md`, flip the Plan 5 row from `🔜 next` to `✅ shipped` and the Plan 6 row from `⏳ planned` to `🔜 next`. Rewrite the Plan 5 briefing to reference the as-shipped commits.

```bash
git add docs/superpowers/plans/README.md
git commit -m "docs(plans): mark Plan 5 shipped, Plan 6 next"
```

---

## Self-review checklist

- [ ] Spec § 4.2 home scenes 2 (featured) and 3 (explore): kinetic title + decrypt kicker via SectionHeading inputs. ✅
- [ ] Spec § 4.2 home scene 5 (contact): `transmission/open` kicker decrypts. ✅
- [ ] Spec § 4.2 marquee band between every scene: 3 bands across 4 scenes. ✅
- [ ] Spec § 6 SectionHeading `[decrypt]` opt-in input: ✅ (plus `[kineticTitle]` and `[ready]` companions).
- [ ] Spec § 4.7 perf: pure CSS scroll-snap (no JS scrolljacking); marquees pause off-screen via existing CSS rule. ✅
- [ ] Spec § 4.8 a11y: marquee `aria-hidden="true"` (existing `MarqueeBand` template); scroll-snap auto-disabled <768px and under reduced motion; decrypt aria-label keeps screen readers stable. ✅
- [ ] CLAUDE.md "The `~$` Prompt Rule": every new kicker leads with `~$`. ✅
- [ ] CLAUDE.md "Theme-Material Rule": marquee CSS uses `var(--glass-bg)` / `var(--glass-border)` — themes still control its surface. ✅
- [ ] Spec § 4.2 scenes 2 (tech graph deep-dive) and 4 (metrics) — both deleted in impeccable polish; the spec is stale on these. Documented in "Out of scope" above.

## Next plan

Plan 6 picks up from this checkpoint:
- Apply the same `SectionHeading` + `SceneFrame` + marquee treatment to `/about` (3 scenes: Identity / Stack / Off-grid).
- Same to `/projects` (1 featured panel + ARCHIVE grid).
- Featured-card "FILE 01 / FILE 02" panels with decrypt-text + corner brackets — defer to here since the same primitive applies to both home featured cards and projects-index cards.
