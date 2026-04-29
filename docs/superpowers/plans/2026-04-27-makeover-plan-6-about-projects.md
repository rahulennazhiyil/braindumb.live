# KPR-verse Makeover — Plan 6: About + Projects-index Restaging

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the home-page cinematic treatment to `/about` (3 scenes — Bio / Career / Tech Stack) and `/projects` (one cinematic header on the existing grid). Each scene gains an inline `appDecryptText` kicker + `<app-kinetic-heading>` title, an `[appSceneFrame]` + `(sceneEnter)` ready signal, and (about only) `[appSceneScrollLock]` on the page root with `<app-marquee-band>` strips between scenes.

**Architecture:** Same pattern as Plan 5. About has three logical scenes wrapped in `<section appSceneFrame>` blocks inside a `<main appSceneScrollLock>` wrapper; the Bio scene loses its plain `<h1>bio__name</h1>` markup in favour of the same kicker + kinetic title shape used on home. Projects-index keeps its single-section structure (the spec's 1-featured-panel + ARCHIVE grid restructure is deferred — it's a content rework, not a primitive treatment) and just gets the cinematic header.

**Tech Stack:** Angular 21 standalone APIs, signals, vitest-angular. **Cross-buildable-lib path-alias imports stay banned** (memory tag `feedback_ng_packagr_cross_lib`) — directives are imported into the page components only, never into `shared-ui`.

**Spec reference:** `docs/superpowers/specs/2026-04-27-kprverse-makeover-design.md` § 4.2 (about — 3 scenes; projects — index), § 4.7 (perf), § 4.8 (a11y).

**Out of scope (deferred):**
- About "Off-grid" scene (spec § 4.2) — no source content for it; spec § 7 forbids new copy. Bio + Career + Tech Stack already cover the three present scenes.
- Projects-index "1-featured panel + ARCHIVE grid" restructure — content rework, not a primitive treatment; defer.
- Featured-card / project-card "FILE 01" / "FILE 02" decrypt labels with corner brackets — same cross-buildable-lib import problem the SectionHeading enhancement hit. Add a static `data-file` chrome (no DecryptText) inside the page component when ready, or solve the lib pipeline first.
- 0.18em-tracking-rule violations in **other** pages (memory tag 373) — Plan 7 is the natural home for those (kinetic-only treatment for feed/contact/playground/admin).

---

## File Structure

**Created:**
- `apps/web/src/app/pages/about/about.spec.ts` — assertions for the 3 scenes + scroll-lock + marquees + decrypt + kinetic.
- `apps/web/src/app/pages/projects/projects-index.spec.ts` — assertions for the cinematic header.

**Modified:**
- `apps/web/src/app/pages/about/about.ts` — three new `*Ready` signals; imports add `SceneFrame`, `SceneScrollLock`, `MarqueeBand`, `DecryptText`, `KineticHeading`. Drop the unused `SectionHeading` import (the 3 sections now use inline cinematic markup so the SectionHeading component is no longer needed here).
- `apps/web/src/app/pages/about/about.html` — root wraps in `<main appSceneScrollLock class="about__page">`; sections gain `appSceneFrame (sceneEnter)`; bio kicker becomes `~$ whoami --about` decrypted; bio name → `<app-kinetic-heading>`; career + tech-stack kickers + titles take the inline cinematic treatment; two marquee bands between the three scenes.
- `apps/web/src/app/pages/about/about.css` — `.about__page` flex wrapper; `.bio__name app-kinetic-heading` font inheritance reset; small spacing tweaks for snapped sections.
- `apps/web/src/app/pages/projects/projects-index.ts` — add `bioReady`/`projectsReady` signal + `onProjectsEnter()` handler; imports `SceneFrame`, `DecryptText`, `KineticHeading`; drop the unused `SectionHeading` import.
- `apps/web/src/app/pages/projects/projects-index.html` — wrap content in `<section appSceneFrame (sceneEnter)>`; replace `<app-section-heading>` with the inline cinematic kicker + kinetic title block. (No scroll-lock — single section.)

---

## Task 1: About spec — failing test

**Files:**
- Create: `apps/web/src/app/pages/about/about.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { About } from './about';

describe('About', () => {
  it('wraps the page in [appSceneScrollLock]', async () => {
    await TestBed.configureTestingModule({
      imports: [About],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(About);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[appSceneScrollLock]'),
    ).toBeTruthy();
  });

  it('renders three [appSceneFrame] sections', async () => {
    await TestBed.configureTestingModule({
      imports: [About],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(About);
    fixture.detectChanges();
    const scenes = fixture.nativeElement.querySelectorAll(
      'section[appSceneFrame]',
    );
    expect(scenes.length).toBe(3);
  });

  it('inserts marquee bands between scenes', async () => {
    await TestBed.configureTestingModule({
      imports: [About],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(About);
    fixture.detectChanges();
    const bands = fixture.nativeElement.querySelectorAll('app-marquee-band');
    expect(bands.length).toBeGreaterThanOrEqual(2);
  });

  it('decrypts the bio kicker', async () => {
    await TestBed.configureTestingModule({
      imports: [About],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(About);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="whoami --about"]'),
    ).toBeTruthy();
  });

  it('renders the bio name via <app-kinetic-heading>', async () => {
    await TestBed.configureTestingModule({
      imports: [About],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(About);
    fixture.detectChanges();
    const kinetic = fixture.nativeElement.querySelector(
      '.bio__name app-kinetic-heading [aria-label]',
    );
    expect(kinetic?.getAttribute('aria-label')).toBe('Rahul E');
  });

  it('decrypts career + tech-stack kickers', async () => {
    await TestBed.configureTestingModule({
      imports: [About],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(About);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="git log --career"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[aria-label="npm list --depth=0"]'),
    ).toBeTruthy();
  });

  it('renders kinetic Career and Tech Stack titles', async () => {
    await TestBed.configureTestingModule({
      imports: [About],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(About);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Career"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Tech Stack"]'),
    ).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run to confirm new tests fail**

```bash
npx nx test web --watch=false
```

Expected: 7 new About assertions FAIL — none of the cinematic markup exists yet. (The career-timeline/tech-bubbles components currently spin up D3 in `ngAfterViewInit` — these tests run on the default browser platform without `PLATFORM_ID: 'server'`; if the D3 simulation throws on happy-dom, mark the spec as needing the same `PLATFORM_ID: 'server'` provider used in `home.spec.ts`. Check the failure type before assuming.)

---

## Task 2: About — implementation

**Files:**
- Modify: `apps/web/src/app/pages/about/about.ts`
- Modify: `apps/web/src/app/pages/about/about.html`
- Modify: `apps/web/src/app/pages/about/about.css`

- [ ] **Step 1: Update about.ts**

Replace the entire contents of `apps/web/src/app/pages/about/about.ts` with:

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CareerTimeline } from '@rahul-dev/features-career-timeline';
import {
  MarqueeBand,
  SceneFrame,
  SceneScrollLock,
} from '@rahul-dev/features-scene-frame';
import { TechBubbles } from '@rahul-dev/features-tech-bubbles';
import { DecryptText, KineticHeading } from '@rahul-dev/shared-cinematics';
import { Reveal } from '@rahul-dev/shared-ui';
import { Github, Linkedin, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-about',
  imports: [
    Reveal,
    CareerTimeline,
    TechBubbles,
    LucideAngularModule,
    DecryptText,
    KineticHeading,
    SceneFrame,
    SceneScrollLock,
    MarqueeBand,
  ],
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  protected readonly openToOpportunities = signal(true);
  protected readonly Github = Github;
  protected readonly Linkedin = Linkedin;

  protected readonly bioReady = signal<boolean>(false);
  protected readonly careerReady = signal<boolean>(false);
  protected readonly stackReady = signal<boolean>(false);

  protected onBioEnter(): void {
    this.bioReady.set(true);
  }

  protected onCareerEnter(): void {
    this.careerReady.set(true);
  }

  protected onStackEnter(): void {
    this.stackReady.set(true);
  }
}
```

- [ ] **Step 2: Replace about.html**

Replace the entire contents of `apps/web/src/app/pages/about/about.html` with:

```html
<main class="about__page" appSceneScrollLock>
  <!-- ================= BIO ================= -->
  <section
    appSceneFrame
    (sceneEnter)="onBioEnter()"
    class="about__scene about__scene--bio max-w-5xl mx-auto px-4 md:px-6 py-16"
    aria-label="Rahul E — about"
  >
    @if (openToOpportunities()) {
      <div class="open-badge">
        <span class="open-badge__dot" aria-hidden="true"></span>
        Open to opportunities
      </div>
    }

    <span class="bio__kicker font-mono text-xs uppercase tracking-[0.18em] text-accent-primary">
      <span class="text-text-muted">~$</span>
      <span [appDecryptText]="'whoami --about'" [autoplay]="bioReady()">
        whoami --about
      </span>
    </span>

    <h1 class="bio__name">
      <app-kinetic-heading text="Rahul E" [ready]="bioReady()" />
    </h1>
    <p class="bio__tagline">Frontend Developer · Angular · Data Visualisation</p>

    <p class="bio__text">
      I build fast, accessible web applications with Angular — mostly the kind that
      make dense data feel approachable. Three-plus years of shipping production Angular,
      the last stretch at Data Unveil where I've been deep in D3, real-time dashboards,
      and design systems.
    </p>
    <p class="bio__text">
      Outside the day job I'm building this site as a living playground: an Nx monorepo,
      Angular 21 SSR, Supabase, and whatever D3 experiment catches my eye.
    </p>

    <div class="bio__links">
      <a href="https://github.com/rahulennazhiyil" target="_blank" rel="noopener" class="bio__link">
        <lucide-angular [img]="Github" [size]="15" aria-hidden="true" />
        GitHub
      </a>
      <a href="https://linkedin.com/in/rahul-e" target="_blank" rel="noopener" class="bio__link">
        <lucide-angular [img]="Linkedin" [size]="15" aria-hidden="true" />
        LinkedIn
      </a>
    </div>
  </section>

  <app-marquee-band label="SCENE 02 / career · git log --career · 3+ years prod angular" />

  <!-- ================= CAREER ================= -->
  <section
    appSceneFrame
    (sceneEnter)="onCareerEnter()"
    appReveal
    class="about__scene max-w-5xl mx-auto px-4 md:px-6 py-16 w-full"
  >
    <header class="flex flex-col gap-2 items-start text-left">
      <span class="font-mono text-xs uppercase tracking-[0.18em] text-accent-primary">
        <span class="text-text-muted">~$</span>
        <span [appDecryptText]="'git log --career'" [autoplay]="careerReady()">
          git log --career
        </span>
      </span>
      <h2 class="font-display font-bold text-3xl md:text-4xl text-text-primary">
        <app-kinetic-heading text="Career" [ready]="careerReady()" />
      </h2>
      <p class="font-body text-text-secondary max-w-2xl">
        Where I've been and what I've shipped.
      </p>
    </header>
    <div class="mt-10">
      <app-career-timeline />
    </div>
  </section>

  <app-marquee-band label="SCENE 03 / tech stack · npm list --depth=0 · bubbles by expertise" />

  <!-- ================= TECH STACK ================= -->
  <section
    appSceneFrame
    (sceneEnter)="onStackEnter()"
    appReveal
    class="about__scene max-w-5xl mx-auto px-4 md:px-6 py-16 w-full"
  >
    <header class="flex flex-col gap-2 items-start text-left">
      <span class="font-mono text-xs uppercase tracking-[0.18em] text-accent-primary">
        <span class="text-text-muted">~$</span>
        <span [appDecryptText]="'npm list --depth=0'" [autoplay]="stackReady()">
          npm list --depth=0
        </span>
      </span>
      <h2 class="font-display font-bold text-3xl md:text-4xl text-text-primary">
        <app-kinetic-heading text="Tech Stack" [ready]="stackReady()" />
      </h2>
      <p class="font-body text-text-secondary max-w-2xl">
        Bubble size = expertise level. Hover to explore.
      </p>
    </header>
    <div class="mt-10">
      <app-tech-bubbles />
    </div>
  </section>
</main>
```

- [ ] **Step 3: Update about.css**

Append this block at the end of `apps/web/src/app/pages/about/about.css`:

```css
/* ============ Page wrapper for SceneScrollLock ============ */
.about__page {
  display: flex;
  flex-direction: column;
}
.about__page > app-marquee-band {
  flex: 0 0 auto;
}

/* Bio name uses the same kinetic-heading inheritance reset as home. */
.bio__name app-kinetic-heading,
.bio__name .kinetic-heading {
  font: inherit;
  letter-spacing: inherit;
  color: inherit;
}

/* Section headers wrap a kinetic-heading in their h2 — keep the h2 box. */
.about__scene h2 app-kinetic-heading,
.about__scene h2 .kinetic-heading {
  font: inherit;
  letter-spacing: inherit;
  color: inherit;
}
```

- [ ] **Step 4: Run About tests**

```bash
npx nx test web --watch=false
```

Expected: all 7 About assertions pass. If the test setup hits a D3 / ResizeObserver crash inside `<app-career-timeline>` or `<app-tech-bubbles>` on the browser platform, add `{ provide: PLATFORM_ID, useValue: 'server' }` to the spec's providers array (mirror `home.spec.ts`).

- [ ] **Step 5: Typecheck + lint**

```bash
npx nx typecheck web
npx nx lint web
```

Expected: clean.

- [ ] **Step 6: Build (sanity check — about.css size)**

```bash
npx nx build web
```

Expected: success. about.css should still fit under the 12kb error cap from Plan 4.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/app/pages/about
git commit -m "feat(about): scroll-lock + 3 scenes (bio/career/stack) + marquees

About page restaged to mirror home: <main appSceneScrollLock> wrapper
with three appSceneFrame sections, two marquee bands between them, and
inline DecryptText kickers + KineticHeading titles per scene. Bio
section's h1 swaps for <app-kinetic-heading text='Rahul E'>; the
'~$ whoami --about' kicker decrypts on intersect. Plain SectionHeading
import dropped — inline cinematic markup avoids the cross-buildable-lib
ng-packagr issue (see memory feedback_ng_packagr_cross_lib).

Plan: docs/superpowers/plans/2026-04-27-makeover-plan-6-about-projects.md
Spec: docs/superpowers/specs/2026-04-27-kprverse-makeover-design.md § 4.2"
```

---

## Task 3: Projects-index spec — failing test

**Files:**
- Create: `apps/web/src/app/pages/projects/projects-index.spec.ts`

- [ ] **Step 1: Write the spec**

The page calls `ProjectService.listPublished()` in the constructor — the test must provide a stub.

```ts
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProjectService } from '@rahul-dev/core-supabase';
import { describe, expect, it, vi } from 'vitest';
import { ProjectsIndex } from './projects-index';

const stubService = {
  listPublished: vi.fn().mockResolvedValue([]),
};

describe('ProjectsIndex', () => {
  it('renders inside an [appSceneFrame] section', async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsIndex],
      providers: [
        provideRouter([]),
        { provide: ProjectService, useValue: stubService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProjectsIndex);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('section[appSceneFrame]'),
    ).toBeTruthy();
  });

  it('decrypts the projects kicker', async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsIndex],
      providers: [
        provideRouter([]),
        { provide: ProjectService, useValue: stubService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProjectsIndex);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="ls ./projects"]'),
    ).toBeTruthy();
  });

  it('renders the kinetic Projects title', async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsIndex],
      providers: [
        provideRouter([]),
        { provide: ProjectService, useValue: stubService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProjectsIndex);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Projects"]'),
    ).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run to confirm new tests fail**

```bash
npx nx test web --watch=false
```

Expected: 3 new ProjectsIndex tests FAIL — no `[appSceneFrame]` section, no decrypt kicker, no kinetic title.

---

## Task 4: Projects-index — implementation

**Files:**
- Modify: `apps/web/src/app/pages/projects/projects-index.ts`
- Modify: `apps/web/src/app/pages/projects/projects-index.html`

- [ ] **Step 1: Update projects-index.ts**

Replace the entire contents of `apps/web/src/app/pages/projects/projects-index.ts` with:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ProjectService } from '@rahul-dev/core-supabase';
import { SceneFrame } from '@rahul-dev/features-scene-frame';
import { DecryptText, KineticHeading } from '@rahul-dev/shared-cinematics';
import type { Project } from '@rahul-dev/shared-types';
import { LoadingSkeleton, ProjectCard, Reveal } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-projects-index',
  imports: [
    LoadingSkeleton,
    ProjectCard,
    Reveal,
    DecryptText,
    KineticHeading,
    SceneFrame,
  ],
  templateUrl: './projects-index.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsIndex {
  protected readonly skeletonItems = Array.from({ length: 6 }, (_, i) => i);
  private readonly service = inject(ProjectService);

  protected readonly items = signal<readonly Project[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly indexReady = signal<boolean>(false);

  protected readonly ordered = computed<readonly Project[]>(() => {
    const list = this.items();
    return [...list].sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return a.sort_order - b.sort_order;
    });
  });

  constructor() {
    void this.refresh();
  }

  protected hrefFor(p: Project): { href: string; external: boolean } {
    if (p.live_url) return { href: p.live_url, external: true };
    if (p.github_url) return { href: p.github_url, external: true };
    return { href: `/projects/${p.slug}`, external: false };
  }

  protected onIndexEnter(): void {
    this.indexReady.set(true);
  }

  protected async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.items.set(await this.service.listPublished());
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load.');
    } finally {
      this.loading.set(false);
    }
  }
}
```

- [ ] **Step 2: Update projects-index.html**

Replace the entire contents of `apps/web/src/app/pages/projects/projects-index.html` with:

```html
<section
  appSceneFrame
  (sceneEnter)="onIndexEnter()"
  class="max-w-6xl mx-auto px-4 md:px-6 py-16 flex flex-col gap-8"
>
  <header class="flex flex-col gap-2 items-start text-left">
    <span class="font-mono text-xs uppercase tracking-[0.18em] text-accent-primary">
      <span class="text-text-muted">~$</span>
      <span [appDecryptText]="'ls ./projects'" [autoplay]="indexReady()">
        ls ./projects
      </span>
    </span>
    <h1 class="font-display font-bold text-3xl md:text-4xl text-text-primary">
      <app-kinetic-heading text="Projects" [ready]="indexReady()" />
    </h1>
    <p class="font-body text-text-secondary max-w-2xl">
      Case studies, production work, and side projects. Featured first.
    </p>
  </header>

  @if (error(); as e) {
    <p class="font-mono text-xs text-error">
      <span class="text-text-muted">&gt;</span> {{ e }}
    </p>
  }

  @if (loading()) {
    <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Loading projects">
      @for (i of skeletonItems; track i) {
        <li class="glass p-6 flex flex-col gap-4 min-h-[160px]">
          <app-loading-skeleton height="0.5rem" width="35%" />
          <app-loading-skeleton height="1.375rem" width="75%" />
          <app-loading-skeleton height="0.8rem" width="100%" />
          <app-loading-skeleton height="0.8rem" width="65%" />
          <div class="flex gap-1.5 mt-auto">
            <app-loading-skeleton height="1.25rem" width="4rem" />
            <app-loading-skeleton height="1.25rem" width="4rem" />
          </div>
        </li>
      }
    </ul>
  } @else if (ordered().length === 0) {
    <div class="glass p-8 text-center flex flex-col gap-2 items-center">
      <span class="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">
        <span class="text-accent-primary">~$</span> ls --empty
      </span>
      <p class="font-body text-sm text-text-secondary">
        No public projects yet. They'll land here as they get written up.
      </p>
    </div>
  } @else {
    <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      @for (p of ordered(); track p.id) {
        @let link = hrefFor(p);
        <li appReveal>
          <app-project-card
            [title]="p.title"
            [description]="p.description ?? ''"
            [techTags]="p.tech_tags ?? []"
            [href]="link.href"
            [external]="link.external"
          />
        </li>
      }
    </ul>
  }
</section>
```

(Notable diffs: `<main>` → `<section appSceneFrame>`; `<app-section-heading>` replaced with the inline header pattern (matches home + about); empty-state kicker tracking flipped from `0.2em` to `0.18em` to match the system label spec — same fix the impeccable session applied to home, memory tag 373 docs the wider pattern.)

- [ ] **Step 3: Run ProjectsIndex tests**

```bash
npx nx test web --watch=false
```

Expected: 3 ProjectsIndex tests pass.

- [ ] **Step 4: Typecheck + lint + build**

```bash
npx nx typecheck web
npx nx lint web
npx nx build web
```

Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/pages/projects
git commit -m "feat(projects-index): cinematic header + scene-frame

Replaces <app-section-heading> with the inline kicker + kinetic title
pattern used on home + about. Wraps the page in a single
<section appSceneFrame> with an indexReady signal flipped on intersect,
driving the DecryptText autoplay and KineticHeading ready state. Empty
-state kicker tracking corrected from 0.2em to 0.18em (system label
spec). No scroll-lock — single section.

Plan: docs/superpowers/plans/2026-04-27-makeover-plan-6-about-projects.md
Spec: docs/superpowers/specs/2026-04-27-kprverse-makeover-design.md § 4.2"
```

---

## Task 5: Smoke check + plan index update

**Files:** `docs/superpowers/plans/README.md`

- [ ] **Step 1: Multi-project lint + typecheck**

```bash
npx nx run-many -t lint,typecheck -p web,ui,hero-graph
```

Expected: 6 successful targets (3 projects × 2 tasks).

- [ ] **Step 2: Multi-project test**

```bash
npx nx run-many -t test -p web,ui,hero-graph --watch=false
```

Expected: web +10 (7 About + 3 ProjectsIndex), ui unchanged, hero-graph unchanged. All green.

- [ ] **Step 3: Production build**

```bash
npx nx build web
```

Expected: clean. Both `about.css` and `projects-index.css` (which doesn't exist — there's no styleUrl) should fit under the 12kb cap.

- [ ] **Step 4: Hand-test the runtime**

```bash
npx nx serve web
```

Walk:
1. Navigate to `/about` (link from nav). Expect: snap-scroll between Bio / Career / Tech Stack scenes; kicker on each scene scrambles into place; `Rahul E` rises letter-by-letter on Bio; marquee strips between sections; reduced-motion toggles in DevTools collapse all animations.
2. Navigate to `/projects`. Expect: cinematic header (`~$ ls ./projects` decrypts; `Projects` rises). Grid below loads normally.
3. View source on both pages: kickers and titles read as final strings (kinetic-heading exposes `aria-label` with the full text; decrypt sets the target text instantly when not autoplaying — i.e. on SSR).

If any step fails, fix and re-run **Step 1** + **Step 2**.

- [ ] **Step 5: Plan index update**

Edit `docs/superpowers/plans/README.md`:

- Status table: flip Plan 6 row from `🔜 next` to `✅ shipped`; flip Plan 7 row from `⏳ planned` to `🔜 next`.
- Briefing: rewrite the Plan 6 entry with the as-shipped commit references and a "Deferred" note for the Off-grid scene + 1-featured-panel + ARCHIVE-grid + FILE-NN labels.

Commit:

```bash
git add docs/superpowers/plans/README.md docs/superpowers/plans/2026-04-27-makeover-plan-6-about-projects.md
git commit -m "docs(plans): mark Plan 6 shipped, Plan 7 next + plan doc"
```

---

## Self-review checklist

- [ ] Spec § 4.2 about — 3 scenes (Identity / Stack / Off-grid): mapped to existing Bio / Career / Tech Stack content. Off-grid deferred (no source content). ✅
- [ ] Spec § 4.2 about — kinetic + decrypt + scene-frame + scroll-lock + marquees: all wired. ✅
- [ ] Spec § 4.2 projects — index "1 featured panel + ARCHIVE grid": deferred (content rework). Cinematic header lands. ✅ (partial)
- [ ] Spec § 4.7 perf: same primitives as Plan 5; nothing new beyond what's already proven. ✅
- [ ] Spec § 4.8 a11y: scroll-snap fallback under 768px / reduced motion (global rule already in styles.css from Plan 5); marquees `aria-hidden`; kinetic/decrypt expose `aria-label`. ✅
- [ ] CLAUDE.md `~$` Prompt Rule: every kicker leads with `~$`. ✅
- [ ] Memory `feedback_ng_packagr_cross_lib`: cinematics imports stay at the page-component layer; no buildable lib touches `@rahul-dev/shared-cinematics`. ✅
- [ ] 0.18em tracking enforced on the kickers I touched (about empty-state in projects-index too). ✅

## Next plan

Plan 7 (kinetic-only treatment for `/feed`, `/contact`, `/playground`, `/admin/*`) is up next per the index. That plan can also sweep the remaining 0.18em tracking violations across the broader codebase (memory tag 373).
