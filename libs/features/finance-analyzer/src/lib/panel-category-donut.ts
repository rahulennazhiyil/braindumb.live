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
import type { CategoryBucket } from './aggregate';

const PALETTE = [
  'var(--accent-primary)',
  'var(--accent-secondary)',
  'var(--cat-data)',
  'var(--cat-infra)',
  'var(--cat-platform)',
  'var(--success)',
  'var(--text-secondary)',
  'var(--error)',
];

@Component({
  selector: 'app-finance-panel-category-donut',
  imports: [],
  templateUrl: './panel-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelCategoryDonut implements AfterViewInit, OnDestroy {
  readonly title = input<string>('Top expense categories');
  readonly data = input.required<readonly CategoryBucket[]>();

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
    const raw = this.data();
    if (raw.length === 0) return;

    // Fold long tail into "Other" so the donut stays readable.
    const top = raw.slice(0, 7);
    const rest = raw.slice(7);
    const data: CategoryBucket[] =
      rest.length > 0
        ? [
            ...top,
            {
              category: 'Other',
              amount: rest.reduce((s, r) => s + r.amount, 0),
            },
          ]
        : top;

    const radius = Math.min(width, height) / 2 - 6;
    const inner = radius * 0.6;
    const total = d3.sum(data, (d) => d.amount);

    const svg = d3
      .select(host)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3
      .pie<CategoryBucket>()
      .value((d) => d.amount)
      .sort(null);
    const arc = d3
      .arc<d3.PieArcDatum<CategoryBucket>>()
      .innerRadius(inner)
      .outerRadius(radius);

    g.selectAll('path')
      .data(pie(data as CategoryBucket[]))
      .join('path')
      .attr('d', arc)
      .attr('fill', (_, i) => PALETTE[i % PALETTE.length])
      .attr('stroke', 'var(--bg-primary)')
      .attr('stroke-width', 2)
      .append('title')
      .text(
        (d) =>
          `${d.data.category}: ${d.data.amount.toLocaleString()} (${Math.round(
            (d.data.amount / total) * 100,
          )}%)`,
      );

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.1em')
      .attr('font-family', 'var(--font-display)')
      .attr('font-weight', 700)
      .attr('font-size', 16)
      .attr('fill', 'var(--text-primary)')
      .text(total.toLocaleString());
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .attr('font-family', 'var(--font-mono)')
      .attr('font-size', 10)
      .attr('fill', 'var(--text-muted)')
      .text('total spend');
  }
}
