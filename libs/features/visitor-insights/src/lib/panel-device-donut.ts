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
import type { Bucket } from './aggregate';

const COLORS: Record<string, string> = {
  desktop: 'var(--accent-primary)',
  mobile: 'var(--accent-secondary)',
  tablet: 'var(--cat-data)',
  unknown: 'var(--text-muted)',
};

@Component({
  selector: 'app-panel-device-donut',
  imports: [],
  templateUrl: './panel-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelDeviceDonut implements AfterViewInit, OnDestroy {
  readonly title = input<string>('Devices');
  readonly data = input.required<readonly Bucket[]>();

  private readonly host =
    viewChild.required<ElementRef<HTMLDivElement>>('host');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);

  private ready = false;
  private resizeObserver?: ResizeObserver;

  constructor() {
    effect(() => {
      this.data();
      if (this.ready) this.draw();
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
    const data = this.data();
    if (data.length === 0) return;

    const radius = Math.min(width, height) / 2 - 6;
    const inner = radius * 0.6;

    const svg = d3
      .select(host)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3
      .pie<Bucket>()
      .value((d) => d.count)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<Bucket>>().innerRadius(inner).outerRadius(radius);

    const total = d3.sum(data, (d) => d.count);

    g.selectAll('path')
      .data(pie(data as Bucket[]))
      .join('path')
      .attr('d', arc)
      .attr('fill', (d) => COLORS[d.data.key] ?? 'var(--text-muted)')
      .attr('stroke', 'var(--bg-primary)')
      .attr('stroke-width', 2)
      .append('title')
      .text((d) => `${d.data.key}: ${d.data.count} (${Math.round((d.data.count / total) * 100)}%)`);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.1em')
      .attr('font-family', 'var(--font-display)')
      .attr('font-weight', 700)
      .attr('font-size', 20)
      .attr('fill', 'var(--text-primary)')
      .text(total);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.1em')
      .attr('font-family', 'var(--font-mono)')
      .attr('font-size', 10)
      .attr('fill', 'var(--text-muted)')
      .text('views');
  }
}
