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
import type { MonthBucket } from './aggregate';

@Component({
  selector: 'app-finance-panel-income-expenses',
  imports: [],
  templateUrl: './panel-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelIncomeExpenses implements AfterViewInit, OnDestroy {
  readonly title = input<string>('Income vs expenses');
  readonly data = input.required<readonly MonthBucket[]>();

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

    const margin = { top: 10, right: 10, bottom: 26, left: 44 };
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

    const x0 = d3
      .scaleBand<string>()
      .domain(data.map((d) => d.month))
      .range([0, innerW])
      .padding(0.25);

    const x1 = d3
      .scaleBand<string>()
      .domain(['income', 'expenses'])
      .range([0, x0.bandwidth()])
      .padding(0.08);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => Math.max(d.income, d.expenses)) ?? 0])
      .nice()
      .range([innerH, 0]);

    const color = { income: 'var(--success)', expenses: 'var(--error)' };

    const group = g
      .selectAll<SVGGElement, MonthBucket>('g.month')
      .data(data)
      .join('g')
      .attr('class', 'month')
      .attr('transform', (d) => `translate(${x0(d.month) ?? 0},0)`);

    group
      .append('rect')
      .attr('x', x1('income') ?? 0)
      .attr('width', x1.bandwidth())
      .attr('y', (d) => y(d.income))
      .attr('height', (d) => innerH - y(d.income))
      .attr('fill', color.income)
      .attr('rx', 2)
      .append('title')
      .text((d) => `${d.month} income: ${d.income.toLocaleString()}`);

    group
      .append('rect')
      .attr('x', x1('expenses') ?? 0)
      .attr('width', x1.bandwidth())
      .attr('y', (d) => y(d.expenses))
      .attr('height', (d) => innerH - y(d.expenses))
      .attr('fill', color.expenses)
      .attr('rx', 2)
      .append('title')
      .text((d) => `${d.month} expenses: ${d.expenses.toLocaleString()}`);

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x0).tickSizeOuter(0))
      .call((sel) => {
        sel
          .selectAll('text')
          .attr('fill', 'var(--text-muted)')
          .style('font-family', 'var(--font-mono)')
          .style('font-size', '10px');
        sel.selectAll('line, path').attr('stroke', 'var(--border)');
      });

    g.append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(4)
          .tickSize(-innerW)
          .tickFormat((v) => formatMoney(+v)),
      )
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

function formatMoney(value: number): string {
  if (Math.abs(value) >= 1000) return `${Math.round(value / 1000)}k`;
  return String(Math.round(value));
}
