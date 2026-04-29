import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Fixed full-viewport SVG turbulence layer. Opacity is driven entirely by
 * the `--cinematic-grain-opacity` theme token — themes that want the layer
 * gone (e.g. `print`) set it to 0 and the overlay disappears with no JS
 * cost. The component itself never re-renders after mount.
 */
@Component({
  selector: 'app-grain-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grain-overlay" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <filter id="grain-turbulence">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0.5 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-turbulence)" />
      </svg>
    </div>
  `,
  styleUrl: './grain-overlay.css',
})
export class GrainOverlay {}
