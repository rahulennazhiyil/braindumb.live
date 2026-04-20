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

@Component({
  selector: 'app-panel-browser-bar',
  imports: [],
  templateUrl: './panel-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelBrowserBar implements AfterViewInit, OnDestroy {
  readonly title = input<string>('Browsers');
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

    const margin = { top: 4, right: 40, bottom: 4, left: 72 };
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

    const y = d3
      .scaleBand<string>()
      .domain(data.map((d) => d.key))
      .range([0, innerH])
      .padding(0.25);

    const max = d3.max(data, (d) => d.count) ?? 1;
    const x = d3.scaleLinear().domain([0, max]).range([0, innerW]);

    g.selectAll('rect')
      .data(data as Bucket[])
      .join('rect')
      .attr('x', 0)
      .attr('y', (d) => y(d.key) ?? 0)
      .attr('width', (d) => x(d.count))
      .attr('height', y.bandwidth())
      .attr('fill', 'var(--accent-primary)')
      .attr('fill-opacity', 0.8)
      .attr('rx', 2);

    g.selectAll('text.label')
      .data(data as Bucket[])
      .join('text')
      .attr('class', 'label')
      .attr('x', -6)
      .attr('y', (d) => (y(d.key) ?? 0) + y.bandwidth() / 2)
      .attr('dy', '0.32em')
      .attr('text-anchor', 'end')
      .attr('font-family', 'var(--font-mono)')
      .attr('font-size', 10)
      .attr('fill', 'var(--text-secondary)')
      .text((d) => d.key);

    g.selectAll('text.value')
      .data(data as Bucket[])
      .join('text')
      .attr('class', 'value')
      .attr('x', (d) => x(d.count) + 4)
      .attr('y', (d) => (y(d.key) ?? 0) + y.bandwidth() / 2)
      .attr('dy', '0.32em')
      .attr('font-family', 'var(--font-mono)')
      .attr('font-size', 10)
      .attr('fill', 'var(--text-muted)')
      .text((d) => d.count);
  }
}
