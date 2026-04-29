import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  PLATFORM_ID,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';

interface ScriptedLine {
  readonly prompt: string;
  readonly text: string;
  /** Optional ms to dwell after the line completes before the next starts. */
  readonly dwellMs?: number;
}

const SCRIPT_LONG: readonly ScriptedLine[] = [
  { prompt: '~$', text: 'init theme...', dwellMs: 80 },
  { prompt: '~$', text: 'init graph...', dwellMs: 80 },
  { prompt: '~$', text: 'auth daemon idle.', dwellMs: 120 },
  { prompt: '~$', text: 'rahul --whoami', dwellMs: 200 },
  { prompt: '>', text: 'frontend engineer · data unveil · bengaluru', dwellMs: 280 },
  { prompt: '~$', text: 'rahul --start', dwellMs: 0 },
];

const SCRIPT_SHORT: readonly ScriptedLine[] = [
  { prompt: '~$', text: 'rahul --start', dwellMs: 0 },
];

const CHAR_INTERVAL_MS = 34;

const KONAMI_SEQUENCE: readonly string[] = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
];

/**
 * Animated terminal panel that types its scripted lines character by
 * character. Emits `done` when the script finishes (or when `skip()` is
 * called by a tap/key event). Caller should hide the component on `done`
 * and reveal the real hero.
 *
 * Konami sequence (↑↑↓↓) during the boot fires `konamiTriggered` then
 * `done` — consumers can react by opening the auth terminal directly.
 *
 * Browser-only — server-rendered output is just the empty shell so SSR
 * doesn't show a partially-typed line.
 */
@Component({
  selector: 'app-boot-sequence',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './boot-sequence.html',
  styleUrl: './boot-sequence.css',
})
export class BootSequence implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  readonly done = output<void>();
  readonly konamiTriggered = output<void>();

  protected readonly mode = signal<'long' | 'short'>('long');
  protected readonly typedLines = signal<readonly string[]>([]);
  protected readonly currentLineText = signal<string>('');
  protected readonly currentLine = signal<ScriptedLine | null>(null);
  protected readonly finished = signal<boolean>(false);

  protected readonly script = computed<readonly ScriptedLine[]>(() =>
    this.mode() === 'long' ? SCRIPT_LONG : SCRIPT_SHORT,
  );

  private timer: ReturnType<typeof setTimeout> | null = null;
  private skipped = false;
  private konamiBuffer: string[] = [];

  setMode(mode: 'long' | 'short'): void {
    this.mode.set(mode);
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.finished.set(true);
      return;
    }
    if (this.prefersReducedMotion()) {
      this.finished.set(true);
      this.done.emit();
      return;
    }
    this.typeNextLine(0);
  }

  ngOnDestroy(): void {
    this.cancelTimer();
  }

  @HostListener('window:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (this.skipped) return;

    const expected = KONAMI_SEQUENCE[this.konamiBuffer.length];
    if (event.key === expected) {
      this.konamiBuffer.push(event.key);
      if (this.konamiBuffer.length === KONAMI_SEQUENCE.length) {
        this.konamiBuffer = [];
        this.konamiTriggered.emit();
        this.skip();
      }
      return;
    }

    // Wrong key during a partial sequence: reset, then fall through to
    // the normal "any key skips" behaviour.
    this.konamiBuffer = [];
    this.skip();
  }

  @HostListener('window:pointerdown')
  skip(): void {
    if (this.skipped) return;
    this.skipped = true;
    this.cancelTimer();
    this.finished.set(true);
    this.done.emit();
  }

  private typeNextLine(index: number): void {
    const lines = this.script();
    if (index >= lines.length) {
      this.finished.set(true);
      this.done.emit();
      return;
    }
    const line = lines[index];
    this.currentLine.set(line);
    this.currentLineText.set('');

    const target = line.text;
    let i = 0;
    const tick = () => {
      if (this.skipped) return;
      i++;
      this.currentLineText.set(target.slice(0, i));
      if (i < target.length) {
        this.timer = setTimeout(tick, CHAR_INTERVAL_MS);
      } else {
        this.typedLines.update((arr) => [...arr, `${line.prompt} ${target}`]);
        this.currentLine.set(null);
        this.currentLineText.set('');
        this.timer = setTimeout(
          () => this.typeNextLine(index + 1),
          line.dwellMs ?? 100,
        );
      }
    };
    this.timer = setTimeout(tick, CHAR_INTERVAL_MS);
  }

  private cancelTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private prefersReducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
