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
  K8S_EDGES,
  K8S_KIND_COLOR,
  K8S_NODES,
  K8S_STATUS_COLOR,
  K8sEdge,
  K8sNode,
} from './k8s-data';

type SimNode = K8sNode & d3.SimulationNodeDatum;
type SimEdge = { source: SimNode; target: SimNode };

const SOURCE = `d3.forceSimulation(nodes)
  .force('link', d3.forceLink(edges).id(n => n.id).distance(80))
  .force('charge', d3.forceManyBody().strength(-220))
  .force('center', d3.forceCenter(w/2, h/2))
  .force('collide', d3.forceCollide().radius(18));

// Kind drives shape (rect for deployments, hexagon for services,
// circle for pods, triangle for configmaps). Status drives the
// outer stroke color (running/pending/failed).`;

@Component({
  selector: 'app-playground-k8s',
  imports: [DemoFrame],
  templateUrl: './k8s-cluster.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class K8sCluster implements AfterViewInit, OnDestroy {
  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);

  protected readonly kicker = './playground/kubernetes';
  protected readonly title = 'Kubernetes cluster';
  protected readonly summary =
    'Pods, services, deployments, and config maps across two namespaces. Drag nodes to explore; status colors the rim.';
  protected readonly techTags = ['D3.js', 'force layout', 'Kubernetes'] as const;
  protected readonly source = SOURCE;

  private simulation?: d3.Simulation<SimNode, SimEdge>;
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.zone.runOutsideAngular(() => this.init());
  }

  ngOnDestroy(): void {
    this.simulation?.stop();
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

    const nodes: SimNode[] = K8S_NODES.map((n) => ({ ...n }));
    const idToNode = new Map(nodes.map((n) => [n.id, n]));
    const edges: SimEdge[] = K8S_EDGES.map((e: K8sEdge) => {
      const s = idToNode.get(e.source);
      const t = idToNode.get(e.target);
      return s && t ? { source: s, target: t } : null;
    }).filter((e): e is SimEdge => e !== null);

    d3.select(host).selectAll('svg').remove();
    const svg = d3
      .select(host)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const linkSel = svg
      .append('g')
      .attr('stroke', 'var(--glass-border)')
      .attr('stroke-opacity', 0.45)
      .selectAll<SVGLineElement, SimEdge>('line')
      .data(edges)
      .join('line')
      .attr('stroke-width', 1);

    const group = svg
      .append('g')
      .selectAll<SVGGElement, SimNode>('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'grab');

    // Shape per kind.
    group.each(function (d) {
      const g = d3.select(this);
      const fill = K8S_KIND_COLOR[d.kind];
      const stroke = K8S_STATUS_COLOR[d.status];
      if (d.kind === 'deployment') {
        g.append('rect')
          .attr('width', 24)
          .attr('height', 18)
          .attr('x', -12)
          .attr('y', -9)
          .attr('rx', 2)
          .attr('fill', fill)
          .attr('stroke', stroke)
          .attr('stroke-width', 2);
      } else if (d.kind === 'service') {
        const r = 12;
        const points = Array.from({ length: 6 }, (_, i) => {
          const a = (Math.PI / 3) * i - Math.PI / 2;
          return `${r * Math.cos(a)},${r * Math.sin(a)}`;
        }).join(' ');
        g.append('polygon')
          .attr('points', points)
          .attr('fill', fill)
          .attr('stroke', stroke)
          .attr('stroke-width', 2);
      } else if (d.kind === 'configmap') {
        g.append('polygon')
          .attr('points', '0,-12 11,9 -11,9')
          .attr('fill', fill)
          .attr('stroke', stroke)
          .attr('stroke-width', 2);
      } else {
        g.append('circle')
          .attr('r', 9)
          .attr('fill', fill)
          .attr('stroke', stroke)
          .attr('stroke-width', 2);
      }
    });

    group
      .append('text')
      .attr('y', 24)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'var(--font-mono)')
      .attr('font-size', 10)
      .attr('fill', 'var(--text-secondary)')
      .text((d) => d.label);

    group.append('title').text((d) => `${d.kind} · ${d.label} · ${d.status}`);

    // Drag.
    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on('start', (event, d) => {
        if (!event.active) this.simulation?.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) this.simulation?.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
    group.call(drag);

    this.simulation?.stop();
    this.simulation = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<SimNode, SimEdge>(edges)
          .id((d) => d.id)
          .distance(80)
          .strength(0.35),
      )
      .force('charge', d3.forceManyBody<SimNode>().strength(-220))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide<SimNode>().radius(18));

    this.simulation.on('tick', () => {
      linkSel
        .attr('x1', (d) => (d.source as SimNode).x ?? 0)
        .attr('y1', (d) => (d.source as SimNode).y ?? 0)
        .attr('x2', (d) => (d.target as SimNode).x ?? 0)
        .attr('y2', (d) => (d.target as SimNode).y ?? 0);
      group.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });
  }
}
