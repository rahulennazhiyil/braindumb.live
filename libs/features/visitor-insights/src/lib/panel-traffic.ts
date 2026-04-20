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
import type { DailyCount } from './aggregate';

@Component({
  selector: 'app-panel-traffic',
  imports: [],
  templateUrl: './panel-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelTraffic implements AfterViewInit, OnDestroy {
  readonly title = input<string>('Traffic');
  readonly data = input.required<readonly DailyCount[]>();

  private readonly host =
    viewChild.required<ElementRef<HTMLDivElement>>('host');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);

  private ready = false;
  private resizeObserver?: ResizeObserver;

  constructor() {
    effect(() => {
      // Watch `data` so redraw triggers on new inputs.
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

    const data = this.data();
    const margin = { top: 12, right: 12, bottom: 22, left: 32 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    d3.select(host).selectAll('svg').remove();

    if (data.length === 0) return;

    const svg = d3
      .select(host)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const parseDay = d3.utcParse('%Y-%m-%d');

    const x = d3
      .scaleUtc()
      .domain(d3.extent(data, (d) => parseDay(d.day) ?? new Date()) as [Date, Date])
      .range([0, innerW]);

    const maxCount = d3.max(data, (d) => d.count) ?? 1;
    const y = d3.scaleLinear().domain([0, maxCount]).nice().range([innerH, 0]);

    const area = d3
      .area<DailyCount>()
      .x((d) => x(parseDay(d.day) ?? new Date()))
      .y0(innerH)
      .y1((d) => y(d.count))
      .curve(d3.curveMonotoneX);

    const gradId = `traffic-grad-${Math.random().toString(36).slice(2, 8)}`;
    const grad = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', gradId)
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', 1);
    grad.append('stop').attr('offset', '0%').attr('stop-color', 'var(--accent-primary)').attr('stop-opacity', 0.4);
    grad.append('stop').attr('offset', '100%').attr('stop-color', 'var(--accent-primary)').attr('stop-opacity', 0);

    g.append('path')
      .datum(data)
      .attr('fill', `url(#${gradId})`)
      .attr('d', area);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'var(--accent-primary)')
      .attr('stroke-width', 1.5)
      .attr(
        'd',
        d3
          .line<DailyCount>()
          .x((d) => x(parseDay(d.day) ?? new Date()))
          .y((d) => y(d.count))
          .curve(d3.curveMonotoneX),
      );

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(Math.min(6, data.length))
          .tickFormat(d3.utcFormat('%b %d') as never),
      )
      .call((sel) => {
        sel.selectAll('text').attr('fill', 'var(--text-muted)').style('font-family', 'var(--font-mono)').style('font-size', '10px');
        sel.selectAll('line, path').attr('stroke', 'var(--border)');
      });

    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickSize(-innerW))
      .call((sel) => {
        sel.selectAll('text').attr('fill', 'var(--text-muted)').style('font-family', 'var(--font-mono)').style('font-size', '10px');
        sel.selectAll('line').attr('stroke', 'var(--border)').attr('stroke-opacity', 0.3);
        sel.select('path').remove();
      });
  }
}
