import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DemoFrame } from '../demo-frame';

type Phase = 'idle' | 'playing' | 'ended';

interface Bubble {
  readonly id: number;
  readonly x: number;
  readonly r: number;
  /** Score awarded when popped — small bubbles are worth more. */
  readonly value: number;
  /** Initial vertical velocity in px/sec; bubbles drift UP. */
  readonly vy: number;
  /** Horizontal drift in px/sec. */
  readonly vx: number;
  readonly hue: number;
  /** Mutable position — kept on the bubble so the template can bind. */
  px: number;
  py: number;
}

const GAME_DURATION_MS = 30_000;
const SPAWN_INTERVAL_MS = 380;
const COMBO_WINDOW_MS = 1_200;
const HIGHSCORE_KEY = 'rahul-dev:force-pop:highscore';

const NOTES = `requestAnimationFrame loop:
  spawn ~= every 380ms (linear ramp at higher score)
  for each bubble:
    py -= vy * dt          // drift up
    px += vx * dt          // sideways wobble
  remove bubble if py + r < 0  -> +1 missed
  on tap:
    score += value * combo
    combo: pops within 1.2s window  (cap ×4)`;

@Component({
  selector: 'app-playground-force-pop',
  imports: [DemoFrame],
  templateUrl: './force-pop.html',
  styleUrl: './force-pop.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForcePop implements AfterViewInit, OnDestroy {
  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);

  protected readonly kicker = './playground/force-pop';
  protected readonly title = 'Force Pop';
  protected readonly summary =
    'Tap the rising bubbles before they drift off the top. Smaller is worth more, ' +
    'rapid pops chain a combo multiplier. 30 seconds on the clock.';
  protected readonly tags: readonly string[] = [
    'd3-quadtree',
    'rAF loop',
    'mobile-first',
  ];
  protected readonly notes = NOTES;

  protected readonly bubbles = signal<readonly Bubble[]>([]);
  protected readonly score = signal(0);
  protected readonly combo = signal(1);
  protected readonly missed = signal(0);
  protected readonly remainingMs = signal(GAME_DURATION_MS);
  protected readonly phase = signal<Phase>('idle');
  protected readonly highScore = signal(0);

  protected readonly remainingLabel = computed(() => {
    const ms = this.remainingMs();
    return `${(ms / 1000).toFixed(1)}s`;
  });

  protected readonly progressPct = computed(
    () => (this.remainingMs() / GAME_DURATION_MS) * 100,
  );

  private rafId = 0;
  private lastTs = 0;
  private spawnAcc = 0;
  private nextId = 1;
  private endsAt = 0;
  private comboTimer: ReturnType<typeof setTimeout> | null = null;
  private resizeObserver?: ResizeObserver;
  private hostSize = { w: 0, h: 0 };

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const stored = Number(localStorage.getItem(HIGHSCORE_KEY) ?? 0);
    if (Number.isFinite(stored) && stored > 0) this.highScore.set(stored);
    this.measure();
    this.resizeObserver = new ResizeObserver(() => this.measure());
    this.resizeObserver.observe(this.host().nativeElement);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    if (this.comboTimer) clearTimeout(this.comboTimer);
    this.resizeObserver?.disconnect();
  }

  protected start(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.bubbles.set([]);
    this.score.set(0);
    this.combo.set(1);
    this.missed.set(0);
    this.remainingMs.set(GAME_DURATION_MS);
    this.endsAt = performance.now() + GAME_DURATION_MS;
    this.spawnAcc = 0;
    this.nextId = 1;
    this.lastTs = 0;
    this.phase.set('playing');
    this.zone.runOutsideAngular(() => {
      this.rafId = requestAnimationFrame((ts) => this.tick(ts));
    });
  }

  protected popBubble(bubble: Bubble, event: Event): void {
    if (this.phase() !== 'playing') return;
    event.stopPropagation();
    this.bubbles.update((bs) => bs.filter((b) => b.id !== bubble.id));
    const gain = bubble.value * this.combo();
    this.zone.run(() => {
      this.score.update((s) => s + gain);
      this.combo.update((c) => Math.min(4, c + 1));
    });
    if (this.comboTimer) clearTimeout(this.comboTimer);
    this.comboTimer = setTimeout(
      () => this.zone.run(() => this.combo.set(1)),
      COMBO_WINDOW_MS,
    );
  }

  private tick(ts: number): void {
    if (this.phase() !== 'playing') return;
    if (this.lastTs === 0) this.lastTs = ts;
    const dt = Math.min(48, ts - this.lastTs) / 1000;
    this.lastTs = ts;

    const remaining = Math.max(0, this.endsAt - ts);

    this.spawnAcc += dt * 1000;
    const spawnEvery =
      SPAWN_INTERVAL_MS - Math.min(180, this.score() * 0.3); // ramp difficulty
    while (this.spawnAcc >= spawnEvery) {
      this.spawnAcc -= spawnEvery;
      this.spawnBubble();
    }

    let missedDelta = 0;
    const next: Bubble[] = [];
    for (const b of this.bubbles()) {
      const py = b.py - b.vy * dt;
      const px = b.px + b.vx * dt;
      if (py + b.r < 0) {
        missedDelta++;
        continue;
      }
      b.py = py;
      b.px = px;
      next.push(b);
    }

    if (missedDelta > 0) {
      this.zone.run(() => this.missed.update((m) => m + missedDelta));
    }

    // Trigger CD by replacing the array reference.
    this.bubbles.set([...next]);
    this.zone.run(() => this.remainingMs.set(remaining));

    if (remaining <= 0) {
      this.endGame();
      return;
    }

    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }

  private spawnBubble(): void {
    const { w, h } = this.hostSize;
    if (w === 0 || h === 0) return;
    const r = randInt(14, 32);
    const value = Math.round((34 - r) * 1.2); // smaller = more points
    const x = randInt(r + 8, Math.max(r + 9, w - r - 8));
    const bubble: Bubble = {
      id: this.nextId++,
      x,
      r,
      value,
      vy: randInt(60, 120) + this.score() * 0.2,
      vx: randInt(-30, 30),
      hue: randInt(170, 320),
      px: x,
      py: h + r + 4,
    };
    this.bubbles.set([...this.bubbles(), bubble]);
  }

  private endGame(): void {
    this.zone.run(() => {
      this.phase.set('ended');
      this.remainingMs.set(0);
      const final = this.score();
      if (final > this.highScore()) {
        this.highScore.set(final);
        try {
          localStorage.setItem(HIGHSCORE_KEY, String(final));
        } catch {
          // storage unavailable — fine, runtime memory still has it
        }
      }
    });
  }

  private measure(): void {
    const rect = this.host().nativeElement.getBoundingClientRect();
    this.hostSize = { w: rect.width, h: rect.height };
  }
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
