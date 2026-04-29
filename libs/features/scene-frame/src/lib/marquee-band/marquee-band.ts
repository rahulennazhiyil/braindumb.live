import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * ASCII status strip rendered between scenes. Auto-pauses under
 * `prefers-reduced-motion` via pure CSS — no JS observer needed.
 *
 * Repeats the label enough times to cover any reasonable viewport width;
 * the container is overflow-hidden, the inner is animation-translated.
 *
 * Usage:
 *   <app-marquee-band label="SCENE 02 / projects" />
 */
@Component({
  selector: 'app-marquee-band',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="marquee-band" aria-hidden="true">
      <div class="marquee-band__track">
        @for (i of repeats(); track i) {
          <span class="marquee-band__item">{{ separator() }} {{ label() }} </span>
        }
      </div>
    </div>
  `,
  styleUrl: './marquee-band.css',
})
export class MarqueeBand {
  readonly label = input.required<string>();
  readonly separator = input<string>('//');
  /**
   * How many copies of the label to render. Default 12 covers ultrawide
   * monitors with a 12-character label; consumers can override for very
   * short or very long labels.
   */
  readonly count = input<number>(12);

  protected readonly repeats = computed(() =>
    Array.from({ length: this.count() }, (_, i) => i),
  );
}
