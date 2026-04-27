import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Pure-CSS horizontal scan-line layer. Opacity is theme-driven via
 * `--cinematic-scan-opacity`; the lines themselves are a repeating
 * gradient — zero raster, zero JS, zero re-render after mount.
 */
@Component({
  selector: 'app-scan-line-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="scan-line-overlay" aria-hidden="true"></div>`,
  styleUrl: './scan-line-overlay.css',
})
export class ScanLineOverlay {}
