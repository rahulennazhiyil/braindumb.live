import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

interface CharCell {
  readonly key: string;
  readonly char: string;
  readonly delayMs: number;
}

const PER_CHAR_DELAY_MS = 38;

/**
 * Splits the provided text into per-character spans, each with a
 * staggered animation delay. The actual animation is pure CSS — when the
 * `kinetic-heading--ready` class is applied to the host (typically by a
 * SceneFrame on intersect), the chars slide+fade into place.
 *
 * Aria-label exposes the full text so the per-span split is invisible to
 * screen readers.
 *
 * Usage:
 *   <app-kinetic-heading text="rahul.dev" />
 */
@Component({
  selector: 'app-kinetic-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="kinetic-heading"
      [class.kinetic-heading--ready]="ready()"
      [attr.aria-label]="text()"
    >
      @for (cell of cells(); track cell.key) {
        <span
          class="kinetic-heading__char"
          aria-hidden="true"
          [style.animation-delay.ms]="cell.delayMs"
        >{{ cell.char }}</span>
      }
    </span>
  `,
  styleUrl: './kinetic-heading.css',
})
export class KineticHeading {
  readonly text = input.required<string>();
  readonly ready = input<boolean>(true);

  protected readonly cells = computed<readonly CharCell[]>(() => {
    const t = this.text();
    return [...t].map((ch, i) => ({
      key: `${i}-${ch}`,
      char: ch === ' ' ? ' ' : ch,
      delayMs: i * PER_CHAR_DELAY_MS,
    }));
  });
}
