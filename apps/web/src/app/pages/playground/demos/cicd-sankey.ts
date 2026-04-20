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
import {
  SankeyGraph,
  SankeyLink,
  SankeyNode,
  sankey,
  sankeyLinkHorizontal,
} from 'd3-sankey';
import { DemoFrame } from '../demo-frame';
import {
  PIPELINE_LINKS,
  PIPELINE_NODES,
  PipelineLink,
  PipelineNode,
  STAGE_COLOR,
} from './cicd-data';

type SNode = SankeyNode<PipelineNode, PipelineLink>;
type SLink = SankeyLink<PipelineNode, PipelineLink>;

const SOURCE = `const layout = sankey<PipelineNode, PipelineLink>()
  .nodeId(n => n.id)
  .nodeWidth(14)
  .nodePadding(18)
  .extent([[4, 4], [w - 4, h - 4]]);

// Link width = seconds elapsed in that stage. Stage colors the node.
// Each link path uses sankeyLinkHorizontal().`;

@Component({
  selector: 'app-playground-cicd',
  imports: [DemoFrame],
  templateUrl: './cicd-sankey.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CicdSankey implements AfterViewInit, OnDestroy {
  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);

  protected readonly kicker = './playground/cicd';
  protected readonly title = 'CI/CD pipeline';
  protected readonly summary =
    'Sankey of a real Nx build graph. Flow thickness encodes wall-clock seconds per stage; color encodes stage type.';
  protected readonly techTags = ['D3.js', 'd3-sankey', 'CI/CD'] as const;
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

    d3.select(host).selectAll('svg').remove();
    const svg = d3
      .select(host)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const layout = sankey<PipelineNode, PipelineLink>()
      .nodeId((n) => n.id)
      .nodeWidth(14)
      .nodePadding(18)
      .extent([
        [4, 4],
        [width - 4, height - 4],
      ]);

    const graph: SankeyGraph<PipelineNode, PipelineLink> = layout({
      nodes: PIPELINE_NODES.map((n) => ({ ...n })),
      links: PIPELINE_LINKS.map((l) => ({ ...l, value: l.seconds })),
    });

    svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.35)
      .selectAll<SVGPathElement, SLink>('path')
      .data(graph.links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (d) => STAGE_COLOR[(d.target as SNode).stage])
      .attr('stroke-width', (d) => Math.max(1, d.width ?? 1))
      .append('title')
      .text(
        (d) =>
          `${(d.source as SNode).label} → ${(d.target as SNode).label}: ${d.value}s`,
      );

    const nodeG = svg
      .append('g')
      .selectAll<SVGGElement, SNode>('g')
      .data(graph.nodes)
      .join('g');

    nodeG
      .append('rect')
      .attr('x', (d) => d.x0 ?? 0)
      .attr('y', (d) => d.y0 ?? 0)
      .attr('height', (d) => Math.max(2, (d.y1 ?? 0) - (d.y0 ?? 0)))
      .attr('width', (d) => (d.x1 ?? 0) - (d.x0 ?? 0))
      .attr('fill', (d) => STAGE_COLOR[d.stage])
      .attr('rx', 2);

    nodeG
      .append('text')
      .attr('x', (d) => ((d.x0 ?? 0) < width / 2 ? (d.x1 ?? 0) + 6 : (d.x0 ?? 0) - 6))
      .attr('y', (d) => (((d.y0 ?? 0) + (d.y1 ?? 0)) / 2))
      .attr('dy', '0.32em')
      .attr('text-anchor', (d) =>
        (d.x0 ?? 0) < width / 2 ? 'start' : 'end',
      )
      .attr('font-family', 'var(--font-mono)')
      .attr('font-size', 10)
      .attr('fill', 'var(--text-secondary)')
      .text((d) => d.label);
  }
}
