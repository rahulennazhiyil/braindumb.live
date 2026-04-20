import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-finance-panel-savings-gauge',
  imports: [],
  templateUrl: './panel-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelSavingsGauge implements AfterViewInit, OnDestroy {
  readonly title = input<string>('Savings rate');
  readonly data = input.required<number>(); // 0..1

  private readonly host =
    viewChild.required<ElementRef<HTMLDivElement>>('host');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);

  private ready = false;
  private resizeObserver?: ResizeObserver;

  constructor() {
    effect(() => {
      this.data();
      if (this.ready) this.zone.runOutsideAngular(() => this.draw());
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.zone.runOutsideAngular(() => this.init());
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private init(): void {
    this.ready = true;
    this.draw();
    this.resizeObserver = new ResizeObserver(() => this.draw());
    this.resizeObserver.observe(this.host().nativeElement);
  }

  private draw(): void {
    const host = this.host().nativeElement;
    const { width, height } = host.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    d3.select(host).selectAll('svg').remove();

    const rate = Math.max(0, Math.min(1, this.data()));
    const size = Math.min(width, height);
    const radius = size / 2 - 10;
    const startAngle = -Math.PI / 2;
    const endAngle = Math.PI / 2;
    const progress = startAngle + (endAngle - startAngle) * rate;

    const svg = d3
      .select(host)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2 + radius / 2})`);

    const bg = d3
      .arc<null>()
      .innerRadius(radius - 14)
      .outerRadius(radius)
      .startAngle(startAngle)
      .endAngle(endAngle);

    const fg = d3
      .arc<null>()
      .innerRadius(radius - 14)
      .outerRadius(radius)
      .startAngle(startAngle)
      .endAngle(progress);

    g.append('path').attr('d', bg(null) ?? '').attr('fill', 'var(--bg-elevated)');
    g.append('path').attr('d', fg(null) ?? '').attr('fill', color(rate));

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .attr('font-family', 'var(--font-display)')
      .attr('font-weight', 700)
      .attr('font-size', 28)
      .attr('fill', 'var(--text-primary)')
      .text(`${Math.round(rate * 100)}%`);
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('font-family', 'var(--font-mono)')
      .attr('font-size', 10)
      .attr('fill', 'var(--text-muted)')
      .text('of income saved');
  }
}

function color(rate: number): string {
  if (rate >= 0.3) return 'var(--success)';
  if (rate >= 0.15) return 'var(--accent-secondary)';
  return 'var(--error)';
}
