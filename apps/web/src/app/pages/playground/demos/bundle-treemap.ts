import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  inject,
  viewChild,
} from '@angular/core';
import * as d3 from 'd3';
import { DemoFrame } from '../demo-frame';
import {
  BUNDLE_TREE,
  BundleNode,
  STRATEGY_COLOR,
  isLeaf,
} from './bundle-data';

const SOURCE = `const root = d3.hierarchy(BUNDLE_TREE)
  .sum(d => isLeaf(d) ? d.kb : 0)
  .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

d3.treemap().size([w, h]).padding(2).round(true)(root);

// Leaves colored by load strategy (eager = cyan, lazy = amber).
// Branches show group labels at their bounding rect corner.`;

type TreeDatum = d3.HierarchyRectangularNode<BundleNode>;

@Component({
  selector: 'app-playground-bundle',
  imports: [DemoFrame],
  templateUrl: './bundle-treemap.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BundleTreemap implements AfterViewInit, OnDestroy {
  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);

  protected readonly kicker = './playground/bundle';
  protected readonly title = 'Bundle treemap';
  protected readonly summary =
    'Squarify layout of the app bundle. Leaves sized by KB, colored by load strategy.';
  protected readonly techTags = ['D3.js', 'd3-hierarchy', 'webpack'] as const;
  protected readonly source = SOURCE;

  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.zone.runOutsideAngular(() => this.init());
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private init(): void {
    const el = this.host().nativeElement;
    this.draw(el);
    this.resizeObserver = new ResizeObserver(() => this.draw(el));
    this.resizeObserver.observe(el);
  }

  private draw(host: HTMLDivElement): void {
    const { width, height } = host.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const root = d3
      .hierarchy<BundleNode>(BUNDLE_TREE)
      .sum((d) => (isLeaf(d) ? d.kb : 0))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    d3
      .treemap<BundleNode>()
      .tile(d3.treemapSquarify)
      .size([width, height])
      .padding(2)
      .round(true)(root);

    d3.select(host).selectAll('svg').remove();
    const svg = d3
      .select(host)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const leaves = root.leaves() as TreeDatum[];

    const leafG = svg
      .append('g')
      .selectAll<SVGGElement, TreeDatum>('g')
      .data(leaves)
      .join('g')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

    leafG
      .append('rect')
      .attr('width', (d) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d) => Math.max(0, d.y1 - d.y0))
      .attr('rx', 2)
      .attr('fill', (d) => {
        if (!isLeaf(d.data)) return 'var(--bg-elevated)';
        return STRATEGY_COLOR[d.data.strategy];
      })
      .attr('fill-opacity', 0.75)
      .attr('stroke', 'var(--bg-primary)')
      .attr('stroke-width', 1);

    leafG
      .append('title')
      .text((d) =>
        isLeaf(d.data)
          ? `${d.data.name} · ${d.data.kb} KB · ${d.data.strategy}`
          : d.data.name,
      );

    leafG
      .filter((d) => d.x1 - d.x0 > 56 && d.y1 - d.y0 > 26)
      .append('text')
      .attr('x', 6)
      .attr('y', 16)
      .attr('font-family', 'var(--font-mono)')
      .attr('font-size', 10)
      .attr('fill', 'var(--bg-primary)')
      .attr('font-weight', '600')
      .text((d) => (isLeaf(d.data) ? d.data.name : ''));

    leafG
      .filter((d) => d.x1 - d.x0 > 56 && d.y1 - d.y0 > 42)
      .append('text')
      .attr('x', 6)
      .attr('y', 30)
      .attr('font-family', 'var(--font-mono)')
      .attr('font-size', 9)
      .attr('fill', 'var(--bg-primary)')
      .attr('fill-opacity', 0.75)
      .text((d) => (isLeaf(d.data) ? `${d.data.kb} KB` : ''));
  }
}
