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

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

@Component({
  selector: 'app-panel-peak-hours',
  imports: [],
  templateUrl: './panel-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelPeakHours implements AfterViewInit, OnDestroy {
  readonly title = input<string>('Peak hours (UTC)');
  readonly data = input.required<readonly (readonly number[])[]>();

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
    if (data.length !== 7) return;

    const margin = { top: 16, right: 8, bottom: 4, left: 32 };
    const cellW = (width - margin.left - margin.right) / 24;
    const cellH = (height - margin.top - margin.bottom) / 7;
    const gap = 1;

    const svg = d3
      .select(host)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const flat = data.flat();
    const max = d3.max(flat) ?? 0;
    const scale = d3.scaleSequential<string, string>(d3.interpolateViridis).domain([0, max || 1]);

    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        const count = data[d][h];
        g.append('rect')
          .attr('x', h * cellW + gap / 2)
          .attr('y', d * cellH + gap / 2)
          .attr('width', cellW - gap)
          .attr('height', cellH - gap)
          .attr('rx', 2)
          .attr('fill', count === 0 ? 'var(--bg-elevated)' : scale(count))
          .attr('fill-opacity', count === 0 ? 0.3 : 1)
          .append('title')
          .text(`${DAYS[d]} ${h.toString().padStart(2, '0')}:00 — ${count}`);
      }
    }

    // Hour axis labels (every 6h).
    for (const h of [0, 6, 12, 18]) {
      g.append('text')
        .attr('x', h * cellW + cellW / 2)
        .attr('y', -4)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'var(--font-mono)')
        .attr('font-size', 9)
        .attr('fill', 'var(--text-muted)')
        .text(`${h.toString().padStart(2, '0')}`);
    }

    // Weekday labels.
    for (let d = 0; d < 7; d++) {
      svg
        .append('text')
        .attr('x', margin.left - 6)
        .attr('y', margin.top + d * cellH + cellH / 2)
        .attr('dy', '0.32em')
        .attr('text-anchor', 'end')
        .attr('font-family', 'var(--font-mono)')
        .attr('font-size', 9)
        .attr('fill', 'var(--text-muted)')
        .text(DAYS[d]);
    }
  }
}
