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
import type { DailyPoint } from './aggregate';

@Component({
  selector: 'app-finance-panel-daily-spend',
  imports: [],
  templateUrl: './panel-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelDailySpend implements AfterViewInit, OnDestroy {
  readonly title = input<string>('Daily expense');
  readonly data = input.required<readonly DailyPoint[]>();

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
    const data = this.data();
    if (data.length === 0) return;

    const parse = d3.utcParse('%Y-%m-%d');
    const points = data
      .map((p) => ({ date: parse(p.day), amount: p.amount }))
      .filter((p): p is { date: Date; amount: number } => p.date !== null);

    const margin = { top: 10, right: 10, bottom: 22, left: 44 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3
      .select(host)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleUtc()
      .domain(d3.extent(points, (p) => p.date) as [Date, Date])
      .range([0, innerW]);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(points, (p) => p.amount) ?? 0])
      .nice()
      .range([innerH, 0]);

    g.append('path')
      .datum(points)
      .attr('fill', 'none')
      .attr('stroke', 'var(--accent-primary)')
      .attr('stroke-width', 1.5)
      .attr(
        'd',
        d3
          .line<{ date: Date; amount: number }>()
          .x((p) => x(p.date))
          .y((p) => y(p.amount))
          .curve(d3.curveMonotoneX),
      );

    g.selectAll('circle')
      .data(points)
      .join('circle')
      .attr('cx', (p) => x(p.date))
      .attr('cy', (p) => y(p.amount))
      .attr('r', 2.5)
      .attr('fill', 'var(--accent-primary)')
      .append('title')
      .text((p) => `${p.date.toISOString().slice(0, 10)}: ${p.amount.toLocaleString()}`);

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(Math.min(6, points.length))
          .tickFormat(d3.utcFormat('%b %d') as never),
      )
      .call((sel) => {
        sel
          .selectAll('text')
          .attr('fill', 'var(--text-muted)')
          .style('font-family', 'var(--font-mono)')
          .style('font-size', '10px');
        sel.selectAll('line, path').attr('stroke', 'var(--border)');
      });

    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickSize(-innerW))
      .call((sel) => {
        sel
          .selectAll('text')
          .attr('fill', 'var(--text-muted)')
          .style('font-family', 'var(--font-mono)')
          .style('font-size', '10px');
        sel.selectAll('line').attr('stroke', 'var(--border)').attr('stroke-opacity', 0.3);
        sel.select('path').remove();
      });
  }
}
