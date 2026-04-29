# KPR-verse Makeover — Plan 7: Kinetic-only Treatment for Remaining Pages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lighter cinematic treatment — kicker decrypt + kinetic title + per-page `[appSceneFrame]` reveal — applied to `/feed`, `/contact`, `/privacy`, `/playground` (index), and `/playground/<slug>` (via the shared `DemoFrame` component). No scroll-lock, no marquee bands; these pages prioritise readability/productivity over theatre. As a bonus sweep, fix the 0.18em-tracking-rule violations the impeccable session catalogued (memory tag 373) on the kickers and form labels we're already touching.

**Architecture:** Same pattern as Plan 6's `/projects` page — replace `<app-section-heading>` with the inline kicker + kinetic title block (`appDecryptText` on the kicker, `<app-kinetic-heading>` on the title), wrap the page root in a single `<section appSceneFrame (sceneEnter)>` with a `pageReady` (or named-equivalent) signal that drives both autoplay + ready inputs. `DemoFrame` is itself an Angular component in `apps/web/` — not a buildable lib — so the cross-buildable-lib import ban (memory `feedback_ng_packagr_cross_lib`) doesn't apply, and `DecryptText` / `KineticHeading` can be imported directly.

**Tech Stack:** Angular 21 standalone APIs, signals, vitest-angular.

**Spec reference:** `docs/superpowers/specs/2026-04-27-kprverse-makeover-design.md` § 4.2 (`/feed`, `/contact`, `/privacy` — traditional scroll, kinetic-section reveals; `/playground` — traditional scroll with kinetic reveals), § 4.7 (perf — these pages stay cheap). CLAUDE.md "Design Context" — Brand cinematics stay **off** `/admin/*`.

**Out of scope (deferred):**
- `/admin/*` cinematic treatment (CLAUDE.md design contract — admin is product-register, productivity-first).
- Playground demo-card hover preview (3s SVG snippet) per spec § 4.2 — that's a content / D3 build, not a primitive treatment.
- Force Pop game restage — already shipped per phase 2; spec § 4.2 says "stays exactly as built".
- Per-card "FILE NN" labels with corner brackets — same buildable-lib import problem (carried forward from Plan 6).

---

## File Structure

**Created:**
- `apps/web/src/app/pages/feed/feed.spec.ts` — assertions for scene-frame + decrypt kicker + kinetic title.
- `apps/web/src/app/pages/contact/contact.spec.ts` — same shape.
- `apps/web/src/app/pages/privacy/privacy.spec.ts` — same.
- `apps/web/src/app/pages/playground/playground-index.spec.ts` — same.
- `apps/web/src/app/pages/playground/demo-frame.spec.ts` — same (input-driven kicker + title).

**Modified:**
- `apps/web/src/app/pages/feed/feed.ts` + `feed.html` — replace SectionHeading with inline cinematic header; `feedReady` signal; scene-frame.
- `apps/web/src/app/pages/contact/contact.ts` + `contact.html` — same; **plus** fix `tracking-[0.2em]` → `tracking-[0.18em]` on every form label and the contact kicker (system label spec).
- `apps/web/src/app/pages/privacy/privacy.ts` + `privacy.html` — same.
- `apps/web/src/app/pages/playground/playground-index.ts` + `playground-index.html` — same (also fix the "soon" badge tracking).
- `apps/web/src/app/pages/playground/demo-frame.ts` + `demo-frame.html` — replace SectionHeading with inline cinematic header (note: `kicker`, `title`, `summary` are already inputs, so the `<app-kinetic-heading>` and `[appDecryptText]` get those input strings directly); `demoReady` signal; scene-frame on the page root.

**No CSS file changes** — all styles are tailwind utilities; only the tracking value flips.

---

## Task 1: Feed — failing test

**Files:**
- Create: `apps/web/src/app/pages/feed/feed.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FeedService } from '@rahul-dev/core-supabase';
import { describe, expect, it, vi } from 'vitest';
import { Feed } from './feed';

const stubService = {
  list: vi.fn().mockResolvedValue([]),
};

const baseProviders = [
  provideRouter([]),
  { provide: FeedService, useValue: stubService },
  { provide: PLATFORM_ID, useValue: 'server' },
];

describe('Feed', () => {
  it('renders inside a [appSceneFrame] section', async () => {
    await TestBed.configureTestingModule({
      imports: [Feed],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Feed);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('section[appSceneFrame]'),
    ).toBeTruthy();
  });

  it('decrypts the feed kicker', async () => {
    await TestBed.configureTestingModule({
      imports: [Feed],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Feed);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="tail -f feed.log"]'),
    ).toBeTruthy();
  });

  it('renders the kinetic Feed title', async () => {
    await TestBed.configureTestingModule({
      imports: [Feed],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Feed);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Feed"]'),
    ).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npx nx test web --watch=false
```

Expected: 3 new Feed assertions FAIL.

---

## Task 2: Feed — implementation

**Files:**
- Modify: `apps/web/src/app/pages/feed/feed.ts`
- Modify: `apps/web/src/app/pages/feed/feed.html`

- [ ] **Step 1: Update feed.ts**

Replace the entire contents of `apps/web/src/app/pages/feed/feed.ts` with:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FeedService } from '@rahul-dev/core-supabase';
import { SceneFrame } from '@rahul-dev/features-scene-frame';
import { DecryptText, KineticHeading } from '@rahul-dev/shared-cinematics';
import {
  FEED_ITEM_TYPES,
  type FeedItem,
  type FeedItemType,
} from '@rahul-dev/shared-types';
import { BlogCard, LoadingSkeleton, Reveal } from '@rahul-dev/shared-ui';

type FilterValue = 'all' | FeedItemType;

@Component({
  selector: 'app-feed',
  imports: [
    BlogCard,
    LoadingSkeleton,
    Reveal,
    DecryptText,
    KineticHeading,
    SceneFrame,
  ],
  templateUrl: './feed.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Feed {
  protected readonly skeletonItems = Array.from({ length: 4 }, (_, i) => i);
  private readonly service = inject(FeedService);

  protected readonly filters: readonly FilterValue[] = [
    'all',
    ...FEED_ITEM_TYPES,
  ];
  protected readonly filter = signal<FilterValue>('all');
  protected readonly items = signal<readonly FeedItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly feedReady = signal<boolean>(false);

  protected readonly visible = computed<readonly FeedItem[]>(() => {
    const f = this.filter();
    const list = this.items();
    return f === 'all' ? list : list.filter((i) => i.type === f);
  });

  constructor() {
    void this.refresh();
  }

  protected setFilter(v: FilterValue): void {
    this.filter.set(v);
  }

  protected onFeedEnter(): void {
    this.feedReady.set(true);
  }

  protected async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.items.set(await this.service.list({ limit: 50 }));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load.');
    } finally {
      this.loading.set(false);
    }
  }

  protected countFor(f: FilterValue): number {
    const list = this.items();
    return f === 'all' ? list.length : list.filter((i) => i.type === f).length;
  }

  protected hrefFor(item: FeedItem): string | undefined {
    return item.url ?? undefined;
  }
}
```

- [ ] **Step 2: Update feed.html**

Replace the entire contents of `apps/web/src/app/pages/feed/feed.html` with:

```html
<section
  appSceneFrame
  (sceneEnter)="onFeedEnter()"
  class="max-w-4xl mx-auto px-4 md:px-6 py-16 flex flex-col gap-8"
>
  <header class="flex flex-col gap-2 items-start text-left">
    <span class="font-mono text-xs uppercase tracking-[0.18em] text-accent-primary">
      <span class="text-text-muted">~$</span>
      <span [appDecryptText]="'tail -f feed.log'" [autoplay]="feedReady()">
        tail -f feed.log
      </span>
    </span>
    <h1 class="font-display font-bold text-3xl md:text-4xl text-text-primary">
      <app-kinetic-heading text="Feed" [ready]="feedReady()" />
    </h1>
    <p class="font-body text-text-secondary max-w-2xl">
      Blog posts, external links, project updates, learning notes.
    </p>
  </header>

  <nav
    class="flex flex-wrap gap-2"
    role="tablist"
    aria-label="Feed type filter"
  >
    @for (f of filters; track f) {
      <button
        type="button"
        role="tab"
        class="px-3 py-1.5 rounded-chip font-mono text-xs uppercase tracking-[0.18em] transition-colors border cursor-pointer"
        [class.bg-accent-primary]="filter() === f"
        [class.text-bg-primary]="filter() === f"
        [class.border-accent-primary]="filter() === f"
        [class.text-text-secondary]="filter() !== f"
        [class.border-border]="filter() !== f"
        [class.hover:text-accent-primary]="filter() !== f"
        [attr.aria-selected]="filter() === f"
        (click)="setFilter(f)"
      >
        {{ f }} <span class="opacity-60">{{ countFor(f) }}</span>
      </button>
    }
  </nav>

  @if (error(); as e) {
    <p class="font-mono text-xs text-error">
      <span class="text-text-muted">&gt;</span> {{ e }}
    </p>
  }

  @if (loading()) {
    <ul class="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Loading feed">
      @for (i of skeletonItems; track i) {
        <li class="glass p-6 flex flex-col gap-4 min-h-[140px]">
          <app-loading-skeleton height="1.125rem" width="70%" />
          <app-loading-skeleton height="0.8rem" width="100%" />
          <app-loading-skeleton height="0.8rem" width="55%" />
          <div class="flex gap-1.5 mt-auto">
            <app-loading-skeleton height="1.25rem" width="3.5rem" />
            <app-loading-skeleton height="1.25rem" width="3.5rem" />
          </div>
        </li>
      }
    </ul>
  } @else if (visible().length === 0) {
    <div class="glass p-8 text-center flex flex-col gap-2 items-center">
      <span class="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">
        <span class="text-accent-primary">~$</span> ls --empty
      </span>
      <p class="font-body text-sm text-text-secondary">
        Nothing here yet. Admin adds items via <span class="font-mono">/admin/feed</span>.
      </p>
    </div>
  } @else {
    <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
      @for (item of visible(); track item.id) {
        <li appReveal>
          <app-blog-card
            [title]="item.title"
            [excerpt]="item.content ?? item.url ?? ''"
            [publishedAt]="item.published_at"
            [tags]="item.tags ?? []"
            [href]="hrefFor(item)"
            [external]="true"
          />
        </li>
      }
    </ul>
  }
</section>
```

(Notable diffs vs prior: replaces `<app-section-heading>` with the inline cinematic header; wraps `<main>` → `<section appSceneFrame>`; filter tab tracking flipped from `tracking-wider` (≈0.05em) to `tracking-[0.18em]` to match the system spec; empty-state kicker tracking flipped from `0.2em` to `0.18em`.)

- [ ] **Step 3: Run tests + typecheck + lint**

```bash
npx nx test web --watch=false
npx nx typecheck web
npx nx lint web
```

Expected: 3 Feed assertions pass, all other web tests still green, lint clean.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/pages/feed
git commit -m "feat(feed): cinematic header + scene-frame + tracking sweep

Replaces <app-section-heading> with the inline kicker + kinetic title
pattern. Wraps the page in <section appSceneFrame> with a feedReady
signal. Filter tabs and empty-state kicker tracking corrected from
0.2em/wider to 0.18em (system label spec)."
```

---

## Task 3: Contact — failing test

**Files:**
- Create: `apps/web/src/app/pages/contact/contact.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ContactService } from '@rahul-dev/core-supabase';
import { describe, expect, it, vi } from 'vitest';
import { Contact } from './contact';

const stubService = {
  submit: vi.fn().mockResolvedValue(undefined),
};

const baseProviders = [
  provideRouter([]),
  { provide: ContactService, useValue: stubService },
  { provide: PLATFORM_ID, useValue: 'server' },
];

describe('Contact', () => {
  it('renders inside a [appSceneFrame] section', async () => {
    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('section[appSceneFrame]'),
    ).toBeTruthy();
  });

  it('decrypts the contact kicker', async () => {
    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="echo $EMAIL"]'),
    ).toBeTruthy();
  });

  it('renders the kinetic Contact title', async () => {
    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Contact"]'),
    ).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npx nx test web --watch=false
```

Expected: 3 new Contact assertions FAIL.

---

## Task 4: Contact — implementation

**Files:**
- Modify: `apps/web/src/app/pages/contact/contact.ts`
- Modify: `apps/web/src/app/pages/contact/contact.html`

- [ ] **Step 1: Update contact.ts**

Replace the entire contents of `apps/web/src/app/pages/contact/contact.ts` with:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContactService } from '@rahul-dev/core-supabase';
import { SceneFrame } from '@rahul-dev/features-scene-frame';
import { DecryptText, KineticHeading } from '@rahul-dev/shared-cinematics';
import { type SocialLink } from '@rahul-dev/shared-ui';
import { map } from 'rxjs';

/**
 * Contact page — also the landing for unauthenticated visitors that the
 * authGuard redirects away from /admin. When the redirect adds
 * `?from=admin`, the page surfaces the "this area is for Rahul" banner.
 */
@Component({
  selector: 'app-contact',
  imports: [FormsModule, DecryptText, KineticHeading, SceneFrame],
  templateUrl: './contact.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  private readonly service = inject(ContactService);
  private readonly route = inject(ActivatedRoute);

  protected readonly socials: readonly SocialLink[] = [
    { label: 'GitHub', href: 'https://github.com/rahuledu6', icon: 'github' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rahule', icon: 'linkedin' },
    { label: 'Email', href: 'mailto:duboopathi@gmail.com', icon: 'mail' },
  ];

  protected readonly fromAdmin = toSignal(
    this.route.queryParamMap.pipe(map((m) => m.get('from') === 'admin')),
    { initialValue: false },
  );

  protected readonly contactReady = signal<boolean>(false);

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly message = signal('');
  protected readonly submitting = signal(false);
  protected readonly sent = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly canSubmit = computed(
    () =>
      !this.submitting() &&
      this.name().trim().length > 0 &&
      /.+@.+\..+/.test(this.email().trim()) &&
      this.message().trim().length >= 4,
  );

  protected onContactEnter(): void {
    this.contactReady.set(true);
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.canSubmit()) return;
    this.submitting.set(true);
    this.error.set(null);
    try {
      await this.service.submit({
        name: this.name().trim(),
        email: this.email().trim(),
        message: this.message().trim(),
      });
      this.sent.set(true);
      this.name.set('');
      this.email.set('');
      this.message.set('');
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Send failed.');
    } finally {
      this.submitting.set(false);
    }
  }
}
```

- [ ] **Step 2: Update contact.html**

Replace the entire contents of `apps/web/src/app/pages/contact/contact.html` with:

```html
<section
  appSceneFrame
  (sceneEnter)="onContactEnter()"
  class="max-w-3xl mx-auto px-4 md:px-6 py-16 flex flex-col gap-8"
>
  @if (fromAdmin()) {
    <aside
      class="glass border-accent-primary/30 p-4 flex flex-col gap-1"
      role="status"
    >
      <span class="font-mono text-xs uppercase tracking-[0.18em] text-accent-primary">
        <span class="text-text-muted">~#</span> denied
      </span>
      <p class="font-body text-sm text-text-secondary">
        That area is for Rahul. If you're looking for him, the form below
        is the quickest way to reach him.
      </p>
    </aside>
  }

  <header class="flex flex-col gap-2 items-start text-left">
    <span class="font-mono text-xs uppercase tracking-[0.18em] text-accent-primary">
      <span class="text-text-muted">~$</span>
      <span [appDecryptText]="'echo $EMAIL'" [autoplay]="contactReady()">
        echo $EMAIL
      </span>
    </span>
    <h1 class="font-display font-bold text-3xl md:text-4xl text-text-primary">
      <app-kinetic-heading text="Contact" [ready]="contactReady()" />
    </h1>
    <p class="font-body text-text-secondary max-w-2xl">
      The fastest way to reach me. Messages land in a Supabase inbox I read.
    </p>
  </header>

  @if (sent()) {
    <p class="glass p-4 font-mono text-xs text-accent-primary">
      <span class="text-text-muted">&gt;</span> message sent. talk soon.
    </p>
  } @else {
    <form
      class="glass p-5 flex flex-col gap-4"
      (submit)="submit($event)"
      novalidate
    >
      @if (error(); as e) {
        <p class="font-mono text-xs text-error">
          <span class="text-text-muted">&gt;</span> {{ e }}
        </p>
      }

      <div class="flex flex-col gap-1">
        <label
          for="contact-name"
          class="font-mono text-xs uppercase tracking-[0.18em] text-text-muted"
          >name</label
        >
        <input
          id="contact-name"
          type="text"
          class="bg-bg-surface border border-border rounded-chip px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:border-accent-primary/60"
          name="name"
          required
          minlength="1"
          [ngModel]="name()"
          (ngModelChange)="name.set($event)"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label
          for="contact-email"
          class="font-mono text-xs uppercase tracking-[0.18em] text-text-muted"
          >email</label
        >
        <input
          id="contact-email"
          type="email"
          autocomplete="email"
          class="bg-bg-surface border border-border rounded-chip px-3 py-2 font-mono text-sm text-text-primary focus:outline-none focus:border-accent-primary/60"
          name="email"
          required
          [ngModel]="email()"
          (ngModelChange)="email.set($event)"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label
          for="contact-message"
          class="font-mono text-xs uppercase tracking-[0.18em] text-text-muted"
          >message</label
        >
        <textarea
          id="contact-message"
          class="bg-bg-surface border border-border rounded-chip px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:border-accent-primary/60 min-h-[140px] resize-y"
          name="message"
          required
          minlength="4"
          [ngModel]="message()"
          (ngModelChange)="message.set($event)"
        ></textarea>
      </div>

      <div class="flex items-center gap-2 justify-end">
        <button
          type="submit"
          class="px-4 py-2 rounded-chip bg-accent-primary text-bg-primary hover:shadow-glow hover:-translate-y-0.5 font-mono text-xs uppercase tracking-[0.18em] transition-all disabled:opacity-40"
          [disabled]="!canSubmit()"
        >
          {{ submitting() ? 'sending…' : 'send' }}
        </button>
      </div>
    </form>
  }

  <section class="flex flex-col gap-3">
    <h2 class="font-mono text-xs uppercase tracking-[0.18em] text-accent-primary">
      <span class="text-text-muted">~$</span> cat ./socials
    </h2>
    <ul class="flex flex-wrap gap-3">
      @for (s of socials; track s.href) {
        <li>
          <a
            [href]="s.href"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-chip border border-border text-text-secondary hover:text-accent-primary hover:border-accent-primary/60 font-mono text-xs uppercase tracking-[0.18em] transition-colors"
          >
            {{ s.label }}
          </a>
        </li>
      }
    </ul>
  </section>
</section>
```

(Notable diffs: every `tracking-[0.2em]` and `tracking-wider` flipped to `tracking-[0.18em]` — 6 sites in this file. `<app-section-heading>` replaced with inline cinematic header. `<main>` → `<section appSceneFrame>`. `~#` is intentional — root-prompt indicator in the denied banner, not a `~$` violation.)

- [ ] **Step 3: Run tests + typecheck + lint**

```bash
npx nx test web --watch=false
npx nx typecheck web
npx nx lint web
```

Expected: 3 Contact assertions pass, all green.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/pages/contact
git commit -m "feat(contact): cinematic header + scene-frame + tracking sweep

Inline DecryptText kicker + KineticHeading title; <section appSceneFrame>
wrapper with contactReady signal. Six tracking-[0.2em]/wider violations
across form labels, socials kicker, denied-banner kicker, send button
flipped to tracking-[0.18em] (system label spec, memory tag 373)."
```

---

## Task 5: Privacy + Playground-index — failing tests

These two pages have a near-identical SectionHeading swap. Combine into one task pair to keep the plan tight.

**Files:**
- Create: `apps/web/src/app/pages/privacy/privacy.spec.ts`
- Create: `apps/web/src/app/pages/playground/playground-index.spec.ts`

- [ ] **Step 1: Write privacy spec**

```ts
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { Privacy } from './privacy';

const baseProviders = [
  provideRouter([]),
  { provide: PLATFORM_ID, useValue: 'server' },
];

describe('Privacy', () => {
  it('renders inside a [appSceneFrame] section', async () => {
    await TestBed.configureTestingModule({
      imports: [Privacy],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Privacy);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('section[appSceneFrame]'),
    ).toBeTruthy();
  });

  it('decrypts the privacy kicker', async () => {
    await TestBed.configureTestingModule({
      imports: [Privacy],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Privacy);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="cat /privacy"]'),
    ).toBeTruthy();
  });

  it('renders the kinetic Privacy title', async () => {
    await TestBed.configureTestingModule({
      imports: [Privacy],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Privacy);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Privacy"]'),
    ).toBeTruthy();
  });
});
```

- [ ] **Step 2: Write playground-index spec**

```ts
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { PlaygroundIndex } from './playground-index';

const baseProviders = [
  provideRouter([]),
  { provide: PLATFORM_ID, useValue: 'server' },
];

describe('PlaygroundIndex', () => {
  it('renders inside a [appSceneFrame] section', async () => {
    await TestBed.configureTestingModule({
      imports: [PlaygroundIndex],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(PlaygroundIndex);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('section[appSceneFrame]'),
    ).toBeTruthy();
  });

  it('decrypts the playground kicker', async () => {
    await TestBed.configureTestingModule({
      imports: [PlaygroundIndex],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(PlaygroundIndex);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="ls ./playground"]'),
    ).toBeTruthy();
  });

  it('renders the kinetic playground title', async () => {
    await TestBed.configureTestingModule({
      imports: [PlaygroundIndex],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(PlaygroundIndex);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector(
        '[aria-label="Visualization playground"]',
      ),
    ).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run to confirm both fail**

```bash
npx nx test web --watch=false
```

Expected: 6 new assertions FAIL across the two spec files.

---

## Task 6: Privacy + Playground-index — implementation

**Files:**
- Modify: `apps/web/src/app/pages/privacy/privacy.ts`
- Modify: `apps/web/src/app/pages/privacy/privacy.html`
- Modify: `apps/web/src/app/pages/playground/playground-index.ts`
- Modify: `apps/web/src/app/pages/playground/playground-index.html`

- [ ] **Step 1: Update privacy.ts**

Replace the entire contents of `apps/web/src/app/pages/privacy/privacy.ts` with:

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SceneFrame } from '@rahul-dev/features-scene-frame';
import { DecryptText, KineticHeading } from '@rahul-dev/shared-cinematics';

@Component({
  selector: 'app-privacy',
  imports: [RouterLink, DecryptText, KineticHeading, SceneFrame],
  templateUrl: './privacy.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Privacy {
  protected readonly privacyReady = signal<boolean>(false);

  protected onPrivacyEnter(): void {
    this.privacyReady.set(true);
  }
}
```

- [ ] **Step 2: Update privacy.html**

Replace the entire contents of `apps/web/src/app/pages/privacy/privacy.html` with:

```html
<section
  appSceneFrame
  (sceneEnter)="onPrivacyEnter()"
  class="max-w-3xl mx-auto px-4 md:px-6 py-16 flex flex-col gap-8"
>
  <header class="flex flex-col gap-2 items-start text-left">
    <span class="font-mono text-xs uppercase tracking-[0.18em] text-accent-primary">
      <span class="text-text-muted">~$</span>
      <span [appDecryptText]="'cat /privacy'" [autoplay]="privacyReady()">
        cat /privacy
      </span>
    </span>
    <h1 class="font-display font-bold text-3xl md:text-4xl text-text-primary">
      <app-kinetic-heading text="Privacy" [ready]="privacyReady()" />
    </h1>
    <p class="font-body text-text-secondary max-w-2xl">
      How rahul.dev tracks visitors, and what it deliberately doesn't.
    </p>
  </header>

  <section class="flex flex-col gap-3 font-body text-text-secondary leading-relaxed">
    <h2 class="font-display font-bold text-xl text-text-primary mt-4">
      What gets recorded
    </h2>
    <p>
      When analytics is enabled in the app config, every page navigation
      records: the URL path, the referrer (if the browser shares it),
      your user-agent string, coarse device type (desktop / mobile /
      tablet), browser + OS derived from the user-agent, screen
      dimensions, browser language, and the timezone reported by your
      browser.
    </p>
    <p>
      No cookies are set. No third-party scripts run. Nothing is sent to
      Google, Meta, Vercel, or any analytics vendor — the data lives
      only in this site's own Supabase database.
    </p>

    <h2 class="font-display font-bold text-xl text-text-primary mt-4">
      What does <em>not</em> get recorded
    </h2>
    <p>
      Your raw IP address is never stored. It's used only at write-time
      to resolve an approximate country (Phase 11.1) and then discarded.
      Your real identity is never recorded.
    </p>

    <h2 class="font-display font-bold text-xl text-text-primary mt-4">
      How "unique visitors" works
    </h2>
    <p>
      For the admin dashboard's "unique visitors" count, a SHA-256 hash
      is computed from a daily-rotated random salt + your user-agent.
      The salt is stored in your browser's localStorage and rotates
      every UTC day, which means today's hash cannot be correlated with
      tomorrow's. Phase 11.1 moves the salt rotation server-side via a
      Supabase Edge Function for full privacy guarantees even against
      someone with DB access.
    </p>

    <h2 class="font-display font-bold text-xl text-text-primary mt-4">
      Bots are filtered
    </h2>
    <p>
      Requests with user-agents matching common bot signatures
      (crawlers, headless Chrome, Playwright, Lighthouse, etc.) are
      flagged and excluded from dashboard stats.
    </p>

    <h2 class="font-display font-bold text-xl text-text-primary mt-4">
      Questions
    </h2>
    <p>
      Reach me via
      <a
        href="mailto:duboopathi@gmail.com"
        class="text-accent-primary hover:underline"
        >email</a
      >
      or the <a routerLink="/contact" class="text-accent-primary hover:underline">contact form</a>.
    </p>
  </section>
</section>
```

- [ ] **Step 3: Update playground-index.ts**

Replace the entire contents of `apps/web/src/app/pages/playground/playground-index.ts` with:

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SceneFrame } from '@rahul-dev/features-scene-frame';
import { DecryptText, KineticHeading } from '@rahul-dev/shared-cinematics';
import { Reveal, TagChip } from '@rahul-dev/shared-ui';
import { ArrowUpRight, LucideAngularModule } from 'lucide-angular';

interface DemoCard {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly status: 'live' | 'soon';
}

@Component({
  selector: 'app-playground-index',
  imports: [
    RouterLink,
    LucideAngularModule,
    Reveal,
    TagChip,
    DecryptText,
    KineticHeading,
    SceneFrame,
  ],
  templateUrl: './playground-index.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaygroundIndex {
  protected readonly ArrowUpRight = ArrowUpRight;

  protected readonly playgroundReady = signal<boolean>(false);

  protected readonly demos: readonly DemoCard[] = [
    {
      slug: 'kubernetes',
      title: 'Kubernetes cluster',
      description:
        'Force-directed graph of pods, services, deployments, and config maps with status colors.',
      tags: ['force layout', 'D3.js', 'Kubernetes'],
      status: 'live',
    },
    {
      slug: 'cicd',
      title: 'CI/CD pipeline',
      description:
        'Sankey of an Nx build pipeline. Flow width encodes wall-clock seconds per stage.',
      tags: ['sankey', 'd3-sankey', 'CI/CD'],
      status: 'live',
    },
    {
      slug: 'bundle',
      title: 'Bundle treemap',
      description:
        'Squarify layout of the app bundle. Sized by KB, colored by lazy vs eager load strategy.',
      tags: ['treemap', 'd3-hierarchy', 'bundling'],
      status: 'live',
    },
    {
      slug: 'force-pop',
      title: 'Force Pop · mini-game',
      description:
        'Tap rising bubbles before they drift off the top. Combos chain, smaller is worth more, 30 seconds.',
      tags: ['game', 'rAF', 'mobile-first'],
      status: 'live',
    },
    {
      slug: 'rxjs',
      title: 'RxJS marble stream',
      description:
        'Animated marble diagram over observable operators. Play, pause, change speed.',
      tags: ['RxJS', 'animation'],
      status: 'soon',
    },
    {
      slug: 'heatmap',
      title: 'API latency heatmap',
      description:
        'Calendar heatmap of daily p95 latency. Zoom from week to day.',
      tags: ['heatmap', 'observability'],
      status: 'soon',
    },
    {
      slug: 'docker',
      title: 'Docker network',
      description:
        'Chord diagram of container-to-container communication.',
      tags: ['chord', 'Docker'],
      status: 'soon',
    },
    {
      slug: 'realtime',
      title: 'Realtime dashboard',
      description:
        'Line, bar, and gauge charts driven by an RxJS interval.',
      tags: ['multi-chart', 'RxJS', 'realtime'],
      status: 'soon',
    },
  ];

  protected onPlaygroundEnter(): void {
    this.playgroundReady.set(true);
  }
}
```

- [ ] **Step 4: Update playground-index.html**

Replace the entire contents of `apps/web/src/app/pages/playground/playground-index.html` with:

```html
<section
  appSceneFrame
  (sceneEnter)="onPlaygroundEnter()"
  class="max-w-6xl mx-auto px-4 md:px-6 py-16 flex flex-col gap-10"
>
  <header class="flex flex-col gap-2 items-start text-left">
    <span class="font-mono text-xs uppercase tracking-[0.18em] text-accent-primary">
      <span class="text-text-muted">~$</span>
      <span [appDecryptText]="'ls ./playground'" [autoplay]="playgroundReady()">
        ls ./playground
      </span>
    </span>
    <h1 class="font-display font-bold text-3xl md:text-4xl text-text-primary">
      <app-kinetic-heading text="Visualization playground" [ready]="playgroundReady()" />
    </h1>
    <p class="font-body text-text-secondary max-w-2xl">
      D3.js demos of Kubernetes, CI/CD, bundles, RxJS streams, API heatmaps, and more.
    </p>
  </header>

  <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    @for (d of demos; track d.slug) {
      <li appReveal>
        @if (d.status === 'live') {
          <a
            [routerLink]="['/playground', d.slug]"
            class="group glass p-5 flex flex-col gap-3 h-full no-underline hover:shadow-glow hover:border-accent-primary/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            <div class="flex items-start justify-between gap-4">
              <h3 class="font-display font-bold text-lg text-text-primary">
                {{ d.title }}
              </h3>
              <lucide-angular
                [img]="ArrowUpRight"
                [size]="18"
                class="text-accent-primary opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                aria-hidden="true"
              />
            </div>
            <p class="font-body text-sm text-text-secondary leading-relaxed">
              {{ d.description }}
            </p>
            <ul class="flex flex-wrap gap-1.5 mt-auto">
              @for (tag of d.tags; track tag) {
                <li>
                  <app-tag-chip>{{ tag }}</app-tag-chip>
                </li>
              }
            </ul>
          </a>
        } @else {
          <article
            class="glass p-5 flex flex-col gap-3 h-full opacity-60"
            aria-label="Coming soon"
          >
            <div class="flex items-start justify-between gap-4">
              <h3 class="font-display font-bold text-lg text-text-primary">
                {{ d.title }}
              </h3>
              <span class="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">
                soon
              </span>
            </div>
            <p class="font-body text-sm text-text-secondary leading-relaxed">
              {{ d.description }}
            </p>
            <ul class="flex flex-wrap gap-1.5 mt-auto">
              @for (tag of d.tags; track tag) {
                <li>
                  <app-tag-chip>{{ tag }}</app-tag-chip>
                </li>
              }
            </ul>
          </article>
        }
      </li>
    }
  </ul>
</section>
```

(Notable diff: `tracking-wider` on the "soon" badge → `tracking-[0.18em]`.)

- [ ] **Step 5: Run tests + typecheck + lint**

```bash
npx nx test web --watch=false
npx nx typecheck web
npx nx lint web
```

Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/pages/privacy apps/web/src/app/pages/playground/playground-index.html apps/web/src/app/pages/playground/playground-index.ts
git commit -m "feat(privacy+playground-index): cinematic header + scene-frame

Same kicker-decrypt + kinetic-title + scene-frame treatment as feed
and contact. 'soon' badge tracking-wider flipped to tracking-[0.18em]
on playground-index."
```

---

## Task 7: DemoFrame — failing test

`DemoFrame` wraps every playground demo (`/playground/<slug>`). Its `kicker`/`title` are inputs — the test sets them and verifies the inline cinematic markup picks them up.

**Files:**
- Create: `apps/web/src/app/pages/playground/demo-frame.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { DemoFrame } from './demo-frame';

const baseProviders = [
  provideRouter([]),
  { provide: PLATFORM_ID, useValue: 'server' },
];

describe('DemoFrame', () => {
  it('renders inside a [appSceneFrame] section', async () => {
    await TestBed.configureTestingModule({
      imports: [DemoFrame],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(DemoFrame);
    fixture.componentRef.setInput('kicker', 'cat ./demo');
    fixture.componentRef.setInput('title', 'Demo');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('section[appSceneFrame]'),
    ).toBeTruthy();
  });

  it('decrypts the kicker input', async () => {
    await TestBed.configureTestingModule({
      imports: [DemoFrame],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(DemoFrame);
    fixture.componentRef.setInput('kicker', 'cat ./demo');
    fixture.componentRef.setInput('title', 'Demo');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="cat ./demo"]'),
    ).toBeTruthy();
  });

  it('renders kinetic heading from title input', async () => {
    await TestBed.configureTestingModule({
      imports: [DemoFrame],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(DemoFrame);
    fixture.componentRef.setInput('kicker', 'cat ./demo');
    fixture.componentRef.setInput('title', 'K8s cluster');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="K8s cluster"]'),
    ).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npx nx test web --watch=false
```

Expected: 3 new DemoFrame assertions FAIL.

---

## Task 8: DemoFrame — implementation

**Files:**
- Modify: `apps/web/src/app/pages/playground/demo-frame.ts`
- Modify: `apps/web/src/app/pages/playground/demo-frame.html`

- [ ] **Step 1: Update demo-frame.ts**

Replace the entire contents of `apps/web/src/app/pages/playground/demo-frame.ts` with:

```ts
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SceneFrame } from '@rahul-dev/features-scene-frame';
import { DecryptText, KineticHeading } from '@rahul-dev/shared-cinematics';
import { TagChip } from '@rahul-dev/shared-ui';
import { ArrowLeft, Code2, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-demo-frame',
  imports: [
    RouterLink,
    LucideAngularModule,
    TagChip,
    DecryptText,
    KineticHeading,
    SceneFrame,
  ],
  templateUrl: './demo-frame.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoFrame {
  readonly kicker = input.required<string>();
  readonly title = input.required<string>();
  readonly summary = input<string>();
  readonly techTags = input<readonly string[]>([]);
  /**
   * Implementation notes revealed via the "view source" toggle. Not the
   * literal file source — a short sketch of the D3 layout calls that make
   * the demo work, meant to explain intent at a glance.
   */
  readonly notes = input<string>();

  protected readonly showNotes = signal(false);
  protected readonly demoReady = signal<boolean>(false);
  protected readonly ArrowLeft = ArrowLeft;
  protected readonly Code2 = Code2;

  protected toggleNotes(): void {
    this.showNotes.update((v) => !v);
  }

  protected onDemoEnter(): void {
    this.demoReady.set(true);
  }
}
```

- [ ] **Step 2: Update demo-frame.html**

Replace the entire contents of `apps/web/src/app/pages/playground/demo-frame.html` with:

```html
<section
  appSceneFrame
  (sceneEnter)="onDemoEnter()"
  class="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16 flex flex-col gap-6"
>
  <a
    routerLink="/playground"
    class="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-[0.18em] text-text-muted hover:text-accent-primary transition-colors w-max"
  >
    <lucide-angular [img]="ArrowLeft" [size]="12" aria-hidden="true" />
    <span>cd ../</span>
  </a>

  <div class="flex items-start justify-between flex-wrap gap-4">
    <header class="flex flex-col gap-2 items-start text-left">
      <span class="font-mono text-xs uppercase tracking-[0.18em] text-accent-primary">
        <span class="text-text-muted">~$</span>
        <span [appDecryptText]="kicker()" [autoplay]="demoReady()">
          {{ kicker() }}
        </span>
      </span>
      <h1 class="font-display font-bold text-3xl md:text-4xl text-text-primary">
        <app-kinetic-heading [text]="title()" [ready]="demoReady()" />
      </h1>
      @if (summary(); as s) {
        <p class="font-body text-text-secondary max-w-2xl">{{ s }}</p>
      }
    </header>
    @if (notes()) {
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-chip border border-border text-text-secondary hover:text-accent-primary hover:border-accent-primary/60 font-mono text-xs uppercase tracking-[0.18em] transition-colors"
        [attr.aria-pressed]="showNotes()"
        (click)="toggleNotes()"
      >
        <lucide-angular [img]="Code2" [size]="14" aria-hidden="true" />
        <span>{{ showNotes() ? 'hide notes' : 'view notes' }}</span>
      </button>
    }
  </div>

  @if (techTags().length > 0) {
    <ul class="flex flex-wrap gap-1.5">
      @for (tag of techTags(); track tag) {
        <li>
          <app-tag-chip>{{ tag }}</app-tag-chip>
        </li>
      }
    </ul>
  }

  <section
    class="glass relative w-full h-[min(70vh,560px)] overflow-hidden"
    aria-label="Visualization canvas"
  >
    <ng-content select="[slot=viz]" />
  </section>

  <section class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 mt-4">
    <div class="flex flex-col gap-3 font-body text-sm text-text-secondary leading-relaxed">
      <ng-content select="[slot=explanation]" />
    </div>

    @if (showNotes() && notes(); as n) {
      <pre
        class="glass p-4 font-mono text-xs text-text-muted whitespace-pre-wrap overflow-x-auto"
      >{{ n }}</pre>
    }
  </section>
</section>
```

(Notable diffs: `<main>` → `<section appSceneFrame>`; `<app-section-heading>` replaced with the inline cinematic header that pipes `kicker()`/`title()`/`summary()` inputs into `appDecryptText` / `<app-kinetic-heading>`; `tracking-wider` on cd-back link and view-notes button → `tracking-[0.18em]`.)

- [ ] **Step 3: Run tests + typecheck + lint + build**

```bash
npx nx test web --watch=false
npx nx typecheck web
npx nx lint web
npx nx build web
```

Expected: all green. The `playground-demo` lazy chunks should still build.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/pages/playground/demo-frame.ts apps/web/src/app/pages/playground/demo-frame.html
git commit -m "feat(demo-frame): cinematic header + scene-frame

DemoFrame wraps every /playground/<slug> route. Replaces
<app-section-heading> with an inline cinematic header driven by the
existing kicker()/title()/summary() inputs; <main> -> <section
appSceneFrame> with a demoReady signal; cd-back link + view-notes
button tracking flipped to 0.18em."
```

---

## Task 9: Smoke check + plan index update

**Files:**
- Modify: `docs/superpowers/plans/README.md`
- _(plan doc itself committed alongside)_

- [ ] **Step 1: Multi-project lint + typecheck**

```bash
npx nx run-many -t lint,typecheck -p web,ui,hero-graph
```

Expected: 6 successful targets.

- [ ] **Step 2: Multi-project test**

```bash
npx nx run-many -t test -p web,ui,hero-graph --watch=false
```

Expected: web +15 (Feed 3 + Contact 3 + Privacy 3 + PlaygroundIndex 3 + DemoFrame 3); ui + hero-graph unchanged.

- [ ] **Step 3: Production build**

```bash
npx nx build web
```

Expected: clean. Lazy chunks: `feed`, `contact`, `privacy`, `playground-index`, plus the per-demo chunks. All small.

- [ ] **Step 4: Hand-test**

```bash
npx nx serve web
```

Walk:
1. `/feed` — kicker `~$ tail -f feed.log` decrypts on load; `Feed` rises kinetically; filter tabs render with consistent 0.18em tracking.
2. `/contact` — kicker `~$ echo $EMAIL` decrypts; `Contact` rises; form labels (name/email/message) all tracking-tight uniformly.
3. `/privacy` — kicker `~$ cat /privacy` decrypts; `Privacy` rises.
4. `/playground` — kicker `~$ ls ./playground` decrypts; `Visualization playground` rises; "soon" badges tracked 0.18em.
5. `/playground/kubernetes` (or any live demo) — kicker decrypts (uses the demo's own kicker input); kinetic title rises; viz still renders below.
6. Reduced-motion toggle — every kinetic / decrypt collapses to final text instantly.

If any step fails, fix and re-run **Step 1** + **Step 2**.

- [ ] **Step 5: Plan index update**

Edit `docs/superpowers/plans/README.md`:

- Status row: flip Plan 7 from `🔜 next` to `✅ shipped`; flip Plan 8 from `⏳ planned` to `🔜 next`.
- Briefing: rewrite Plan 7 entry with the as-shipped commits + the deferred items (admin cinematic touch, demo hover preview SVGs, FILE NN labels).

Commit:

```bash
git add docs/superpowers/plans/README.md docs/superpowers/plans/2026-04-27-makeover-plan-7-kinetic-only.md
git commit -m "docs(plans): mark Plan 7 shipped, Plan 8 next + plan doc"
```

---

## Self-review checklist

- [ ] Spec § 4.2 `/feed`, `/contact`, `/privacy` (traditional scroll, kinetic-section reveals): inline DecryptText + KineticHeading on each section header; appSceneFrame on root. ✅
- [ ] Spec § 4.2 `/playground` (traditional scroll with kinetic reveals): playground-index + DemoFrame both restaged. ✅
- [ ] Spec § 4.2 `/admin/*` minimal cinematic touch: **deviated by design** — CLAUDE.md "Design Context" overrides the spec on this surface (admin = product-register, productivity-first). Documented in "Out of scope". ✅
- [ ] Memory tag 373 (0.18em tracking violations across 7+ pages beyond home): swept on every page touched (feed, contact, privacy, playground-index, demo-frame — 11+ tracking sites flipped). ✅
- [ ] Memory `feedback_ng_packagr_cross_lib`: every cinematics import lives in `apps/web/`, never in a buildable lib. ✅
- [ ] CLAUDE.md `~$` Prompt Rule: every kicker leads with `~$` (the `~#` denied banner is intentional root-prompt indicator, not a violation). ✅

## Next plan

Plan 8 (audio + custom cursor) is up next per the index. It's an independent layer — could ship before or after Plan 9 (new easter eggs).
